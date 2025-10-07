import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const GoogleAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    // Handle Google OAuth callback
    const handleCallback = async () => {
      try {
        console.log('Processing Google OAuth callback...');
        
        // Get the credential from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const credential = urlParams.get('credential');
        const error = urlParams.get('error');
        
        console.log('Callback parameters:', { credential: !!credential, error });
        
        if (error) {
          console.error('Google OAuth error:', error);
          setStatus('error');
          setTimeout(() => navigate('/login?google_auth=error'), 2000);
          return;
        }
        
        if (credential) {
          console.log('Google OAuth callback received credential');
          setStatus('success');
          
          // For now, redirect to login page with success message
          // In a real implementation, you would process the credential here
          setTimeout(() => navigate('/login?google_auth=success'), 2000);
        } else {
          console.warn('No credential found in callback');
          setStatus('error');
          setTimeout(() => navigate('/login?google_auth=error'), 2000);
        }
      } catch (error) {
        console.error('Google OAuth callback error:', error);
        setStatus('error');
        setTimeout(() => navigate('/login?google_auth=error'), 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return {
          title: 'Processing Google Authentication...',
          message: 'Please wait while we complete your sign-in.',
          icon: 'animate-spin'
        };
      case 'success':
        return {
          title: 'Authentication Successful!',
          message: 'Redirecting you to the login page...',
          icon: 'text-green-600'
        };
      case 'error':
        return {
          title: 'Authentication Failed',
          message: 'Redirecting you to the login page...',
          icon: 'text-red-600'
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className={`rounded-full h-12 w-12 mx-auto mb-4 flex items-center justify-center ${
          status === 'processing' ? 'animate-spin border-b-2 border-blue-600' : statusInfo.icon
        }`}>
          {status === 'processing' ? (
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          ) : status === 'success' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {statusInfo.title}
        </h2>
        <p className="text-gray-600">
          {statusInfo.message}
        </p>
      </div>
    </div>
  );
};
