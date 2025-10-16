import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CardContent, ElevatedCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { VerifiedBadge } from '../../components/ui/TrustBadge';
import { Skeleton, SkeletonJobCard, SkeletonCard } from '../../components/ui/Skeleton';
import { LazyLoad, LazyImage } from '../../components/ui/LazyLoad';
import { ProfileCompletionWizard } from '../../components/profile/ProfileCompletionWizard';
import { ProfileCompletionProgress, getProfileCompletionItems, calculateProfileCompletion } from '../../components/profile/ProfileCompletionProgress';
import { SkillVerification } from '../../components/profile/SkillVerification';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import { Job } from '../../components/jobs/JobCard';
import { 
  ArrowRight, 
  Briefcase, 
  Wallet, 
  Clock, 
  TrendingUp, 
  Star, 
  MapPin, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Eye,
  Target,
  User,
  Phone,
  FileText,
  Award,
  Settings,
  X
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!user) return 0;
    
    let completed = 0;
    let total = 6;
    
    if (user.fullName) completed++;
    if (user.email) completed++;
    if (user.phone) completed++;
    if (user.about && user.about.length > 10) completed++;
    if (user.skills && user.skills.length > 0) completed++;
    if (user.profileImage) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  
  // Profile completion checklist items
  const profileChecklist = [
    {
      id: 'name',
      label: 'Full Name',
      completed: !!user?.fullName,
      icon: User
    },
    {
      id: 'phone',
      label: 'Phone Number',
      completed: !!user?.phone,
      icon: Phone
    },
    {
      id: 'bio',
      label: 'About Section',
      completed: !!(user?.about && user.about.length > 10),
      icon: FileText
    },
    {
      id: 'skills',
      label: 'Skills Added',
      completed: !!(user?.skills && user.skills.length > 0),
      icon: Award
    },
    {
      id: 'photo',
      label: 'Profile Photo',
      completed: !!user?.profileImage,
      icon: User
    }
  ];

  // Load jobs and stats from API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load jobs
        const jobsResponse = await apiService.getJobs({ limit: 20 });
        if (jobsResponse.success && jobsResponse.data?.jobs) {
          setJobs(jobsResponse.data.jobs);
        }
        
        // TODO: Load user stats from API
        // const statsResponse = await apiService.getUserStats();
        // if (statsResponse.success) {
        //   setStats(statsResponse.data.stats);
        // }
        
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Get recent jobs (first 3)
  const recentJobs = jobs.slice(0, 3).map(job => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    rate: job.hourlyRate,
    minRate: job.minHourlyRate,
    maxRate: job.maxHourlyRate,
    posted: new Date(job.postedDate).toLocaleDateString(),
    skills: job.skills,
    type: job.type || 'Part-time',
    verified: true,
    urgent: job.urgency === 'high',
    match: 85 // TODO: Calculate real match score based on skills
  }));

  // Get all active jobs for expanded view
  const allJobs = jobs.map(job => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    rate: job.hourlyRate,
    minRate: job.minHourlyRate,
    maxRate: job.maxHourlyRate,
    posted: new Date(job.postedDate).toLocaleDateString(),
    skills: job.skills,
    type: job.type || 'Part-time',
    verified: true,
    urgent: job.urgency === 'high',
    match: 85 // TODO: Calculate real match score based on skills
  }));

  // Get additional jobs (excluding the first 3 that are already shown)
  const additionalJobs = allJobs.slice(3);

  const handleViewAll = () => {
    setShowAllJobs(!showAllJobs);
  };

  const quickActions = [
    {
      title: 'Browse Jobs',
      description: 'Find new opportunities',
      icon: Briefcase,
      href: '/employee/jobs',
      color: 'primary'
    },
    {
      title: 'Submit Timesheet',
      description: 'Log your hours',
      icon: Clock,
      href: '/employee/timesheet',
      color: 'secondary'
    },
    {
      title: 'View Earnings',
      description: 'Check your wallet',
      icon: Wallet,
      href: '/employee/wallet',
      color: 'success'
    },
    {
      title: 'Update Profile',
      description: 'Complete your profile',
      icon: Target,
      href: '/profile',
      color: 'trust'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        {/* Welcome Header Skeleton */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton height={36} width="60%" className="mb-2 bg-primary-200" />
              <Skeleton height={20} width="80%" className="bg-primary-200" />
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Skeleton width={120} height={32} rounded className="bg-primary-200" />
              <div className="text-right">
                <Skeleton height={24} width={40} className="mb-1 bg-primary-200" />
                <Skeleton height={16} width={60} className="bg-primary-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* Jobs Section Skeleton */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton height={28} width="40%" />
            <SkeletonButton size="sm" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <SkeletonJobCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-6 lg:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome back, {user?.fullName || 'Student'}!</h1>
            <p className="text-primary-100 text-base lg:text-lg">
              Ready to find your next opportunity? Let's make today productive.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-0 lg:space-y-2">
            <VerifiedBadge size="lg" text="Verified Student" />
            <div className="text-right">
              <div className="text-xl lg:text-2xl font-bold">{stats.rating}★</div>
              <div className="text-sm text-primary-100">Your Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion Checklist */}
      {profileCompletion < 100 && (
        <ElevatedCard className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Complete Your Profile
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {profileCompletion}% complete • {profileChecklist.filter(item => !item.completed).length} items remaining
                  </p>
                </div>
              </div>
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  Complete Profile
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profileChecklist.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.id} className={`flex items-center space-x-3 p-3 rounded-lg ${
                    item.completed 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : 'bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      item.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-neutral-300 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-400'
                    }`}>
                      {item.completed ? <CheckCircle className="h-4 w-4" /> : <IconComponent className="h-4 w-4" />}
                    </div>
                    <span className={`text-sm font-medium ${
                      item.completed 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-neutral-700 dark:text-neutral-300'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </ElevatedCard>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <ElevatedCard hover className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Active Applications</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.activeApplications}</p>
                <p className="text-xs text-success-600 dark:text-success-400 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2 this week
                </p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                <Briefcase className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </ElevatedCard>

        <ElevatedCard hover className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-success-100 dark:bg-success-900/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">This Month's Earnings</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">₹{stats.totalEarnings.toLocaleString()}</p>
                <p className="text-xs text-success-600 dark:text-success-400 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15% from last month
                </p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-xl">
                <Wallet className="h-6 w-6 text-success-600" />
              </div>
            </div>
          </CardContent>
        </ElevatedCard>

        <ElevatedCard hover className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-secondary-100 dark:bg-secondary-900/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Hours This Month</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.hoursThisMonth}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Target: 40 hours
                </p>
              </div>
              <div className="p-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl">
                <Clock className="h-6 w-6 text-secondary-600" />
              </div>
            </div>
          </CardContent>
        </ElevatedCard>

        <ElevatedCard hover className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-trust-100 dark:bg-trust-900/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Completed Jobs</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.completedJobs}</p>
                <p className="text-xs text-trust-600 dark:text-trust-400 flex items-center mt-1">
                  <Star className="h-3 w-3 mr-1" />
                  {stats.rating}★ average
                </p>
              </div>
              <div className="p-3 bg-trust-100 dark:bg-trust-900/30 rounded-xl">
                <CheckCircle className="h-6 w-6 text-trust-600" />
              </div>
            </div>
          </CardContent>
        </ElevatedCard>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <ElevatedCard hover className="h-full">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                    action.color === 'primary' ? 'bg-primary-100 dark:bg-primary-900/30' :
                    action.color === 'secondary' ? 'bg-secondary-100 dark:bg-secondary-900/30' :
                    action.color === 'success' ? 'bg-success-100 dark:bg-success-900/30' :
                    'bg-trust-100 dark:bg-trust-900/30'
                  }`}>
                    <action.icon className={`h-6 w-6 ${
                      action.color === 'primary' ? 'text-primary-600' :
                      action.color === 'secondary' ? 'text-secondary-600' :
                      action.color === 'success' ? 'text-success-600' :
                      'text-trust-600'
                    }`} />
                  </div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {action.description}
                  </p>
                </CardContent>
              </ElevatedCard>
            </Link>
          ))}
        </div>
      </div>

      {/* Recommended Jobs */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Recommended Jobs</h2>
          <Button 
            variant="outline" 
            size="sm" 
            rightIcon={<ArrowRight className="h-4 w-4" />}
            onClick={handleViewAll}
          >
            {showAllJobs ? 'Show Less' : 'View All'}
          </Button>
        </div>
        
        <div className="space-y-4">
          {recentJobs.length > 0 ? (
            recentJobs.map((job, index) => (
              <LazyLoad
                key={job.id}
                fallback={<SkeletonJobCard />}
                threshold={0.1}
                rootMargin="100px"
              >
                <ElevatedCard hover className="relative">
                  {job.urgent && (
                    <div className="absolute -top-2 -right-2 bg-error-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      URGENT
                    </div>
                  )}
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                            {job.title}
                          </h3>
                          {job.verified && <VerifiedBadge size="sm" />}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{job.company}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{job.posted}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.map((skill, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="text-xl sm:text-2xl font-bold text-primary-600">
                              {job.minRate && job.maxRate ? `₹${job.minRate}-${job.maxRate}/hr` : `₹${job.rate}/hr`}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                              <span>{job.type}</span>
                              <span className="text-trust-600 dark:text-trust-400 font-medium">
                                {job.match}% match
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
                            <Link to={`/employee/jobs/${job.id}`} className="flex-1 sm:flex-none">
                              <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />} className="w-full sm:w-auto">
                                View
                              </Button>
                            </Link>
                            <Button variant="primary" size="sm" className="w-full sm:w-auto">
                              Apply Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </ElevatedCard>
              </LazyLoad>
            ))
          ) : (
            <ElevatedCard className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  No Jobs Available
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  We're working on bringing you the best opportunities. Check back soon!
                </p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Refresh Jobs
                </Button>
              </CardContent>
            </ElevatedCard>
          )}
        </div>

        {/* Additional Jobs - shown when "View All" is clicked */}
        {showAllJobs && (
          <div className="mt-6 space-y-4 animate-fade-in-up">
            {additionalJobs.map((job, index) => (
              <ElevatedCard 
                key={job.id} 
                hover 
                className="relative animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {job.urgent && (
                  <div className="absolute -top-2 -right-2 bg-error-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    URGENT
                  </div>
                )}
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {job.title}
                        </h3>
                        {job.verified && <VerifiedBadge size="sm" />}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{job.company}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{job.posted}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <div className="text-xl sm:text-2xl font-bold text-primary-600">
                            ₹{job.rate}/hr
                          </div>
                          <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                            <span>{job.type}</span>
                            <span className="text-trust-600 dark:text-trust-400 font-medium">
                              {job.match}% match
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
                          <Link to={`/employee/jobs/${job.id}`} className="flex-1 sm:flex-none">
                            <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />} className="w-full sm:w-auto">
                              View
                            </Button>
                          </Link>
                          <Button variant="primary" size="sm" className="w-full sm:w-auto">
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </ElevatedCard>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};