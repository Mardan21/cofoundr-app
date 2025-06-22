#!/usr/bin/env python3
"""
Test script to demonstrate the merging functionality
"""

import asyncio
import json
from app.main import merge_frontend_with_linkedin_data

# Example frontend data (what the app actually sends - minimal set)
frontend_data = {
    "bio": "I'm a software engineer with a passion for building products that help people live better lives.",
    "startupIdea": "AI-powered startup that helps businesses automate their marketing and sales processes",
    "links": [
        {
            "name": "LinkedIn",
            "url": "https://www.linkedin.com/in/anand-mohansingh"
        },
        {
            "name": "GitHub",
            "url": "https://github.com/anandmohansingh"
        }
    ]
}

# Example LinkedIn data (what we get from LinkedIn API)
linkedin_data = {
    "public_identifier": "lethiraj",
    "profile_pic_url": None,
    "background_cover_image_url": None,
    "first_name": "Lakshmi Prasanna",
    "last_name": "Ethiraj",
    "full_name": "Lakshmi Prasanna Ethiraj",
    "follower_count": 911,
    "occupation": "Vice President, Marcus by Goldman Sachs at Goldman Sachs",
    "headline": "Vice president at Goldman Sachs",
    "summary": "Experienced software engineer with expertise in financial technology and AI.",
    "country": "US",
    "country_full_name": "United States of America",
    "city": "New York City Metropolitan Area",
    "state": None,
    "experiences": [
        {
            "starts_at": {
                "day": 1,
                "month": 12,
                "year": 2022
            },
            "ends_at": None,
            "company": "Goldman Sachs",
            "company_linkedin_profile_url": "https://www.linkedin.com/company/goldman-sachs/",
            "company_facebook_profile_url": None,
            "title": "Vice President, Marcus by Goldman Sachs",
            "description": "Senior Software Engineer",
            "location": None,
            "logo_url": "https://s3.us-west-000.backblazeb2.com/proxycurl/company/goldman-sachs/profile"
        },
        {
            "starts_at": {
                "day": 1,
                "month": 12,
                "year": 2020
            },
            "ends_at": None,
            "company": "Goldman Sachs",
            "company_linkedin_profile_url": "https://www.linkedin.com/company/goldman-sachs/",
            "company_facebook_profile_url": None,
            "title": "Associate, Marcus By Goldman Sachs",
            "description": "Software Engineer",
            "location": "New York City Metropolitan Area",
            "logo_url": "https://s3.us-west-000.backblazeb2.com/proxycurl/company/goldman-sachs/profile"
        }
    ],
    "education": [
        {
            "starts_at": None,
            "ends_at": None,
            "field_of_study": "Computer Science",
            "degree_name": "Bachelor of Science - BS",
            "school": "University at Buffalo",
            "school_linkedin_profile_url": "https://www.linkedin.com/school/universityatbuffalo/",
            "school_facebook_profile_url": None,
            "description": None,
            "logo_url": "https://s3.us-west-000.backblazeb2.com/proxycurl/company/universityatbuffalo/profile",
            "grade": None,
            "activities_and_societies": None
        },
        {
            "starts_at": None,
            "ends_at": None,
            "field_of_study": "Computer science and Engineering ",
            "degree_name": "Master of Science - MS",
            "school": "University at Buffalo",
            "school_linkedin_profile_url": "https://www.linkedin.com/school/universityatbuffalo/",
            "school_facebook_profile_url": None,
            "description": None,
            "logo_url": "https://s3.us-west-000.backblazeb2.com/proxycurl/company/universityatbuffalo/profile",
            "grade": None,
            "activities_and_societies": None
        }
    ],
    "languages": [
        "English",
        "Hindi",
        "Sanskrit",
        "Tamil",
        "Telugu"
    ],
    "accomplishment_projects": [
        {
            "starts_at": None,
            "ends_at": None,
            "title": "Engineering Intramural",
            "description": "Led engineering team for intramural project",
            "url": None
        }
    ],
    "accomplishment_honors_awards": [
        {
            "title": "Dean's List",
            "issuer": None,
            "issued_on": None,
            "description": "Academic excellence award"
        }
    ],
    "connections": 500
}

def test_merge_functionality():
    """Test the merging functionality"""
    print("🧪 Testing Merge Functionality")
    print("=" * 50)
    
    # Test 1: Merge with LinkedIn data
    print("\n1️⃣ Testing merge with LinkedIn data:")
    merged_with_linkedin = merge_frontend_with_linkedin_data(frontend_data, linkedin_data)
    
    print(f"✅ Name: {merged_with_linkedin['name']}")
    print(f"✅ Bio: {merged_with_linkedin['bio'][:100]}...")
    print(f"✅ Startup Idea: {merged_with_linkedin['startupIdea']}")
    print(f"✅ Role: {merged_with_linkedin['role']}")
    print(f"✅ Location: {merged_with_linkedin['location']}")
    print(f"✅ Skills: {merged_with_linkedin['skills']}")
    print(f"✅ Experience count: {len(merged_with_linkedin['experience'])}")
    print(f"✅ Education count: {len(merged_with_linkedin['education'])}")
    print(f"✅ Projects count: {len(merged_with_linkedin['projects'])}")
    print(f"✅ Languages: {merged_with_linkedin.get('languages', [])}")
    print(f"✅ Profile Type: {merged_with_linkedin['profileType']}")
    print(f"✅ Looking For: {merged_with_linkedin['lookingFor'][:100]}...")
    print(f"✅ Links: {[link['name'] for link in merged_with_linkedin['links']]}")
    
    # Test 2: Merge without LinkedIn data
    print("\n2️⃣ Testing merge without LinkedIn data:")
    merged_without_linkedin = merge_frontend_with_linkedin_data(frontend_data, None)
    
    print(f"✅ Name: {merged_without_linkedin['name']}")
    print(f"✅ Bio: {merged_without_linkedin['bio'][:100]}...")
    print(f"✅ Startup Idea: {merged_without_linkedin['startupIdea']}")
    print(f"✅ Skills: {merged_without_linkedin['skills']}")
    print(f"✅ Experience count: {len(merged_without_linkedin['experience'])}")
    print(f"✅ Profile Type: {merged_without_linkedin['profileType']}")
    print(f"✅ Links: {[link['name'] for link in merged_without_linkedin['links']]}")
    
    # Test 3: Save merged data to file for inspection
    print("\n3️⃣ Saving merged data to file...")
    with open('merged_profile_example.json', 'w') as f:
        json.dump(merged_with_linkedin, f, indent=2)
    print("✅ Saved merged profile to 'merged_profile_example.json'")
    
    print("\n🎉 Merge functionality test completed!")

if __name__ == "__main__":
    test_merge_functionality() 