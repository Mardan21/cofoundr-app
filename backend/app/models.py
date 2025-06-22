from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import date

class ProfileType(str, Enum):
    FOUNDER = "founder"
    COFOUNDER = "cofounder"

class Experience(BaseModel):
    company: str
    title: str
    startDate: str
    endDate: Optional[str] = None
    description: str

class Education(BaseModel):
    school: str
    degree: str
    startDate: str
    endDate: Optional[str] = None

class Project(BaseModel):
    name: str
    description: str

class Link(BaseModel):
    name: str
    url: str

class Accomplishment(BaseModel):
    name: str
    description: str

class UserProfile(BaseModel):
    name: str
    startupIdea: str
    role: str
    location: str
    skills: List[str]
    experience: List[Experience]
    education: List[Education]
    projects: List[Project]
    links: List[Link]
    accomplishments: List[Accomplishment]
    what_im_looking_for: str = Field(alias="what I'm looking for")
    profileType: ProfileType

class CreateUserRequest(BaseModel):
    """Request model for creating a user with minimal frontend data and optional LinkedIn enrichment"""
    # Frontend data (minimal set)
    bio: str
    startupIdea: str
    links: List[Link]
    linkedin_id: Optional[str] = None

class SwipeDecision(BaseModel):
    target_user_id: str
    decision: int  # 1 = like, 2 = super like, 0 = dislike

class SwipeHistory(BaseModel):
    user_id: str
    target_user_id: str
    decision: int
    timestamp: str

class RecommendationRequest(BaseModel):
    user_id: str
    limit: int = 10

class RecommendationResponse(BaseModel):
    recommendations: List[Dict[str, Any]]
    scores: List[float]

class EmbeddingData(BaseModel):
    skills: List[float]
    summary: List[float]
    interests: List[float]
    domain: List[float] 