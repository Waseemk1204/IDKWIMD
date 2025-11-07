import apiService from './api';

// Use backend OAuth flow instead of direct client-side redirect
const API_URL = import.meta.env.VITE_API_URL || 'https://idkwimd-production.up.railway.app/api/v1';

export interface LinkedInUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  headline?: string;
  location?: string;
}

export interface LinkedInAuthResponse {
  success: boolean;
  user?: LinkedInUserInfo;
  error?: string;
}

class LinkedInAuthService {
  /**
   * Initiate LinkedIn OAuth flow via backend
   * @param mode - 'login' or 'signup' to indicate the auth mode
   * @param role - 'employee' or 'employer' for signup
   */
  async signIn(mode: 'login' | 'signup' = 'login', role?: 'employee' | 'employer'): Promise<LinkedInAuthResponse> {
    try {
      console.log('Initiating LinkedIn OAuth flow via backend...');
      
      // Store mode for callback handling (optional)
      localStorage.setItem('linkedin_auth_mode', mode);
      
      // Redirect to backend OAuth endpoint
      // The backend will handle the OAuth flow and redirect back to frontend
      const backendOAuthUrl = `${API_URL}/auth/linkedin${role ? `?role=${role}` : ''}`;
      
      console.log('LinkedIn OAuth URL:', backendOAuthUrl);
      console.log('Redirecting to backend OAuth endpoint...');
      
      // Redirect to backend OAuth initiation endpoint
      window.location.href = backendOAuthUrl;
      
      return {
        success: true
      };
      
    } catch (error) {
      console.error('LinkedIn OAuth error:', error);
      return {
        success: false,
        error: 'Failed to initiate LinkedIn authentication'
      };
    }
  }

  /**
   * Get auth mode from localStorage
   */
  getAuthMode(): 'login' | 'signup' {
    const mode = localStorage.getItem('linkedin_auth_mode') as 'login' | 'signup' || 'login';
    
    // Clean up
    localStorage.removeItem('linkedin_auth_mode');
    
    return mode;
  }
}

// Export singleton instance
export const linkedinAuthService = new LinkedInAuthService();

// Export the class for testing
export { LinkedInAuthService };

