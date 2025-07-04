import { LinkedInProfileResponse, User, ProfileSetupData } from '@/types/User';

const API_BASE_URL = 'http://localhost:8000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Extract LinkedIn ID from LinkedIn URL
 * @param linkedinUrl Full LinkedIn profile URL
 * @returns LinkedIn ID (username)
 */
export const extractLinkedInId = (linkedinUrl: string): string => {
  // Remove any trailing slashes and normalize the URL
  const cleanUrl = linkedinUrl.trim().replace(/\/$/, '');
  
  // Support multiple LinkedIn URL formats
  const patterns = [
    /linkedin\.com\/in\/([^\/\?]+)/i,           // Standard format
    /linkedin\.com\/pub\/[^\/]+\/[^\/]+\/[^\/]+\/([^\/\?]+)/i, // Old pub format
    /linkedin\.com\/profile\/view\?id=([^&]+)/i // Very old format
  ];
  
  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  throw new Error('Invalid LinkedIn URL format. Please use: https://linkedin.com/in/your-profile');
};

/**
 * Fetch LinkedIn profile data from the API
 * @param linkedinId LinkedIn username/ID
 * @returns LinkedIn profile data
 */
export const fetchLinkedInProfile = async (linkedinId: string): Promise<LinkedInProfileResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/linkedin/profile/${linkedinId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.detail || `Failed to fetch LinkedIn profile: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error.message}`);
  }
};

/**
 * Create a new user profile by sending app data to the backend.
 * The backend will handle LinkedIn enrichment and merging.
 * @param profileData Data collected from the app form, including linkedinId (the full URL)
 * @returns The created user profile from the backend
 */
export const createUserProfile = async (
  profileData: ProfileSetupData,
): Promise<User> => {
  try {
    // The backend expects the key to be `linkedin_id`
    const payload = {
      ...profileData,
      linkedin_id: extractLinkedInId(profileData.linkedinId),
    };

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.detail || `Failed to create user: ${response.statusText}`);
    }

    const createdUserResponse = await response.json();
    // The response from the backend is { message, user_id, profile, ... }
    return createdUserResponse.profile;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error.message}`);
  }
};

/**
 * DEPRECATED: Create fallback LinkedIn data when API is not available
 */
/*
const createFallbackLinkedInData = (profileData: ProfileSetupData): LinkedInProfileResponse => {
  return {
    full_name: profileData.full_name,
    role: "Professional", // Default role
    city: "Unknown",
    state: "Unknown", 
    profile_pic_url: "https://via.placeholder.com/150", // Placeholder image
    skills: [], // Empty skills array
    experiences: [], // Empty experiences
    education: [], // Empty education
    accomplishment_projects: [], // Empty projects
  };
};
*/

/**
 * Complete profile setup flow.
 * This function now just forwards the profile data to the backend,
 * which handles all the enrichment and merging logic.
 * @param profileData Profile setup data from the form
 * @returns Complete user profile from the backend
 */
export const completeProfileSetup = async (profileData: ProfileSetupData): Promise<User> => {
  try {
    // createUserProfile now handles sending the data to the backend for processing.
    const user = await createUserProfile(profileData);
    return user;
  } catch (error: any) {
    console.error('Profile setup error:', error);
    throw error;
  }
};

/**
 * Update user profile data
 * @param userId User ID
 * @param profileData Updated profile data
 * @returns Updated user profile
 */
export const updateUserProfile = async (userId: string, profileData: Partial<User>): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.detail || `Failed to update user: ${response.statusText}`);
    }

    const updatedUserResponse = await response.json();
    return updatedUserResponse.profile;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error.message}`);
  }
};

/**
 * Get recommendations for a user
 * @param userId User ID
 * @param limit Number of recommendations to fetch
 * @returns List of recommended user profiles and scores
 */
export const getRecommendations = async (userId: string, limit: number = 3) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/recommendations?limit=${limit}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.detail || `Failed to fetch recommendations: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error.message}`);
  }
};

/**
 * Record a swipe decision for a user
 * @param userId The ID of the user who is swiping
 * @param targetUserId The ID of the user being swiped on
 * @param decision 0 for dislike, 1 for like, 2 for super like
 * @returns Success message
 */
export const recordSwipe = async (userId: string, targetUserId: string, decision: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/swipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target_user_id: targetUserId,
        decision: decision,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.detail || `Failed to record swipe: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error.message}`);
  }
};
