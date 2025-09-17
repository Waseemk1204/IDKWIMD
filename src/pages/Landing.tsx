import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Shield, CheckCircle, Star, Users, Award, ArrowRight, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TrustBadge, VerifiedBadge, SecureBadge } from '../components/ui/TrustBadge';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { FeaturesCycle } from '../components/FeaturesCycle';
import { JobCard } from '../components/jobs/JobCard';
import apiService from '../services/api';

// Mock Navbar component since it's imported
const Navbar = ({ onAboutClick, onHowItWorksClick, onContactClick }: { onAboutClick: () => void; onHowItWorksClick: () => void; onContactClick: () => void }) => (
  <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/70 dark:bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-200/30 dark:border-neutral-800/50 shadow-lg`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          <Link to="/" className="text-3xl font-bold text-blue-600 dark:text-blue-500">PART-TIME PAY$</Link>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={onAboutClick}
            className="text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            About
          </button>
          <button 
            onClick={onHowItWorksClick}
            className="text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            How it Works
          </button>
          <Link 
            to="/blogs"
            className="text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            Blogs
          </Link>
          <button 
            onClick={onContactClick}
            className="text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Contact
          </button>
          <ThemeToggle />
          <Link 
            to="/login"
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  </nav>
);


// Statistics data
const stats = [
  { id: 1, name: 'Active Users', value: '50,000+' },
  { id: 2, name: 'Jobs Posted', value: '25,000+' },
  { id: 3, name: 'Hours Worked', value: '1M+' },
  { id: 4, name: 'Average Rating', value: '4.8★' },
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showAbout, setShowAbout] = useState(false);
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
    const isModalOpen = showAbout || showHowItWorks || showContact;
    
    if (isModalOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Lock body scroll completely
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.overflowX = 'hidden';
      document.body.style.overflowY = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
      document.documentElement.style.overflowY = 'hidden';
    } else {
      // Restore body scroll
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.style.overflowX = 'hidden'; // Keep horizontal hidden
      document.body.style.overflowY = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.overflowX = 'hidden'; // Keep horizontal hidden
      document.documentElement.style.overflowY = '';
      
      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.style.overflowX = 'hidden';
      document.body.style.overflowY = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.overflowX = 'hidden';
      document.documentElement.style.overflowY = '';
    };
  }, [showAbout, showHowItWorks, showContact]);

  // Handle keyboard events for modal closing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showAbout) setShowAbout(false);
        if (showHowItWorks) setShowHowItWorks(false);
        if (showContact) setShowContact(false);
      }
    };

    if (showAbout || showHowItWorks || showContact) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAbout, showHowItWorks, showContact]);

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


  const handleAboutClick = () => {
    setShowAbout(true);
    setShowHowItWorks(false);
    setShowContact(false);
  };

  const handleHowItWorksClick = () => {
    setShowHowItWorks(true);
    setShowAbout(false);
    setShowContact(false);
  };

  const handleContactClick = () => {
    setShowContact(true);
    setShowAbout(false);
    setShowHowItWorks(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 overflow-x-hidden pt-16 scrollbar-hide" style={{ overflowX: 'hidden' }}>
      <Navbar onAboutClick={handleAboutClick} onHowItWorksClick={handleHowItWorksClick} onContactClick={handleContactClick} />
      
      <main role="main">
        {/* Hero Section */}
        <section 
          className="relative gradient-hero overflow-hidden"
          aria-labelledby="hero-heading"
        >
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-9 lg:text-left">
                      {/* Trust Badges */}
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
                        <VerifiedBadge size="md" />
                        <SecureBadge size="md" />
                        <TrustBadge variant="protected" size="md" />
                      </div>
                      
                      <h1 
                        id="hero-heading"
                        className="text-4xl tracking-tight font-extrabold text-neutral-900 dark:text-neutral-100 sm:text-5xl md:text-6xl animate-fade-in-up"
                      >
                        <span className="block">Find & Hire Talent</span>
                        <span className="block text-gradient">
                          For Part-Time Jobs
                        </span>
                      </h1>
                      <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 animate-fade-in-up">
                        Connect with skilled professionals for part-time work or
                        find flexible job opportunities that match your skills and schedule.
                      </p>
                      
                      {/* Trust Stats */}
                      <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-neutral-600 dark:text-neutral-400">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-primary-600" />
                          <span className="font-semibold text-primary-600">50K+</span> Students
                        </div>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-1 text-secondary-600" />
                          <span className="font-semibold text-secondary-600">4.8★</span> Rating
                        </div>
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-1 text-trust-600" />
                          <span className="font-semibold text-trust-600">100%</span> Secure
                        </div>
                      </div>
                      
                      <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                          <Link to="/signup?role=employer">
                            <Button 
                              variant="gradient" 
                              size="lg" 
                              className="w-full"
                              rightIcon={<ArrowRight className="h-4 w-4" />}
                              trustIndicator
                            >
                              Hire Talent
                            </Button>
                          </Link>
                          <Link to="/signup?role=employee">
                            <Button 
                              variant="outline" 
                              size="lg" 
                              className="w-full"
                              rightIcon={<ArrowRight className="h-4 w-4" />}
                            >
                              Find Work
                            </Button>
                          </Link>
                        </div>
                        
                        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400 text-center lg:text-left">
                          Join thousands of students and employers who trust our platform
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="lg:absolute lg:inset-y-0 lg:right-12 lg:w-1/2">
            <div className="relative">
              <img 
                className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full rounded-l-3xl lg:rounded-l-none" 
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80" 
                alt="Students and professionals working on laptops in a modern co-working space, representing part-time work opportunities"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent lg:rounded-l-none rounded-l-3xl"></div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="bg-white dark:bg-neutral-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={stat.id} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <p className="text-3xl font-bold text-gradient mb-2">{stat.value}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">{stat.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section 
          className="py-20 bg-neutral-50 dark:bg-neutral-800"
          aria-labelledby="features-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 
                id="features-heading"
                className="text-base text-primary-600 dark:text-primary-500 font-semibold tracking-wide uppercase mb-4"
              >
                Features
              </h2>
              <p className="text-3xl leading-8 font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
                A better way to work
              </p>
              <p className="mt-4 max-w-2xl text-xl text-neutral-600 dark:text-neutral-400 mx-auto">
                Whether you're looking for talent or work, our platform makes it
                simple and secure.
              </p>
            </div>
            <div className="mt-16">
              <FeaturesCycle />
            </div>
          </div>
        </section>

        {/* Job Listings Section */}
        <section className="py-20 bg-white dark:bg-neutral-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
                Latest Job Opportunities
              </h2>
              <p className="mt-4 text-xl text-neutral-600 dark:text-neutral-400">
                Find part-time work that fits your schedule and skills
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {isLoadingJobs ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 animate-pulse">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded mb-4 w-3/4"></div>
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded mb-4 w-1/2"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-16"></div>
                      <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-20"></div>
                    </div>
                  </div>
                ))
              ) : (
                jobPosts.slice(0, visibleJobs).map((job, index) => (
                <div 
                  key={job.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <JobCard job={job} />
                </div>
                ))
              )}
            </div>
            
            {visibleJobs < jobPosts.length && (
              <div className="text-center">
                <Button
                  onClick={loadMoreJobs}
                  isLoading={isLoadingMore}
                  variant="outline"
                  size="lg"
                  rightIcon={<ChevronDown className="h-4 w-4" />}
                >
                  {isLoadingMore ? 'Loading...' : 'View More Jobs'}
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-20 bg-neutral-50 dark:bg-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
                Read Our Blog
              </h2>
              <p className="mt-4 text-xl text-neutral-600 dark:text-neutral-400">
                Tips, insights, and advice for your part-time career journey
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoadingBlogs ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="h-48 bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="p-6">
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded mb-4 w-3/4"></div>
                      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded mb-4 w-1/2"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-20"></div>
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                blogPosts.map((blog, index) => (
                <Link
                  key={blog.id}
                  to={`/blogs/${blog.id}`}
                  className="block bg-white dark:bg-neutral-800 rounded-xl shadow-soft overflow-hidden animate-fade-in-up hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative h-48">
                    <img 
                      src={blog.thumbnail} 
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                        {blog.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2 line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center">
                        <span className="font-medium">{blog.author}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(blog.publishDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <span>{blog.readTime}</span>
                    </div>
                  </div>
                </Link>
                ))
              )}
            </div>
            
            <div className="text-center mt-8">
              <Link to="/blogs">
                <Button
                  variant="outline"
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  View More Blogs
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
                Get started in just 4 simple steps
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div key={step.id} className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full text-2xl">
                    {step.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                What Our Users Say
              </h2>
              <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
                Real feedback from our community
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <img 
                      className="h-12 w-12 rounded-full object-cover" 
                      src={testimonial.image} 
                      alt={testimonial.name}
                    />
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-600 dark:text-gray-300">
                    "{testimonial.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="mt-12 space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <button
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-0 focus:ring-offset-0 active:outline-none"
                    onClick={() => toggleFaq(faq.id)}
                    style={{ outline: 'none' }}
                  >
                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                      {faq.question}
                    </span>
                    {openFaq === faq.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {openFaq === faq.id && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 dark:text-gray-300">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          className="bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-800 dark:to-secondary-800"
          aria-labelledby="cta-heading"
        >
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
            <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between">
              <div className="lg:flex-1">
                <h2 
                  id="cta-heading"
                  className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
                >
                  <span className="block">Ready to dive in?</span>
                  <span className="block text-primary-100">
                    Start your journey today.
                  </span>
                </h2>
                <p className="mt-4 text-lg text-primary-100 max-w-2xl lg:mx-0">
                  Join thousands of students and employers who are already building their future with us.
                </p>
                
                {/* Trust indicators */}
                <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6">
                  <div className="flex items-center text-primary-100">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Free to join</span>
                  </div>
                  <div className="flex items-center text-primary-100">
                    <Shield className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Secure platform</span>
                  </div>
                  <div className="flex items-center text-primary-100">
                    <Star className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">4.8★ rating</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 lg:mt-0 lg:ml-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/signup">
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="bg-white text-primary-600 hover:bg-primary-50 border-white"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Get started free
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button 
                      variant="ghost" 
                      size="lg"
                      className="text-white hover:bg-white/10 border border-white/20"
                    >
                      Log in
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer 
        className="bg-gray-900 dark:bg-gray-950"
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-white">PART-TIME PAY$</h3>
              <p className="mt-2 text-gray-400 max-w-md">
                Connecting talented professionals with flexible work opportunities. 
                Build your career on your terms.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium">Company</h4>
              <ul className="mt-2 space-y-2">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white transition-colors duration-200">
                    About
                  </Link>
                </li>
                <li><span className="text-gray-400">Careers</span></li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium">Support</h4>
              <ul className="mt-2 space-y-2">
                <li>
                  <Link to="/help" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Help Center
                  </Link>
                </li>
                <li><span className="text-gray-400">Privacy</span></li>
                <li><span className="text-gray-400">Terms</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-center text-gray-400">
              &copy; {new Date().getFullYear()} PART-TIME PAY$. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* About Modal */}
      {showAbout && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
          onClick={() => setShowAbout(false)}
        >
          <div 
            className="bg-white dark:bg-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">About PART-TIME PAY$</h2>
                <button
                  onClick={() => setShowAbout(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6 text-neutral-600 dark:text-neutral-400">
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">Our Mission</h3>
                  <p>
                    PART-TIME PAY$ is dedicated to bridging the gap between talented students and forward-thinking employers. 
                    We believe that flexible work arrangements are the future of employment, providing students with valuable 
                    experience while helping businesses access skilled talent on-demand.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">What We Offer</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Verified job opportunities from trusted employers</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Secure payment processing with guaranteed timely payments</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Built-in time tracking and project management tools</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>24/7 customer support and dispute resolution</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">Why Choose Us?</h3>
                  <p>
                    With over 50,000 active users and 25,000+ completed jobs, we've built a reputation for reliability, 
                    security, and excellence. Our platform is designed specifically for the unique needs of students and 
                    part-time workers, ensuring a seamless experience for both job seekers and employers.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button onClick={() => setShowAbout(false)} variant="primary">
                  Got it
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">+91 98765 43210</p>
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