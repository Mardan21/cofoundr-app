from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
from datetime import datetime
from typing import List, Optional, Dict, Any
import os
from bson import ObjectId

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://vaibhav:GiAr2e0PpsWuB2zb@cluster0.pjxhtwr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
DATABASE_NAME = os.getenv("DATABASE_NAME", "Profile")

class MongoDBManager:
    def __init__(self):
        self.client = AsyncIOMotorClient(MONGODB_URL)
        self.db = self.client[DATABASE_NAME]
        
        # Collections
        self.users = self.db.User
        self.user_embeddings = self.db.user_embeddings
        self.swipe_history = self.db.swipe_history
    
    async def create_indexes(self):
        """Create database indexes for better performance"""
        await self.users.create_index([("name", ASCENDING)])
        await self.users.create_index([("profile_type", ASCENDING)])
        await self.user_embeddings.create_index([("user_id", ASCENDING)])
        await self.swipe_history.create_index([("user_id", ASCENDING)])
        await self.swipe_history.create_index([("timestamp", DESCENDING)])
    
    async def create_user(self, user_data: dict) -> str:
        """Create a new user in the database"""
        user_data["created_at"] = datetime.utcnow()
        user_data["updated_at"] = datetime.utcnow()
        
        result = await self.users.insert_one(user_data)
        return str(result.inserted_id)
    
    async def save_user_embeddings(self, user_id: str, embeddings: dict) -> str:
        """Save user embeddings to database"""
        embedding_data = {
            "user_id": user_id,
            "skills_embedding": embeddings.get('skills', []),
            "startup_embedding": embeddings.get('startup', []),
            "role_location_embedding": embeddings.get('role_location', []),
            "experience_embedding": embeddings.get('experience', []),
            "education_embedding": embeddings.get('education', []),
            "projects_embedding": embeddings.get('projects', []),
            "accomplishments_embedding": embeddings.get('accomplishments', []),
            "looking_for_embedding": embeddings.get('looking_for', []),
            "created_at": datetime.utcnow()
        }
        
        # Update if exists, insert if not
        result = await self.user_embeddings.update_one(
            {"user_id": user_id},
            {"$set": embedding_data},
            upsert=True
        )
        return user_id
    
    async def get_user_embeddings(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user embeddings from database"""
        embedding = await self.user_embeddings.find_one({"user_id": user_id})
        if embedding:
            return {
                'skills': embedding.get('skills_embedding', []),
                'startup': embedding.get('startup_embedding', []),
                'role_location': embedding.get('role_location_embedding', []),
                'experience': embedding.get('experience_embedding', []),
                'education': embedding.get('education_embedding', []),
                'projects': embedding.get('projects_embedding', []),
                'accomplishments': embedding.get('accomplishments_embedding', []),
                'looking_for': embedding.get('looking_for_embedding', [])
            }
        return None
    
    async def save_swipe(self, user_id: str, target_user_id: str, decision: int) -> str:
        """Save a swipe decision to database"""
        swipe_data = {
            "user_id": user_id,
            "target_user_id": target_user_id,
            "decision": decision,
            "timestamp": datetime.utcnow()
        }
        
        result = await self.swipe_history.insert_one(swipe_data)
        return str(result.inserted_id)
    
    async def get_swipe_history(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get user's swipe history"""
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
    
    async def get_all_users(self, exclude_user_id: str = None) -> List[Dict[str, Any]]:
        """Get all users except the specified one"""
        filter_query = {}
        if exclude_user_id:
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
            user['id'] = str(user['_id'])
            del user['_id']
            users.append(user)
        
        return users
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID (handles both string and ObjectId)"""
        try:
            # Try to convert to ObjectId if it's a valid ObjectId string
            if len(user_id) == 24:  # ObjectId is 24 characters
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
                del user['_id']
            return user
        except Exception as e:
            print(f"Error getting user by ID {user_id}: {e}")
            return None
    
    async def close(self):
        """Close database connection"""
        self.client.close()

# Global database manager instance
db_manager = MongoDBManager()

def get_db():
    """Dependency to get database manager"""
    return db_manager 