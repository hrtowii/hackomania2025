import aiosqlite
import json
from datetime import datetime

DATABASE = "database.db"

async def init_db():
    async with aiosqlite.connect(DATABASE) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE,
                password TEXT,
                username TEXT,
                health_score_avg REAL DEFAULT 0,
                challenge_progress TEXT DEFAULT '[0, 0, 0, 0, 0]',
                friends TEXT DEFAULT '[]'
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS Posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                front_image TEXT,
                back_image TEXT,
                ingredients TEXT,
                calories INTEGER,
                health_score INTEGER,
                visibility TEXT,
                timestamp DATETIME,
                upvotes INTEGER DEFAULT 0,
                FOREIGN KEY(userId) REFERENCES Users(id)
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS Challenges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                description TEXT
            )
        """)
        await db.commit()

async def save_post(userId, front_image, back_image, ingredients, calories, health_score, visibility, timestamp, upvotes):
    async with aiosqlite.connect(DATABASE) as db:
        await db.execute("""
            INSERT INTO Posts(userId, front_image, back_image, ingredients, calories, health_score, visibility, timestamp, upvotes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (userId, front_image, back_image, ingredients, calories, health_score, visibility, timestamp, upvotes))
        await db.commit()

        # Update user's average health score
        await db.execute("""
            UPDATE Users
            SET health_score_avg = (SELECT AVG(health_score) FROM Posts WHERE userId = ?)
            WHERE id = ?
        """, (userId, userId))
        await db.commit()

async def update_score(user_id, chal1, chal2, chal3, chal4, total):
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute("SELECT challenge_progress FROM Users WHERE id = ?", (user_id,))
        result = await cursor.fetchone()
        if result:
            progress = json.loads(result[0])
            progress[0] += float(chal1)
            progress[1] += float(chal2)
            progress[2] += float(chal3)
            progress[3] += float(chal4)
            progress[4] += float(total) 
            await db.execute("UPDATE Users SET challenge_progress = ? WHERE id = ?", (json.dumps(progress), user_id))
            await db.commit()

async def get_user(user_id):
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute("SELECT health_score_avg, challenge_progress, username FROM Users WHERE id = ?", (user_id,))
        user = await cursor.fetchone()
        if not user:
            return None
        cursor = await db.execute("SELECT id FROM Posts WHERE userId = ?", (user_id,))
        posts = await cursor.fetchall()
        return {
            "username": user[2],
            "posts": [post[0] for post in posts],
            "health_score": user[0],
            "challenge_progress": user[1]
        }

async def add_friend(user_id, friend_id):
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute("SELECT friends FROM Users WHERE id = ?", (friend_id,))
        friend = await cursor.fetchone()
        if not friend:
            return False
        cursor = await db.execute("SELECT friends FROM Users WHERE id = ?", (user_id,))
        user = await cursor.fetchone()
        if not user:
            return False

        friend_friends = json.loads(friend[0])
        user_friends = json.loads(user[0])

        if user_id not in friend_friends:
            friend_friends.append(user_id)
        if friend_id not in user_friends:
            user_friends.append(friend_id)

        await db.execute("UPDATE Users SET friends = ? WHERE id = ?", (json.dumps(friend_friends), friend_id))
        await db.execute("UPDATE Users SET friends = ? WHERE id = ?", (json.dumps(user_friends), user_id))
        await db.commit()
        return True

async def get_feed(user_id, sort_method, visibility="friends"):
    async with aiosqlite.connect(DATABASE) as db:
        if visibility == "friends":
            cursor = await db.execute("SELECT friends FROM Users WHERE id = ?", (user_id,))
            friends = await cursor.fetchone()
            if not friends:
                return []
            friend_ids = json.loads(friends[0])
            placeholders = ",".join("?" * len(friend_ids))
            query = f"""
                SELECT * FROM Posts
                WHERE userId IN ({placeholders})
                ORDER BY {sort_method}
            """
            cursor = await db.execute(query, friend_ids)
        else:
            query = f"""
                SELECT * FROM Posts
                WHERE visibility = ?
                ORDER BY {sort_method}
            """
            cursor = await db.execute(query, (visibility,))
        posts = await cursor.fetchall()
        formatted_posts = []
        for post in posts:
            formatted_posts.append({
                "id": post[0],
                "userId": post[1],
                "front_image": post[2],
                "back_image": post[3],
                "ingredients": post[4],
                "calories": post[5],
                "health_score": post[6],
                "visibility": post[7],
                "timestamp": post[8],
                "upvotes": post[9]
            })
        return formatted_posts
        # return posts

async def upvote_post(post_id):
    async with aiosqlite.connect(DATABASE) as db:
        await db.execute("UPDATE Posts SET upvotes = upvotes + 1 WHERE id = ?", (post_id,))
        await db.commit()
        cursor = await db.execute("SELECT upvotes FROM Posts WHERE id = ?", (post_id,))
        result = await cursor.fetchone()
        return result[0] if result else None

async def get_challenges():
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute("SELECT * FROM Challenges")
        challenges = await cursor.fetchall()
        return challenges

async def get_challenge_leaderboard(challenge_no, num):
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute(f"""
            SELECT id, username, json_extract(challenge_progress, '$[{challenge_no - 1}]') AS points
            FROM Users
            ORDER BY points DESC
            LIMIT ?
        """, (num,))
        leaderboard = await cursor.fetchall()
        return leaderboard

async def get_all_users():
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute("SELECT id, username FROM Users")
        users = await cursor.fetchall()
        return users

async def get_health_leaderboard(num):
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute("SELECT id, username, health_score_avg FROM Users ORDER BY health_score_avg DESC LIMIT ?", (num,))
        leaderboard = await cursor.fetchall()
        return leaderboard