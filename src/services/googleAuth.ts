// Google OAuth configuration
const GOOGLE_CLIENT_ID = '916734429640-e7c73gltbkl4eijae1qso7sbp6kkaauh.apps.googleusercontent.com';

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export interface GoogleAuthResponse {
  success: boolean;
  user?: GoogleUserInfo;
  error?: string;
}

class GoogleAuthService {
  private isLoaded = false;
  private isResolved = false;

  constructor() {
    this.loadGoogleScript();
  }

  /**
   * Load Google Identity Services script
   */
  private loadGoogleScript(): void {
    if (this.isLoaded) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client?v=' + Date.now(); // Cache busting
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.initializeGoogleAuth();
    };
    document.head.appendChild(script);
  }

  /**
   * Initialize Google Auth
   */
  private initializeGoogleAuth(): void {
    if (typeof window !== 'undefined' && (window as any).google) {
      console.log('Initializing Google Auth with client ID:', GOOGLE_CLIENT_ID);
      
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true, // Enable FedCM as required by Google
        ux_mode: 'popup' // Use popup mode to avoid callback URL issues
      });
      
      this.isLoaded = true;
      console.log('Google Auth initialized successfully');
    } else {
      console.error('Google Identity Services not available');
    }
  }

  /**
   * Handle Google credential response
   */
  private handleCredentialResponse(response: any): GoogleAuthResponse {
    try {
      // Decode the JWT token to get user info
      const payload = this.decodeJWT(response.credential);
      
      const userInfo: GoogleUserInfo = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name
      };

      return {
        success: true,
        user: userInfo
      };
    } catch (error) {
      console.error('Google OAuth error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Decode JWT token
   */
  private decodeJWT(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  /**
   * Trigger Google OAuth flow
   */
  async signIn(): Promise<GoogleAuthResponse> {
    return new Promise((resolve) => {
      if (!this.isLoaded) {
        resolve({
          success: false,
          error: 'Google Auth not loaded yet'
        });
        return;
      }

      // Reset resolved state
      this.isResolved = false;

      // Set up one-time callback
      const originalCallback = (window as any).google.accounts.id.callback;
      (window as any).google.accounts.id.callback = (response: any) => {
        this.isResolved = true;
        const result = this.handleCredentialResponse(response);
        resolve(result);
        // Restore original callback
        (window as any).google.accounts.id.callback = originalCallback;
      };

      try {
        console.log('Initiating Google OAuth prompt...');
        
        // Check if Google API is available
        if (!(window as any).google?.accounts?.id) {
          throw new Error('Google Identity Services not loaded');
        }
        
        // Try popup mode first
        try {
          (window as any).google.accounts.id.prompt();
          console.log('Google OAuth prompt initiated (popup mode), waiting for response...');
        } catch (popupError) {
          console.warn('Popup mode failed, trying redirect mode:', popupError);
          // Fallback to redirect mode if popup fails
          (window as any).google.accounts.id.prompt({
            ux_mode: 'redirect',
            redirect_uri: window.location.origin + '/auth/google/callback'
          });
          console.log('Google OAuth prompt initiated (redirect mode), waiting for response...');
        }
        
        // Set a timeout to handle cases where prompt doesn't respond
        setTimeout(() => {
          // If we haven't resolved yet, it means the prompt didn't work
          if (!this.isResolved) {
            console.warn('Google OAuth timeout - no response received');
            this.isResolved = true;
            resolve({
              success: false,
              error: 'Google authentication timed out. Please try email/password login.'
            });
          }
        }, 30000); // 30 second timeout
        
      } catch (error) {
        console.error('Google OAuth error:', error);
        this.isResolved = true;
        resolve({
          success: false,
          error: 'Failed to initiate Google authentication. Please try email/password login.'
        });
      }
    });
  }

  /**
   * Sign out user
   */
  signOut(): void {
    if (this.isLoaded && (window as any).google) {
      (window as any).google.accounts.id.disableAutoSelect();
    }
  }

  /**
   * Check if Google Auth is loaded
   */
  isGoogleAuthLoaded(): boolean {
    return this.isLoaded;
  }
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService();

// Export the class for testing
export { GoogleAuthService };
