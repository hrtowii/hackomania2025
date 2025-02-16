from aicmds import analyze_image_with_openai
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import aiosqlite
import json
import base64
from datetime import datetime
from models import (
    FoodDetails,
    UserCreate,
    UserLogin,
    PostCreate,
    ChallengeProgress,
    UserResponse,
    PostResponse,
    ChallengeResponse,
    LeaderboardUser,
)
from database import (
    init_db,
    save_post,
    update_score,
    get_user,
    add_friend,
    get_feed,
    upvote_post,
    get_challenges,
    get_challenge_leaderboard,
    get_all_users,
    get_health_leaderboard,
)
import os
import openai
from dotenv import load_dotenv
from fastapi.responses import JSONResponse

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

openai.api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=openai.api_key)

@app.on_event("startup")
async def startup():
    await init_db()

@app.post("/auth/signup")
async def signup(user: UserCreate):
    async with aiosqlite.connect("database.db") as db:
        cursor = await db.execute("SELECT email FROM Users WHERE email = ?", (user.email,))
        if await cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already exists")
        await db.execute(
            "INSERT INTO Users(email, password, username) VALUES (?, ?, ?)",
            (user.email, user.password, user.username),
        )
        await db.commit()
    return {"status": "success"}

@app.post("/auth/login")
async def login(user: UserLogin):
    async with aiosqlite.connect("database.db") as db:
        cursor = await db.execute("SELECT id, password FROM Users WHERE email = ?", (user.email,))
        result = await cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Account doesn't exist")
        if result[1] != user.password:
            raise HTTPException(status_code=401, detail="Wrong password")
        return {"userId": result[0]}

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user_endpoint(user_id: int):
    user = await get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # get_user returns a dict with username, posts, health_score and challenge_progress
    return JSONResponse(content=user)

@app.get("/users/{user_id}/friends/add/{friend_id}")
async def add_friend_endpoint(user_id: int, friend_id: int):
    success = await add_friend(user_id, friend_id)
    if not success:
        raise HTTPException(status_code=404, detail="User or friend not found")
    return {"success": True}

@app.post("/posts/upload")
async def upload(post: PostCreate):
    res = analyze_image_with_openai(post.back_image)
    # Save the post with proper ingredients (converted from comma separated string to json list)
    await save_post(
        userId=post.userID,
        front_image=post.front_image,
        back_image=post.back_image,
        ingredients=json.dumps(res["ingredients"].split(", ")),
        calories=res["calories"],
        health_score=res["health_score"],
        visibility=post.visibility,
        timestamp=datetime.now(),
        upvotes=0,
    )
    await update_score(
        user_id=post.userID,
        chal1=res["chal1"],
        chal2=res["chal2"],
        chal3=res["chal3"],
        chal4=res["chal4"],
        total=res["total_chals"],
    )
    return {"status": "success"}

@app.get("/feed/{user_id}/friends/{sort_method}")
async def friend_feed(user_id: int, sort_method: str):
    sort_options = {
        "recency": "timestamp ASC",
        "upvotes": "upvotes DESC",
        "health": "health_score DESC",
    }
    posts = await get_feed(user_id, sort_options.get(sort_method, "upvotes DESC"), visibility="friends")
    return {"posts": posts}

@app.get("/feed/community/{sort_method}")
async def community_feed(sort_method: str):
    sort_options = {
        "recency": "timestamp ASC",
        "upvotes": "upvotes DESC",
        "health": "health_score DESC",
    }
    posts = await get_feed(None, sort_options.get(sort_method, "upvotes DESC"), visibility="public")
    return {"posts": posts}

@app.get("/feed/healthy/{sort_method}")
async def healthy_feed(sort_method: str):
    sort_options = {
        "recency": "timestamp ASC",
        "upvotes": "upvotes DESC",
        "health": "health_score DESC",
    }
    posts = await get_feed(None, sort_options.get(sort_method, "upvotes DESC"), visibility="public", health_threshold=8.0)
    return {"posts": posts}

@app.get("/posts/upvote/{post_id}")
async def upvote_post_endpoint(post_id: int):
    upvotes = await upvote_post(post_id)
    if upvotes is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"upvotes": upvotes}

@app.get("/posts/{post_id}", response_model=PostResponse)
async def get_post_endpoint(post_id: int):
    async with aiosqlite.connect("database.db") as db:
        cursor = await db.execute("SELECT * FROM Posts WHERE id = ?", (post_id,))
        post = await cursor.fetchone()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        # post tuple is assumed to be in the order:
        # id, userId, front_image, back_image, ingredients, calories, health_score, visibility, timestamp, upvotes
        post_dict = {
            "id": post[0],
            "userId": post[1],
            "front_image": post[2],
            "back_image": post[3],
            "ingredients": post[4],
            "calories": post[5],
            "health_score": post[6],
            "visibility": post[7],
            "timestamp": post[8],
            "upvotes": post[9],
        }
        return post_dict

@app.get("/challenges", response_model=List[ChallengeResponse])
async def get_challenges_endpoint():
    challenges = await get_challenges()
    # Assume each challenge tuple is in order (id, name, description)
    challenges_list = [
        {"id": c[0], "name": c[1], "description": c[2]} for c in challenges
    ]
    return challenges_list

@app.get("/challenge_leaderboard/{challenge_no}/{num}", response_model=List[LeaderboardUser])
async def get_challenge_leaderboard_endpoint(challenge_no: int, num: int):
    leaderboard = await get_challenge_leaderboard(challenge_no, num)
    # Each leaderboard tuple is in order: id, username, points
    leaderboard_list = [
        {"id": entry[0], "username": entry[1], "points": entry[2]} for entry in leaderboard
    ]
    return leaderboard_list

@app.get("/users", response_model=List[LeaderboardUser])
async def get_all_users_endpoint():
    users = await get_all_users()
    # get_all_users returns tuples of (id, username); we add a default points value (0) if needed.
    users_list = [{"id": user[0], "username": user[1], "points": 0} for user in users]
    return users_list

@app.get("/leaderboard/health/{num}", response_model=List[LeaderboardUser])
async def leaderboard_health(num: int):
    leaderboard = await get_health_leaderboard(num)
    # Each leaderboard tuple is in order: id, username, health_score_avg; map health_score_avg -> points.
    leaderboard_list = [
        {"id": user[0], "username": user[1], "points": user[2]} for user in leaderboard
    ]
    return leaderboard_list

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)