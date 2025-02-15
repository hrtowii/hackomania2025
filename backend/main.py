import sqlite3
from flask import Flask, jsonify, request, make_response
from flask_login import LoginManager
import openai
from dbcmds import save_post, update_score
from aicmds import analyze_image_with_openai
import json
import base64
from dotenv import load_dotenv
import os
import datetime

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=openai.api_key)

app = Flask(__name__)
app.secret_key = "definitely not plaintext"

login_manager = LoginManager()
login_manager.init_app(app)

@app.route("/auth/signup", methods=["POST"])
def signup():
    data = request.get_json()

    email = data['email']
    username = data['username']
    password = data['password']

    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute(
            "SELECT email FROM Users WHERE email = (?)", (email,))
        rows = cur.fetchall()

    if rows:
        return make_response(jsonify(error="Email already exists"), 400)

    try:
        with sqlite3.connect('database.db') as con:
            cur = con.cursor()
            cur.execute("INSERT INTO users(email, password, username) VALUES (?, ?, ?)",
                        (email, password, username))
            con.commit()
    except sqlite3.IntegrityError:
        return make_response(jsonify(error="Database error"), 500)

    return make_response(jsonify(status=200))

@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data['email']
    password = data['password']

    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute(
            "SELECT id, password FROM Users WHERE email = (?)", (email,))
        rows = cur.fetchall()

    if not rows:
        return make_response(jsonify(error="Account doesn't exist"), 404)

    db_password = rows[0]['password']
    user_id = rows[0]['id']
    if db_password == password:
        return make_response(jsonify(id=user_id))
    else:
        return make_response(jsonify(error="Wrong password"), 401)

@app.route("/users/<user_id>/", methods=["GET"])
def get_user(user_id):
    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute(
            "SELECT health_score_avg, challenge_progress FROM Users WHERE id = (?)", (user_id,))
        rows = cur.fetchall()

    print(rows)

    try:
        health_score = rows[0]['health_score_avg']
        challenge_progress = rows[0]['challenge_progress']
    except:
        return make_response(jsonify(error="User doesn't exist"), 404)

    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute(
            "SELECT id FROM Posts WHERE userId = (?)", (user_id,))
        posts = cur.fetchall()

    all_posts = []
    for i in posts:
        all_posts.append(i['id'])

    return make_response(jsonify(posts=all_posts, health_score=health_score, challenge_progress=challenge_progress))

@app.route("/users/<user_id>/friends/add/<friend_id>/", methods=["GET"])
def add_friend(user_id, friend_id):
    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute("SELECT friends FROM Users WHERE id = (?)", (friend_id,))
        friend_rows = cur.fetchall()

    if not friend_rows:
        return make_response(jsonify(error="Friend user doesn't exist"), 404)

    friends_friendlist = json.loads(friend_rows[0]['friends'])

    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute("SELECT friends FROM Users WHERE id = (?)", (user_id,))
        user_rows = cur.fetchall()

    if not user_rows:
        return make_response(jsonify(error="User doesn't exist"), 404)

    user_friendlist = json.loads(user_rows[0]['friends'])

    if int(user_id) not in friends_friendlist:
        friends_friendlist.append(int(user_id))
    if int(friend_id) not in user_friendlist:
        user_friendlist.append(int(friend_id))

    with sqlite3.connect('database.db') as con:
        cur = con.cursor()
        cur.execute("UPDATE Users SET friends=(?) WHERE id=(?)",
                    (json.dumps(user_friendlist), user_id))
        cur.execute("UPDATE Users SET friends=(?) WHERE id=(?)",
                    (json.dumps(friends_friendlist), friend_id))
        con.commit()

    return make_response(jsonify(success=True))

@app.route("/posts/upload", methods=["POST"])
def upload():
    data = request.get_json()

    if not data or 'front_image' not in data or 'back_image' not in data:
        return jsonify(error="No image found", status=400)

    front_image = data['front_image']
    back_image = data['back_image']
    vis = data['visibility']
    user_id = data['userID']
    curr_dt = datetime.datetime.now()

    if not user_id:
        return make_response(jsonify(error="No user ID provided"), 400)
    elif isinstance(user_id, int) == False:
        return make_response(jsonify(error="User ID is not int"), 400)
    if (vis != "public") and (vis != "friends"):
        return make_response(jsonify(error="No user ID provided"), 400)
    try:
        user_id = int(user_id)
    except ValueError:
        return make_response(jsonify(error="User ID must be an integer"), 400)

    res = analyze_image_with_openai(back_image)
    # res = {"calories":900,"health_score":3,"food_name":"Fried Chicken and Fries","ingredients":"Chicken, batter, oil, fries","chal1":False,"chal2":False,"chal3":True,"chal4":True,"total_chals":2}
    cals = res["calories"]
    hs = res["health_score"]
    ingredients = res['ingredients'].split(', ')
    
    chal1 = res["chal1"]
    chal2 = res["chal2"]
    chal3 = res["chal3"]
    chal4 = res["chal4"]
    total = res["total_chals"]

    save_post(userId=user_id, front_image=front_image, back_image=back_image, ingredients=json.dumps(ingredients), calories=cals, health_score=hs, visibility=vis, timestamp=curr_dt, upvotes=0)
    
    update_score(Id=user_id, chal1=chal1, chal2=chal2, chal3=chal3, chal4=chal4, total=total)
    
    return make_response(jsonify(status=200))

