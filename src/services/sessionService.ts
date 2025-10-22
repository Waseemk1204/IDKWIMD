// Enhanced Session Management Service
// Handles both httpOnly cookies (preferred) and localStorage fallback

interface SessionData {
  token: string;
  refreshToken?: string;
  expiresAt: number;
  user?: any;
}

class SessionService {
  private static instance: SessionService;
  private sessionData: SessionData | null = null;
  private refreshPromise: Promise<string> | null = null;

  private constructor() {
    this.loadSessionFromStorage();
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  // Load session data from localStorage (fallback)
  private loadSessionFromStorage(): void {
    try {
      const stored = localStorage.getItem('session');
      console.log('SessionService - Loading session from storage:', !!stored);
      if (stored) {
        const sessionData = JSON.parse(stored);
        console.log('SessionService - Parsed session data:', { 
          hasToken: !!sessionData.token, 
          expiresAt: sessionData.expiresAt,
          isExpired: sessionData.expiresAt <= Date.now()
        });
        // Check if session is still valid
        if (sessionData.expiresAt && sessionData.expiresAt > Date.now()) {
          this.sessionData = sessionData;
          console.log('SessionService - Session loaded successfully');
        } else {
          // Session expired, clear it
          console.log('SessionService - Session expired, clearing');
          this.clearSession();
        }
      } else {
        console.log('SessionService - No session found in storage');
      }
    } catch (error) {
      console.error('SessionService - Failed to load session from storage:', error);
      this.clearSession();
    }
  }

  // Save session data to localStorage (fallback)
  private saveSessionToStorage(sessionData: SessionData): void {
    try {
      localStorage.setItem('session', JSON.stringify(sessionData));
    } catch (error) {
      console.error('Failed to save session to storage:', error);
    }
  }

  // Set session data
  public setSession(token: string, refreshToken?: string, expiresIn: number = 3600): void {
    console.log('SessionService - setSession called with:', {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      expiresIn
    });
    
    const expiresAt = Date.now() + (expiresIn * 1000);
    this.sessionData = {
      token,
      refreshToken,
      expiresAt,
    };

    console.log('SessionService - Session data created:', {
      hasToken: !!this.sessionData.token,
      hasRefreshToken: !!this.sessionData.refreshToken,
      expiresAt: this.sessionData.expiresAt
    });

    // Save to localStorage as fallback
    this.saveSessionToStorage(this.sessionData);
    
    console.log('SessionService - Session saved to storage');
  }

  // Get current token
  public getToken(): string | null {
    console.log('SessionService - getToken called, sessionData:', !!this.sessionData);
    if (!this.sessionData) {
      console.log('SessionService - No session data available');
      return null;
    }

    // Check if token is expired
    if (this.sessionData.expiresAt <= Date.now()) {
      console.log('SessionService - Token expired, attempting refresh');
      // Try to refresh if we have a refresh token
      if (this.sessionData.refreshToken) {
        this.refreshToken();
        return this.sessionData?.token || null;
      } else {
        console.log('SessionService - No refresh token, clearing session');
        this.clearSession();
        return null;
      }
    }

    console.log('SessionService - Returning valid token');
    return this.sessionData.token;
  }

  // Get refresh token
  public getRefreshToken(): string | null {
    return this.sessionData?.refreshToken || null;
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // Clear session data
  public clearSession(): void {
    this.sessionData = null;
    localStorage.removeItem('session');
    localStorage.removeItem('token'); // Clear old token format
  }

  // Refresh token
  public async refreshToken(): Promise<string> {
    if (!this.sessionData?.refreshToken) {
      this.clearSession();
      throw new Error('No refresh token available');
    }

    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      if (!newToken) {
        throw new Error('Token refresh failed');
      }
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  // Perform the actual token refresh
  private async performTokenRefresh(): Promise<string> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include httpOnly cookies
        body: JSON.stringify({
          refreshToken: this.sessionData?.refreshToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.token) {
          // Update session with new token
          this.setSession(
            data.data.token,
            data.data.refreshToken || this.sessionData?.refreshToken,
            data.data.expiresIn || 3600
          );
          return data.data.token;
        }
      }

      // Refresh failed, clear session
      this.clearSession();
      throw new Error('Token refresh failed');
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearSession();
      throw new Error('Token refresh failed');
    }
  }

  // Check if session is about to expire (within 5 minutes)
  public isSessionExpiringSoon(): boolean {
    if (!this.sessionData) return false;
    const fiveMinutes = 5 * 60 * 1000;
    return this.sessionData.expiresAt - Date.now() < fiveMinutes;
  }

  // Get session expiry time
  public getSessionExpiryTime(): number | null {
    return this.sessionData?.expiresAt || null;
  }

  // Update user data in session
  public updateUserData(userData: any): void {
    if (this.sessionData) {
      this.sessionData.user = userData;
      this.saveSessionToStorage(this.sessionData);
    }
  }

  // Get user data from session
  public getUserData(): any {
    return this.sessionData?.user || null;
  }
}

// Export singleton instance
export const sessionService = SessionService.getInstance();
export default sessionService;
