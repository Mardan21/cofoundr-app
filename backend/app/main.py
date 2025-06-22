from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import uuid
from datetime import datetime

from .models import (
    UserProfile, SwipeDecision, RecommendationRequest, 
    RecommendationResponse, ProfileType
)
from .recommender import CoFounderRecommender, handle_swipe_feedback
from .database import get_db, MongoDBManager
from .linkedin_integration import linkedin_integration

app = FastAPI(
    title="Co-Founder Matching MCP Server",
    description="A Model Context Protocol server for co-founder matching using collaborative filtering with LinkedIn integration",
    version="1.0.0"
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize recommender system
recommender = CoFounderRecommender()

@app.on_event("startup")
async def startup_event():
    """Initialize the application"""
    print("🚀 Co-Founder Matching MCP Server starting up...")
    
    # Create database indexes
    try:
        db = get_db()
        await db.create_indexes()
        print("✅ Database indexes created successfully")
    except Exception as e:
        print(f"⚠️  Warning: Could not create database indexes: {e}")
        print("   This is normal if MongoDB is not connected yet")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("🛑 Co-Founder Matching MCP Server shutting down...")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Co-Founder Matching MCP Server is running!",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.post("/users", response_model=Dict[str, Any])
async def create_user(profile: UserProfile, db: MongoDBManager = Depends(get_db)):
    """Create a new user profile and generate embeddings"""
    try:
        # Convert profile to dict
        user_data = profile.dict()
        
        # Create user in database
        user_id = await db.create_user(user_data)
        
        # Generate embeddings
        embeddings = recommender.generate_embeddings(user_data)
        
        # Save embeddings to database
        await db.save_user_embeddings(user_id, embeddings)
        
        return {
            "message": "User created successfully",
            "user_id": user_id,
            "profile": user_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

@app.post("/users/{user_id}/swipe")
async def record_swipe(user_id: str, swipe: SwipeDecision, db: MongoDBManager = Depends(get_db)):
    """Record a swipe decision (like/dislike/super like)"""
    try:
        # Verify user exists
        user = await db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify target user exists
        target_user = await db.get_user_by_id(swipe.target_user_id)
        if not target_user:
            raise HTTPException(status_code=404, detail="Target user not found")
        
        # Save swipe decision to database
        swipe_id = await db.save_swipe(user_id, swipe.target_user_id, swipe.decision)
        
        # Update recommender cache for continuous learning
        await handle_swipe_feedback(user_id, swipe.target_user_id, swipe.decision)
        
        return {
            "message": "Swipe recorded successfully",
            "swipe_id": swipe_id,
            "decision": swipe.decision
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error recording swipe: {str(e)}")

@app.post("/users/{user_id}/recommendations", response_model=RecommendationResponse)
async def get_recommendations(user_id: str, request: RecommendationRequest, db: MongoDBManager = Depends(get_db)):
    """Get personalized recommendations for a user"""
    try:
        # Get user profile
        user = await db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get swipe history
        swipe_history_records = await db.get_swipe_history(user_id, limit=50)
        
        # Convert swipe history to format expected by recommender
        swipe_history = []
        for record in swipe_history_records:
            target_user = await db.get_user_by_id(record['target_user_id'])
            if target_user:
                swipe_history.append({
                    'profile': target_user,
                    'decision': record['decision']
                })
        
        # Get all candidate users (excluding current user)
        all_candidates = await db.get_all_users(exclude_user_id=user_id)
        
        # Convert user profile to dict format for recommender
        my_profile = {
            'name': user['name'],
            'startupIdea': user['startupIdea'],
            'role': user['role'],
            'location': user['location'],
            'skills': user['skills'],
            'experience': user['experience'],
            'education': user['education'],
            'projects': user['projects'],
            'links': user['links'],
            'accomplishments': user['accomplishments'],
            'what I\'m looking for': user.get('what I\'m looking for', ''),
            'profileType': user['profileType']
        }
        
        # Get recommendations using async function
        recommendations_with_scores = await recommender.recommend_profiles(
            my_profile, all_candidates, swipe_history, user_id
        )
        
        # Limit results
        recommendations_with_scores = recommendations_with_scores[:request.limit]
        
        # Separate recommendations and scores
        recommendations = [rec[0] for rec in recommendations_with_scores]
        scores = [rec[1] for rec in recommendations_with_scores]
        
        return RecommendationResponse(
            recommendations=recommendations,
            scores=scores
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting recommendations: {str(e)}")

@app.get("/users/{user_id}/profile")
async def get_user_profile(user_id: str, db: MongoDBManager = Depends(get_db)):
    """Get a user's profile"""
    try:
        user = await db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting user profile: {str(e)}")

@app.get("/users/{user_id}/swipe-history")
async def get_swipe_history(user_id: str, limit: int = 20, db: MongoDBManager = Depends(get_db)):
    """Get user's swipe history"""
    try:
        user = await db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        swipe_history = await db.get_swipe_history(user_id, limit=limit)
        
        return {
            'user_id': user_id,
            'swipe_history': swipe_history
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting swipe history: {str(e)}")

@app.get("/stats")
async def get_stats(db: MongoDBManager = Depends(get_db)):
    """Get system statistics"""
    try:
        # Get basic stats
        total_users = await db.users.count_documents({})
        total_swipes = await db.swipe_history.count_documents({})
        
        return {
            'total_users': total_users,
            'total_swipes': total_swipes,
            'server_status': 'healthy',
            'timestamp': datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting stats: {str(e)}")

# LinkedIn Integration Endpoints
@app.post("/linkedin/enrich-profile")
async def enrich_linkedin_profile(linkedin_id: str):
    """
    Enrich user profile with LinkedIn data, summary, and audio
    
    Args:
        linkedin_id: LinkedIn profile ID (e.g., 'lethiraj')
    """
    try:
        result = await linkedin_integration.enrich_user_profile(linkedin_id)
        
        if result['success']:
            return {
                'success': True,
                'linkedin_id': linkedin_id,
                'profile_data': result['profile_data'],
                'summary': result['summary'],
                'audio_base64': result['audio_base64'],
                'message': 'Profile enriched successfully'
            }
        else:
            raise HTTPException(status_code=400, detail=result['error'])
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error enriching profile: {str(e)}")

@app.get("/linkedin/profile/{linkedin_id}")
async def get_linkedin_profile(linkedin_id: str):
    """
    Get LinkedIn profile data only
    
    Args:
        linkedin_id: LinkedIn profile ID
    """
    try:
        profile_data = await linkedin_integration.get_linkedin_profile(linkedin_id)
        
        if profile_data:
            return {
                'success': True,
                'linkedin_id': linkedin_id,
                'profile_data': profile_data
            }
        else:
            raise HTTPException(status_code=404, detail="LinkedIn profile not found")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching LinkedIn profile: {str(e)}")

@app.post("/linkedin/summarize")
async def summarize_linkedin_profile(profile_data: Dict[str, Any]):
    """
    Generate summary from LinkedIn profile data
    
    Args:
        profile_data: LinkedIn profile data dictionary
    """
    try:
        summary = await linkedin_integration.summarize_profile(profile_data)
        
        if summary:
            return {
                'success': True,
                'summary': summary
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to generate summary")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

@app.post("/linkedin/text-to-speech")
async def convert_text_to_speech(text: str):
    """
    Convert text to speech using ElevenLabs
    
    Args:
        text: Text to convert to speech
    """
    try:
        audio_data = await linkedin_integration.text_to_speech(text)
        
        if audio_data:
            # Convert to base64 for API response
            import base64
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
            return {
                'success': True,
                'audio_base64': audio_base64,
                'text_length': len(text)
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to convert text to speech")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in text-to-speech: {str(e)}")

@app.post("/users/{user_id}/enrich-from-linkedin")
async def enrich_user_from_linkedin(user_id: str, linkedin_id: str, db: MongoDBManager = Depends(get_db)):
    """
    Enrich existing user profile with LinkedIn data
    
    Args:
        user_id: Existing user ID in the system
        linkedin_id: LinkedIn profile ID to enrich with
    """
    try:
        # Verify user exists
        user = await db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Enrich with LinkedIn data
        result = await linkedin_integration.enrich_user_profile(linkedin_id)
        
        if result['success']:
            # Update user profile with LinkedIn data
            linkedin_data = result['profile_data']
            
            # Merge LinkedIn data with existing profile
            updated_profile = user.copy()
            
            # Update fields if they exist in LinkedIn data
            if linkedin_data.get('full_name') and not user.get('name'):
                updated_profile['name'] = linkedin_data['full_name']
            
            if linkedin_data.get('headline') and not user.get('role'):
                updated_profile['role'] = linkedin_data['headline']
            
            if linkedin_data.get('summary') and not user.get('startupIdea'):
                updated_profile['startupIdea'] = linkedin_data['summary'][:500]  # Limit length
            
            if linkedin_data.get('experiences') and not user.get('experience'):
                # Convert LinkedIn experiences to our format
                experiences = []
                for exp in linkedin_data['experiences'][:3]:  # Limit to 3
                    experiences.append({
                        'title': exp.get('title', ''),
                        'description': exp.get('description', ''),
                        'company': exp.get('company', '')
                    })
                updated_profile['experience'] = experiences
            
            if linkedin_data.get('education') and not user.get('education'):
                # Convert LinkedIn education to our format
                education = []
                for edu in linkedin_data['education'][:2]:  # Limit to 2
                    education.append({
                        'degree': edu.get('degree_name', ''),
                        'school': edu.get('school', '')
                    })
                updated_profile['education'] = education
            
            if linkedin_data.get('skills') and not user.get('skills'):
                # Extract skills from LinkedIn
                skills = [skill.get('name', '') for skill in linkedin_data['skills'][:10]]
                updated_profile['skills'] = skills
            
            # Update user in database
            await db.users.update_one(
                {"_id": user['id']},
                {"$set": updated_profile}
            )
            
            return {
                'success': True,
                'user_id': user_id,
                'linkedin_id': linkedin_id,
                'updated_profile': updated_profile,
                'summary': result['summary'],
                'audio_base64': result['audio_base64'],
                'message': 'User profile enriched with LinkedIn data'
            }
        else:
            raise HTTPException(status_code=400, detail=result['error'])
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error enriching user: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 