import sqlite3
from datetime import datetime

def save_post(user_id, image_base64, ingredients, calories, health_score, visibility, upvotes):
   with sqlite3.connect('database.db') as con:
        cur = con.cursor()
        cur.execute("INSERT INTO Posts(user_id, image_base64, ingredients, calories, health_score, visibility, upvotes) VALUES (?, ?, ?, ?, ?, ?, ?)", (user_id, image_base64, ingredients, calories, health_score, visibility, upvotes, ))
        con.commit()

        post_id = con.lastrowid
        con.close()

        return post_id
