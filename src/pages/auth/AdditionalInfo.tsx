import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const AdditionalInfo: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) {
      return;
    }
    
    // Check for token in URL - if present, AuthContext will process it
    const tokenInUrl = searchParams.get('token');
    if (tokenInUrl && !user) {
      return;
    }
    
    // If no user and no token, redirect to login
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Redirect to appropriate onboarding page based on role
    // Pass user data via state so onboarding can pre-fill fields
    const userState = {
      fullName: user.fullName || '',
      email: user.email || '',
      profilePhoto: user.profilePhoto || ''
    };
    
    if (user.role === 'employer') {
      navigate('/onboarding/employer', { replace: true, state: userState });
    } else {
      navigate('/onboarding/employee', { replace: true, state: userState });
    }
  }, [user, isLoading, navigate, searchParams]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Setting up your profile...
        </h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    </div>
  );
};

