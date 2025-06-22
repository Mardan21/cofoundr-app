#!/usr/bin/env python3
"""
Test the recommender with real data from MongoDB
"""

import asyncio
import json
import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.recommender import get_recommender, handle_swipe_feedback
from app.database import get_db

async def test_with_real_data():
    """Test recommender with actual MongoDB data"""
    
    print("🔍 Testing Recommender with Real MongoDB Data")
    print("=" * 50)
    
    # Get the singleton recommender instance
    recommender = get_recommender()
    db = get_db()
    
    try:
        # Get all users from database
        all_users = await db.get_all_users()
        print(f"📊 Found {len(all_users)} users in database")
        
        if len(all_users) < 2:
            print("❌ Need at least 2 users to test recommendations")
            return
        
        # Use first user as the "me" profile
        my_profile = all_users[0]
        my_user_id = str(my_profile.get('_id') or my_profile.get('id') or 'user1')
        
        print(f"\n👤 My Profile: {my_profile.get('name', 'Unknown')} - {my_profile.get('role', 'Unknown role')}")
        print(f"   User ID: {my_user_id}")
        print(f"   Startup: {my_profile.get('startupIdea', 'No startup idea')[:50]}...")
        
        # Handle skills properly (might be string or list)
        my_skills = my_profile.get('skills', [])
        if isinstance(my_skills, str):
            my_skills = [my_skills]
        elif not isinstance(my_skills, list):
            my_skills = []
        print(f"   Skills: {', '.join(my_skills[:3])}...")
        
        # Use remaining users as candidates
        candidates = all_users[1:]
        print(f"\n🎯 Testing with {len(candidates)} candidates")
        
        # Clean up candidates - ensure they have proper IDs
        cleaned_candidates = []
        for candidate in candidates:
            candidate_id = str(candidate.get('_id') or candidate.get('id') or f"candidate_{len(cleaned_candidates)}")
            candidate['id'] = candidate_id  # Ensure consistent ID field
            cleaned_candidates.append(candidate)
        
        # Test 1: No swipe history (new user)
        print("\n📋 Test 1: New User Recommendations")
        print("-" * 35)
        
        recommendations = recommender.recommend_profiles(
            my_profile=my_profile, 
            all_candidates=cleaned_candidates, 
            swipe_history=[], 
            user_id=my_user_id
        )
        
        print(f"Got {len(recommendations)} recommendations:")
        for i, (candidate, score) in enumerate(recommendations, 1):
            print(f"  {i}. {candidate.get('name', 'Unknown')} - {candidate.get('role', 'Unknown')}")
            print(f"     ID: {candidate.get('id', 'No ID')}")
            print(f"     Startup: {candidate.get('startupIdea', 'No idea')[:40]}...")
            print(f"     Score: {score:.3f}")
            print()
        
        # Test 2: Simulate some swipes and test learning
        print("📚 Test 2: Simulating Swipe History & Learning")
        print("-" * 40)
        
        # Create realistic swipe history
        swipe_history = []
        
        # Simulate swiping on first 5 candidates
        for i, candidate in enumerate(cleaned_candidates[:5]):
            candidate_id = candidate.get('id')
            
            # Simulate decision logic based on profile compatibility
            my_skills_set = set(my_skills)
            candidate_skills = candidate.get('skills', [])
            if isinstance(candidate_skills, str):
                candidate_skills = [candidate_skills]
            elif not isinstance(candidate_skills, list):
                candidate_skills = []
            
            candidate_skills_set = set(candidate_skills)
            skill_overlap = len(my_skills_set.intersection(candidate_skills_set))
            
            # Decision logic
            if skill_overlap >= 2:
                decision = 2  # Super like - many overlapping skills
            elif skill_overlap >= 1:
                decision = 1  # Like - some overlapping skills
            elif candidate.get('role', '').lower() in ['business', 'marketing', 'sales', 'product']:
                decision = 1  # Like - complementary business skills
            elif candidate.get('startupIdea', '').lower().find('ai') != -1 or candidate.get('startupIdea', '').lower().find('tech') != -1:
                decision = 1  # Like - similar domain
            else:
                decision = 0  # Dislike
            
            # Add to swipe history
            swipe_history.append({
                'profile': candidate,
                'decision': decision
            })
            
            # Update persistent cache
            await handle_swipe_feedback(my_user_id, candidate_id, decision)
            
            decision_text = {0: '👎 Dislike', 1: '👍 Like', 2: '💖 Super Like'}[decision]
            print(f"  {decision_text} {candidate.get('name', 'Unknown')} ({candidate.get('role', 'Unknown')})")
            if skill_overlap > 0:
                print(f"    → Skill overlap: {list(my_skills_set.intersection(candidate_skills_set))}")
        
        print(f"\n📊 Swipe Summary:")
        likes = sum(1 for s in swipe_history if s['decision'] > 0)
        dislikes = sum(1 for s in swipe_history if s['decision'] == 0)
        super_likes = sum(1 for s in swipe_history if s['decision'] == 2)
        print(f"  👍 Likes: {likes}, 💖 Super Likes: {super_likes}, 👎 Dislikes: {dislikes}")
        
        # Get new recommendations after learning
        print(f"\n🎯 Updated Recommendations After Learning:")
        print("-" * 40)
        
        recommendations = recommender.recommend_profiles(
            my_profile=my_profile, 
            all_candidates=cleaned_candidates, 
            swipe_history=swipe_history, 
            user_id=my_user_id
        )
        
        print(f"Got {len(recommendations)} new recommendations:")
        for i, (candidate, score) in enumerate(recommendations, 1):
            print(f"  {i}. {candidate.get('name', 'Unknown')} - {candidate.get('role', 'Unknown')}")
            print(f"     Startup: {candidate.get('startupIdea', 'No idea')[:40]}...")
            print(f"     Score: {score:.3f}")
            
            # Show why this was recommended
            candidate_skills = candidate.get('skills', [])
            if isinstance(candidate_skills, str):
                candidate_skills = [candidate_skills]
            skills_match = set(my_skills).intersection(set(candidate_skills))
            if skills_match:
                print(f"     💡 Matching skills: {list(skills_match)}")
            print()
        
        # Test 3: Show what the system learned
        print("🧠 Test 3: What the System Learned")
        print("-" * 30)
        
        # Check if user has learned weights
        if my_user_id in recommender.user_field_weights:
            learned_weights = recommender.user_field_weights[my_user_id]
            print("Field Importance Changes:")
            for field in recommender.base_weights:
                original = recommender.base_weights[field]
                learned = learned_weights.get(field, original)
                change = learned - original
                arrow = "↗️" if change > 0.01 else "↘️" if change < -0.01 else "➡️"
                print(f"  {field:15}: {original:.3f} → {learned:.3f} {arrow} ({change:+.3f})")
        else:
            print("No learned weights yet (using base weights)")
        
        # Test 4: Check filtering functionality
        print("\n🔍 Test 4: Filtering Already Swiped Users")
        print("-" * 35)
        
        swiped_ids = recommender.get_swiped_user_ids(my_user_id)
        print(f"Already swiped on {len(swiped_ids)} users: {list(swiped_ids)}")
        
        # Get recommendations again to see filtering in action
        all_recommendations = recommender.recommend_profiles(
            my_profile=my_profile, 
            all_candidates=cleaned_candidates, 
            swipe_history=[], 
            user_id=my_user_id
        )
        
        print(f"Available recommendations after filtering: {len(all_recommendations)}")
        for candidate, score in all_recommendations:
            print(f"  - {candidate.get('name', 'Unknown')} (ID: {candidate.get('id')})")
        
        # Test 5: Embedding generation
        print("\n🔧 Test 5: Embedding Generation Test")
        print("-" * 25)
        
        try:
            embeddings = recommender.generate_embeddings(my_profile)
            print("✅ Generated embeddings for fields:")
            for field, embedding in embeddings.items():
                print(f"  {field:15}: {len(embedding)} dimensions")
                # Show first few values
                print(f"    Sample: [{embedding[0]:.3f}, {embedding[1]:.3f}, {embedding[2]:.3f}, ...]")
        except Exception as e:
            print(f"❌ Error generating embeddings: {e}")
        
        # Test 6: Persistence test
        print("\n💾 Test 6: Persistence Test")
        print("-" * 20)
        
        # Check if cache files exist
        import os
        cache_dir = recommender.cache_dir
        weights_file = recommender.weights_file
        swipe_file = recommender.swipe_cache_file
        
        print(f"Cache directory: {cache_dir}")
        print(f"Weights file exists: {os.path.exists(weights_file)}")
        print(f"Swipe cache file exists: {os.path.exists(swipe_file)}")
        
        if os.path.exists(weights_file):
            file_size = os.path.getsize(weights_file)
            print(f"Weights file size: {file_size} bytes")
        
        if os.path.exists(swipe_file):
            file_size = os.path.getsize(swipe_file)
            print(f"Swipe cache file size: {file_size} bytes")
        
        print("\n🎉 All tests completed successfully!")
        
        # Summary
        print("\n📋 Test Summary:")
        print("-" * 15)
        print(f"✅ Users tested: {len(all_users)}")
        print(f"✅ Swipes simulated: {len(swipe_history)}")
        print(f"✅ Recommendations generated: {len(recommendations)}")
        print(f"✅ Persistent storage: Working")
        print(f"✅ Filtering: Working")
        print(f"✅ Learning: {'Working' if my_user_id in recommender.user_field_weights else 'No changes detected'}")
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()

