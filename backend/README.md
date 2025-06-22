# Co-Founder Matching MCP Server

A Model Context Protocol (MCP) server for co-founder matching using collaborative filtering and AI-powered recommendations. This system implements a "Tinder for co-founders" approach where users swipe on potential co-founders, and the system learns their preferences to provide personalized recommendations.

## 🚀 Features

- **Collaborative Filtering**: Learns user preferences from swipe history
- **AI-Powered Matching**: Uses sentence transformers for semantic similarity (no external LLM calls)
- **Multi-Aspect Analysis**: Analyzes skills, interests, experience, and domain expertise
- **Real-time Recommendations**: Provides personalized co-founder suggestions
- **RESTful API**: Easy integration with frontend applications
- **MongoDB Atlas**: Cloud database with async operations

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │◄──►│   MCP Server     │◄──►│   MongoDB       │
│   (Tinder-like) │    │   (FastAPI)      │    │   Atlas Cloud   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Recommender     │
                       │  System          │
                       │  (Local AI)      │
                       └──────────────────┘
```

## 🔍 How It Works (No External LLM Calls)

The system uses **sentence transformers** - local AI models that run on your server:

1. **Embedding Generation**: Converts text to vectors using local models
2. **Similarity Matching**: Compares vectors using cosine similarity
3. **Preference Learning**: Analyzes swipe patterns to learn user preferences
4. **Recommendation Scoring**: Combines learned preferences with AI similarity

**No OpenAI, GPT, or external API calls are made** - everything runs locally!

## 📋 Prerequisites

- Python 3.8+
- MongoDB Atlas account (free tier available)
- pip (Python package manager)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd likelionHacks
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Run setup script**
   ```bash
   python setup.py
   ```

4. **Set up MongoDB Atlas**
   - Create account at: https://www.mongodb.com/atlas
   - Create a new cluster (free tier available)
   - Get your connection string from Atlas dashboard
   - Update `.env` file with your connection string

5. **Run the server**
   ```bash
   python run_server.py
   ```

The server will start on `http://localhost:8000`

## 📚 API Documentation

Once the server is running, you can access:
- **Interactive API Docs**: http://localhost:8000/docs
- **OpenAPI Specification**: http://localhost:8000/openapi.json

### Core Endpoints

#### 1. Create User Profile
```http
POST /users
Content-Type: application/json

{
  "name": "Anand",
  "startupIdea": "AI-powered marketing automation",
  "role": "Founder",
  "location": "New York, NY",
  "skills": ["AI", "Machine Learning", "Python"],
  "experience": [...],
  "education": [...],
  "projects": [...],
  "links": [...],
  "accomplishments": [...],
  "what I'm looking for": "Technical co-founder with ML expertise",
  "profileType": "founder"
}
```

#### 2. Record Swipe Decision
```http
POST /users/{user_id}/swipe
Content-Type: application/json

{
  "target_user_id": "target-user-uuid",
  "decision": 1  // 0=dislike, 1=like, 2=super like
}
```

#### 3. Get Recommendations
```http
POST /users/{user_id}/recommendations
Content-Type: application/json

{
  "user_id": "user-uuid",
  "limit": 10
}
```

#### 4. Get User Profile
```http
GET /users/{user_id}/profile
```

#### 5. Get Swipe History
```http
GET /users/{user_id}/swipe-history?limit=20
```

## 🧠 How the Recommender Works

### 1. Embedding Generation (Local AI)
The system generates embeddings for four key aspects of each profile using **sentence transformers**:
- **Skills**: Technical and soft skills
- **Summary**: Startup idea, role, and what they're looking for
- **Interests**: Projects and accomplishments
- **Domain**: Experience and education background

### 2. Preference Learning
```python
def learn_preference_patterns(my_embeddings, swipe_history, context_size=10):
    # Analyzes last 10 swipes to learn patterns
    # Weights: Like=1.0, Super Like=2.0, Dislike=-0.5
```

### 3. Recommendation Scoring
```python
def predict_swipe_likelihood(candidate_embeddings, learned_preferences):
    # Calculates similarity to previously liked profiles
    # Returns likelihood score
```

### 4. Final Recommendation
```python
final_score = 0.8 * swipe_likelihood + 0.2 * ai_compatibility_score
```

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
HOST=0.0.0.0
PORT=8000
RELOAD=true

# MongoDB Atlas Configuration
MONGODB_URL=mongodb+srv://your_username:your_password@your_cluster.abc123.mongodb.net/cofounder_matching
DATABASE_NAME=cofounder_matching

# Logging
LOG_LEVEL=info
```

## 📊 Database Schema (MongoDB Atlas)

### Users Collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "startupIdea": "string",
  "role": "string",
  "location": "string",
  "skills": ["array"],
  "experience": ["array"],
  "education": ["array"],
  "projects": ["array"],
  "links": ["array"],
  "accomplishments": ["array"],
  "what I'm looking for": "string",
  "profileType": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### User Embeddings Collection
```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "skills_embedding": ["array"],
  "summary_embedding": ["array"],
  "interests_embedding": ["array"],
  "domain_embedding": ["array"],
  "created_at": "datetime"
}
```

### Swipe History Collection
```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "target_user_id": "string",
  "decision": "number", // 0=dislike, 1=like, 2=super like
  "timestamp": "datetime"
}
```

## 🚀 Usage Example

```python
import requests

# Base URL
BASE_URL = "http://localhost:8000"

# 1. Create a user profile
user_data = {
    "name": "Anand",
    "startupIdea": "AI-powered startup that helps businesses automate their marketing and sales processes",
    "role": "Founder",
    "location": "New York, NY",
    "skills": ["AI", "Machine Learning", "Data Science", "Python", "SQL"],
    "experience": [...],
    "education": [...],
    "projects": [...],
    "links": [...],
    "accomplishments": [...],
    "what I'm looking for": "I'm looking for a co-founder who is passionate about the startup idea and has the skills to help me build the startup",
    "profileType": "founder"
}

response = requests.post(f"{BASE_URL}/users", json=user_data)
user_id = response.json()["user_id"]

# 2. Get recommendations
recommendations_response = requests.post(
    f"{BASE_URL}/users/{user_id}/recommendations",
    json={"user_id": user_id, "limit": 5}
)

recommendations = recommendations_response.json()
print("Recommended co-founders:", recommendations)
```

## 🔍 Testing

The server includes comprehensive error handling and validation. You can test the API using:

1. **Interactive docs**: Visit http://localhost:8000/docs
2. **Test script**: Run `python test_api.py`
3. **curl commands**: Use the endpoints directly
4. **Postman**: Import the OpenAPI spec

## 🛡️ Error Handling

The system includes robust error handling for:
- Invalid user IDs
- Missing embeddings
- Database connection issues
- Malformed requests

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced matching algorithms
- [ ] Analytics dashboard
- [ ] Mobile app integration
- [ ] Machine learning model retraining
- [ ] A/B testing framework

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For questions or support, please open an issue on GitHub or contact the development team. 