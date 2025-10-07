import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const GoogleAuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle Google OAuth callback
    const handleCallback = () => {
      try {
        // Get the credential from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const credential = urlParams.get('credential');
        
        if (credential) {
          // Process the credential (this would normally be handled by the backend)
          console.log('Google OAuth callback received credential');
          
          // For now, redirect to login page with a success message
          navigate('/login?google_auth=success');
        } else {
          // No credential found, redirect to login with error
          navigate('/login?google_auth=error');
        }
      } catch (error) {
        console.error('Google OAuth callback error:', error);
        navigate('/login?google_auth=error');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Processing Google Authentication...
        </h2>
        <p className="text-gray-600">
          Please wait while we complete your sign-in.
        </p>
      </div>
    </div>
  );
};
