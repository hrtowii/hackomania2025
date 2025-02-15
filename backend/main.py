import sqlite3
from flask import Flask, jsonify, request
from flask_login import LoginManager
import OpenAI
from dbcmds import save_post

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
            "SELECT email FROM Users WHERE email = (?)", (email,)) # sql query
        rows = cur.fetchall()

    try:
        rows[0]['email']
        return jsonify(error="Email already exists", status=400)
    except:
        pass

    with sqlite3.connect('database.db') as con:
        cur = con.cursor()
        cur.execute("INSERT INTO users(email, password, username) VALUES (?, ?, ?)",
                        (email, password, username))
        con.commit()

    return jsonify(success=True)


@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data['email']
    password = data['password']

    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute(
            "SELECT id, password FROM Users WHERE email = (?)", (email,)) # sql query
        rows = cur.fetchall()

    try:
        db_password = rows[0]['password']
        user_id = rows[0]['id']
        if db_password == password:
            return jsonify(id=user_id, status=200)
        else:
            return jsonify(error="Wrong password", status=400)
    except:
        return jsonify(error="Account doesn't exist", status=400)

@app.route("/users/<user_id>/", methods=["GET"])
def get_user(user_id):

    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute(
            "SELECT health_score_avg, challenge_progress FROM Users WHERE id = (?)", (user_id,))
        rows = cur.fetchall()

    try:
        health_score = rows[0]['health_score_avg']
        challenge_progress = rows[0]['challenge_progress']
    except:
        return jsonify(error="user doesn't exist", status=400)

    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute(
            "SELECT id FROM Posts WHERE userId = (?)", (user_id,)) # sql query
        rows = cur.fetchall()
        print(rows)

    posts = rows

    return jsonify(posts=posts, health_score=health_score, challenge_progress=challenge_progress, status=200)


@app.route("/users/<user_id>/friends/add/<friend_id>/", methods=["GET"])
def add_friend(user_id, friend_id):

    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute(
            "SELECT friends FROM Users WHERE id = (?)", (friend_id,))
        rows = cur.fetchall()

    try:
        friends_friendlist = rows[0]['friends']
    except:
        return jsonify(error="user doesn't exist"), 400

    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute(
            "SELECT friends FROM Users WHERE id = (?)", (user_id,))
        rows = cur.fetchall()

    try:
        user_friendlist = rows[0]['friends']
    except:
        return jsonify(error="user doesn't exist"), 400


    print(1)

    # i know this is terrible practice dont murder me but i cant be bothered to deal with the foreign key shit
    # hopefully this doesnt bckfire :)

    print(friends_friendlist)
    print(user_friendlist)

    friends_friendlist_parsed = json.loads(friends_friendlist)
    user_friendlist_parsed = json.loads(user_friendlist)

    print(2)

    if user_id not in friends_friendlist:
        friends_friendlist_parsed.append(user_id)

    if friend_id not in user_friendlist:
        user_friendlist_parsed.append(friend_id)

    print(3)

    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute("UPDATE Users SET friends=(?) WHERE id=(?)",
                        (json.dumps(user_friendlist_parsed), user_id))
        cur.execute("UPDATE Users SET friends=(?) WHERE id=(?)",
                        (json.dumps(friends_friendlist_parsed), friend_id))
        con.commit()

    print(4)

    return jsonify(success=True)


@app.route("/posts", methods=["GET", "POST"])
def posts():
    data = request.get_json()

    with sqlite3.connect('database.db') as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute(
            "SELECT type FROM posts WHERE email = (?)", (email,)) # sql query
        rows = cur.fetchall()

@app.route("/posts/upload", methods=["POST"])
def upload():
    data = request.get_json()

    if not data or 'image_base64' not in data:
        return jsonify(error="No image found", status=400)

    image_b64 = data['image_base64']
    vis = data['visibility']# DEFAULTS TO comm
    user_id = data['userID'] # Validation below

    if not user_id:
        return jsonify(error="No user ID provided", status=400)
    elif isinstance(user_id, int) == False:
        return jsonify(error="User ID is not int", status=400)
    
    if (vis != "public") and (vis != "friends"):
        return jsonify(error="Invalid visibility type")

    try:
        img = decode_img(image_b64)
        print(img)

    except ValueError as e:
        return jsonify(error=str(e), status=400)


    

    
    
    return jsonify(status=200)


@app.route("/posts/<post_id>/", methods=["GET"])
def get_post_by_id(post_id):
    pass


if __name__ == "__main__":
    app.run(port=8080)
