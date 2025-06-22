import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Tuple, Set
import json
import pickle
import os
from datetime import datetime

class CoFounderRecommender:
    def __init__(self, cache_dir: str = "recommender_cache"):
        # Initialize sentence transformer for generating embeddings
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Cache directory for persistent storage
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
        
        # Persistent storage files
        self.weights_file = os.path.join(cache_dir, "user_weights.pkl")
        self.swipe_cache_file = os.path.join(cache_dir, "swipe_cache.pkl")
        
        # Load or initialize persistent data
        self.user_field_weights = self._load_weights()
        self.user_swipe_cache = self._load_swipe_cache()  # user_id -> set of swiped_user_ids
        
        # Base weights (fallback for new users) - Updated for new schema
        self.base_weights = {
            'skills': 0.25, 'startup': 0.20, 'role_location': 0.10, 'experience': 0.15,
            'education': 0.10, 'projects': 0.10, 'bio': 0.05, 'looking_for': 0.05
        }
    
    def _load_weights(self) -> Dict[str, Dict[str, float]]:
        """Load user weights from disk"""
        try:
            if os.path.exists(self.weights_file):
                with open(self.weights_file, 'rb') as f:
                    return pickle.load(f)
        except Exception as e:
            print(f"Error loading weights: {e}")
        return {}
    
    def _save_weights(self):
        """Save user weights to disk"""
        try:
            with open(self.weights_file, 'wb') as f:
                pickle.dump(self.user_field_weights, f)
        except Exception as e:
            print(f"Error saving weights: {e}")
    
    def _load_swipe_cache(self) -> Dict[str, Set[str]]:
        """Load swipe cache from disk"""
        try:
            if os.path.exists(self.swipe_cache_file):
                with open(self.swipe_cache_file, 'rb') as f:
                    data = pickle.load(f)
                    # Convert lists back to sets
                    return {k: set(v) for k, v in data.items()}
        except Exception as e:
            print(f"Error loading swipe cache: {e}")
        return {}
    
    def _save_swipe_cache(self):
        """Save swipe cache to disk"""
        try:
            # Convert sets to lists for JSON serialization
            data = {k: list(v) for k, v in self.user_swipe_cache.items()}
            with open(self.swipe_cache_file, 'wb') as f:
                pickle.dump(data, f)
        except Exception as e:
            print(f"Error saving swipe cache: {e}")
    
    def normalize_user_id(self, user_id: Any) -> str:
        """Normalize user ID to consistent string format"""
        if user_id is None:
            return None
        return str(user_id).strip()
    
    def update_swipe_cache(self, user_id: str, swiped_user_id: str):
        """Update the swipe cache with new swipe - CONTINUOUS FEEDBACK"""
        user_id = self.normalize_user_id(user_id)
        swiped_user_id = self.normalize_user_id(swiped_user_id)
        
        if not user_id or not swiped_user_id:
            return
        
        if user_id not in self.user_swipe_cache:
            self.user_swipe_cache[user_id] = set()
        
        self.user_swipe_cache[user_id].add(swiped_user_id)
        
        # Save to disk immediately for persistence
        self._save_swipe_cache()
        
        print(f"✅ Updated swipe cache: {user_id} swiped {swiped_user_id}")
    
    def get_swiped_user_ids(self, user_id: str) -> Set[str]:
        """Get all user IDs that this user has swiped on"""
        user_id = self.normalize_user_id(user_id)
        return self.user_swipe_cache.get(user_id, set())
    
    def generate_embeddings(self, profile: Dict[str, Any]) -> Dict[str, List[float]]:
        """Generate embeddings for different aspects of a user profile"""
        
        # Skills embedding
        skills = profile.get('skills', [])
        if isinstance(skills, list):
            skills_text = " ".join(skills)
        else:
            skills_text = str(skills) if skills else ""
        skills_embedding = self.model.encode(skills_text).tolist()
        
        # Startup idea embedding
        startup_text = profile.get('startupIdea', '') or profile.get('startup_idea', '') or ""
        startup_embedding = self.model.encode(startup_text).tolist()
        
        # Role and location embedding
        role = profile.get('role', '') or ""
        location = profile.get('location', '') or ""
        role_location_text = f"{role} {location}"
        role_location_embedding = self.model.encode(role_location_text).tolist()
        
        # Experience embedding
        experience_list = profile.get('experience', [])
        if isinstance(experience_list, list):
            experience_text = " ".join([f"{exp.get('title', '')} {exp.get('description', '')}" for exp in experience_list])
        else:
            experience_text = str(experience_list) if experience_list else ""
        experience_embedding = self.model.encode(experience_text).tolist()
        
        # Education embedding
        education_list = profile.get('education', [])
        if isinstance(education_list, list):
            education_text = " ".join([f"{edu.get('degree', '')} {edu.get('school', '')}" for edu in education_list])
        else:
            education_text = str(education_list) if education_list else ""
        education_embedding = self.model.encode(education_text).tolist()
        
        # Projects embedding
        projects_list = profile.get('projects', [])
        if isinstance(projects_list, list):
            projects_text = " ".join([f"{p.get('name', '')} {p.get('description', '')}" for p in projects_list])
        else:
            projects_text = str(projects_list) if projects_list else ""
        projects_embedding = self.model.encode(projects_text).tolist()
        
        # Accomplishments embedding
        accomplishments_list = profile.get('accomplishments', [])
        if isinstance(accomplishments_list, list):
            accomplishments_text = " ".join([f"{a.get('name', '')} {a.get('description', '')}" for a in accomplishments_list])
        else:
            accomplishments_text = str(accomplishments_list) if accomplishments_list else ""
        accomplishments_embedding = self.model.encode(accomplishments_text).tolist()
        
        # What I'm looking for embedding
        what_im_looking_for = profile.get("what I\\'m looking for", '') or profile.get('what_im_looking_for', '') or ""
        looking_for_embedding = self.model.encode(what_im_looking_for).tolist()
        
        return {
            'skills': skills_embedding,
            'startup': startup_embedding,
            'role_location': role_location_embedding,
            'experience': experience_embedding,
            'education': education_embedding,
            'projects': projects_embedding,
            'accomplishments': accomplishments_embedding,
            'looking_for': looking_for_embedding
        }
    
    def learn_preference_patterns(self, my_embeddings: Dict[str, List[float]], 
                                swipe_history: List[Dict[str, Any]], 
                                context_size: int = 50) -> Dict[str, List[Tuple[List[float], float]]]:
        """Learn preference patterns from swipe history - CORRECTED LOGIC"""
        
        # Store examples of what user liked/disliked for each field
        field_preferences = {
            'skills': [], 'startup': [], 'role_location': [], 'experience': [],
            'education': [], 'projects': [], 'bio': [], 'looking_for': []
        }
        
        if not swipe_history:
            return field_preferences
        
        # Process recent swipe history (increased context for better learning)
        for swipe in swipe_history[-context_size:]:
            profile = swipe.get('profile', {})
            decision = swipe.get('decision', 0)  # 0=no, 1=yes, 2=super
            
            # Skip if no profile data
            if not profile:
                continue
            
            # Generate embeddings for the swiped profile
            try:
                profile_embeddings = self.generate_embeddings(profile)
            except Exception as e:
                print(f"Error generating embeddings for profile: {e}")
                continue
            
            # Convert decision to weight: positive for likes, negative for dislikes
            weight = 1.0 if decision == 1 else 2.0 if decision == 2 else -0.5
            
            # Store the actual embeddings of profiles they liked/disliked
            for field in field_preferences.keys():
                field_preferences[field].append((profile_embeddings[field], weight))
        
        return field_preferences
    
    def learn_field_importance(self, learned_preferences: Dict[str, List[Tuple[List[float], float]]], 
                             user_id: str) -> Dict[str, float]:
        """Learn which fields are most important to user based on swipe patterns - PERSISTENT"""
        
        user_id = self.normalize_user_id(user_id)
        
        # Get existing weights or start with base weights
        if user_id in self.user_field_weights:
            field_weights = self.user_field_weights[user_id].copy()
        else:
            field_weights = self.base_weights.copy()
        
        # Calculate how predictive each field is of positive swipes
        field_predictiveness = {}
        
        for field, preference_history in learned_preferences.items():
            if not preference_history:
                field_predictiveness[field] = 0
                continue
            
            positive_weight = sum(weight for _, weight in preference_history if weight > 0)
            negative_weight = abs(sum(weight for _, weight in preference_history if weight < 0))
            total_interactions = len(preference_history)
            
            # Fields with strong positive patterns get boosted
            if total_interactions > 0:
                predictiveness = (positive_weight - negative_weight) / total_interactions
                field_predictiveness[field] = max(-0.5, min(0.5, predictiveness))
            else:
                field_predictiveness[field] = 0
        
        # Adjust weights based on how predictive each field is
        for field in field_weights:
            adjustment = field_predictiveness.get(field, 0) * 0.05  # Very gradual learning (5% max adjustment)
            field_weights[field] = max(0.05, min(0.4, field_weights[field] + adjustment))
        
        # Normalize to sum to 1.0
        total_weight = sum(field_weights.values())
        if total_weight > 0:
            for field in field_weights:
                field_weights[field] /= total_weight
        
        # Store learned weights persistently
        self.user_field_weights[user_id] = field_weights
        self._save_weights()  # Save to disk immediately
        
        return field_weights

    def predict_swipe_likelihood(self, candidate_embeddings: Dict[str, List[float]], 
                               learned_preferences: Dict[str, List[Tuple[List[float], float]]],
                               user_id: str) -> float:
        """Predict likelihood of swiping right on a candidate - CORRECTED LOGIC"""
        
        if not any(learned_preferences.values()):
            return 0.5  # Neutral score if no history
        
        # Learn personalized field importance weights (PERSISTENT)
        field_weights = self.learn_field_importance(learned_preferences, user_id)
        
        total_score = 0
        field_count = 0
        
        for field, weight in field_weights.items():
            preference_history = learned_preferences.get(field, [])
            if not preference_history:
                continue
            
            field_score = 0
            total_weight = 0
            
            # Compare candidate to each profile in user's swipe history for this field
            for liked_profile_embedding, swipe_weight in preference_history:
                try:
                    # How similar is this candidate to profiles user liked/disliked?
                    similarity = cosine_similarity(
                        [candidate_embeddings[field]], 
                        [liked_profile_embedding]
                    )[0][0]
                    
                    # If user liked similar profiles before, this is good
                    # If user disliked similar profiles before, this is bad
                    field_score += similarity * swipe_weight
                    total_weight += abs(swipe_weight)
                except Exception as e:
                    print(f"Error calculating similarity for field {field}: {e}")
                    continue
            
            if total_weight > 0:
                # Average the field score and weight by personalized field importance
                avg_field_score = field_score / total_weight
                total_score += avg_field_score * weight
                field_count += 1
        
        # Normalize by number of fields with data
        if field_count > 0:
            final_score = total_score / sum(field_weights.values())
            # Convert to 0-1 range (sigmoid-like)
            return max(0, min(1, (final_score + 1) / 2))
        
        return 0.5  # Default neutral score
    
    def recommend_profiles(self, my_profile: Dict[str, Any], 
                          all_candidates: List[Dict[str, Any]], 
                          swipe_history: List[Dict[str, Any]],
                          user_id: str) -> List[Tuple[Dict[str, Any], float]]:
        """Main recommendation function with PROPER FILTERING"""
        
        user_id = self.normalize_user_id(user_id)
        
        # Get all previously swiped user IDs (from persistent cache)
        swiped_user_ids = self.get_swiped_user_ids(user_id)
        
        # Also add current session swipes to cache
        for swipe in swipe_history:
            profile = swipe.get('profile', {})
            # Try multiple possible ID fields
            candidate_id = (profile.get('id') or 
                          profile.get('_id') or 
                          profile.get('user_id') or 
                          profile.get('userId'))
            
            if candidate_id:
                normalized_id = self.normalize_user_id(candidate_id)
                if normalized_id:
                    swiped_user_ids.add(normalized_id)
                    # Update persistent cache
                    self.update_swipe_cache(user_id, normalized_id)
        
        # Filter candidates to exclude already swiped users + self
        available_candidates = []
        my_user_id = self.normalize_user_id(my_profile.get('_id') or my_profile.get('id'))
        
        for candidate in all_candidates:
            # Try multiple possible ID fields
            candidate_id = (candidate.get('id') or 
                          candidate.get('_id') or 
                          candidate.get('user_id') or 
                          candidate.get('userId'))
            
            if candidate_id:
                normalized_id = self.normalize_user_id(candidate_id)
                # Exclude already swiped users AND exclude self
                if normalized_id and normalized_id not in swiped_user_ids and normalized_id != my_user_id:
                    available_candidates.append(candidate)
            else:
                # If no ID found, include but warn (unless it's clearly the same person)
                candidate_name = candidate.get('full_name', '') or candidate.get('name', '')
                my_name = my_profile.get('full_name', '') or my_profile.get('name', '')
                if candidate_name != my_name:  # Basic name check to avoid self-recommendation
                    print(f"⚠️  Candidate has no ID field: {candidate}")
                    available_candidates.append(candidate)
        
        print(f"📊 Filtered {len(all_candidates)} candidates to {len(available_candidates)} available (excluded {len(swiped_user_ids)} already swiped)")
        
        # If no available candidates, return empty list
        if not available_candidates:
            return []
        
        # If no swipe history, return 3 random candidates
        if not swipe_history:
            import random
            random.shuffle(available_candidates)  # Shuffle for variety
            if len(available_candidates) <= 3:
                return [(candidate, 0.5) for candidate in available_candidates]
            else:
                return [(candidate, 0.5) for candidate in available_candidates[:3]]
        
        # Generate my embeddings once
        try:
            my_embeddings = self.generate_embeddings(my_profile)
        except Exception as e:
            print(f"Error generating user embeddings: {e}")
            # Fallback to random selection
            import random
            random.shuffle(available_candidates)
            return [(candidate, 0.5) for candidate in available_candidates[:3]]
        
        # Learn what types of profiles I actually swipe yes on
        learned_preferences = self.learn_preference_patterns(my_embeddings, swipe_history)
        
        scores = []
        for candidate in available_candidates:
            try:
                # Generate embeddings for candidate
                candidate_embeddings = self.generate_embeddings(candidate)
                
                # Predict likelihood I'll swipe yes based on my past behavior
                swipe_likelihood = self.predict_swipe_likelihood(candidate_embeddings, learned_preferences, user_id)
                
                scores.append((candidate, swipe_likelihood))
            except Exception as e:
                print(f"Error scoring candidate: {e}")
                # Give neutral score if error
                scores.append((candidate, 0.5))
        
        # Return top 3 sorted by score (highest first)
        return sorted(scores, key=lambda x: x[1], reverse=True)[:3]

# Global recommender instance for continuous memory
_recommender_instance = None

def get_recommender() -> CoFounderRecommender:
    """Get singleton recommender instance for continuous memory"""
    global _recommender_instance
    if _recommender_instance is None:
        _recommender_instance = CoFounderRecommender()
    return _recommender_instance

# Flask route helpers for continuous feedback
def handle_swipe_feedback(user_id: str, swiped_user_id: str, decision: int):
    """Handle swipe feedback for continuous learning"""
    recommender = get_recommender()
    recommender.update_swipe_cache(user_id, swiped_user_id)
    print(f"📝 Swipe feedback recorded: User {user_id} swiped {decision} on {swiped_user_id}")

def get_recommendations(user_id: str, user_profile: Dict, all_candidates: List[Dict], 
                       swipe_history: List[Dict]) -> List[Tuple[Dict, float]]:
    """Get recommendations using persistent recommender"""
    recommender = get_recommender()
    return recommender.recommend_profiles(user_profile, all_candidates, swipe_history, user_id)