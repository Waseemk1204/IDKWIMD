import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowRight, X, Menu, CheckCircle, Briefcase, Clock, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { JobCard } from '../components/jobs/JobCard';
import apiService from '../services/api';
import { SEO, pageSEO } from '../utils/seo';
import { DevelopmentNotice } from '../components/ui/DevelopmentNotice';

// API Test Component for debugging - TODO: Remove or implement
const ApiTestComponent = () => { // eslint-disable-line @typescript-eslint/no-unused-vars
  console.log('ApiTestComponent defined but not used');
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const testApi = async () => {
    setIsLoading(true);
    setTestResult('Testing API...');
    
    try {
      const response = await apiService.testConnection();
      setTestResult(`✅ API Test Success: ${response.message}`);
    } catch (error: any) {
      setTestResult(`❌ API Test Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testHealth = async () => {
    setIsLoading(true);
    setTestResult('Testing Health...');
    
    try {
      const response = await apiService.getHealth();
      setTestResult(`✅ Health Check: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setTestResult(`❌ Health Check Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testPing = async () => {
    setIsLoading(true);
    setTestResult('Testing Ping...');
    
    try {
      const response = await apiService.ping();
      setTestResult(`✅ Ping Success: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setTestResult(`❌ Ping Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Only show in development mode
  const shouldShow = !import.meta.env.PROD;

  if (!shouldShow) return null;

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-50 max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Mobile Debug</h3>
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs bg-gray-500 text-white px-2 py-1 rounded"
        >
          {showDebug ? 'Hide' : 'Show'}
        </button>
      </div>
      
      {showDebug && (
        <div className="space-y-2">
          <div className="text-xs text-gray-600 dark:text-gray-300">
            <div>URL: {window.location.href}</div>
            <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
            <div>Online: {navigator.onLine ? 'Yes' : 'No'}</div>
          </div>
          
          <div className="flex space-x-1">
            <button 
              onClick={testPing} 
              disabled={isLoading}
              className="bg-purple-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
            >
              Ping
            </button>
            <button 
              onClick={testApi} 
              disabled={isLoading}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
            >
              Test API
            </button>
            <button 
              onClick={testHealth} 
              disabled={isLoading}
              className="bg-green-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
            >
              Health
            </button>
          </div>
        </div>
      )}
      
      <div className="text-xs text-gray-600 dark:text-gray-300 break-words mt-2 max-h-32 overflow-y-auto">
        {testResult}
      </div>
    </div>
  );
};

// Responsive Navbar component for landing page
const Navbar = ({ onHowItWorksClick, onContactClick }: { onHowItWorksClick: () => void; onContactClick: () => void }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-lg sm:text-xl font-bold text-primary-500 hover:text-primary-600 transition-colors duration-150">
              PART-TIME PAY$
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/blogs"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors px-3 py-2 text-sm font-medium"
            >
              Blogs
            </Link>
            <Link 
              to="/about-us"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors px-3 py-2 text-sm font-medium"
            >
              About
            </Link>
            <button 
              onClick={onContactClick}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors px-3 py-2 text-sm font-medium"
            >
              Contact
            </button>
            <ThemeToggle />
            <Link 
              to="/login"
              className="ml-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors text-sm font-semibold shadow-sm"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-4 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
              <Link 
                to="/blogs"
                onClick={closeMobileMenu}
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Blogs
              </Link>
              <Link 
                to="/about-us"
                onClick={closeMobileMenu}
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                About
              </Link>
              <button 
                onClick={() => {
                  onContactClick();
                  closeMobileMenu();
                }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Contact
              </button>
              <Link 
                to="/login"
                onClick={closeMobileMenu}
                className="block text-center bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 font-semibold mt-4"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};


// Statistics data - simplified and professional
const stats = [
  { id: 1, name: 'Active Jobs', value: '500+', icon: Briefcase },
  { id: 2, name: 'Students Hired', value: '2,000+', icon: CheckCircle },
  { id: 3, name: 'Hours Tracked', value: '50K+', icon: Clock },
  { id: 4, name: 'Paid Out', value: '₹10L+', icon: DollarSign },
];

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Marketing Specialist',
    content: 'PART-TIME PAY$ helped me find flexible work that fits perfectly around my studies. The payment system is reliable and the employers are professional.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Small Business Owner',
    content: 'As a startup, we needed skilled help without the commitment of full-time hires. This platform connected us with amazing talent quickly.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Graphic Designer',
    content: 'The time tracking feature is a game-changer. I can focus on my work knowing that my hours are being tracked accurately.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80'
  }
];

// FAQ data
const faqs = [
  {
    id: 1,
    question: 'How do I get started?',
    answer: 'Simply sign up with your email, choose whether you\'re looking for work or hiring talent, complete your profile, and start browsing opportunities or posting jobs.'
  },
  {
    id: 2,
    question: 'What types of jobs are available?',
    answer: 'We offer a wide range of part-time opportunities including customer service, data entry, content writing, graphic design, virtual assistance, and many more.'
  },
  {
    id: 3,
    question: 'How does payment work?',
    answer: 'Payments are processed securely through our platform. Freelancers submit timesheets, employers approve them, and payments are released automatically on scheduled dates.'
  },
  {
    id: 4,
    question: 'Is there a fee to use the platform?',
    answer: 'Creating an account and browsing opportunities is free. We charge a small service fee only when successful transactions occur.'
  }
];

// How it works steps
const steps = [
  {
    id: 1,
    title: 'Sign Up',
    description: 'Create your account in minutes and tell us what you\'re looking for.',
    icon: '👤'
  },
  {
    id: 2,
    title: 'Browse & Connect',
    description: 'Find opportunities that match your skills or post your job requirements.',
    icon: '🔍'
  },
  {
    id: 3,
    title: 'Work & Track',
    description: 'Use our built-in tools to manage your work and track time accurately.',
    icon: '⏰'
  },
  {
    id: 4,
    title: 'Get Paid',
    description: 'Receive secure payments on time through our reliable payment system.',
    icon: '💰'
  }
];

export const Landing = () => {
  // TODO: Remove ApiTestComponent or implement it
  console.log('ApiTestComponent available:', ApiTestComponent);
  
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const [visibleJobs, setVisibleJobs] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [jobPosts, setJobPosts] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);

  // Load featured jobs and blogs from API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load featured jobs
        const jobsResponse = await apiService.getFeaturedJobs(8);
        if (jobsResponse.success && jobsResponse.data?.jobs) {
          setJobPosts(jobsResponse.data.jobs);
        }
        setIsLoadingJobs(false);

        // Load featured blogs
        const blogsResponse = await apiService.getFeaturedBlogs(3);
        if (blogsResponse.success && blogsResponse.data?.blogs) {
          setBlogPosts(blogsResponse.data.blogs);
        }
        setIsLoadingBlogs(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoadingJobs(false);
        setIsLoadingBlogs(false);
      }
    };

    loadData();
  }, []);

  // Handle body scroll locking when modals are open
  useEffect(() => {
    const isModalOpen = showHowItWorks || showContact;
    
    if (isModalOpen) {
      // Simply prevent scrolling without any position manipulation
      document.body.style.overflow = 'hidden';
      document.body.style.overflowX = 'hidden';
      document.body.style.overflowY = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
      document.documentElement.style.overflowY = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.overflowX = 'hidden'; // Keep horizontal hidden
      document.body.style.overflowY = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.overflowX = 'hidden'; // Keep horizontal hidden
      document.documentElement.style.overflowY = '';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = '';
      document.body.style.overflowX = 'hidden';
      document.body.style.overflowY = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.overflowX = 'hidden';
      document.documentElement.style.overflowY = '';
    };
  }, [showHowItWorks, showContact]);

  // Handle keyboard events for modal closing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showHowItWorks) setShowHowItWorks(false);
        if (showContact) setShowContact(false);
      }
    };

    if (showHowItWorks || showContact) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showHowItWorks, showContact]);

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const loadMoreJobs = async () => {
    setIsLoadingMore(true);
    try {
      // Load more jobs from API
      const response = await apiService.getJobs({
        page: Math.floor(visibleJobs / 6) + 1,
        limit: 6
      });
      
      if (response.success && response.data?.jobs) {
        setJobPosts(prev => [...prev, ...response.data.jobs]);
        setVisibleJobs(prev => prev + 6);
      }
    } catch (error) {
      console.error('Error loading more jobs:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };


  const handleHowItWorksClick = () => {
    setShowHowItWorks(true);
    setShowContact(false);
  };

  const handleContactClick = () => {
    setShowContact(true);
    setShowHowItWorks(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden pt-16 scrollbar-hide" style={{ overflowX: 'hidden' }}>
      <SEO {...pageSEO.home} />
      
      {/* Development Notice Dialog - Only on Landing Page */}
      <DevelopmentNotice />
      
      <Navbar onHowItWorksClick={handleHowItWorksClick} onContactClick={handleContactClick} />
      
      <main role="main">
        {/* Hero Section - Premium & Impactful */}
        <section 
          className="relative bg-white dark:bg-gray-950 overflow-hidden min-h-[calc(100vh-4rem)]"
          aria-labelledby="hero-heading"
        >
          {/* Animated Background - Subtle & Professional */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Light Mode - Soft Gradient Orbs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:hidden"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 dark:hidden"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 dark:hidden"></div>
            
            {/* Dark Mode - Subtle Glowing Orbs */}
            <div className="hidden dark:block absolute top-20 -left-10 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl animate-blob"></div>
            <div className="hidden dark:block absolute top-40 -right-10 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="hidden dark:block absolute -bottom-20 left-40 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
                      </div>
                      
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
              <div className="text-center max-w-4xl mx-auto py-12">
                {/* Main Headline - Center Aligned & Massive */}
                      <h1 
                        id="hero-heading"
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-6"
                >
                  Part-Time Work
                  <span className="block bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent mt-2">
                    That Fits Your Life
                        </span>
                      </h1>
                
                {/* Supporting Text - Centered */}
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
                  Connect with flexible opportunities designed for students. 
                  Build your career while balancing your studies.
                </p>
                
                {/* CTA Buttons - Centered & Prominent */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                  <Link to="/signup?role=employee" className="group">
                            <Button 
                      variant="primary" 
                              size="lg" 
                      className="px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                            >
                      <span className="flex items-center gap-2">
                        Find Your Next Job
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                            </Button>
                          </Link>
                  <Link to="/signup?role=employer">
                            <Button 
                      variant="secondary" 
                              size="lg" 
                      className="px-8 py-3 text-base font-semibold"
                            >
                      Post a Job
                            </Button>
                          </Link>
                        </div>
                        
                {/* Trust Stats - Centered & Clean - Responsive */}
                <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 px-4 sm:px-6 py-4 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg max-w-full">
                  <div className="text-center min-w-[80px]">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      2K+
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Students Hired
                    </div>
                  </div>
                  <div className="hidden sm:block w-px h-10 bg-gray-300 dark:bg-gray-700"></div>
                  <div className="text-center min-w-[80px]">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      500+
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Active Jobs
                    </div>
                  </div>
                  <div className="hidden sm:block w-px h-10 bg-gray-300 dark:bg-gray-700"></div>
                  <div className="text-center min-w-[80px]">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      ₹10L+
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Paid Out
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Remove Statistics Section - Now integrated in hero */}

        {/* Features Section - Simplified */}
        <section 
          className="py-20 bg-gray-50 dark:bg-gray-900"
          aria-labelledby="features-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 
                id="features-heading"
                className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl"
              >
                How It Works
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                A simple platform for students and employers to connect
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Create Profile
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Sign up and complete your profile with skills and experience
              </p>
            </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Find Opportunities
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Browse jobs that match your schedule and skills
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Get Paid
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Track your hours and receive payments securely
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Job Listings Section - Clean Design */}
        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Latest Opportunities
              </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Find part-time work that fits your schedule
                </p>
              </div>
              <Link to="/employee/jobs">
                <Button variant="secondary" size="md">
                  View All Jobs
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingJobs ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                  </div>
                ))
              ) : (
                jobPosts.slice(0, 6).map((job) => (
                  <JobCard key={job._id || job.id} job={job} />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Blog Section - Simplified */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Latest from Our Blog
              </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Tips and insights for your career journey
                </p>
              </div>
              <Link to="/blogs">
                <Button variant="secondary" size="md">
                  View All Posts
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {isLoadingBlogs ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : (
                blogPosts.map((blog) => (
                <Link
                  key={blog._id || blog.id}
                  to={`/blogs/${blog._id || blog.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-150"
                >
                  <div className="h-48">
                    <img 
                      src={blog.thumbnail} 
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wide">
                        {blog.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                      {blog.excerpt}
                    </p>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(blog.publishedDate || blog.publishDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })} • {blog.readingTime || blog.readTime} min read
                    </div>
                  </div>
                </Link>
                ))
              )}
            </div>
            
          </div>
        </section>

        {/* FAQ Section - Simplified */}
        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Common Questions
              </h2>
            </div>
            <div className="space-y-3">
              {faqs.slice(0, 4).map((faq) => (
                <div key={faq.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <button
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <span className="text-base font-semibold text-gray-900 dark:text-white">
                      {faq.question}
                    </span>
                    {openFaq === faq.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {openFaq === faq.id && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Clean Design */}
        <section 
          className="bg-primary-500"
          aria-labelledby="cta-heading"
        >
          <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h2 
                  id="cta-heading"
                className="text-3xl font-bold text-white sm:text-4xl"
                >
                Ready to Get Started?
                </h2>
              <p className="mt-4 text-lg text-primary-100 max-w-2xl mx-auto">
                Join thousands of students and employers on Part-Time Pays
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/signup">
                    <Button 
                    variant="secondary" 
                      size="lg"
                    className="bg-white text-primary-600 hover:bg-gray-50 border-none shadow-sm"
                    >
                    Create Account
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button 
                      variant="ghost" 
                      size="lg"
                      className="text-white hover:bg-white/10 border border-white/20"
                    >
                    Sign In
                    </Button>
                  </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Clean and Professional */}
      <footer 
        className="bg-gray-900 dark:bg-black border-t border-gray-800"
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold text-white">PART-TIME PAY$</h3>
              <p className="mt-3 text-sm text-gray-400 max-w-md">
                Connecting students with flexible work opportunities
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/blogs" className="text-sm text-gray-400 hover:text-white transition-colors duration-150">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/about-us" className="text-sm text-gray-400 hover:text-white transition-colors duration-150">
                    About
                  </Link>
                </li>
                <li>
                  <button onClick={handleContactClick} className="text-sm text-gray-400 hover:text-white transition-colors duration-150">
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy-policy" className="text-sm text-gray-400 hover:text-white transition-colors duration-150">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors duration-150">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-center text-sm text-gray-400">
              © {new Date().getFullYear()} Part-Time Pays. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* How It Works Modal */}
      {showHowItWorks && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
          onClick={() => setShowHowItWorks(false)}
        >
          <div 
            className="bg-white dark:bg-neutral-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">How It Works</h2>
                <button
                  onClick={() => setShowHowItWorks(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">For Students</h3>
                  <div className="space-y-4">
                    {steps.map((step) => (
                      <div key={step.id} className="flex items-start">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full text-primary-600 dark:text-primary-400 font-semibold text-sm mr-4 flex-shrink-0">
                          {step.id}
                        </div>
                        <div>
                          <h4 className="font-medium text-neutral-900 dark:text-white">{step.title}</h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">For Employers</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-8 h-8 bg-secondary-100 dark:bg-secondary-900 rounded-full text-secondary-600 dark:text-secondary-400 font-semibold text-sm mr-4 flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-white">Post Your Job</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Create detailed job postings with requirements and budget</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-8 h-8 bg-secondary-100 dark:bg-secondary-900 rounded-full text-secondary-600 dark:text-secondary-400 font-semibold text-sm mr-4 flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-white">Review Applications</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Browse student profiles and select the best candidates</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-8 h-8 bg-secondary-100 dark:bg-secondary-900 rounded-full text-secondary-600 dark:text-secondary-400 font-semibold text-sm mr-4 flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-white">Manage Projects</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Track progress and communicate with your team</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-8 h-8 bg-secondary-100 dark:bg-secondary-900 rounded-full text-secondary-600 dark:text-secondary-400 font-semibold text-sm mr-4 flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-white">Pay Securely</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Approve timesheets and release payments automatically</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button onClick={() => setShowHowItWorks(false)} variant="primary">
                  Got it
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContact && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
          onClick={() => setShowContact(false)}
        >
          <div 
            className="bg-white dark:bg-neutral-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">Contact Us</h2>
                <button
                  onClick={() => setShowContact(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Get in Touch</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                    Have questions or need support? We're here to help! Contact us through any of these channels.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">Email</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">support@parttimepays.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">Phone</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">+91 9321495344</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">Address</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Tech Hub, Bangalore, Karnataka 560001</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Business Hours</h3>
                  <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span>9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-neutral-900 dark:text-white mb-2">Need Quick Help?</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                      For immediate assistance, you can also:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link 
                        to="/login" 
                        className="text-sm bg-primary-600 text-white px-3 py-2 rounded-md hover:bg-primary-700 transition-colors text-center"
                        onClick={() => setShowContact(false)}
                      >
                        Sign In for Support
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button onClick={() => setShowContact(false)} variant="primary">
                  Got it
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};