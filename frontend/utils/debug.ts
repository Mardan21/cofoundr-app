import { extractLinkedInId, fetchLinkedInProfile } from './api';

/**
 * Debug utility to test LinkedIn API integration
 */
export const debugLinkedInAPI = async (linkedinUrl: string) => {
  console.log('🔍 Debugging LinkedIn API Integration');
  console.log('=====================================');
  
  try {
    // Step 1: Test URL extraction
    console.log('1. Testing LinkedIn URL extraction...');
    console.log('Input URL:', linkedinUrl);
    
    const linkedinId = extractLinkedInId(linkedinUrl);
    console.log('✅ Extracted LinkedIn ID:', linkedinId);
    
    // Step 2: Test API call
    console.log('\n2. Testing LinkedIn API call...');
    console.log('API Endpoint: http://localhost:8000/linkedin/profile/' + linkedinId);
    
    const profileData = await fetchLinkedInProfile(linkedinId);
    console.log('✅ LinkedIn API Response:', profileData);
    
    return { success: true, data: profileData };
    
  } catch (error: any) {
    console.error('❌ LinkedIn API Debug Failed:', error);
    
    if (error.message.includes('Invalid LinkedIn URL')) {
      console.log('💡 Suggestion: Check the LinkedIn URL format');
    } else if (error.status === 404) {
      console.log('💡 Suggestion: The LinkedIn profile might not exist or be private');
    } else if (error.message.includes('SSL') || error.message.includes('certificate')) {
      console.log('💡 Suggestion: SSL certificate issue with the backend service');
    } else if (error.status === 0) {
      console.log('💡 Suggestion: Backend server might not be running on http://localhost:8000');
    }
    
    return { success: false, error };
  }
};

/**
 * Test multiple LinkedIn URL formats
 */
export const testLinkedInUrlFormats = () => {
  const testUrls = [
    'https://linkedin.com/in/anandms101',
    'https://www.linkedin.com/in/anandms101/',
    'https://linkedin.com/in/anandms101?trk=nav',
    'linkedin.com/in/anandms101',
  ];
  
  console.log('🧪 Testing LinkedIn URL Formats');
  console.log('================================');
  
  testUrls.forEach((url, index) => {
    try {
      const id = extractLinkedInId(url);
      console.log(`✅ Test ${index + 1}: "${url}" → "${id}"`);
    } catch (error: any) {
      console.log(`❌ Test ${index + 1}: "${url}" → Error: ${error.message}`);
    }
  });
}; 