import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import { LinkedInAuthButton } from '../../components/auth/LinkedInAuthButton';
import { SignupSuccessAnimation } from '../../components/ui/SignupSuccessAnimation';
import { googleAuthService } from '../../services/googleAuth';
import { useValidation, schemas } from '../../utils/validation';
import { 
  Mail, 
  Lock, 
  Building2,
  GraduationCap
} from 'lucide-react';

export const Signup: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // Read role from URL parameters, default to 'employee' if not specified
  const urlRole = searchParams.get('role') as 'employer' | 'employee' | null;
  const initialRole = urlRole && ['employer', 'employee'].includes(urlRole) ? urlRole : 'employee';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'employer' | 'employee'>(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [userName, setUserName] = useState('');
  
  const { signup, loginWithGoogle, loginWithLinkedIn } = useAuth();
  const navigate = useNavigate();

  // Enhanced validation
  const {
    // TODO: Implement validation using errors and handleFieldChange
  } = useValidation(schemas.userRegistration);

  const handleGoogleSuccess = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Get the Google user data from the service with signup mode and role
      const result = await googleAuthService.signIn('signup', role);
      
      if (result.success && result.user) {
        // Login with Google user data
        await loginWithGoogle(result.user);
        
        // Extract name for personalization
        const name = result.user.name || result.user.email?.split('@')[0] || 'there';
        setUserName(name);
        
        // Show success animation
        setShowSuccessAnimation(true);
      } else {
        setError(result.error || 'Google authentication failed');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      setError(error instanceof Error ? error.message : 'Google authentication failed');
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
      console.log('Initiating LinkedIn OAuth signup');
      // LinkedIn auth redirect handled by linkedinAuthService
      // The actual signup will happen after LinkedIn redirects back
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

  // Handle OAuth callbacks (Google and LinkedIn)
  useEffect(() => {
    const googleAuth = searchParams.get('google_auth');
    const linkedinAuth = searchParams.get('linkedin_auth');
    const newUser = searchParams.get('new_user');
    const showAnimation = searchParams.get('show_animation');
    const token = searchParams.get('token');
    const profileData = searchParams.get('profile_data');
    const authRole = searchParams.get('role');
    
    // Handle Google OAuth callback for new users
    if (googleAuth === 'success' && newUser === 'true' && token) {
      const storedRole = localStorage.getItem('signup_role') || 'employee';
      setRole(storedRole as 'employee' | 'employer');
      
      // Set loading and show animation
      setIsLoading(true);
      setShowSuccessAnimation(true);
      
      // User name will be set by AuthContext when it processes the token
      // For now, use a placeholder
      setUserName('there');
    }
    
    // Handle LinkedIn OAuth callback with animation for new users
    if (linkedinAuth === 'success' && showAnimation === 'true' && token && authRole) {
      console.log('LinkedIn signup - showing animation and redirecting to onboarding');
      
      setRole(authRole as 'employee' | 'employer');
      setIsLoading(true);
      setShowSuccessAnimation(true);
      
      // Get user's name from the token (it will be set by AuthContext)
      // Use a placeholder for now
      setUserName('there');
      
      // Redirect to onboarding after animation (2 seconds)
      setTimeout(() => {
        navigate(`/onboarding/${authRole}`);
      }, 2000);
    }
    
    // Handle LinkedIn OAuth callback for new users (legacy)
    if (linkedinAuth === 'new_user' && profileData && authRole) {
      try {
        // Decode profile data
        const decodedProfile = JSON.parse(atob(profileData));
        console.log('LinkedIn signup - decoded profile:', decodedProfile);
        
        setRole(authRole as 'employee' | 'employer');
        
        // Pre-fill form with LinkedIn data
        if (decodedProfile.email) {
          setEmail(decodedProfile.email);
        }
        
        // Store full name for later use
        if (decodedProfile.fullName) {
          localStorage.setItem('linkedin_fullName', decodedProfile.fullName);
          setUserName(decodedProfile.fullName);
        }
        
        // Set success state
        setShowSuccessAnimation(true);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Failed to parse LinkedIn profile data:', error);
        setError('Failed to process LinkedIn profile data. Please try manual signup.');
      }
    }
  }, [searchParams, navigate]);
  
  // Update role if URL parameters change
  useEffect(() => {
    const urlRole = searchParams.get('role') as 'employer' | 'employee' | null;
    if (urlRole && ['employer', 'employee'].includes(urlRole)) {
      setRole(urlRole);
    }
  }, [searchParams]);

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setError('');
    setIsLoading(true);
    
    // Basic validation
    if (!email || !password || !role) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }
    
    try {
      await signup(email, password, role);
      
      // Extract name from email for personalization
      const nameFromEmail = email.split('@')[0];
      setUserName(nameFromEmail);
      
      // Show success animation
      setShowSuccessAnimation(true);
    } catch (err) {
      setError('Failed to create an account. Please try again.');
      setIsLoading(false);
    }
  };

  const handleAnimationComplete = () => {
    setShowSuccessAnimation(false);
    setIsLoading(false);
    navigate('/additional-info');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Success Animation */}
      {showSuccessAnimation && (
        <SignupSuccessAnimation
          userName={userName}
          userRole={role}
          onComplete={handleAnimationComplete}
          isVisible={showSuccessAnimation}
        />
      )}
      
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl font-bold text-primary-500">PART-TIME PAY$</h1>
          </Link>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-white">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join thousands of students and employers
          </p>
        </div>

        <Card variant="elevated" className="animate-fade-in">
          <CardContent className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-700 rounded-lg">
                <p className="text-sm text-error-700 dark:text-error-400">{error}</p>
              </div>
            )}

            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('employee')}
                  className={`p-4 rounded-lg border-2 transition-colors duration-150 ${
                    role === 'employee'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <GraduationCap className={`h-6 w-6 mx-auto mb-2 ${
                    role === 'employee' 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    role === 'employee'
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    Student
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={`p-4 rounded-lg border-2 transition-colors duration-150 ${
                    role === 'employer'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <Building2 className={`h-6 w-6 mx-auto mb-2 ${
                    role === 'employer' 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    role === 'employer'
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    Employer
                  </p>
                </button>
              </div>
            </div>

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
                    type="password" 
                    autoComplete="new-password" 
                    required 
                    className="input-professional pl-10"
                    placeholder="Create a strong password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Must be at least 6 characters
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isFullWidth
                isLoading={isLoading}
                loadingText="Creating account..."
              >
                Create {role === 'employee' ? 'Student' : 'Employer'} Account
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
                  mode="signup"
                  role={role}
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
                <LinkedInAuthButton 
                  text="Continue with LinkedIn"
                  className="w-full"
                  mode="signup"
                  role={role}
                  onSuccess={handleLinkedInSuccess}
                  onError={handleLinkedInError}
                />
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link 
                  to={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
              By creating an account, you agree to our{' '}
              <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Terms of Service</button>
              {' '}and{' '}
              <Link to="/privacy-policy" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Privacy Policy</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
