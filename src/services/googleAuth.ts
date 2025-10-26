// Google OAuth configuration
import logger from '../utils/logger';

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
      logger.info('GoogleAuthService - Initializing Google Auth');
      
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: () => {
          // This will be overridden by the Promise callback
          logger.debug('GoogleAuthService - Default OAuth callback called');
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false, // Disable FedCM to avoid AbortError issues
        ux_mode: 'redirect', // Use redirect mode only - no popups
        context: 'signin', // Specify context
        itp_support: true // Support Intelligent Tracking Prevention
      });
      
      this.isLoaded = true;
      logger.info('GoogleAuthService - Initialized successfully');
    } else {
      logger.error('GoogleAuthService - Google Identity Services not available');
    }
  }



  /**
   * Trigger Google OAuth flow
   * @param mode - 'login' or 'signup' to indicate the auth mode
   * @param role - 'employee' or 'employer' for signup
   */
  async signIn(mode: 'login' | 'signup' = 'login', role?: 'employee' | 'employer'): Promise<GoogleAuthResponse> {
    if (!this.isLoaded) {
      return {
        success: false,
        error: 'Google Auth not loaded yet'
      };
    }

    try {
      logger.info('GoogleAuthService - Initiating Google OAuth redirect', { mode, role });
      
      // Check if Google API is available
      if (!(window as any).google?.accounts?.id) {
        throw new Error('Google Identity Services not loaded');
      }
      
      // Use different redirect URIs for signup and login
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
      
      logger.debug('GoogleAuthService - Redirect URI configured', { loginUri });
      
      // Reinitialize Google Auth with the specific login_uri for redirect mode
      const config = {
        client_id: GOOGLE_CLIENT_ID,
        ux_mode: 'redirect',
        login_uri: loginUri, // This is where Google will POST the credential
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false
      };
      
      (window as any).google.accounts.id.initialize(config);
      
      logger.debug('GoogleAuthService - Initialized with redirect mode');
      
      // Create a temporary button element and trigger it
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.top = '-1000px';
      tempDiv.style.left = '-1000px';
      tempDiv.style.visibility = 'hidden';
      document.body.appendChild(tempDiv);
      
      // Render the Google Sign-In button
      (window as any).google.accounts.id.renderButton(tempDiv, {
        theme: 'outline',
        size: 'large',
        type: 'standard'
      });
      
      // Wait for the button to render and then click it
      setTimeout(() => {
        const button = tempDiv.querySelector('div[role="button"]') as HTMLElement;
        if (button) {
          logger.debug('GoogleAuthService - Clicking OAuth button programmatically');
          button.click();
        } else {
          logger.error('GoogleAuthService - OAuth button not found');
          document.body.removeChild(tempDiv);
        }
      }, 100);
      
      // Clean up after a delay
      setTimeout(() => {
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv);
        }
      }, 5000);
      
      logger.info('GoogleAuthService - Redirect initiated, user will be redirected to Google');
      
      // For redirect mode, we return immediately as the user will be redirected
      return {
        success: true,
        user: undefined // Will be handled by backend redirect
      };
      
    } catch (error) {
      logger.error('GoogleAuthService - OAuth error', error);
      return {
        success: false,
        error: 'Failed to initiate Google authentication. Please try email/password login.'
      };
    }
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
