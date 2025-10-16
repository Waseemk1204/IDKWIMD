import React, { useEffect, useState, createContext, useContext } from 'react';
import apiService from '../services/api';
import sessionService from '../services/sessionService';
import { GoogleUserInfo } from '../services/googleAuth';

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
    
    if (tokenFromUrl) {
      handleTokenFromUrl(tokenFromUrl)
        .then(() => {
          // Remove token from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((error) => {
          console.error('AuthContext - Token authentication failed:', error);
          clearAuth();
        })
        .finally(() => {
          setIsLoading(false);
        });
      return; // Don't proceed with normal auth check
    }
    
    // Normal authentication check (localStorage or cookie-based)
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    // Always try to get current user to check cookie-based auth
    apiService.getCurrentUser()
      .then(response => {
        if (response.success && response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else if (savedUser && token) {
          // Fallback to localStorage if cookie auth fails
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
          } catch (error) {
            clearAuth();
          }
        } else {
          // No valid authentication found
          clearAuth();
        }
      })
      .catch(() => {
        // If API call fails, try localStorage fallback
        if (savedUser && token) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
          } catch (error) {
            clearAuth();
          }
        } else {
          clearAuth();
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const clearAuth = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    apiService.clearToken();
  };

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await apiService.login(email, password);
      
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        const token = response.data.token;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        apiService.setToken(token);
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
      const response = await apiService.register({
        fullName: email.split('@')[0], // Default name from email
        username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, ''), // Generate username from email
        email,
        password,
        role: role || 'employee'
      });
      
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        const token = response.data.token;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        apiService.setToken(token);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Signup error in AuthContext:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (googleUser: GoogleUserInfo): Promise<User> => {
    setIsLoading(true);
    try {
      
      const response = await apiService.loginWithGoogle({
        googleId: googleUser.googleId,
        email: googleUser.email,
        fullName: googleUser.fullName,
        profilePhoto: googleUser.profilePhoto,
        givenName: googleUser.givenName,
        familyName: googleUser.familyName
      });
      
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        const token = response.data.token;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        apiService.setToken(token);
        setIsLoading(false);
        return userData;
      } else {
        throw new Error(response.message || 'Google login failed');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Google login error:', error);
      throw error;
    }
  };

  const handleTokenFromUrl = async (token: string): Promise<User> => {
    setIsLoading(true);
    try {
      // Store token in localStorage and set in API service
      localStorage.setItem('token', token);
      apiService.setToken(token);
      
      // Get user data using the token
      const response = await apiService.getCurrentUser();
      
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
      console.error('Token handling error:', error);
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
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