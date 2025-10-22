// LinkedIn OAuth configuration
const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID || 'your-linkedin-client-id';
const LINKEDIN_REDIRECT_URI = import.meta.env.VITE_LINKEDIN_REDIRECT_URI || window.location.origin + '/auth/linkedin/callback';
const LINKEDIN_SCOPE = 'r_liteprofile r_emailaddress';

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
   * Initiate LinkedIn OAuth flow
   * @param mode - 'login' or 'signup' to indicate the auth mode
   * @param role - 'employee' or 'employer' for signup
   */
  async signIn(mode: 'login' | 'signup' = 'login', role?: 'employee' | 'employer'): Promise<LinkedInAuthResponse> {
    try {
      console.log('Initiating LinkedIn OAuth flow...');
      
      // Store mode and role in localStorage for callback
      localStorage.setItem('linkedin_auth_mode', mode);
      if (role) {
        localStorage.setItem('linkedin_auth_role', role);
      }
      
      // Build authorization URL
      const state = this.generateState();
      localStorage.setItem('linkedin_oauth_state', state);
      
      const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('client_id', LINKEDIN_CLIENT_ID);
      authUrl.searchParams.append('redirect_uri', LINKEDIN_REDIRECT_URI);
      authUrl.searchParams.append('scope', LINKEDIN_SCOPE);
      authUrl.searchParams.append('state', state);
      
      console.log('LinkedIn OAuth URL:', authUrl.toString());
      console.log('Redirecting to LinkedIn...');
      
      // Redirect to LinkedIn authorization page
      window.location.href = authUrl.toString();
      
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
   * Handle OAuth callback and exchange code for access token
   */
  async handleCallback(code: string, state: string): Promise<LinkedInAuthResponse> {
    try {
      // Verify state to prevent CSRF
      const savedState = localStorage.getItem('linkedin_oauth_state');
      if (state !== savedState) {
        throw new Error('Invalid state parameter');
      }
      
      // Clean up state from localStorage
      localStorage.removeItem('linkedin_oauth_state');
      
      // Exchange code for access token (this should be done on the backend for security)
      // For now, we'll send the code to our backend
      const response = await fetch('/api/auth/linkedin/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          redirectUri: LINKEDIN_REDIRECT_URI
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }
      
      const data = await response.json();
      
      return {
        success: true,
        user: data.user
      };
      
    } catch (error) {
      console.error('LinkedIn callback error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete LinkedIn authentication'
      };
    }
  }

  /**
   * Fetch LinkedIn profile data using access token
   */
  async getUserProfile(accessToken: string): Promise<LinkedInAuthResponse> {
    try {
      // Fetch basic profile
      const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch LinkedIn profile');
      }
      
      const profile = await profileResponse.json();
      
      // Fetch email address (separate endpoint)
      const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!emailResponse.ok) {
        throw new Error('Failed to fetch LinkedIn email');
      }
      
      const emailData = await emailResponse.json();
      const email = emailData?.elements?.[0]?.['handle~']?.emailAddress;
      
      // Extract profile data
      const firstName = profile.localizedFirstName || '';
      const lastName = profile.localizedLastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      
      // Get profile picture
      const profilePictureUrl = profile.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier;
      
      // Get headline (from positions or current position)
      const headline = profile.localizedHeadline || '';
      
      return {
        success: true,
        user: {
          id: profile.id,
          email: email || '',
          name: fullName,
          picture: profilePictureUrl,
          headline: headline
        }
      };
      
    } catch (error) {
      console.error('LinkedIn profile fetch error:', error);
      return {
        success: false,
        error: 'Failed to fetch LinkedIn profile'
      };
    }
  }

  /**
   * Generate random state for OAuth security
   */
  private generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get auth mode and role from localStorage
   */
  getAuthContext(): { mode: 'login' | 'signup', role?: 'employee' | 'employer' } {
    const mode = localStorage.getItem('linkedin_auth_mode') as 'login' | 'signup' || 'login';
    const role = localStorage.getItem('linkedin_auth_role') as 'employee' | 'employer' | undefined;
    
    // Clean up
    localStorage.removeItem('linkedin_auth_mode');
    localStorage.removeItem('linkedin_auth_role');
    
    return { mode, role };
  }
}

// Export singleton instance
export const linkedinAuthService = new LinkedInAuthService();

// Export the class for testing
export { LinkedInAuthService };

