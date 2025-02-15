import sqlite3
from datetime import datetime

def save_post(userId, front_image, back_image, ingredients, calories, health_score, visibility, timestamp, upvotes):
   with sqlite3.connect('database.db') as con:
        cur = con.cursor()
        cur.execute("INSERT INTO Posts(userId, front_image, back_image, ingredients, calories, health_score, visibility, timestamp, upvotes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", (userId, front_image, back_image, ingredients, calories, health_score, visibility, timestamp, upvotes, ))
        con.commit()

      #   post_id = con.lastrowid
      #   con.close()

      #   return post_id

def get(userId):
   with sqlite3.connect('database.db') as con:
         con.row_factory = sqlite3.Row
         cur = con.cursor()
         cur.execute(
            "SELECT * FROM Posts WHERE userId = (?)", (userId,)) # sql query
         rows = cur.fetchall()

      
