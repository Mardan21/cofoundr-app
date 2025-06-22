#!/usr/bin/env python3
"""
Generate embeddings for all existing users in the database
"""

import asyncio
import os
from dotenv import load_dotenv
from app.database import MongoDBManager
from app.recommender import CoFounderRecommender

# Load environment variables from .env file
load_dotenv()
async def generate_embeddings_for_all_users():
    """Generate embeddings for all users in the database"""
    print("🧠 Generating embeddings for all users...")
    print("=" * 60)
    
    try:
        db = MongoDBManager()
        recommender = CoFounderRecommender()
        
        # Get all users
        users = await db.get_all_users()
        
        if not users:
            print("❌ No users found in database")
            return
        
        print(f"✅ Found {len(users)} users to process")
        print()
        
        success_count = 0
        error_count = 0
        
        for i, user in enumerate(users, 1):
            try:
                print(f"Processing {i}/{len(users)}: {user['full_name']}...")
                
                # Generate embeddings
                embeddings = recommender.generate_embeddings(user)
                
                # Save embeddings to database
                await db.save_user_embeddings(user['id'], embeddings)
                
                print(f"✅ Generated embeddings for {user['full_name']}")
                success_count += 1
                
            except Exception as e:
                print(f"❌ Error processing {user['full_name']}: {e}")
                error_count += 1
        
        print()
        print("=" * 60)
        print(f"🎉 Embedding generation completed!")
        print(f"✅ Successfully processed: {success_count} users")
        print(f"❌ Errors: {error_count} users")
        print()
        print("🚀 Now you can test the recommendation system:")
        print("   python test_api.py")
        
    except Exception as e:
        print(f"❌ Error generating embeddings: {e}")

if __name__ == "__main__":
    asyncio.run(generate_embeddings_for_all_users()) 