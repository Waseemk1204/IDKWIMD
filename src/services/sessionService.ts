// Enhanced Session Management Service
// Handles both httpOnly cookies (preferred) and localStorage fallback
import logger from '../utils/logger';

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
      logger.debug('SessionService - Loading session from storage', { hasStored: !!stored });
      if (stored) {
        const sessionData = JSON.parse(stored);
        logger.debug('SessionService - Parsed session data', {
          hasToken: !!sessionData.token,
          isExpired: sessionData.expiresAt <= Date.now()
        });
        // Check if session is still valid
        if (sessionData.expiresAt && sessionData.expiresAt > Date.now()) {
          this.sessionData = sessionData;
          logger.info('SessionService - Session loaded successfully');
        } else {
          // Session expired, clear it
          logger.debug('SessionService - Session expired, clearing');
          this.clearSession();
        }
      } else {
        logger.debug('SessionService - No session found in storage');
      }
    } catch (error) {
      logger.error('SessionService - Failed to load session from storage', error);
      this.clearSession();
    }
  }

  // Save session data to localStorage (fallback)
  private saveSessionToStorage(sessionData: SessionData): void {
    try {
      localStorage.setItem('session', JSON.stringify(sessionData));
    } catch (error) {
      logger.error('Failed to save session to storage', error);
    }
  }

  // Set session data
  public setSession(token: string, refreshToken?: string, expiresIn: number = 3600): void {
    logger.debug('SessionService - setSession called', {
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

    // Save to localStorage as fallback
    this.saveSessionToStorage(this.sessionData);

    logger.info('SessionService - Session saved successfully');
  }

  // Get current token
  // Note: Does not attempt to refresh - let API interceptor handle 401 errors
  public getToken(): string | null {
    logger.debug('SessionService - getToken called', { hasSession: !!this.sessionData });
    if (!this.sessionData) {
      return null;
    }

    // Return token even if expired - API interceptor will catch 401 and refresh
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
    logger.info('SessionService - Token refresh requested');

    if (!this.sessionData?.refreshToken) {
      logger.warn('SessionService - No refresh token available, clearing session');
      this.clearSession();
      throw new Error('No refresh token available');
    }

    // Prevent multiple simultaneous refresh attempts (debounce)
    if (this.refreshPromise) {
      logger.debug('SessionService - Refresh already in progress, returning existing promise');
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      if (!newToken) {
        logger.error('SessionService - Token refresh returned no token');
        throw new Error('Token refresh failed - no token returned');
      }
      logger.info('SessionService - Token refresh successful');
      return newToken;
    } catch (error) {
      logger.error('SessionService - Token refresh failed', error);
      throw error;
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
      logger.error('Token refresh failed', error);
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
