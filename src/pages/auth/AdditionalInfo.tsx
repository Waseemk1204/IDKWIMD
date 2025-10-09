import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const AdditionalInfo: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    console.log('AdditionalInfo page loaded');
    console.log('User:', user);
    console.log('User role:', user?.role);
    
    // If no user, redirect to login
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }
    
    // Redirect to appropriate onboarding page based on role
    if (user.role === 'employer') {
      console.log('Redirecting to employer onboarding');
      navigate('/onboarding/employer', { replace: true });
    } else {
      console.log('Redirecting to employee onboarding');
      navigate('/onboarding/employee', { replace: true });
    }
  }, [user, navigate]);
  
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

