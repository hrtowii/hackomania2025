## 🌟 Project Overview
hackathon project that combines computer vision with social engagement to promote healthy eating habits. Users capture photos of their meals, get AI-powered nutrition analysis, earn points for healthy choices, and compete on leaderboards while building a health-conscious community.

**Hackathon Challenge:** https://hackomania.geekshacking.com/challengeStatements/Kitchen%20Copilot%20Challenge%20Statement.pdf


## 🚀 Key Features
- **AI-Powered Food Analysis**  
  - Dual camera system captures food presentation
  - OpenAI analysis provides calorie count & nutrition score
  - Automatic challenge completion detection

- **Gamified Health Tracking**  
  - Earn points for healthy choices (vegetables, whole grains, etc.)
  - Compete in 5 nutritional challenges
  - Track progress through dynamic leaderboards

- **Social Wellness Platform**  
  - Share healthy meals with friends
  - Discover nutrition tips in Explore section
  - Follow friends' progress and achievements

- **Real-Time Leaderboards**  
  - Global and challenge-specific rankings
  - Customizable entry counts
  - Interactive challenge explanations

## 🛠 Tech Stack
**Frontend**  
- React Native (Expo)  
- React Navigation  
- React Native Paper UI Kit  
- Expo Camera & Image Picker  

**Backend**  
- Flask REST API  
- SQLite Database  
- OpenAI Vision API (Nutrition Analysis)  
- JWT Authentication  

**AI/ML**  
- GPT-4 Vision for food detection  
- Custom nutrition scoring algorithm  
- Challenge completion detection model  

## ⚙️ Installation
**Prerequisites**  
- Node.js 18+ & npm
- Python 3.9+
- Expo CLI (`npm install -g expo-cli`)
- OpenAI API key

**Setup**  
```bash
# Frontend
cd frontend
npm install
cp .env.example .env # Add your backend URL

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env # Add OpenAI API key

# Initialize Database
python database.py
```

## 🏃 Running the App
**Start Backend**  
```bash
cd backend
python main.py # Starts on port 8080
```

**Start Frontend**  
```bash
cd frontend
npx expo start
```

## 🍎 Key Components
1. **AI Nutrition Analysis**  
```python
def analyze_image_with_openai(image_b64):
    # GPT-4 Vision analyzes food composition
    # Returns calories, health score, and challenge completions
```

2. **Social Feed**  
```tsx
// React Native feed with upvoting
<FlatList 
  data={posts}
  renderItem={({item}) => (
    <PostCard 
      frontImage={item.front_image}
      backImage={item.back_image}
      onUpvote={() => handleUpvote(item.id)}
    />
  )}
/>
```

3. **Challenge System**  
```python
# Update user's challenge progress
def update_score(user_id, chal1, chal2, chal3, chal4, total):
    # Track challenge completions in JSON array
    # [veggies, whole_grains, protein, no_fried, total]
```


## 🌱 Future Roadmap
- [ ] Meal planning integration
- [ ] Nutritionist chat feature
- [ ] AR food visualization
- [ ] Weekly health reports
- [ ] Recipe suggestion engine
