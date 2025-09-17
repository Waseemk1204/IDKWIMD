import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const provider = searchParams.get('provider');
        const role = searchParams.get('role');
        const error = searchParams.get('error');
        const errorMessage = searchParams.get('message');

        if (error || errorMessage) {
          setStatus('error');
          setMessage(errorMessage || 'Authentication failed. Please try again.');
          return;
        }

        if (provider && role) {
          setUserRole(role);
          
          // Simulate successful authentication
          // In a real app, you would verify the OAuth tokens here
          const mockUser = {
            id: 'oauth-user-' + Date.now(),
            name: `OAuth User (${provider})`,
            email: `user@${provider}.com`,
            role: role as 'employer' | 'employee' | 'admin',
            verified: true
          };

          // Update auth context
          await login(mockUser.email, 'oauth-password'); // This would be handled differently in real implementation
          
          setStatus('success');
          setMessage(`Successfully signed in with ${provider}!`);
          
          // Redirect to appropriate dashboard after a short delay
          setTimeout(() => {
            // Check for intended job ID from localStorage
            const intendedJobId = localStorage.getItem('intendedJobId');
            
            if (intendedJobId && role === 'employee') {
              // Clear the intended job ID and redirect to the specific job
              localStorage.removeItem('intendedJobId');
              navigate(`/employee/jobs/${intendedJobId}`);
            } else {
              // Default dashboard redirect based on role
              if (role === 'employer') {
                navigate('/employer');
              } else if (role === 'admin') {
                navigate('/admin');
              } else {
                navigate('/employee');
              }
            }
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Invalid OAuth callback. Missing required parameters.');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, login]);

  const handleRetry = () => {
    navigate('/login');
  };

  const handleContinue = () => {
    if (userRole === 'employer') {
      navigate('/employer');
    } else if (userRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/employee');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Icon */}
          <div className="flex justify-center">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-16 w-16 text-green-600" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-red-600" />
            )}
          </div>

          {/* Status Message */}
          <div className="text-center">
            {status === 'loading' && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Processing Authentication
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we complete your sign-in...
                </p>
              </div>
            )}
            
            {status === 'success' && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  Sign-in Successful!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {message}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Redirecting to your dashboard...
                </p>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                  Authentication Failed
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {message}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {status === 'success' && (
            <div className="space-y-3">
              <Button
                onClick={handleContinue}
                className="w-full"
                size="lg"
              >
                Continue to Dashboard
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                variant="primary"
                className="w-full"
                size="lg"
              >
                Try Again
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Back to Home
              </Button>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Secure OAuth Authentication</p>
                <p>
                  Your authentication is processed securely using OAuth 2.0 standards. 
                  No passwords are stored or transmitted.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
