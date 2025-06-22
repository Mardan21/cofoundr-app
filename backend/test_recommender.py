#!/usr/bin/env python3
"""
Test script for the CoFounder Recommender System
Tests different scenarios and shows how the system learns from swipe behavior
"""

import asyncio
import json
from app.recommender import CoFounderRecommender
from app.database import get_db

async def test_recommender():
    """Test the recommender system with various scenarios"""
    
    # Initialize recommender
    recommender = CoFounderRecommender()
    
    print("🚀 Testing CoFounder Recommender System")
    print("=" * 50)
    
    # Test 1: Basic profile matching
    print("\n📋 Test 1: Basic Profile Matching")
    print("-" * 30)
    
    my_profile = {
        'skills': ['Python', 'Machine Learning', 'Backend Development', 'AWS'],
        'startupIdea': 'AI-powered healthcare platform for early disease detection',
        'role': 'Technical Co-founder',
        'location': 'San Francisco, CA',
        'experience': [
            {'title': 'Senior ML Engineer', 'description': 'Built recommendation systems at Google'},
            {'title': 'Backend Developer', 'description': 'Scaled microservices at Uber'}
        ],
        'education': [
            {'degree': 'MS Computer Science', 'school': 'Stanford University'},
            {'degree': 'BS Engineering', 'school': 'MIT'}
        ],
        'projects': [
            {'name': 'HealthAI', 'description': 'ML model for cancer detection'},
            {'name': 'EcoTracker', 'description': 'Carbon footprint tracking app'}
        ],
        'accomplishments': [
            {'name': 'Google ML Award', 'description': 'Best ML project of the year'},
            {'name': 'Stanford Innovation Prize', 'description': 'Healthcare innovation'}
        ],
        'what I\'m looking for': 'Business co-founder with healthcare experience and fundraising skills'
    }
    
    candidates = [
        {
            'id': '1',
            'skills': ['Business Development', 'Healthcare', 'Sales', 'Fundraising'],
            'startupIdea': 'Digital health platform for patient engagement',
            'role': 'Business Co-founder',
            'location': 'San Francisco, CA',
            'experience': [
                {'title': 'VP Sales', 'description': 'Grew healthcare startup to $50M ARR'},
                {'title': 'Business Development', 'description': 'Partnerships at Johnson & Johnson'}
            ],
            'education': [
                {'degree': 'MBA', 'school': 'Harvard Business School'},
                {'degree': 'BS Biology', 'school': 'UC Berkeley'}
            ],
            'projects': [
                {'name': 'HealthConnect', 'description': 'Patient-doctor communication platform'},
                {'name': 'MedTech Accelerator', 'description': 'Mentored 20+ health startups'}
            ],
            'accomplishments': [
                {'name': 'Forbes 30 Under 30', 'description': 'Healthcare category'},
                {'name': 'Healthcare Innovation Award', 'description': 'Patient care technology'}
            ],
            'what I\'m looking for': 'Technical co-founder with ML expertise'
        },
        {
            'id': '2',
            'skills': ['Design', 'UX/UI', 'Frontend', 'Product Management'],
            'startupIdea': 'Design collaboration platform for remote teams',
            'role': 'Design Co-founder',
            'location': 'New York, NY',
            'experience': [
                {'title': 'Senior Product Designer', 'description': 'Led design at Figma'},
                {'title': 'UX Manager', 'description': 'Built design systems at Airbnb'}
            ],
            'education': [
                {'degree': 'BFA Design', 'school': 'Parsons School of Design'},
                {'degree': 'MS Human-Computer Interaction', 'school': 'Carnegie Mellon'}
            ],
            'projects': [
                {'name': 'DesignHub', 'description': 'Collaborative design tool'},
                {'name': 'UX Research Platform', 'description': 'User research automation'}
            ],
            'accomplishments': [
                {'name': 'Design Award', 'description': 'Best UX design of 2023'},
                {'name': 'Innovation Grant', 'description': 'Design technology innovation'}
            ],
            'what I\'m looking for': 'Technical co-founder with backend expertise'
        },
        {
            'id': '3',
            'skills': ['Python', 'Data Science', 'Machine Learning', 'Research'],
            'startupIdea': 'AI-powered drug discovery platform',
            'role': 'Research Co-founder',
            'location': 'Boston, MA',
            'experience': [
                {'title': 'Research Scientist', 'description': 'AI research at DeepMind'},
                {'title': 'Data Scientist', 'description': 'Drug discovery at Pfizer'}
            ],
            'education': [
                {'degree': 'PhD Computer Science', 'school': 'MIT'},
                {'degree': 'MS Bioinformatics', 'school': 'Harvard'}
            ],
            'projects': [
                {'name': 'DrugAI', 'description': 'ML model for drug discovery'},
                {'name': 'Bioinformatics Tool', 'description': 'Genomic analysis platform'}
            ],
            'accomplishments': [
                {'name': 'Nature Paper', 'description': 'Published in Nature on AI drug discovery'},
                {'name': 'Research Grant', 'description': '$2M NIH grant for drug discovery'}
            ],
            'what I\'m looking for': 'Business co-founder with pharmaceutical experience'
        }
    ]
    
    # Test with no swipe history (new user)
    print("🎯 New User (No Swipe History):")
    recommendations = await recommender.recommend_profiles(my_profile, candidates, [], "user123")
    for i, (candidate, score) in enumerate(recommendations, 1):
        print(f"  {i}. {candidate['role']} - {candidate['startupIdea'][:50]}... (Score: {score:.3f})")
    
    # Test 2: Learning from swipe behavior
    print("\n📚 Test 2: Learning from Swipe Behavior")
    print("-" * 40)
    
    # Simulate some swipes
    swipe_history = [
        {
            'profile': candidates[0],  # Business co-founder - LIKED
            'decision': 1
        },
        {
            'profile': candidates[1],  # Design co-founder - DISLIKED
            'decision': 0
        },
        {
            'profile': candidates[2],  # Research co-founder - SUPER LIKED
            'decision': 2
        }
    ]
    
    print("🔄 After Learning from Swipes:")
    recommendations = await recommender.recommend_profiles(my_profile, candidates, swipe_history, "user123")
    for i, (candidate, score) in enumerate(recommendations, 1):
        print(f"  {i}. {candidate['role']} - {candidate['startupIdea'][:50]}... (Score: {score:.3f})")
    
    # Test 3: Show learned weights
    print("\n⚖️ Test 3: Learned Field Weights")
    print("-" * 30)
    
    # Get the learned weights
    my_embeddings = recommender.generate_embeddings(my_profile)
    learned_preferences = recommender.learn_preference_patterns(my_embeddings, swipe_history)
    learned_weights = recommender.learn_field_importance(learned_preferences, "user123")
    
    print("Original Weights vs Learned Weights:")
    for field in recommender.base_weights:
        original = recommender.base_weights[field]
        learned = learned_weights[field]
        change = learned - original
        print(f"  {field:15}: {original:.3f} → {learned:.3f} ({change:+.3f})")
    
    # Test 4: Test with database integration
    print("\n🗄️ Test 4: Database Integration")
    print("-" * 30)
    
    try:
        db = get_db()
        
        # Save embeddings to database
        embeddings = recommender.generate_embeddings(my_profile)
        await db.save_user_embeddings("test_user_123", embeddings)
        print("✅ Saved embeddings to database")
        
        # Retrieve embeddings from database
        retrieved_embeddings = await db.get_user_embeddings("test_user_123")
        if retrieved_embeddings:
            print("✅ Retrieved embeddings from database")
            print(f"   Skills embedding length: {len(retrieved_embeddings['skills'])}")
            print(f"   Startup embedding length: {len(retrieved_embeddings['startup'])}")
        else:
            print("❌ Failed to retrieve embeddings")
            
    except Exception as e:
        print(f"❌ Database test failed: {e}")
    
    # Test 5: Edge cases
    print("\n🔍 Test 5: Edge Cases")
    print("-" * 20)
    
    # Test with empty profile
    empty_profile = {'skills': [], 'startupIdea': '', 'role': '', 'location': ''}
    try:
        empty_embeddings = recommender.generate_embeddings(empty_profile)
        print("✅ Empty profile handled correctly")
    except Exception as e:
        print(f"❌ Empty profile failed: {e}")
    
    # Test with missing fields
    partial_profile = {'skills': ['Python'], 'role': 'Developer'}
    try:
        partial_embeddings = recommender.generate_embeddings(partial_profile)
        print("✅ Partial profile handled correctly")
    except Exception as e:
        print(f"❌ Partial profile failed: {e}")
    
    print("\n🎉 Recommender testing completed!")
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(test_recommender()) 