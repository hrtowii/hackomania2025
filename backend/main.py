import sqlite3
from flask import Flask, jsonify, request, make_response
from flask_login import LoginManager
import openai
from dbcmds import save_post
import json
import base64

def decode_img(img_b64):
    try:
        img = base64.b64decode(img_b64)
        return img
    except Exception as e:
        raise ValueError("Invalid Base64 Image")

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

    if not rows:
        return make_response(jsonify(error="User doesn't exist"), 404)

    health_score = rows[0]['health_score_avg']
    challenge_progress = rows[0]['challenge_progress']

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

    if not data or 'image_base64' not in data:
        return make_response(jsonify(error="No image found"), 400)

    image_b64 = data['image_base64']
    vis = data.get('visibility', 'public')
    user_id = data.get('userID')

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

    if vis not in ("public", "friends"):
        return make_response(jsonify(error="Invalid visibility type"), 400)

    try:
        img = decode_img(image_b64)
    except ValueError as e:
        return make_response(jsonify(error=str(e)), 400)

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

    return make_response(jsonify(posts=posts,status=200))

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

    return make_response(jsonify(posts=posts,status=200))

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

    return make_response(jsonify(posts=posts,status=200))

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

        return make_response(jsonify(count=count, status=200))
    except:
        return make_response(jsonify(error="Post with specified ID doesn't exist!"), 400)

if __name__ == "__main__":
    app.run(port=8080)