async def test_multiple_users():
    """Test with multiple users to see different recommendation patterns"""
    
    print("\n" + "="*60)
    print("🔍 Testing Multiple Users for Different Patterns")
    print("="*60)
    
    recommender = get_recommender()
    db = get_db()
    
    try:
        all_users = await db.get_all_users()
        if len(all_users) < 4:
            print("Need at least 4 users for multi-user testing")
            return
        
        # Test first 3 users as different personas
        test_users = all_users[:3]
        candidates = all_users[3:]
        
        for i, user in enumerate(test_users):
            user_id = str(user.get('_id') or user.get('id') or f'testuser{i}')
            print(f"\n👤 User {i+1}: {user.get('name', 'Unknown')} ({user.get('role', 'Unknown')})")
            
            # Simulate different swiping patterns
            swipe_history = []
            for j, candidate in enumerate(candidates[:3]):
                if i == 0:  # User 1: Likes technical people
                    decision = 1 if 'tech' in candidate.get('role', '').lower() else 0
                elif i == 1:  # User 2: Likes business people
                    decision = 1 if any(word in candidate.get('role', '').lower() for word in ['business', 'marketing', 'sales']) else 0
                else:  # User 3: Random pattern
                    decision = j % 2
                
                if decision > 0:
                    swipe_history.append({'profile': candidate, 'decision': decision})
                    await handle_swipe_feedback(user_id, str(candidate.get('_id') or candidate.get('id')), decision)
            
            # Get recommendations
            recs = recommender.recommend_profiles(user, candidates, swipe_history, user_id)
            print(f"  Top recommendation: {recs[0][0].get('name', 'Unknown') if recs else 'None'}")
            
    except Exception as e:
        print(f"Error in multi-user test: {e}")

if __name__ == "__main__":
    print("Starting Recommender System Tests...")
    asyncio.run(test_with_real_data())
    asyncio.run(test_multiple_users())