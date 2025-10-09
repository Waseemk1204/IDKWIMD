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
        callback: () => {
          // This will be overridden by the Promise callback
          console.log('Default Google OAuth callback called');
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false, // Disable FedCM to avoid AbortError issues
        ux_mode: 'redirect', // Use redirect mode only - no popups
        context: 'signin', // Specify context
        itp_support: true // Support Intelligent Tracking Prevention
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
      console.log('Google OAuth credential response received:', response);
      
      // Decode the JWT token to get user info
      const payload = this.decodeJWT(response.credential);
      console.log('Decoded JWT payload:', payload);
      
      const userInfo: GoogleUserInfo = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name
      };

      console.log('Google user info:', userInfo);

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
   * @param mode - 'login' or 'signup' to indicate the auth mode
   * @param role - 'employee' or 'employer' for signup
   */
  async signIn(mode: 'login' | 'signup' = 'login', role?: 'employee' | 'employer'): Promise<GoogleAuthResponse> {
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
        console.log('Google OAuth callback triggered with response:', response);
        this.isResolved = true;
        const result = this.handleCredentialResponse(response);
        console.log('Google OAuth result:', result);
        resolve(result);
        // Restore original callback
        (window as any).google.accounts.id.callback = originalCallback;
      };

      try {
        console.log('Initiating Google OAuth redirect...');
        
        // Check if Google API is available
        if (!(window as any).google?.accounts?.id) {
          throw new Error('Google Identity Services not loaded');
        }
        
        // Use different redirect URIs for signup and login
        // For signup, encode role in the URI path so backend can read it
        let loginUri;
        if (mode === 'signup') {
          const rolePath = role || 'employee';
          loginUri = window.location.hostname === 'localhost' 
            ? `${window.location.origin}/signup/${rolePath}`  // Local development
            : `https://parttimepays.in/signup/${rolePath}`;    // Production
        } else {
          loginUri = window.location.hostname === 'localhost' 
            ? window.location.origin + '/login'  // Local development
            : 'https://parttimepays.in/login';    // Production
        }
        
        console.log('🔵 Using login URI:', loginUri);
        console.log('🔵 Auth mode:', mode);
        console.log('🔵 Auth role:', role);
        
        // Store mode and role in localStorage for frontend callback handling
        localStorage.setItem('google_auth_mode', mode);
        if (role) {
          localStorage.setItem('signup_role', role);
          console.log('Stored signup role in localStorage:', role);
        }
        
        // CRITICAL: Reinitialize Google Auth with the specific login_uri
        // The login_uri parameter tells Google where to POST the credential
        console.log('🔵 Reinitializing Google Auth with login_uri:', loginUri);
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          ux_mode: 'redirect',
          login_uri: loginUri, // This is where Google will POST the credential
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false
        });
        
        // Create a temporary button element and trigger it
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'fixed';
        tempDiv.style.top = '-1000px';
        tempDiv.style.left = '-1000px';
        tempDiv.style.visibility = 'hidden';
        document.body.appendChild(tempDiv);
        
        // Render the Google Sign-In button (no redirect_uri needed here)
        (window as any).google.accounts.id.renderButton(tempDiv, {
          theme: 'outline',
          size: 'large',
          type: 'standard'
        });
        
        // Wait for the button to render and then click it
        setTimeout(() => {
          const button = tempDiv.querySelector('div[role="button"]') as HTMLElement;
          if (button) {
            console.log('Clicking Google OAuth button programmatically');
            button.click();
          } else {
            console.error('Google OAuth button not found');
            document.body.removeChild(tempDiv);
            resolve({
              success: false,
              error: 'Failed to create Google OAuth button'
            });
            return;
          }
        }, 100);
        
        // Add timeout for popup
        setTimeout(() => {
          if (!this.isResolved) {
            console.log('Google OAuth popup timeout');
            document.body.removeChild(tempDiv);
            resolve({
              success: false,
              error: 'Google authentication timed out. Please try again.'
            });
          }
        }, 30000); // 30 second timeout
        
        // Clean up after a delay
        setTimeout(() => {
          if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv);
          }
        }, 5000);
        
        console.log('Google OAuth redirect initiated - user will be redirected to Google');
        
        // For redirect mode, we don't need to wait for a response
        // The user will be redirected to Google and then back to our callback
        // The Promise will be resolved when the callback page processes the response
        
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
