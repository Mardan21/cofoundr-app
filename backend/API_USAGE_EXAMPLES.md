# API Usage Examples

## Creating Users with LinkedIn Enrichment

### 1. Create User with Minimal Frontend Data Only

**Endpoint:** `POST /users`

**Request Body:**
```json
{
  "bio": "I'm a software engineer with a passion for building products that help people live better lives.",
  "startupIdea": "AI-powered startup that helps businesses automate their marketing and sales processes",
  "links": [
    {
      "name": "LinkedIn",
      "url": "https://www.linkedin.com/in/anand-mohansingh"
    },
    {
      "name": "GitHub",
      "url": "https://github.com/anandmohansingh"
    }
  ]
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user_id": "507f1f77bcf86cd799439011",
  "profile": {
    "name": "",
    "bio": "I'm a software engineer with a passion for building products that help people live better lives.",
    "startupIdea": "AI-powered startup that helps businesses automate their marketing and sales processes",
    "role": "",
    "location": "",
    "skills": [],
    "experience": [],
    "education": [],
    "projects": [],
    "links": [
      {
        "name": "LinkedIn",
        "url": "https://www.linkedin.com/in/anand-mohansingh"
      },
      {
        "name": "GitHub",
        "url": "https://github.com/anandmohansingh"
      }
    ],
    "accomplishments": [],
    "profileType": "founder",
    "lookingFor": "Looking for a co-founder to build something amazing together!"
  },
  "linkedin_enriched": false
}
```

### 2. Create User with LinkedIn Enrichment

**Endpoint:** `POST /users`

**Request Body:**
```json
{
  "bio": "I'm a software engineer with a passion for building products that help people live better lives.",
  "startupIdea": "AI-powered startup that helps businesses automate their marketing and sales processes",
  "links": [
    {
      "name": "LinkedIn",
      "url": "https://www.linkedin.com/in/anand-mohansingh"
    },
    {
      "name": "GitHub",
      "url": "https://github.com/anandmohansingh"
    }
  ],
  "linkedin_id": "lethiraj"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user_id": "507f1f77bcf86cd799439011",
  "profile": {
    "name": "Lakshmi Prasanna Ethiraj",
    "bio": "I'm a software engineer with a passion for building products that help people live better lives.",
    "startupIdea": "AI-powered startup that helps businesses automate their marketing and sales processes",
    "role": "Vice president at Goldman Sachs",
    "location": "New York City Metropolitan Area, United States of America",
    "skills": ["Python", "React", "Node.js"],
    "experience": [
      {
        "company": "Goldman Sachs",
        "title": "Vice President, Marcus by Goldman Sachs",
        "startDate": "2022-12-01",
        "endDate": null,
        "description": "Senior Software Engineer"
      }
    ],
    "education": [
      {
        "school": "University at Buffalo",
        "degree": "Bachelor of Science - BS",
        "startDate": "",
        "endDate": ""
      }
    ],
    "projects": [
      {
        "name": "Engineering Intramural",
        "description": "Led engineering team for intramural project"
      }
    ],
    "links": [
      {
        "name": "LinkedIn",
        "url": "https://www.linkedin.com/in/anand-mohansingh"
      },
      {
        "name": "GitHub",
        "url": "https://github.com/anandmohansingh"
      }
    ],
    "accomplishments": [
      {
        "name": "Dean's List",
        "description": "Academic excellence award"
      }
    ],
    "languages": ["English", "Hindi", "Sanskrit", "Tamil", "Telugu"],
    "profileType": "founder",
    "lookingFor": "Looking for a co-founder to build something amazing together!"
  },
  "linkedin_enriched": true,
  "audio_base64": "UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT..."
}
```

### 3. Create User with LinkedIn ID in URL Path

**Endpoint:** `POST /users/with-linkedin/{linkedin_id}`

**Request Body:**
```json
{
  "bio": "I'm a software engineer with a passion for building products that help people live better lives.",
  "startupIdea": "AI-powered startup that helps businesses automate their marketing and sales processes",
  "links": [
    {
      "name": "LinkedIn",
      "url": "https://www.linkedin.com/in/anand-mohansingh"
    },
    {
      "name": "GitHub",
      "url": "https://github.com/anandmohansingh"
    }
  ]
}
```

**Response:**
```json
{
  "message": "User created successfully with LinkedIn enrichment",
  "user_id": "507f1f77bcf86cd799439011",
  "profile": {
    // Same as above with LinkedIn enrichment
  },
  "linkedin_id": "lethiraj"
}
```

## Data Flow

1. **Frontend sends minimal data:**
   - `bio`: User's bio/description
   - `startupIdea`: Their startup idea (can be empty string)
   - `links`: Array of links (LinkedIn required, GitHub optional)
   - `linkedin_id`: Optional LinkedIn profile ID

2. **Backend processing:**
   - If `linkedin_id` is provided, fetch LinkedIn profile data
   - Merge frontend data with LinkedIn data
   - Frontend data takes precedence for bio, startupIdea, and links
   - LinkedIn data provides name, role, location, experience, education, skills, etc.
   - Set defaults for missing fields
   - Generate audio summary using ElevenLabs (if LinkedIn enrichment is used)
   - Save audio to database along with user profile

3. **Result:**
   - Complete user profile with all required fields
   - Audio file stored in database (if LinkedIn enrichment was used)
   - User is created in database
   - Embeddings are generated for recommendation system

## Audio Storage and Retrieval

### Get User Audio
**Endpoint:** `GET /users/{user_id}/audio`

**Response:**
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "audio_base64": "UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT...",
  "message": "Audio retrieved successfully"
}
```

### Get User Profile with Audio
**Endpoint:** `GET /users/{user_id}/profile?include_audio=true`

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "full_name": "Lakshmi Prasanna Ethiraj",
  "bio": "I'm a software engineer with a passion for building products that help people live better lives.",
  "startupIdea": "AI-powered startup that helps businesses automate their marketing and sales processes",
  "role": "Vice president at Goldman Sachs",
  "city": "New York City Metropolitan Area",
  "state": "United States of America",
  "skills": ["Python", "React", "Node.js"],
  "experiences": [...],
  "education": [...],
  "links": [...],
  "profileType": "founder",
  "lookingFor": "Looking for a co-founder to build something amazing together!",
  "audio_base64": "UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT...",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
``` 