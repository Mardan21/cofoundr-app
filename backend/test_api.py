#!/usr/bin/env python3
"""
Test script for the Co-Founder Matching MCP Server

This script demonstrates how to use the API endpoints with existing MongoDB data.
"""

import requests
import json
import time
from typing import Dict, Any

BASE_URL = "http://localhost:8000"

def test_api_with_existing_data():
    """Test the API with existing MongoDB data"""
    print("🧪 Testing Co-Founder Matching MCP Server API with existing data")
    print("=" * 60)
    
    # 1. Get system stats first
    print("\n1️⃣ Getting system statistics...")
    try:
        response = requests.get(f"{BASE_URL}/stats")
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ System stats:")
            print(f"   Total users: {stats['total_users']}")
            print(f"   Total swipes: {stats['total_swipes']}")
            print(f"   Server status: {stats['server_status']}")
            
            if stats['total_users'] == 0:
                print("❌ No users found in database. Please ensure MongoDB Atlas is connected and data is loaded.")
                return
        else:
            print(f"❌ Failed to get stats: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error getting stats: {str(e)}")
        return
    
    # 2. Get a sample user to test with
    print(f"\n2️⃣ Getting sample user profiles...")
    try:
        # Try to get the first user (Anand) by ID from your data
        user_id = "685714d1393b7d40af585cb8"  # Anand's ObjectId from your data
        response = requests.get(f"{BASE_URL}/users/{user_id}/profile")
        if response.status_code == 200:
            user = response.json()
            print(f"✅ Found user: {user['name']} - {user['startupIdea'][:40]}...")
            print(f"   Location: {user['location']}")
            print(f"   Skills: {', '.join(user['skills'][:3])}...")
            print(f"   Looking for: {user.get('what I\'m looking for', '')[:50]}...")
        else:
            print(f"❌ Failed to get user profile: {response.text}")
            print("   Trying to get any available user...")
            
            # Try to get recommendations to find any user
            response = requests.post(f"{BASE_URL}/users/{user_id}/recommendations", json={"user_id": user_id, "limit": 1})
            if response.status_code == 200:
                recommendations = response.json()
                if recommendations['recommendations']:
                    user = recommendations['recommendations'][0]
                    user_id = user['id']
                    print(f"✅ Using available user: {user['name']} ({user['role']})")
                    print(f"   Location: {user['location']}")
                    print(f"   Skills: {', '.join(user['skills'][:3])}...")
                else:
                    print("❌ No users found in database")
                    return
            else:
                print("❌ No users available for testing")
                return
    except Exception as e:
        print(f"❌ Error getting user profile: {str(e)}")
        return
    
    # 3. Simulate some swipes for the user
    print(f"\n3️⃣ Simulating swipe history for {user['name']}...")
    
    # Get a few other users to swipe on
    try:
        # Get recommendations to see other users
        recommendation_request = {
            "user_id": user_id,
            "limit": 5
        }
        
        response = requests.post(f"{BASE_URL}/users/{user_id}/recommendations", json=recommendation_request)
        if response.status_code == 200:
            recommendations = response.json()
            other_users = recommendations['recommendations']
            
            if other_users:
                print(f"✅ Found {len(other_users)} potential co-founders to swipe on")
                
                # Simulate swipes on first 3 users
                swipe_decisions = [1, 0, 2]  # like, dislike, super like
                
                for i, (target_user, decision) in enumerate(zip(other_users[:3], swipe_decisions)):
                    swipe_data = {
                        "target_user_id": target_user['id'],
                        "decision": decision
                    }
                    
                    try:
                        response = requests.post(f"{BASE_URL}/users/{user_id}/swipe", json=swipe_data)
                        if response.status_code == 200:
                            decision_text = {0: "dislike", 1: "like", 2: "super like"}[decision]
                            print(f"✅ Swiped {decision_text} on {target_user['name']}")
                        else:
                            print(f"❌ Failed to record swipe: {response.text}")
                    except Exception as e:
                        print(f"❌ Error recording swipe: {str(e)}")
            else:
                print("⚠️  No other users found for swiping")
        else:
            print(f"❌ Failed to get recommendations: {response.text}")
    except Exception as e:
        print(f"❌ Error getting recommendations: {str(e)}")
    
    # 4. Get updated recommendations after swiping
    print(f"\n4️⃣ Getting updated recommendations for {user['name']}...")
    try:
        recommendation_request = {
            "user_id": user_id,
            "limit": 3
        }
        
        response = requests.post(f"{BASE_URL}/users/{user_id}/recommendations", json=recommendation_request)
        if response.status_code == 200:
            recommendations = response.json()
            print(f"✅ Got {len(recommendations['recommendations'])} recommendations:")
            
            for i, (rec, score) in enumerate(zip(recommendations['recommendations'], recommendations['scores'])):
                print(f"   {i+1}. {rec['name']} - Score: {score:.3f}")
                print(f"      Startup: {rec['startupIdea'][:40]}...")
                print(f"      Skills: {', '.join(rec['skills'][:3])}...")
                print()
        else:
            print(f"❌ Failed to get recommendations: {response.text}")
    except Exception as e:
        print(f"❌ Error getting recommendations: {str(e)}")
    
    # 5. Get swipe history
    print(f"\n5️⃣ Getting swipe history for {user['name']}...")
    try:
        response = requests.get(f"{BASE_URL}/users/{user_id}/swipe-history?limit=10")
        if response.status_code == 200:
            history = response.json()
            print(f"✅ Swipe history retrieved ({len(history['swipe_history'])} swipes):")
            for swipe in history['swipe_history']:
                decision_text = {0: "dislike", 1: "like", 2: "super like"}[swipe['decision']]
                print(f"   {decision_text} on user {swipe['target_user_id'][:8]}...")
        else:
            print(f"❌ Failed to get swipe history: {response.text}")
    except Exception as e:
        print(f"❌ Error getting swipe history: {str(e)}")
    
    print("\n" + "=" * 60)
    print("🎉 API test completed!")
    print(f"📖 Check out the interactive docs at: {BASE_URL}/docs")

if __name__ == "__main__":
    # Wait a moment for the server to be ready
    print("⏳ Waiting for server to be ready...")
    time.sleep(2)
    
    try:
        # Test if server is running
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            test_api_with_existing_data()
        else:
            print(f"❌ Server not responding. Status: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to server at {BASE_URL}")
        print("Make sure the server is running with: python run_server.py")
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}") 
        