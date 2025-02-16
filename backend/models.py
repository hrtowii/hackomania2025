from pydantic import BaseModel
from typing import List, Optional

class FoodDetails(BaseModel):
    calories: int
    health_score: float
    food_name: str
    ingredients: str
    chal1: bool
    chal2: bool
    chal3: bool
    chal4: bool
    total_chals: int

class UserCreate(BaseModel):
    email: str
    username: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class PostCreate(BaseModel):
    front_image: str
    back_image: str
    visibility: str
    userID: int

class ChallengeProgress(BaseModel):
    chal1: bool
    chal2: bool
    chal3: bool
    chal4: bool
    total: float

class UserResponse(BaseModel):
    username: str
    posts: List[int]
    health_score: float
    challenge_progress: str

class PostResponse(BaseModel):
    id: int
    userId: int
    front_image: str
    back_image: str
    ingredients: str
    calories: int
    health_score: int
    visibility: str
    timestamp: str
    upvotes: int

class ChallengeResponse(BaseModel):
    id: int
    name: str
    description: str

class LeaderboardUser(BaseModel):
    id: int
    username: str
    points: int