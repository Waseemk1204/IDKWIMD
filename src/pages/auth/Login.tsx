import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import { LinkedInAuthButton } from '../../components/auth/LinkedInAuthButton';
import { googleAuthService } from '../../services/googleAuth';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, loginWithGoogle, loginWithLinkedIn, handleTokenFromUrl, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user) {
      console.log('User is authenticated, redirecting to dashboard:', user.role);
      if (user.role === 'employer') {
        navigate('/employer');
      } else if (user.role === 'employee') {
        navigate('/employee');
      } else if (user.role === 'admin') {
        navigate('/admin');
      }
    }
  }, [user, navigate]);

  // Handle Google OAuth callback
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get('token');
      const googleAuth = urlParams.get('google_auth');
      const error = urlParams.get('error');

      // Handle token from backend redirect
      if (token && googleAuth === 'success') {
        console.log('Processing Google OAuth callback - token received from backend');
        setIsLoading(true);
        setError('');

        try {
          // Use handleTokenFromUrl to process the token
          const user = await handleTokenFromUrl(token);

          if (user) {
            console.log('Google login successful:', user);

            // Clean up URL parameters
            window.history.replaceState({}, document.title, '/login');

            // Check if user is NEW (just created via Google OAuth)
            // New users created within the last 60 seconds should go through onboarding
            const accountAge = user.createdAt ? Date.now() - new Date(user.createdAt).getTime() : Infinity;
            const isNewAccount = accountAge < 60000; // Less than 60 seconds old

            console.log('Account age (ms):', accountAge, 'Is new?', isNewAccount);

            // NEW users should go through onboarding
            if (isNewAccount) {
              console.log('🎉 New Google user - redirecting to onboarding');
              const onboardingPath = user.role === 'employer' ? '/onboarding/employer' : '/onboarding/employee';
              navigate(onboardingPath);
              return;
            }

            // EXISTING users go to their dashboard
            const intendedJobId = localStorage.getItem('intendedJobId');

            if (intendedJobId) {
              localStorage.removeItem('intendedJobId');
              navigate(`/employee/jobs/${intendedJobId}`);
            } else {
              if (user?.role === 'employer') {
                navigate('/employer');
              } else if (user?.role === 'employee') {
                navigate('/employee');
              } else if (user?.role === 'admin') {
                navigate('/admin');
              } else {
                navigate('/employee');
              }
            }
          } else {
            throw new Error('Login failed');
          }
        } catch (loginError) {
          console.error('Google login error:', loginError);
          setError('Google authentication failed. Please try again.');
          // Clean up URL parameters
          window.history.replaceState({}, document.title, '/login');
        } finally {
          setIsLoading(false);
        }
      } else if (error) {
        // Best practice: Differentiate error messages by OAuth provider
        const errorType = error.toString();
        const isLinkedInError = errorType.includes('linkedin') || urlParams.get('linkedin_auth') === 'failed';
        const providerName = isLinkedInError ? 'LinkedIn' : 'Google';

        console.log(`${providerName} OAuth error:`, error);
        const message = urlParams.get('message');
        if (message) {
          setError(`${providerName} authentication failed: ${message}`);
        } else {
          setError(`${providerName} authentication failed. Please try again.`);
        }
        // Clean up URL parameters
        window.history.replaceState({}, document.title, '/login');
      }
    };

    handleGoogleCallback();
  }, [location, handleTokenFromUrl, navigate]);

  // LinkedIn OAuth is handled automatically by AuthContext
  // No need to do anything here - just let AuthContext process the token from URL

  const handleGoogleSuccess = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('Initiating Google OAuth login');

      // Get the Google user data from the service with login mode
      const result = await googleAuthService.signIn('login');

      if (result.success) {
        // In redirect mode, the user will be redirected to Google
        // The actual login will happen after Google redirects back
        console.log('Google OAuth redirect initiated successfully');
        // Don't try to login here as we're in redirect mode
        return;
      } else {
        setError(result.error || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      setError(error instanceof Error ? error.message : 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error: string) => {
    setError(error);
  };

  const handleLinkedInSuccess = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('Initiating LinkedIn OAuth login');
      // LinkedIn auth redirect handled by linkedinAuthService
      // The actual login will happen after LinkedIn redirects back
      console.log('LinkedIn OAuth redirect initiated successfully');
      // Don't try to login here as we're in redirect mode
      return;
    } catch (error) {
      console.error('LinkedIn OAuth error:', error);
      setError(error instanceof Error ? error.message : 'LinkedIn authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInError = (error: string) => {
    setError(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      const params = new URLSearchParams(location.search);
      const intent = params.get('intent');

      // Check for intended job ID from localStorage
      const intendedJobId = localStorage.getItem('intendedJobId');

      if (intendedJobId) {
        // Clear the intended job ID and redirect to the specific job
        localStorage.removeItem('intendedJobId');
        navigate(`/employee/jobs/${intendedJobId}`);
      } else {
        // Always redirect to dashboard based on user role or intent
        if (intent === 'employer' || user?.role === 'employer') {
          navigate('/employer');
        } else if (intent === 'employee' || user?.role === 'employee') {
          navigate('/employee');
        } else if (user?.role === 'admin') {
          navigate('/admin');
        } else {
          // Default to employee dashboard if no specific role
          navigate('/employee');
        }
      }
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl font-bold text-primary-500">PART-TIME PAY$</h1>
          </Link>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to access your account
          </p>
        </div>

        <Card variant="elevated" className="animate-fade-in">
          <CardContent className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-700 rounded-lg">
                <p className="text-sm text-error-700 dark:text-error-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input-professional pl-10"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="input-professional pl-10 pr-10"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isFullWidth
                isLoading={isLoading}
                loadingText="Signing in..."
              >
                Sign In
              </Button>
            </form>

            {/* Social Sign-In Options */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <GoogleAuthButton
                  text="Continue with Google"
                  className="w-full"
                  mode="login"
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
                <LinkedInAuthButton
                  text="Continue with LinkedIn"
                  className="w-full"
                  mode="login"
                  onSuccess={handleLinkedInSuccess}
                  onError={handleLinkedInError}
                />
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};