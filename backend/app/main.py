from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import uuid
from datetime import datetime
import base64
from bson import ObjectId

from .models import (
    UserProfile, SwipeDecision, RecommendationRequest, 
    RecommendationResponse, ProfileType, CreateUserRequest
)
from .recommender import get_recommender, handle_swipe_feedback
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

def clean_objectids(obj):
    """Recursively convert ObjectIds to strings in a data structure"""
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, dict):
        return {key: clean_objectids(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [clean_objectids(item) for item in obj]
    else:
        return obj

def merge_frontend_with_linkedin_data(frontend_data: Dict[str, Any], linkedin_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge minimal frontend user data with LinkedIn profile data - UPDATED FOR NEW SCHEMA
    
    Args:
        frontend_data: Minimal data from the frontend (bio, startupIdea, links)
        linkedin_data: Data from LinkedIn API
        
    Returns:
        Complete user profile data matching new MongoDB schema
    """
    merged_profile = {}
    
    # Start with frontend data as the base. This contains user-provided info
    # which should be prioritized for fields like bio, startup idea, etc.
    merged_profile = frontend_data.copy() if frontend_data else {}

    # If LinkedIn data is available, enrich the profile.
    if linkedin_data:
        # Core identity - Use LinkedIn name only if not provided in form.
        if linkedin_data.get('full_name') and not merged_profile.get('full_name'):
            merged_profile['full_name'] = linkedin_data.get('full_name')

        # Professional info - LinkedIn is the primary source if available.
        merged_profile['role'] = linkedin_data.get('headline', merged_profile.get('role'))
        merged_profile['profile_pic_url'] = linkedin_data.get('profile_pic_url', merged_profile.get('profile_pic_url'))
        merged_profile['follower_count'] = linkedin_data.get('follower_count', 0)
        merged_profile['connections'] = linkedin_data.get('connections', 0)
        
        # Location - LinkedIn is primary source.
        merged_profile['city'] = linkedin_data.get('city', merged_profile.get('city'))
        merged_profile['state'] = linkedin_data.get('state') or linkedin_data.get('country_full_name') or merged_profile.get('state')

        # Detailed sections - LinkedIn is the source. Overwrite if present.
        if 'experiences' in linkedin_data:
            merged_profile['experiences'] = linkedin_data['experiences']
        
        if 'education' in linkedin_data:
            merged_profile['education'] = linkedin_data['education']
            
        if linkedin_data.get('skills'):
            merged_profile['skills'] = [skill['name'] for skill in linkedin_data.get('skills', []) if 'name' in skill]

        if 'accomplishment_projects' in linkedin_data:
            merged_profile['accomplishment_projects'] = linkedin_data['accomplishment_projects']
            
        # Combine links, preventing duplicates
        if linkedin_data.get('links'):
            existing_links = merged_profile.get('links', [])
            linkedin_links = linkedin_data.get('links', [])
            
            existing_urls = {link['url'] for link in existing_links if isinstance(link, dict) and 'url' in link}
            
            for link in linkedin_links:
                if isinstance(link, dict) and 'url' in link and link['url'] not in existing_urls:
                    existing_links.append(link)
            
            merged_profile['links'] = existing_links

    # Set default values for any remaining *essential* fields that are still missing.
    # This prevents errors if both frontend and LinkedIn data are sparse.
    merged_profile.setdefault('full_name', '')
    merged_profile.setdefault('bio', '')
    merged_profile.setdefault('startupIdea', '')
    merged_profile.setdefault('lookingFor', 'Looking for a co-founder to build something amazing together!')
    merged_profile.setdefault('profileType', 'founder')
    merged_profile.setdefault('role', 'Professional')
    merged_profile.setdefault('city', 'Unknown')
    merged_profile.setdefault('state', 'Unknown')
    merged_profile.setdefault('profile_pic_url', 'https://via.placeholder.com/150')
    merged_profile.setdefault('skills', [])
    merged_profile.setdefault('experiences', [])
    merged_profile.setdefault('education', [])
    merged_profile.setdefault('accomplishment_projects', [])
    merged_profile.setdefault('links', [])
    
    return merged_profile

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
async def create_user(request: Request, db: MongoDBManager = Depends(get_db)):
    """Create a new user profile with frontend data and optional LinkedIn enrichment"""
    try:
        # Manually parse the request body as JSON.
        # This bypasses the Pydantic model validation that was dropping fields.
        frontend_data = await request.json()
        
        # Extract linkedin_id and remove it from the main data dict.
        linkedin_id = frontend_data.pop('linkedin_id', None)
        
        # Initialize LinkedIn data as None
        linkedin_data = None
        audio_base64 = None
        
        # If LinkedIn ID is provided, fetch LinkedIn profile data and generate audio
        if linkedin_id:
            try:
                # Use the enrich function to get both profile data and audio
                enrich_result = await linkedin_integration.enrich_user_profile(linkedin_id)
                if enrich_result['success']:
                    linkedin_data = enrich_result['profile_data']
                    audio_base64 = enrich_result.get('audio_base64')
                    print(f"✅ Successfully fetched LinkedIn data and audio for {linkedin_id}")
                else:
                    print(f"⚠️  Failed to enrich LinkedIn data for {linkedin_id}: {enrich_result.get('error')}")
            except Exception as e:
                print(f"⚠️  Error enriching LinkedIn data: {e}")
        
        # Merge frontend data with LinkedIn data
        merged_user_data = merge_frontend_with_linkedin_data(frontend_data, linkedin_data)
        
        # Generate audio if not already generated from LinkedIn
        if not audio_base64:
            try:
                # Create a simple summary from bio and startup idea
                summary_text = f"{merged_user_data.get('bio', '')} {merged_user_data.get('startupIdea', '')}"
                if summary_text.strip():
                    audio_result = await linkedin_integration.text_to_speech(summary_text)
                    if audio_result:
                        audio_base64 = base64.b64encode(audio_result).decode('utf-8')
                        print(f"✅ Generated audio from bio and startup idea")
            except Exception as e:
                print(f"⚠️  Error generating audio: {e}")
        
        # Create user in database
        user_id = await db.create_user(merged_user_data, audio_base64)
        
        # Generate embeddings
        recommender = get_recommender()
        embeddings = recommender.generate_embeddings(merged_user_data)
        
        # Save embeddings to database
        await db.save_user_embeddings(user_id, embeddings)
        
        # Convert ObjectId to string for JSON serialization
        user_id_str = str(user_id)
        
        # Clean any ObjectIds from the profile data
        clean_profile = clean_objectids(merged_user_data)
        
        response_data = {
            "message": "User created successfully",
            "user_id": user_id_str,
            "profile": clean_profile,
            "linkedin_enriched": linkedin_data is not None
        }
        
        # Add audio if available
        if audio_base64:
            response_data["audio_base64"] = audio_base64
        
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

@app.post("/users/with-linkedin/{linkedin_id}", response_model=Dict[str, Any])
async def create_user_with_linkedin(linkedin_id: str, request: CreateUserRequest, db: MongoDBManager = Depends(get_db)):
    """Create a new user profile with LinkedIn enrichment using the provided LinkedIn ID"""
    try:
        # Convert frontend data to dict
        frontend_data = request.dict(exclude={'linkedin_id'})
        
        # Fetch LinkedIn profile data
        linkedin_data = await linkedin_integration.get_linkedin_profile(linkedin_id)
        if not linkedin_data:
            raise HTTPException(status_code=404, detail=f"LinkedIn profile not found for ID: {linkedin_id}")
        
        # Merge frontend data with LinkedIn data
        merged_user_data = merge_frontend_with_linkedin_data(frontend_data, linkedin_data)
        
        # Create user in database
        user_id = await db.create_user(merged_user_data)
        
        # Generate embeddings
        recommender = get_recommender()
        embeddings = recommender.generate_embeddings(merged_user_data)
        
        # Save embeddings to database
        await db.save_user_embeddings(user_id, embeddings)
        
        return {
            "message": "User created successfully with LinkedIn enrichment",
            "user_id": str(user_id),  # Convert ObjectId to string
            "profile": clean_objectids(merged_user_data),  # Clean ObjectIds
            "linkedin_id": linkedin_id
        }
    except HTTPException:
        raise
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

@app.get("/users/{user_id}/recommendations", response_model=RecommendationResponse)
async def get_recommendations(user_id: str, limit: int = 10, db: MongoDBManager = Depends(get_db)):
    """Get personalized recommendations for a user"""
    try:
        # Get user profile
        user = await db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        # Get swipe history from database
        swipe_history_records = await db.get_swipe_history(user_id, limit=100)
        # Convert swipe history to format expected by recommender
        swipe_history = []
        for record in swipe_history_records:
            target_user = await db.get_user_by_id(record['target_user_id'])
            if target_user:
                swipe_history.append({
                    'profile': target_user,
                    'decision': record['decision']
                })
        # Use database-level filtering for better performance
        available_candidates = await db.get_available_candidates(user_id)
        # Convert user profile to dict format for recommender - UPDATED FIELD NAMES
        my_profile = {
            'full_name': user.get('full_name', ''),  # Updated field name
            'startupIdea': user.get('startupIdea', ''),
            'role': user.get('role', ''),
            'city': user.get('city', ''),  # Separate city field
            'state': user.get('state', ''),  # Separate state field
            'skills': user.get('skills', []),
            'experiences': user.get('experiences', []),  # Updated field name (plural)
            'education': user.get('education', []),
            'accomplishment_projects': user.get('accomplishment_projects', []),  # Updated field name
            'links': user.get('links', []),
            'bio': user.get('bio', ''),
            'lookingFor': user.get('lookingFor', ''),  # Updated field name
            'profileType': user.get('profileType', 'founder'),  # Updated field name
            '_id': user.get('_id'),  # Include ID for filtering
            'id': user.get('id')  # Include both ID formats
        }
        # Get recommendations using the singleton recommender (NOT async)
        recommender = get_recommender()
        recommendations_with_scores = recommender.recommend_profiles(
            my_profile, available_candidates, swipe_history, user_id
        )
        # Limit results
        recommendations_with_scores = recommendations_with_scores[:limit]
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
async def get_user_profile(user_id: str, include_audio: bool = False, db: MongoDBManager = Depends(get_db)):
    """Get a user's profile with optional audio"""
    try:
        user = await db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Remove audio from response unless specifically requested
        if not include_audio and 'audio_base64' in user:
            user.pop('audio_base64')
        
        # Clean ObjectIds from the response
        return clean_objectids(user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting user profile: {str(e)}")

@app.put("/users/{user_id}/profile", response_model=Dict[str, Any])
async def update_user_profile(user_id: str, profile_data: Dict[str, Any], db: MongoDBManager = Depends(get_db)):
    """Update a user's profile"""
    try:
        # Verify user exists
        user = await db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update the user profile
        success = await db.update_user(user_id, profile_data)
        
        if success:
            # Get the updated user profile
            updated_user = await db.get_user_by_id(user_id)
            
            return {
                "message": "Profile updated successfully",
                "user_id": user_id,
                "profile": clean_objectids(updated_user)
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to update user profile")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating user profile: {str(e)}")

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

@app.get("/users/{user_id}/audio")
async def get_user_audio(user_id: str, db: MongoDBManager = Depends(get_db)):
    """Get user's audio profile"""
    try:
        user = await db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        audio_base64 = user.get('audio_base64')
        if not audio_base64:
            raise HTTPException(status_code=404, detail="No audio found for this user")
        
        return {
            "user_id": user_id,
            "audio_base64": audio_base64,
            "message": "Audio retrieved successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting user audio: {str(e)}")

@app.get("/users/{user_id}/matches")
async def get_mutual_matches(user_id: str, db: MongoDBManager = Depends(get_db)):
    """Get mutual matches for a user"""
    try:
        user = await db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        matches = await db.get_mutual_matches(user_id)
        
        return {
            'user_id': user_id,
            'matches': matches,
            'total_matches': len(matches)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting matches: {str(e)}")

@app.get("/stats")
async def get_stats(db: MongoDBManager = Depends(get_db)):
    """Get system statistics"""
    try:
        # Get basic stats
        total_users = await db.users.count_documents({})
        total_swipes = await db.swipe_history.count_documents({})
        
        # Get recommender stats
        recommender = get_recommender()
        total_learned_users = len(recommender.user_field_weights)
        total_cached_swipes = sum(len(swipes) for swipes in recommender.user_swipe_cache.values())
        
        return {
            'total_users': total_users,
            'total_swipes': total_swipes,
            'users_with_learned_preferences': total_learned_users,
            'cached_swipe_relationships': total_cached_swipes,
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
            
            # Update fields if they exist in LinkedIn data - UPDATED FIELD NAMES
            if linkedin_data.get('full_name') and not user.get('full_name'):
                updated_profile['full_name'] = linkedin_data['full_name']
            
            if linkedin_data.get('headline') and not user.get('role'):
                updated_profile['role'] = linkedin_data['headline']
            
            if linkedin_data.get('summary') and not user.get('bio'):
                updated_profile['bio'] = linkedin_data['summary']
            
            if linkedin_data.get('city') and not user.get('city'):
                updated_profile['city'] = linkedin_data['city']
            
            if linkedin_data.get('experiences') and not user.get('experiences'):
                # Convert LinkedIn experiences to our format
                experiences = []
                for exp in linkedin_data['experiences'][:3]:  # Limit to 3
                    experiences.append({
                        'title': exp.get('title', ''),
                        'description': exp.get('description', ''),
                        'company': exp.get('company', ''),
                        'location': exp.get('location', ''),
                        'starts_at': exp.get('starts_at', {}),
                        'ends_at': exp.get('ends_at', {})
                    })
                updated_profile['experiences'] = experiences  # Note: plural
            
            if linkedin_data.get('education') and not user.get('education'):
                # Convert LinkedIn education to our format
                education = []
                for edu in linkedin_data['education'][:2]:  # Limit to 2
                    education.append({
                        'degree_name': edu.get('degree_name', ''),
                        'field_of_study': edu.get('field_of_study', ''),
                        'school': edu.get('school', ''),
                        'starts_at': edu.get('starts_at', {}),
                        'ends_at': edu.get('ends_at', {})
                    })
                updated_profile['education'] = education
            
            if linkedin_data.get('skills') and not user.get('skills'):
                # Extract skills from LinkedIn
                skills = [skill.get('name', '') for skill in linkedin_data['skills'][:10]]
                updated_profile['skills'] = skills
            
            # Update user in database
            success = await db.update_user(user_id, updated_profile)
            
            if success:
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
                raise HTTPException(status_code=500, detail="Failed to update user profile")
        else:
            raise HTTPException(status_code=400, detail=result['error'])
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error enriching user: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)