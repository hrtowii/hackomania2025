import sqlite3
import json
from datetime import datetime

def save_post(userId, front_image, back_image, ingredients, calories, health_score, visibility, timestamp, upvotes):
   with sqlite3.connect('database.db') as con:
        cur = con.cursor()
        cur.execute("INSERT INTO Posts(userId, front_image, back_image, ingredients, calories, health_score, visibility, timestamp, upvotes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", (userId, front_image, back_image, ingredients, calories, health_score, visibility, timestamp, upvotes, ))
        con.commit()

      #   post_id = con.lastrowid
      #   con.close()

      #   return post_id

def update_score(Id, chal1, chal2, chal3, chal4, total):
      with sqlite3.connect('database.db') as con:
         cur = con.cursor()
         
         cur.execute("SELECT challenge_progress FROM Users WHERE id=?", (Id,))
         result = cur.fetchone()
         
         if result:
            progress = json.loads(result[0])
           
            if chal1:
               progress[0] += 1
            
            if chal2:
               progress[1] += 1
               
            if chal3:
               progress[2] += 1
               
            if chal4:
               progress[3] += 1
               
            progress[4] += total
            
            updated_progress = json.dumps(progress)
            
            cur.execute("UPDATE Users SET challenge_progress=? WHERE id=?", (updated_progress, Id))
            con.commit()
            
         else:
            print(f"User with id {Id} not found :(")

      
