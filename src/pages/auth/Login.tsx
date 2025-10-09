import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { VerifiedBadge, SecureBadge } from '../../components/ui/TrustBadge';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import { googleAuthService } from '../../services/googleAuth';
import { Eye, EyeOff, Mail, Lock, Shield, CheckCircle, Users, Briefcase } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle Google OAuth callback
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const urlParams = new URLSearchParams(location.search);
      const credential = urlParams.get('credential');
      const error = urlParams.get('error');
      
      if (credential) {
        console.log('Processing Google OAuth callback on login page');
        setIsLoading(true);
        setError('');
        
        try {
          // Decode the JWT token to get user info
          const payload = JSON.parse(atob(credential.split('.')[1]));
          console.log('Decoded JWT payload:', payload);
          
          const googleUser = {
            googleId: payload.sub,
            email: payload.email,
            fullName: payload.name,
            profilePhoto: payload.picture,
            givenName: payload.given_name,
            familyName: payload.family_name
          };
          
          console.log('Google user data:', googleUser);
          
          // Login with Google user data
          const user = await loginWithGoogle(googleUser);
          
          if (user) {
            console.log('Google login successful:', user);
            
            // Redirect based on user role or intent
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
                navigate('/employee'); // Default to employee dashboard
              }
            }
          } else {
            throw new Error('Login failed');
          }
        } catch (loginError) {
          console.error('Google login error:', loginError);
          setError('Google authentication failed. Please try again.');
        } finally {
          setIsLoading(false);
        }
      } else if (error) {
        console.error('Google OAuth error:', error);
        const message = urlParams.get('message');
        if (error === 'user_not_found' && message) {
          setError(message);
        } else {
          setError('Google authentication failed. Please try again.');
        }
      }
    };

    handleGoogleCallback();
  }, [location, loginWithGoogle, navigate]);

  const handleGoogleSuccess = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Get the Google user data from the service
      const result = await googleAuthService.signIn();
      
      if (result.success && result.user) {
        // Login with Google user data
        const user = await loginWithGoogle(result.user);
        
        // Redirect based on user role or intent
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

  const trustFeatures = [
    { icon: Shield, text: 'Bank-level security' },
    { icon: CheckCircle, text: 'Verified employers' },
    { icon: Users, text: '50,000+ students' },
  ];

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left side - Branding and trust elements */}
          <div className="hidden lg:block space-y-8 animate-fade-in-left">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-4">
                Welcome Back
              </h1>
              <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
                Connect with verified part-time opportunities or find reliable student talent.
              </p>
            </div>

            {/* Trust indicators */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <VerifiedBadge size="lg" />
                <SecureBadge size="lg" />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {trustFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm">
                    <feature.icon className="h-5 w-5 text-primary-600" />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">50K+</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-600">25K+</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-trust-600">4.8★</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Rating</div>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="animate-fade-in-right">
            <Card variant="elevated" size="lg" className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <CardTitle size="xl">Sign In</CardTitle>
                <CardDescription>
                  Access your account to continue your journey
                </CardDescription>
              </CardHeader>

              <CardContent>
                {error && (
                  <div className="mb-6 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
                    <p className="text-sm text-error-700 dark:text-error-300">{error}</p>
                    {error.includes('Account not found') && (
                      <div className="mt-3">
                        <Link 
                          to="/signup" 
                          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Create a new account
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-neutral-400" />
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
                      <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-neutral-400" />
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
                            <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300">
                        Remember me
                      </label>
                    </div>

                    <button
                      type="button"
                      className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    isFullWidth
                    isLoading={isLoading}
                    loadingText="Signing in..."
                    trustIndicator
                  >
                    Sign In
                  </Button>
                </form>

                {/* Social Sign-In Options */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-300 dark:border-neutral-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <GoogleAuthButton 
                      text="Continue with Google"
                      className="w-full"
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                    />
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Don't have an account?{' '}
                    <Link 
                      to="/signup" 
                      className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      Sign up for free
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};