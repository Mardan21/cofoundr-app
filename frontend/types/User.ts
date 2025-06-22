export interface User {
  id: string;
  email: string;
  name: string;
  profileType: 'cofounder' | 'mentor' | 'investor' | null;
  linkedinUrl?: string;
  githubUsername?: string;
  companyName: string;
  showCompany: boolean;
  bio: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface ProfileSetupData {
  name: string;
  profileType: 'cofounder' | 'mentor' | 'investor' | null;
  linkedinUrl: string;
  githubUsername: string;
  companyName: string;
  showCompany: boolean;
  bio: string;
}