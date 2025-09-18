import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CardContent, ElevatedCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { VerifiedBadge } from '../../components/ui/TrustBadge';
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
  Target
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data - in production, this would come from API/context
  const stats = {
    activeApplications: 5,
    totalEarnings: 12500,
    hoursThisMonth: 32,
    completedJobs: 12,
    rating: 4.8,
    profileCompletion: 85
  };

  // Load jobs from API
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await apiService.getJobs({ limit: 20 });
        if (response.success && response.data?.jobs) {
          setJobs(response.data.jobs);
        }
      } catch (error) {
        console.error('Failed to load jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
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
    match: Math.floor(Math.random() * 20) + 80 // Mock match score
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
    match: Math.floor(Math.random() * 20) + 80 // Mock match score
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
        <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Student'}!</h1>
            <p className="text-primary-100 text-lg">
              Ready to find your next opportunity? Let's make today productive.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <VerifiedBadge size="lg" text="Verified Student" />
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.rating}★</div>
              <div className="text-sm text-primary-100">Your Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {stats.profileCompletion < 100 && (
        <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-warning-600 dark:text-warning-400 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warning-800 dark:text-warning-200">
                Complete your profile to get better job matches
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex-1 bg-warning-200 dark:bg-warning-800 rounded-full h-2">
                  <div 
                    className="bg-warning-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.profileCompletion}%` }}
                  ></div>
                </div>
                <span className="text-xs text-warning-700 dark:text-warning-300">
                  {stats.profileCompletion}%
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="ml-4">
              Complete
            </Button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          {recentJobs.map((job) => (
            <ElevatedCard key={job.id} hover className="relative">
              {job.urgent && (
                <div className="absolute -top-2 -right-2 bg-error-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  URGENT
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {job.title}
                      </h3>
                      {job.verified && <VerifiedBadge size="sm" />}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {job.company}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {job.posted}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      {job.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold text-primary-600">
                          {job.minRate && job.maxRate ? `₹${job.minRate}-${job.maxRate}/hr` : `₹${job.rate}/hr`}
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {job.type}
                        </div>
                        <div className="text-sm text-trust-600 dark:text-trust-400 font-medium">
                          {job.match}% match
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Link to={`/employee/jobs/${job.id}`}>
                          <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                            View
                          </Button>
                        </Link>
                        <Button variant="primary" size="sm">
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
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                          {job.title}
                        </h3>
                        {job.verified && <VerifiedBadge size="sm" />}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {job.company}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {job.posted}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-4">
                        {job.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold text-primary-600">
                            ₹{job.rate}/hr
                          </div>
                          <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            {job.type}
                          </div>
                          <div className="text-sm text-trust-600 dark:text-trust-400 font-medium">
                            {job.match}% match
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Link to={`/employee/jobs/${job.id}`}>
                            <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                              View
                            </Button>
                          </Link>
                          <Button variant="primary" size="sm">
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