@app.route("/feed/<user_id>/friends/<sort_method>")
def friend_feed(user_id, sort_method):

    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute(
            "SELECT friends FROM Users WHERE id = (?)", (user_id,))
        rows = cur.fetchall()

    try:
            friendlist = rows[0]['friends']
    except:
        return make_response(jsonify(error="user doesn't exist", status=400))

    friendlist_parsed = json.loads(friendlist)

    print(friendlist_parsed)

    placeholders = ','.join(['?'] * len(friendlist_parsed))

    print(placeholders)

    sort_options = {
        "recency": "timestamp ASC",
        "upvotes": "upvotes DESC",
        "health": "health_score DESC"
    }

    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute(
            f"SELECT * FROM Posts WHERE userId IN ({placeholders}) ORDER BY {sort_options.get(sort_method, 'upvotes DESC')}", tuple(friendlist_parsed))
        rows = cur.fetchall()

    posts = []
    for post in rows:
        post = dict(post)
        posts.append(post)

    return make_response(jsonify(posts=posts), 200)

@app.route("/feed/community/<sort_method>")
def community_feed(sort_method):

    sort_options = {
        "recency": "timestamp ASC",
        "upvotes": "upvotes DESC",
        "health": "health_score DESC"
    }

    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute(f"SELECT * FROM Posts WHERE visibility='public' ORDER BY {sort_options.get(sort_method, 'upvotes DESC')}")
        rows = cur.fetchall()

    posts = []
    for post in rows:
        post = dict(post)
        posts.append(post)

    return make_response(jsonify(posts=posts), 200)

@app.route("/feed/healthy/<sort_method>")
def healthy_feed(sort_method):

    sort_options = {
        "recency": "timestamp ASC",
        "upvotes": "upvotes DESC",
        "health": "health_score DESC"
    }

    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute(f"SELECT * FROM Posts WHERE visibility='public' AND health_score > 8.0 ORDER BY {sort_options.get(sort_method, 'upvotes DESC')}")
        rows = cur.fetchall()

    posts = []
    for post in rows:
        post = dict(post)
        posts.append(post)

    return make_response(jsonify(posts=posts), 200)

@app.route("/posts/upvote/<post_id>")
def upvote_post(post_id):
    try:
        with sqlite3.connect('database.db') as con:
                cur = con.cursor()
                cur.execute(f"UPDATE Posts SET upvotes=upvotes+1 WHERE id={post_id}")
                con.commit()

        with sqlite3.connect('database.db') as con:
            con.row_factory = sqlite3.Row
            cur = con.cursor()
            cur.execute(
                f"SELECT upvotes FROM Posts WHERE id={post_id}")
            rows = cur.fetchall()

        count = rows[0]['upvotes']

        return make_response(jsonify(count=count), 200)
    except:
        return make_response(jsonify(error="Post with specified ID doesn't exist!"), 400)

@app.route("/posts/<post_id>")
def get_post(post_id):

    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute(
            f"SELECT * FROM Posts WHERE id={post_id}")
        rows = cur.fetchall()
    post = dict(rows[0])
    return make_response(jsonify(post=post), 200)

@app.route("/challenges")
def get_challenges():
    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute("SELECT * FROM Challenges")
        rows = cur.fetchall()

    challenges = []
    for challenge in rows:
        challenge = dict(challenge)
        challenges.append(challenge)
    return make_response(jsonify(challenges=challenges), 200)


@app.route("/challenge_leaderboard/<challenge_no>/<num>")
def get_challenge_leaderboard(challenge_no, num):
    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute(f"SELECT id, username, json_extract(challenge_progress, '$[{int(challenge_no) - 1}]') AS points FROM Users ORDER BY points DESC LIMIT {num}")
        rows = cur.fetchall()

    users = []
    for user in rows:
        user = dict(user)
        users.append(user)
    return make_response(jsonify(users=users), 200)

@app.route("/leaderboard/health/<num>")
def leaderboard_health(num):

    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute(f"SELECT id, username, health_score_avg FROM Users ORDER BY health_score_avg DESC LIMIT ?", (num,))
        rows = cur.fetchall()

    users = []
    for user in rows:
        user = dict(user)
        users.append(user)
    return make_response(jsonify(users=users), 200)

if __name__ == "__main__":
    app.run(port=8080)
