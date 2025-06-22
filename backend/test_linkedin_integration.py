#!/usr/bin/env python3
"""
Test script for LinkedIn Integration
Tests all LinkedIn-related endpoints
"""

import asyncio
import aiohttp
import json
import base64
from typing import Dict, Any

# API base URL
BASE_URL = "http://localhost:8000"

async def test_linkedin_integration():
    """Test all LinkedIn integration endpoints"""
    
    print("🔗 Testing LinkedIn Integration")
    print("=" * 50)
    
    async with aiohttp.ClientSession() as session:
        
        # Test 1: Get LinkedIn Profile
        print("\n📋 Test 1: Get LinkedIn Profile")
        print("-" * 30)
        
        linkedin_id = "lethiraj"  # Replace with actual LinkedIn ID
        
        try:
            async with session.get(f"{BASE_URL}/linkedin/profile/{linkedin_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Successfully fetched LinkedIn profile")
                    print(f"   Name: {data.get('profile_data', {}).get('full_name', 'Unknown')}")
                    print(f"   Headline: {data.get('profile_data', {}).get('headline', 'Unknown')}")
                    print(f"   Experience: {len(data.get('profile_data', {}).get('experiences', []))} positions")
                    print(f"   Skills: {len(data.get('profile_data', {}).get('skills', []))} skills")
                else:
                    print(f"❌ Failed to fetch profile: {response.status}")
                    error_data = await response.json()
                    print(f"   Error: {error_data}")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # Test 2: Enrich Profile (Complete Workflow)
        print("\n🎯 Test 2: Enrich Profile (Complete Workflow)")
        print("-" * 40)
        
        try:
            async with session.post(f"{BASE_URL}/linkedin/enrich-profile?linkedin_id={linkedin_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Profile enriched successfully")
                    print(f"   Summary: {data.get('summary', '')[:100]}...")
                    print(f"   Audio generated: {'Yes' if data.get('audio_base64') else 'No'}")
                    
                    # Save audio to file if generated
                    if data.get('audio_base64'):
                        audio_data = base64.b64decode(data['audio_base64'])
                        with open('profile_audio.mp3', 'wb') as f:
                            f.write(audio_data)
                        print(f"   Audio saved to: profile_audio.mp3")
                else:
                    print(f"❌ Failed to enrich profile: {response.status}")
                    error_data = await response.json()
                    print(f"   Error: {error_data}")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # Test 3: Text to Speech
        print("\n🔊 Test 3: Text to Speech")
        print("-" * 20)
        
        test_text = "Hello! I'm a technical co-founder looking for a business partner to build an AI-powered startup."
        
        try:
            async with session.post(f"{BASE_URL}/linkedin/text-to-speech?text={test_text}") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Text converted to speech successfully")
                    print(f"   Text length: {data.get('text_length')} characters")
                    print(f"   Audio generated: {'Yes' if data.get('audio_base64') else 'No'}")
                    
                    # Save audio to file
                    if data.get('audio_base64'):
                        audio_data = base64.b64decode(data['audio_base64'])
                        with open('test_audio.mp3', 'wb') as f:
                            f.write(audio_data)
                        print(f"   Audio saved to: test_audio.mp3")
                else:
                    print(f"❌ Failed to convert text to speech: {response.status}")
                    error_data = await response.json()
                    print(f"   Error: {error_data}")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # Test 4: Create User and Enrich from LinkedIn
        print("\n👤 Test 4: Create User and Enrich from LinkedIn")
        print("-" * 45)
        
        # First create a test user
        test_user_data = {
            "name": "LinkedIn Test User",
            "startupIdea": "AI-powered platform",
            "role": "Developer",
            "location": "San Francisco",
            "skills": ["Python"],
            "profileType": "founder"
        }
        
        try:
            # Create user
            async with session.post(f"{BASE_URL}/users", json=test_user_data) as response:
                if response.status == 200:
                    user_data = await response.json()
                    user_id = user_data.get('user_id')
                    print(f"✅ Created test user with ID: {user_id}")
                    
                    # Now enrich with LinkedIn data
                    async with session.post(f"{BASE_URL}/users/{user_id}/enrich-from-linkedin?linkedin_id={linkedin_id}") as enrich_response:
                        if enrich_response.status == 200:
                            enrich_data = await enrich_response.json()
                            print(f"✅ User enriched with LinkedIn data")
                            print(f"   Updated name: {enrich_data.get('updated_profile', {}).get('name')}")
                            print(f"   Updated role: {enrich_data.get('updated_profile', {}).get('role')}")
                            print(f"   Skills added: {len(enrich_data.get('updated_profile', {}).get('skills', []))}")
                            print(f"   Experience added: {len(enrich_data.get('updated_profile', {}).get('experience', []))}")
                        else:
                            print(f"❌ Failed to enrich user: {enrich_response.status}")
                            error_data = await enrich_response.json()
                            print(f"   Error: {error_data}")
                else:
                    print(f"❌ Failed to create user: {response.status}")
                    error_data = await response.json()
                    print(f"   Error: {error_data}")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print("\n🎉 LinkedIn Integration Testing Completed!")
        print("=" * 50)

if __name__ == "__main__":
    asyncio.run(test_linkedin_integration()) 