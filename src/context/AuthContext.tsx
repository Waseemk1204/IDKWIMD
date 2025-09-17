import React, { useEffect, useState, createContext } from 'react';
import apiService from '../services/api';

type UserRole = 'employer' | 'employee' | 'admin' | null;

type User = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  profileImage?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
} | null;

type AuthContextType = {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, role: UserRole) => Promise<void>;
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
        name: email.split('@')[0], // Default name from email
        email,
        password,
        role: role || 'employee'
      });
      
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
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
        logout,
        completeOnboarding,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};