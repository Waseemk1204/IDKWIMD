import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { TrustBadge, VerifiedBadge, SecureBadge } from '../../components/ui/TrustBadge';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import { SignupSuccessAnimation } from '../../components/ui/SignupSuccessAnimation';
import { googleAuthService } from '../../services/googleAuth';
import { 
  Mail, 
  Lock, 
  Users, 
  Shield, 
  CheckCircle, 
  Star,
  ArrowRight,
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
  
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Get the Google user data from the service
      const result = await googleAuthService.signIn();
      
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

  // Update role if URL parameters change
  useEffect(() => {
    const urlRole = searchParams.get('role') as 'employer' | 'employee' | null;
    if (urlRole && ['employer', 'employee'].includes(urlRole)) {
      setRole(urlRole);
    }
  }, [searchParams]);

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    console.log('handleSubmit called!', e);
    console.log('Event type:', e?.type);
    console.log('Event target:', e?.target);
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setError('');
    setIsLoading(true);
    
    console.log('Signup form submitted with:', { email, password, role });
    
    try {
      await signup(email, password, role);
      
      console.log('Signup successful, showing animation');
      
      // Extract name from email for personalization
      const nameFromEmail = email.split('@')[0];
      setUserName(nameFromEmail);
      
      // Show success animation
      setShowSuccessAnimation(true);
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to create an account. Please try again.');
      setIsLoading(false);
    }
  };

  const handleAnimationComplete = () => {
    setShowSuccessAnimation(false);
    setIsLoading(false);
    
    // Navigate based on user role
    if (role === 'employer') {
      navigate('/employer');
    } else {
      navigate('/employee');
    }
  };

  const roleBenefits = {
    employee: [
      { icon: GraduationCap, text: 'Find flexible part-time work' },
      { icon: Star, text: 'Build your professional network' },
      { icon: Shield, text: 'Secure, verified opportunities' },
    ],
    employer: [
      { icon: Users, text: 'Access talented student workforce' },
      { icon: Building2, text: 'Scale your business efficiently' },
      { icon: CheckCircle, text: 'Verified, reliable candidates' },
    ],
  };

  const trustStats = [
    { value: '50K+', label: 'Students', color: 'text-primary-600' },
    { value: '25K+', label: 'Jobs Posted', color: 'text-secondary-600' },
    { value: '4.8★', label: 'Rating', color: 'text-trust-600' },
  ];

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Success Animation */}
      {showSuccessAnimation && (
        <SignupSuccessAnimation
          userName={userName}
          userRole={role}
          onComplete={handleAnimationComplete}
          isVisible={showSuccessAnimation}
        />
      )}
      
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left side - Role selection and benefits */}
          <div className="hidden lg:block space-y-8 animate-fade-in-left">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-4">
                Join the Future of Work
              </h1>
              <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
                Whether you're looking for opportunities or talent, we've got you covered.
          </p>
        </div>
        
            {/* Role selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Choose your path:
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Employee option */}
                <button
                  onClick={() => setRole('employee')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                    role === 'employee'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-medium'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 hover:shadow-soft'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      role === 'employee' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}>
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        I'm looking for work
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        Find flexible part-time opportunities that fit your schedule
                      </p>
                      <div className="flex items-center text-sm text-primary-600 font-medium">
                        <span>Get started as a student</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </button>

                {/* Employer option */}
                <button
                  onClick={() => setRole('employer')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                    role === 'employer'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-medium'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 hover:shadow-soft'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      role === 'employer' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}>
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        I want to hire talent
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        Connect with skilled students for your projects
                      </p>
                      <div className="flex items-center text-sm text-primary-600 font-medium">
                        <span>Start hiring today</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Benefits for selected role */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                What you'll get:
              </h3>
              <div className="space-y-3">
                {roleBenefits[role].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm">
                    <benefit.icon className="h-5 w-5 text-primary-600" />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {benefit.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust stats */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              {trustStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Signup form */}
          <div className="animate-fade-in-right">
            <Card variant="elevated" size="lg" className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-4">
                  {role === 'employee' ? (
                    <GraduationCap className="h-8 w-8 text-white" />
                  ) : (
                    <Building2 className="h-8 w-8 text-white" />
                  )}
                </div>
                <CardTitle size="xl">Create Account</CardTitle>
                <CardDescription>
                  {role === 'employee' 
                    ? 'Start your journey to find amazing opportunities'
                    : 'Begin building your team with talented students'
                  }
                </CardDescription>
              </CardHeader>

              <CardContent>
                {error && (
                  <div className="mb-6 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
                    <p className="text-sm text-error-700 dark:text-error-300">{error}</p>
            </div>
          )}
          
                <div className="space-y-6">
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
                type="password" 
                autoComplete="new-password" 
                required 
                          className="input-professional pl-10"
                          placeholder="Create a strong password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
                      </div>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        Must be at least 8 characters with letters and numbers
                      </p>
                    </div>
                  </div>

                  {/* Trust indicators */}
                  <div className="flex items-center justify-center space-x-4 py-4">
                    <VerifiedBadge size="sm" />
                    <SecureBadge size="sm" />
                    <TrustBadge variant="protected" size="sm" />
                  </div>

                  <Button
                    type="button"
                    variant="gradient"
                    size="lg"
                    isFullWidth
                    isLoading={isLoading}
                    loadingText="Creating account..."
                    trustIndicator
                    onClick={handleSubmit}
                  >
                    Create {role === 'employee' ? 'Student' : 'Employer'} Account
                  </Button>
                </div>

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
                    Already have an account?{' '}
                    <Link 
                      to={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
                      className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>

                <div className="mt-4 text-xs text-center text-neutral-500 dark:text-neutral-400">
                  By creating an account, you agree to our{' '}
                  <button className="text-primary-600 hover:text-primary-500">Terms of Service</button>
                  {' '}and{' '}
                  <Link to="/privacy-policy" className="text-primary-600 hover:text-primary-500">Privacy Policy</Link>
              </div>
              </CardContent>
            </Card>
          </div>
          </div>
      </div>
    </div>
  );
};