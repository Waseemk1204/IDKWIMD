import React, { useEffect, useState, createContext, useContext } from 'react';
import apiService from '../services/api';
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
    // Check for saved user and token
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Verify token is still valid by fetching current user
        apiService.getCurrentUser()
          .then(response => {
            if (response.success && response.data?.user) {
              setUser(response.data.user);
              localStorage.setItem('user', JSON.stringify(response.data.user));
            } else {
              // Token is invalid, clear everything
              clearAuth();
            }
          })
          .catch(() => {
            // Token is invalid, clear everything
            clearAuth();
          });
      } catch (error) {
        clearAuth();
      }
    }
    
    setIsLoading(false);
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
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (googleUser: GoogleUserInfo): Promise<User> => {
    setIsLoading(true);
    try {
      // For now, handle Google login locally until backend is deployed
      console.log('Processing Google login locally:', googleUser);
      
      // Create a mock user object based on Google user data
      const mockUser: User = {
        _id: `google_${googleUser.googleId}`,
        fullName: googleUser.fullName,
        displayName: googleUser.fullName,
        username: googleUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, ''),
        email: googleUser.email,
        role: 'employee', // Default role for Google users
        isVerified: true, // Google users are considered verified
        verificationStatus: 'verified',
        profilePhoto: googleUser.profilePhoto,
        phone: '',
        location: '',
        headline: '',
        about: '',
        website: '',
        socialLinks: {
          linkedin: '',
          twitter: '',
          github: '',
          portfolio: ''
        },
        skills: [],
        experiences: [],
        education: [],
        companyInfo: undefined,
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Generate a mock token
      const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Set the user and token
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockToken);
      apiService.setToken(mockToken);
      
      setIsLoading(false);
      console.log('Google login successful:', mockUser);
      return mockUser;
      
    } catch (error) {
      setIsLoading(false);
      console.error('Google login error:', error);
      throw new Error('Google login failed');
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
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