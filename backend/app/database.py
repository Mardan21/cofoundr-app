from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
from datetime import datetime
from typing import List, Optional, Dict, Any
import os
from bson import ObjectId

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://vaibhav:GiAr2e0PpsWuB2zb@cluster0.pjxhtwr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
DATABASE_NAME = os.getenv("DATABASE_NAME", "Profile2")

class MongoDBManager:
    def __init__(self):
        self.client = AsyncIOMotorClient(MONGODB_URL)
        self.db = self.client[DATABASE_NAME]
        
        # Collections
        self.users = self.db.User2
        self.user_embeddings = self.db.user_embeddings
        self.swipe_history = self.db.swipe_history
    
    async def create_indexes(self):
        """Create database indexes for better performance"""
        # Updated indexes for new schema
        await self.users.create_index([("full_name", ASCENDING)])  # Changed from "name"
        await self.users.create_index([("profileType", ASCENDING)])  # Updated field name
        await self.users.create_index([("role", ASCENDING)])
        await self.users.create_index([("city", ASCENDING)])
        await self.users.create_index([("state", ASCENDING)])
        await self.user_embeddings.create_index([("user_id", ASCENDING)])
        await self.swipe_history.create_index([("user_id", ASCENDING)])
        await self.swipe_history.create_index([("target_user_id", ASCENDING)])
        await self.swipe_history.create_index([("timestamp", DESCENDING)])
        
        # Compound index for efficient swipe filtering
        await self.swipe_history.create_index([("user_id", ASCENDING), ("target_user_id", ASCENDING)])
    
    async def create_user(self, user_data: dict, audio_base64: str = None) -> str:
        """Create a new user in the database with optional audio"""
        user_data["created_at"] = datetime.utcnow()
        user_data["updated_at"] = datetime.utcnow()
        
        # Add audio if provided
        if audio_base64:
            user_data["audio_base64"] = audio_base64
        
        result = await self.users.insert_one(user_data)
        return str(result.inserted_id)
    
    async def save_user_embeddings(self, user_id: str, embeddings: dict) -> str:
        """Save user embeddings to database - UPDATED FOR NEW SCHEMA"""
        embedding_data = {
            "user_id": user_id,
            "skills_embedding": embeddings.get('skills', []),
            "startup_embedding": embeddings.get('startup', []),
            "role_location_embedding": embeddings.get('role_location', []),
            "experience_embedding": embeddings.get('experience', []),
            "education_embedding": embeddings.get('education', []),
            "projects_embedding": embeddings.get('projects', []),
            "bio_embedding": embeddings.get('bio', []),  # Updated: bio instead of accomplishments
            "looking_for_embedding": embeddings.get('looking_for', []),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Update if exists, insert if not
        result = await self.user_embeddings.update_one(
            {"user_id": user_id},
            {"$set": embedding_data},
            upsert=True
        )
        return user_id
    
    async def get_user_embeddings(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user embeddings from database - UPDATED FOR NEW SCHEMA"""
        embedding = await self.user_embeddings.find_one({"user_id": user_id})
        if embedding:
            return {
                'skills': embedding.get('skills_embedding', []),
                'startup': embedding.get('startup_embedding', []),
                'role_location': embedding.get('role_location_embedding', []),
                'experience': embedding.get('experience_embedding', []),
                'education': embedding.get('education_embedding', []),
                'projects': embedding.get('projects_embedding', []),
                'bio': embedding.get('bio_embedding', []),  # Updated field
                'looking_for': embedding.get('looking_for_embedding', [])
            }
        return None
    
    async def save_swipe(self, user_id: str, target_user_id: str, decision: int) -> str:
        """Save a swipe decision to database"""
        # Normalize user IDs to strings
        user_id = str(user_id)
        target_user_id = str(target_user_id)
        
        # Check if swipe already exists to prevent duplicates
        existing_swipe = await self.swipe_history.find_one({
            "user_id": user_id,
            "target_user_id": target_user_id
        })
        
        if existing_swipe:
            # Update existing swipe
            result = await self.swipe_history.update_one(
                {"_id": existing_swipe["_id"]},
                {"$set": {
                    "decision": decision,
                    "timestamp": datetime.utcnow()
                }}
            )
            return str(existing_swipe["_id"])
        else:
            # Insert new swipe
            swipe_data = {
                "user_id": user_id,
                "target_user_id": target_user_id,
                "decision": decision,
                "timestamp": datetime.utcnow()
            }
            
            result = await self.swipe_history.insert_one(swipe_data)
            return str(result.inserted_id)
    
    async def get_swipe_history(self, user_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get user's swipe history - INCREASED DEFAULT LIMIT"""
        user_id = str(user_id)  # Normalize to string
        
        cursor = self.swipe_history.find(
            {"user_id": user_id}
        ).sort("timestamp", DESCENDING).limit(limit)
        
        history = []
        async for swipe in cursor:
            history.append({
                'id': str(swipe['_id']),
                'target_user_id': swipe['target_user_id'],
                'decision': swipe['decision'],
                'timestamp': swipe['timestamp'].isoformat()
            })
        
        return history
    
    async def get_swiped_user_ids(self, user_id: str) -> List[str]:
        """Get list of user IDs that this user has swiped on"""
        user_id = str(user_id)
        
        cursor = self.swipe_history.find(
            {"user_id": user_id},
            {"target_user_id": 1, "_id": 0}  # Only return target_user_id field
        )
        
        swiped_ids = []
        async for swipe in cursor:
            swiped_ids.append(swipe['target_user_id'])
        
        return list(set(swiped_ids))  # Remove duplicates
    
    async def get_all_users(self, exclude_user_id: str = None) -> List[Dict[str, Any]]:
        """Get all users except the specified one"""
        filter_query = {}
        if exclude_user_id:
            exclude_user_id = str(exclude_user_id)  # Normalize to string
            # Try to convert to ObjectId if it's a valid ObjectId string
            if len(exclude_user_id) == 24:
                try:
                    exclude_object_id = ObjectId(exclude_user_id)
                    filter_query["_id"] = {"$ne": exclude_object_id}
                except:
                    filter_query["_id"] = {"$ne": exclude_user_id}
            else:
                filter_query["_id"] = {"$ne": exclude_user_id}
        
        cursor = self.users.find(filter_query)
        users = []
        async for user in cursor:
            # Convert ObjectId to string and add as 'id' field
            user['id'] = str(user['_id'])
            # Keep _id for backwards compatibility but also add id
            users.append(user)
        
        return users
    
    async def get_available_candidates(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all users that haven't been swiped on by this user"""
        user_id = str(user_id)
        
        # Get list of already swiped user IDs
        swiped_ids = await self.get_swiped_user_ids(user_id)
        
        # Convert swiped_ids to ObjectIds where possible
        exclude_ids = []
        for swiped_id in swiped_ids:
            if len(swiped_id) == 24:
                try:
                    exclude_ids.append(ObjectId(swiped_id))
                except:
                    exclude_ids.append(swiped_id)
            else:
                exclude_ids.append(swiped_id)
        
        # Also exclude the user themselves
        if len(user_id) == 24:
            try:
                exclude_ids.append(ObjectId(user_id))
            except:
                exclude_ids.append(user_id)
        else:
            exclude_ids.append(user_id)
        
        # Find users not in the exclude list
        filter_query = {"_id": {"$nin": exclude_ids}}
        
        cursor = self.users.find(filter_query)
        candidates = []
        async for user in cursor:
            user['id'] = str(user['_id'])
            candidates.append(user)
        
        return candidates
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID (handles both string and ObjectId)"""
        if not user_id:
            return None
            
        user_id = str(user_id)  # Normalize to string
        
        try:
            # Try to convert to ObjectId if it's a valid ObjectId string
            if len(user_id) == 24:
                try:
                    object_id = ObjectId(user_id)
                    user = await self.users.find_one({"_id": object_id})
                except:
                    # If conversion fails, try as string
                    user = await self.users.find_one({"_id": user_id})
            else:
                # Try as string first
                user = await self.users.find_one({"_id": user_id})
                if not user:
                    # If not found, try as ObjectId
                    try:
                        object_id = ObjectId(user_id)
                        user = await self.users.find_one({"_id": object_id})
                    except:
                        pass
            
            if user:
                user['id'] = str(user['_id'])
                # Keep _id for backwards compatibility
            return user
        except Exception as e:
            print(f"Error getting user by ID {user_id}: {e}")
            return None
    
    async def update_user(self, user_id: str, update_data: dict) -> bool:
        """Update user profile"""
        user_id = str(user_id)
        update_data["updated_at"] = datetime.utcnow()
        
        try:
            if len(user_id) == 24:
                try:
                    object_id = ObjectId(user_id)
                    result = await self.users.update_one(
                        {"_id": object_id},
                        {"$set": update_data}
                    )
                except:
                    result = await self.users.update_one(
                        {"_id": user_id},
                        {"$set": update_data}
                    )
            else:
                result = await self.users.update_one(
                    {"_id": user_id},
                    {"$set": update_data}
                )
            
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating user {user_id}: {e}")
            return False
    
    async def get_mutual_matches(self, user_id: str) -> List[Dict[str, Any]]:
        """Get users who both liked each other"""
        user_id = str(user_id)
        
        # Find users that this user liked (decision = 1 or 2)
        liked_by_me = await self.swipe_history.find(
            {"user_id": user_id, "decision": {"$in": [1, 2]}}
        ).to_list(None)
        
        matches = []
        for swipe in liked_by_me:
            target_user_id = swipe['target_user_id']
            
            # Check if the target user also liked this user
            mutual_like = await self.swipe_history.find_one({
                "user_id": target_user_id,
                "target_user_id": user_id,
                "decision": {"$in": [1, 2]}
            })
            
            if mutual_like:
                # Get the user profile
                user_profile = await self.get_user_by_id(target_user_id)
                if user_profile:
                    matches.append({
                        'user': user_profile,
                        'matched_at': swipe['timestamp'].isoformat(),
                        'my_decision': swipe['decision'],
                        'their_decision': mutual_like['decision']
                    })
        
        return matches
    
    async def save_user_audio(self, user_id: str, audio_base64: str) -> str:
        """Save user audio to database"""
        audio_data = {
            "user_id": user_id,
            "audio_base64": audio_base64,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Update if exists, insert if not
        result = await self.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"audio_base64": audio_base64, "updated_at": datetime.utcnow()}},
            upsert=False
        )
        return user_id
    
    async def get_user_audio(self, user_id: str) -> Optional[str]:
        """Get user audio from database"""
        user = await self.users.find_one({"_id": ObjectId(user_id)})
        if user and user.get('audio_base64'):
            return user['audio_base64']
        return None
    
    async def close(self):
        """Close database connection"""
        self.client.close()

# Global database manager instance
db_manager = MongoDBManager()

def get_db():
    """Dependency to get database manager"""
    return db_manager