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
      if (stored) {
        const sessionData = JSON.parse(stored);
        // Check if session is still valid
        if (sessionData.expiresAt && sessionData.expiresAt > Date.now()) {
          this.sessionData = sessionData;
        } else {
          // Session expired, clear it
          this.clearSession();
        }
      }
    } catch (error) {
      console.error('Failed to load session from storage:', error);
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
    const expiresAt = Date.now() + (expiresIn * 1000);
    this.sessionData = {
      token,
      refreshToken,
      expiresAt,
    };

    // Save to localStorage as fallback
    this.saveSessionToStorage(this.sessionData);
  }

  // Get current token
  public getToken(): string | null {
    if (!this.sessionData) {
      return null;
    }

    // Check if token is expired
    if (this.sessionData.expiresAt <= Date.now()) {
      // Try to refresh if we have a refresh token
      if (this.sessionData.refreshToken) {
        this.refreshToken();
        return this.sessionData?.token || null;
      } else {
        this.clearSession();
        return null;
      }
    }

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
  public async refreshToken(): Promise<string | null> {
    if (!this.sessionData?.refreshToken) {
      this.clearSession();
      return null;
    }

    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  // Perform the actual token refresh
  private async performTokenRefresh(): Promise<string | null> {
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
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearSession();
      return null;
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
