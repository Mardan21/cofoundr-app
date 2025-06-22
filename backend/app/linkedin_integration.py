"""
LinkedIn Profile Integration Module
Handles LinkedIn profile scraping and text-to-speech functionality
"""

import asyncio
import aiohttp
import json
from typing import Dict, Any, Optional
from dotenv import load_dotenv
import os
from elevenlabs.client import ElevenLabs
from elevenlabs import play
import tempfile
import base64

# Load environment variables
load_dotenv()

class LinkedInIntegration:
    def __init__(self):
        # LinkedIn API credentials
        self.proxycurl_api_key = os.getenv("PROXYCURL_API_KEY", "")
        self.proxycurl_endpoint = "https://nubela.co/proxycurl/api/v2/linkedin"
        
        # ElevenLabs API credentials
        self.elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY", "")
        self.elevenlabs_voice_id = os.getenv("ELEVENLABS_VOICE_ID", "")
        
        # OpenAI API credentials
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "")
        
        # Initialize ElevenLabs client
        self.elevenlabs = ElevenLabs(api_key=self.elevenlabs_api_key)
    
    async def get_linkedin_profile(self, profile_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch LinkedIn profile data asynchronously
        
        Args:
            profile_id: LinkedIn profile ID (e.g., 'lethiraj')
            
        Returns:
            Profile data dictionary or None if failed
        """
        try:
            headers = {'Authorization': f'Bearer {self.proxycurl_api_key}'}
            params = {'url': f'https://www.linkedin.com/in/{profile_id}'}
            
            async with aiohttp.ClientSession() as session:

                async with session.get(
                    self.proxycurl_endpoint,
                    params=params,
                    headers=headers
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data
                    else:
                        print(f"LinkedIn API error: {response.status}")
                        return None
                        
        except Exception as e:
            print(f"Error fetching LinkedIn profile: {e}")
            return None
    
    async def summarize_profile(self, profile_data: Dict[str, Any]) -> Optional[str]:
        """
        Generate a summary of the LinkedIn profile using OpenAI
        
        Args:
            profile_data: Raw LinkedIn profile data
            
        Returns:
            Summary text or None if failed
        """
        try:
            # For now, we'll create a simple summary since we don't have OpenAI integration
            # In a full implementation, you'd use the OpenAI API here
            
            summary_parts = []
            
            # Basic info
            if profile_data.get('full_name'):
                summary_parts.append(f"Name: {profile_data['full_name']}")
            
            if profile_data.get('headline'):
                summary_parts.append(f"Headline: {profile_data['headline']}")
            
            if profile_data.get('summary'):
                summary_parts.append(f"Summary: {profile_data['summary'][:200]}...")
            
            # Experience
            if profile_data.get('experiences'):
                summary_parts.append(f"Experience: {len(profile_data['experiences'])} positions")
                for exp in profile_data['experiences'][:2]:  # First 2 experiences
                    title = exp.get('title', 'Unknown')
                    company = exp.get('company', 'Unknown')
                    summary_parts.append(f"  - {title} at {company}")
            
            # Education
            if profile_data.get('education'):
                summary_parts.append(f"Education: {len(profile_data['education'])} institutions")
                for edu in profile_data['education'][:2]:  # First 2 education entries
                    degree = edu.get('degree_name', 'Unknown')
                    school = edu.get('school', 'Unknown')
                    summary_parts.append(f"  - {degree} from {school}")
            
            # Skills
            if profile_data.get('skills'):
                skills = [skill.get('name', '') for skill in profile_data['skills'][:5]]
                summary_parts.append(f"Top Skills: {', '.join(skills)}")
            
            return "\n".join(summary_parts)
            
        except Exception as e:
            print(f"Error summarizing profile: {e}")
            return None
    
    async def text_to_speech(self, text: str) -> Optional[bytes]:
        """
        Convert text to speech using ElevenLabs
        
        Args:
            text: Text to convert to speech
            
        Returns:
            Audio data as bytes or None if failed
        """
        try:
            audio = self.elevenlabs.text_to_speech.convert(
                text=text,
                voice_id=self.elevenlabs_voice_id,
                model_id="eleven_multilingual_v2",
                output_format="mp3_44100_128",
            )
            
            # Handle different return types from ElevenLabs
            if hasattr(audio, 'read'):
                # If it's a file-like object
                return audio.read()
            elif hasattr(audio, '__iter__') and not isinstance(audio, (bytes, str)):
                # If it's a generator or iterable
                return b''.join(audio)
            elif isinstance(audio, bytes):
                # If it's already bytes
                return audio
            else:
                # Try to convert to bytes
                return bytes(audio)
                
        except Exception as e:
            print(f"Error in text-to-speech: {e}")
            return None
    
    async def enrich_user_profile(self, linkedin_id: str) -> Dict[str, Any]:
        """
        Complete workflow: fetch LinkedIn profile, summarize, and convert to speech
        
        Args:
            linkedin_id: LinkedIn profile ID
            
        Returns:
            Dictionary with profile data, summary, and audio
        """
        result = {
            'success': False,
            'profile_data': None,
            'summary': None,
            'audio_base64': None,
            'error': None
        }
        
        try:
            # Step 1: Fetch LinkedIn profile
            profile_data = await self.get_linkedin_profile(linkedin_id)
            if not profile_data:
                result['error'] = "Failed to fetch LinkedIn profile"
                return result
            
            result['profile_data'] = profile_data
            
            # Step 2: Generate summary
            summary = await self.summarize_profile(profile_data)
            if not summary:
                result['error'] = "Failed to generate summary"
                return result
            
            result['summary'] = summary
            
            # Step 3: Convert to speech
            audio_data = await self.text_to_speech(summary)
            if audio_data:
                # Convert to base64 for API response
                audio_base64 = base64.b64encode(audio_data).decode('utf-8')
                result['audio_base64'] = audio_base64
            
            result['success'] = True
            
        except Exception as e:
            result['error'] = str(e)
        
        return result

# Global instance
linkedin_integration = LinkedInIntegration() 