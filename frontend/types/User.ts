export interface User {
  id: string;
  email: string;
  full_name: string;
  bio: string;
  startupIdea: string;
  role: string;
  city: string;
  state: string;
  profile_pic_url: string;
  skills: string[];
  experiences: Experience[];
  education: Education[];
  accomplishment_projects: Project[];
  links: Link[];
  lookingFor: string;
  profileType: 'founder' | 'cofounder' | 'mentor' | 'investor';
  createdAt: string;
  audio_base64?: string;
}

export interface Experience {
  starts_at: DateInfo | null;
  ends_at: DateInfo | "None" | null;
  company: string;
  company_linkedin_profile_url: string;
  company_facebook_profile_url: string;
  title: string;
  description: string;
  location: string;
  logo_url: string;
}

export interface Education {
  starts_at: DateInfo | "None" | null;
  ends_at: DateInfo | null;
  field_of_study: string;
  degree_name: string;
  school: string;
  school_linkedin_profile_url: string;
  school_facebook_profile_url: string;
  description: string;
  logo_url: string;
  grade: string;
  activities_and_societies: string;
}

export interface Project {
  name: string;
  description: string;
}

export interface Link {
  name: string;
  url: string;
}

export interface DateInfo {
  day: number;
  month: number;
  year: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface ProfileSetupData {
  full_name: string;
  bio: string;
  startupIdea: string;
  lookingFor: string;
  profileType: 'founder' | 'cofounder' | 'mentor' | 'investor';
  linkedinId: string;
  links: Link[];
}

export interface LinkedInProfileResponse {
  full_name: string;
  role: string;
  city: string;
  state: string;
  profile_pic_url: string;
  skills: string[];
  experiences: Experience[];
  education: Education[];
  accomplishment_projects: Project[];
}