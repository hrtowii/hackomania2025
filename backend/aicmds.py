import base64
import json
from typing import List, Dict

import cv2
import numpy as np
import openai
from pydantic import BaseModel
from flask import Flask, request, jsonify

from dotenv import load_dotenv
import os

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")
# print(openai.api_key)
client = openai.OpenAI(api_key=openai.api_key, base_url="https://openrouter.ai/api/v1")

class FoodDetails(BaseModel):
    calories: int
    health_score: int
    food_name: str
    ingredients: str

def analyze_image_with_openai(image_b64: str):
    """
    This function sends a base64-encoded image along with instructions to the OpenAI
    vision API using the OpenAI library. The prompt instructs the model to detect
    if the image contains papayas, cucumbers, or tomatoes and to provide details
    on watering, soil, pest, and harvesting.
    """
    try:
        response = client.beta.chat.completions.parse(
            model="gpt-4o-2024-08-06",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert nutritionist who analyzes images and provides information regarding the food in the image."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Analyze the attached image and detect the food present. If you find that there is food in the image, determine how healthy the food is and assign it a score between 1 through 10 based on its ingredients and your expert opinion on its nutritional content (i.e - decrease if it is fat-heavy or very salty, increase if it is balanced or high in protein etc.). Afterwards, respond with a JSON summary that includes the food name and the following details: "
                                "calories, health_score, food_name, and ingredients. For example: "
                                '{"detected_food": ["hot dog"], "details": {"hot dog": {"calories": "...", "health_score": "...", "food_name": "...", "ingredients": "..."}}}.'
                            )
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_b64}",
                                "detail": "high"  # or "low" or "auto"
                            }
                        }
                    ],
                }
            ],
            response_format=FoodDetails,
            max_tokens=500  # Adjust as needed
        )
        
        ai_message = response.choices[0].message.content
        print("OpenAI vision API response:", ai_message)
        result = json.loads(ai_message)
        # print(result)
        return result
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}. Response text: {response.text}")
        return {"detected_food": [], "details": {}}
    except Exception as e:
        print("OpenAI vision API error:", e)
        return {"detected_food": [], "details": {}}

