import React, { useEffect, useState, createContext, useContext } from 'react';
import apiService from '../services/api';
import sessionService from '../services/sessionService';
import { GoogleUserInfo } from '../services/googleAuth';
import { LinkedInUserInfo } from '../services/linkedinAuth';
import logger from '../utils/logger';

type UserRole = 'employer' | 'employee' | 'admin' | null;

type User = {
  _id: string;
  fullName: string;
  displayName?: string;
  username: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  profilePhoto?: string;
  phone?: string;
  location?: string;
  headline?: string;
  about?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    portfolio?: string;
  };
  skills: string[];
  experiences: Array<{
    company: string;
    title: string;
    from: Date;
    to?: Date;
    description?: string;
    current: boolean;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    from: Date;
    to?: Date;
    gpa?: string;
    description?: string;
  }>;
  companyInfo?: {
    companyName: string;
    companySize: string;
    industry: string;
    website: string;
    description: string;
    foundedYear?: number;
    headquarters?: string;
  };
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
} | null;

type AuthContextType = {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, role: UserRole) => Promise<void>;
  loginWithGoogle: (googleUser: GoogleUserInfo) => Promise<User>;
  loginWithLinkedIn: (linkedinUser: LinkedInUserInfo) => Promise<User>;
  handleTokenFromUrl: (token: string) => Promise<User>;
  logout: () => void;
  completeOnboarding: (userData: Partial<User>) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => null,
  signup: async () => {},
  loginWithGoogle: async () => null,
  loginWithLinkedIn: async () => null,
  handleTokenFromUrl: async () => null,
  logout: () => {},
  completeOnboarding: async () => {},
  updateProfile: async () => {}
});

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for token in URL first (Google OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    logger.debug('AuthContext - URL check', {
      currentUrl: window.location.href,
      searchParams: window.location.search,
      hasToken: !!tokenFromUrl
    });
    
    if (tokenFromUrl) {
      logger.info('AuthContext - Token found in URL, processing authentication');
      handleTokenFromUrl(tokenFromUrl)
        .then(() => {
          // Remove token from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((error) => {
          logger.error('AuthContext - Token authentication failed', error);
          clearAuth();
        })
        .finally(() => {
          setIsLoading(false);
        });
      return; // Don't proceed with normal auth check
    }
    
    // Normal authentication check using sessionService
    const savedUser = localStorage.getItem('user');
    const hasValidSession = sessionService.isAuthenticated();
    
    logger.debug('AuthContext - Checking authentication', { hasValidSession, hasSavedUser: !!savedUser });
    
    // Only try to get current user if we have a valid session
    if (hasValidSession) {
      apiService.getCurrentUser()
        .then(response => {
          logger.debug('AuthContext - getCurrentUser response', { success: response.success });
          if (response.success && response.data?.user) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          } else if (savedUser) {
            // Fallback to localStorage if session auth fails but we have a valid session
            try {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
            } catch (error) {
              logger.error('AuthContext - Failed to parse saved user', error);
              clearAuth();
            }
          } else {
            // No valid authentication found
            logger.debug('AuthContext - No valid authentication found');
            clearAuth();
          }
        })
        .catch((error) => {
          logger.error('AuthContext - getCurrentUser failed', error);
          // If API call fails, try localStorage fallback
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
            } catch (parseError) {
              logger.error('AuthContext - Failed to parse saved user on fallback', parseError);
              clearAuth();
            }
          } else {
            clearAuth();
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // No valid session, check localStorage for saved user
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (error) {
          logger.error('AuthContext - Failed to parse saved user', error);
          clearAuth();
        }
      } else {
        clearAuth();
      }
      setIsLoading(false);
    }
  }, []);

  const clearAuth = () => {
    logger.debug('AuthContext - Clearing authentication');
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Keep for backward compatibility
    sessionService.clearSession();
  };

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await apiService.login(email, password);
      
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        const token = response.data.token;
        const refreshToken = response.data.refreshToken;
        const expiresIn = response.data.expiresIn || 3600;
        
        logger.info('AuthContext - Login successful');
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Use session service for proper token management
        sessionService.setSession(token, refreshToken, expiresIn);
        
        setIsLoading(false);
        return userData;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signup = async (email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      // Generate a unique username by adding random suffix
      const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const uniqueUsername = `${baseUsername}_${randomSuffix}`;
      
      const response = await apiService.register({
        fullName: email.split('@')[0], // Default name from email
        username: uniqueUsername, // Generate unique username with random suffix
        email,
        password,
        role: role || 'employee'
      });
      
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        const token = response.data.token;
        const refreshToken = response.data.refreshToken;
        const expiresIn = response.data.expiresIn || 3600;
        
        logger.info('AuthContext - Signup successful');
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Use session service for proper token management
        sessionService.setSession(token, refreshToken, expiresIn);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      logger.error('Signup error in AuthContext', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (googleUser: GoogleUserInfo): Promise<User> => {
    setIsLoading(true);
    try {
      logger.debug('AuthContext - loginWithGoogle called', { email: googleUser.email });
      
      const response = await apiService.loginWithGoogle({
        googleId: googleUser.id,
        email: googleUser.email,
        fullName: googleUser.name,
        profilePhoto: googleUser.picture,
        givenName: googleUser.given_name,
        familyName: googleUser.family_name
      });
      
      logger.debug('AuthContext - Google API response', { success: response.success });
      
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        const token = response.data.token;
        const refreshToken = response.data.refreshToken;
        const expiresIn = response.data.expiresIn || 3600;
        
        logger.info('AuthContext - Google login successful');
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Use session service for proper token management
        sessionService.setSession(token, refreshToken, expiresIn);
        
        setIsLoading(false);
        return userData;
      } else {
        throw new Error(response.message || 'Google login failed');
      }
    } catch (error) {
      setIsLoading(false);
      logger.error('Google login error', error);
      throw error;
    }
  };

  const loginWithLinkedIn = async (linkedinUser: LinkedInUserInfo): Promise<User> => {
    setIsLoading(true);
    try {
      logger.debug('AuthContext - loginWithLinkedIn called', { email: linkedinUser.email });
      
      const response = await apiService.loginWithLinkedIn({
        linkedInId: linkedinUser.id,
        email: linkedinUser.email,
        fullName: linkedinUser.name,
        profilePhoto: linkedinUser.picture,
        headline: linkedinUser.headline,
        location: linkedinUser.location
      });
      
      logger.debug('AuthContext - LinkedIn API response', { success: response.success });
      
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        const token = response.data.token;
        const refreshToken = response.data.refreshToken;
        const expiresIn = response.data.expiresIn || 3600;
        
        logger.info('AuthContext - LinkedIn login successful');
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Use session service for proper token management
        sessionService.setSession(token, refreshToken, expiresIn);
        
        setIsLoading(false);
        return userData;
      } else {
        throw new Error(response.message || 'LinkedIn login failed');
      }
    } catch (error) {
      setIsLoading(false);
      logger.error('LinkedIn login error', error);
      throw error;
    }
  };

  const handleTokenFromUrl = async (token: string): Promise<User> => {
    setIsLoading(true);
    try {
      logger.debug('AuthContext - Processing token from URL');
      
      // Use sessionService for proper token management
      // Set token with default 1 hour expiry (backend doesn't send refresh token in URL)
      sessionService.setSession(token, undefined, 3600);
      
      // Get user data using the token
      const response = await apiService.getCurrentUser();
      
      logger.debug('AuthContext - getCurrentUser response', { success: response.success });
      
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsLoading(false);
        return userData;
      } else {
        throw new Error('Failed to get user data with token');
      }
    } catch (error) {
      logger.error('AuthContext - handleTokenFromUrl error', error);
      // Clear invalid token
      sessionService.clearSession();
      localStorage.removeItem('user');
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      logger.error('Logout error', error);
    } finally {
      clearAuth();
      sessionService.clearSession();
      // Redirect to homepage after logout
      window.location.href = '/';
    }
  };

  const completeOnboarding = async (userData: Partial<User>): Promise<void> => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.updateProfile(userData);
      
      if (response.success && response.data?.user) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.updateProfile(userData);
      
      if (response.success && response.data?.user) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        loginWithLinkedIn,
        handleTokenFromUrl,
        logout,
        completeOnboarding,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};