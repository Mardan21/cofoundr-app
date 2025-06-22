#!/usr/bin/env python3
"""
List all users in the database with their IDs
"""

import asyncio
from app.database import MongoDBManager

async def list_users():
    """List all users in the database"""
    print("📋 Listing all users in the database...")
    print("=" * 60)
    
    try:
        db = MongoDBManager()
        users = await db.get_all_users()
        
        if not users:
            print("❌ No users found in database")
            return
        
        print(f"✅ Found {len(users)} users:")
        print()
        
        # Show first 20 users with full details
        for i, user in enumerate(users[:20], 1):
            print(f"{i}. ID: {user['id']}")
            print(f"   Name: {user['name']}")
            print(f"   Role: {user['role']}")
            print(f"   Location: {user['location']}")
            print(f"   Skills: {', '.join(user['skills'][:3])}...")
            print(f"   Startup: {user['startupIdea'][:50]}...")
            print()
        
        if len(users) > 20:
            print(f"... and {len(users) - 20} more users")
            print()
            print("💡 To see all users, run: python list_all_users.py")
        
        print("=" * 60)
        print("💡 Use any of these IDs to test the API endpoints")
        print("   Example: GET /users/{id}/profile")
        
    except Exception as e:
        print(f"❌ Error listing users: {e}")

if __name__ == "__main__":
    asyncio.run(list_users()) 