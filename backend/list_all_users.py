#!/usr/bin/env python3
"""
List all users in the database in a compact format
"""

import asyncio
from app.database import MongoDBManager

async def list_all_users():
    """List all users in the database in compact format"""
    print("📋 Listing ALL users in the database...")
    print("=" * 80)
    
    try:
        db = MongoDBManager()
        users = await db.get_all_users()
        
        if not users:
            print("❌ No users found in database")
            return
        
        print(f"✅ Found {len(users)} users:")
        print()
        
        # Show all users in compact format
        for i, user in enumerate(users, 1):
            print(f"{i:3d}. {user['id']} | {user['name']:<20} | {user['role']:<15} | {user['location']:<20} | {', '.join(user['skills'][:2])}")
        
        print()
        print("=" * 80)
        print("💡 Use any of these IDs to test the API endpoints")
        print("   Example: GET /users/{id}/profile")
        print(f"   Total users: {len(users)}")
        
    except Exception as e:
        print(f"❌ Error listing users: {e}")

if __name__ == "__main__":
    asyncio.run(list_all_users()) 