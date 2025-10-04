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

  constructor() {
    this.loadGoogleScript();
  }

  /**
   * Load Google Identity Services script
   */
  private loadGoogleScript(): void {
    if (this.isLoaded) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
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
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false, // Disable FedCM to avoid browser blocking
        ux_mode: 'popup' // Use popup instead of redirect
      });
      this.isLoaded = true;
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

      // Set up one-time callback
      const originalCallback = (window as any).google.accounts.id.callback;
      (window as any).google.accounts.id.callback = (response: any) => {
        const result = this.handleCredentialResponse(response);
        resolve(result);
        // Restore original callback
        (window as any).google.accounts.id.callback = originalCallback;
      };

      // Trigger the sign-in flow
      (window as any).google.accounts.id.prompt();
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
