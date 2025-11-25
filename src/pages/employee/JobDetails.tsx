import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Job } from '../../components/jobs/JobCard';
import { JobApplicationForm } from '../../components/jobs/JobApplicationForm';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Skeleton, SkeletonCard, SkeletonText, SkeletonButton } from '../../components/ui/Skeleton';
import { SEO, pageSEO } from '../../utils/seo';
import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Briefcase,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

export const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load job from API
  useEffect(() => {
    const loadJob = async () => {
      if (!id) {
        setError('Job ID is required');
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiService.getJobById(id);
        if (response.success && response.data?.job) {
          setJob(response.data.job);

          // Check if user has already applied (only if authenticated)
          if (isAuthenticated && user) {
            try {
              const applicationsResponse = await apiService.getUserApplications();
              if (applicationsResponse.success && applicationsResponse.data?.applications) {
                const existingApplication = applicationsResponse.data.applications.find(
                  (app: any) => app.job._id === id
                );
                if (existingApplication) {
                  setHasApplied(true);
                  setApplicationStatus(existingApplication.status);
                }
              }
            } catch (error) {
              console.error('Failed to check application status:', error);
            }
          }
        } else {
          setError('Job not found');
        }
      } catch (error) {
        console.error('Failed to load job:', error);
        setError('Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [id, isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Back Button Skeleton */}
        <SkeletonButton size="sm" className="w-32" />

        {/* Header Skeleton */}
        <div className="space-y-4">
          <Skeleton height={36} width="70%" />
          <div className="flex items-center space-x-4">
            <Skeleton height={16} width="30%" />
            <Skeleton height={16} width="25%" />
            <Skeleton height={16} width="20%" />
          </div>
        </div>

        {/* Main Content Skeleton */}
        <SkeletonCard />

        {/* Job Description Skeleton */}
        <div className="space-y-4">
          <Skeleton height={24} width="40%" />
          <SkeletonText lines={8} />
        </div>

        {/* Requirements Skeleton */}
        <div className="space-y-4">
          <Skeleton height={24} width="35%" />
          <SkeletonText lines={5} />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            Back to Jobs
          </Button>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Job Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {error || 'The job you\'re looking for doesn\'t exist or has been removed.'}
        </p>
      </div>
    );
  }

  const formatPayRate = () => {
    if (job.minHourlyRate && job.maxHourlyRate) {
      return `₹${job.minHourlyRate}-${job.maxHourlyRate}/hr`;
    }
    return `₹${job.hourlyRate}/hr`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      // Store the intended job ID for redirect after login
      localStorage.setItem('intendedJobId', id || '');
      navigate('/login');
      return;
    }
    setShowApplicationForm(true);
  };

  const handleApplicationSuccess = () => {
    setShowApplicationForm(false);
    setHasApplied(true);
    setApplicationStatus('pending');
    // Show success message or redirect
  };

  const getApplicationStatusBadge = () => {
    if (!hasApplied) return null;

    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', text: 'Pending Review' },
      reviewed: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', text: 'Under Review' },
      shortlisted: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', text: 'Shortlisted' },
      accepted: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'Not Selected' }
    };

    const config = statusConfig[applicationStatus as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <CheckCircle className="w-4 h-4 mr-1" />
        {config.text}
      </span>
    );
  };
  const seoData = job ? pageSEO.jobDetail(job) : pageSEO.jobs;

  return (
    <div className="space-y-6">
      {job && (
        <SEO
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords}
          url={`${window.location.origin}/employee/jobs/${job.id}`}
          type={seoData.type || 'website'}
        />
      )}
      {/* Back Button */}
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          Back to Jobs
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            {job.title}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center">
              <Briefcase className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{job.company}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">Posted {formatDate(job.postedDate)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end space-y-2 sm:space-y-0 sm:space-x-2">
          {getApplicationStatusBadge()}
          <Button
            onClick={handleApplyClick}
            variant="primary"
            size="lg"
            disabled={hasApplied || job.status !== 'active'}
            className="w-full sm:w-auto min-w-[140px]"
          >
            {hasApplied ? 'Applied' : 'Apply Now'}
          </Button>
        </div>
      </div>

      {/* Job Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-soft border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center mb-2">
            <DollarSign className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Pay Rate</h3>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatPayRate()}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-soft border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center mb-2">
            <Clock className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Duration</h3>
          </div>
          <p className="text-lg font-semibold text-neutral-900 dark:text-white">
            {job.duration || 'Flexible'}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-soft border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center mb-2">
            <Users className="w-5 h-5 text-purple-500 mr-2" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Applications</h3>
          </div>
          <p className="text-lg font-semibold text-neutral-900 dark:text-white">
            {job.applicantCount || 0} applied
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-soft border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
              Job Description
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {job.description}
              </p>
            </div>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-soft border border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                Responsibilities
              </h2>
              <ul className="space-y-3">
                {job.responsibilities.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600 dark:text-neutral-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-soft border border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                Requirements
              </h2>
              <ul className="space-y-3">
                {job.requirements.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600 dark:text-neutral-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Skills */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-soft border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-soft border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Job Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Type:</span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {job.type || 'Part-time'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Experience:</span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {job.experienceLevel || 'Any'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Remote:</span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {job.isRemote ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Urgency:</span>
                <span className={`font-medium ${job.urgency === 'high' ? 'text-red-600 dark:text-red-400' :
                    job.urgency === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-green-600 dark:text-green-400'
                  }`}>
                  {job.urgency || 'Medium'}
                </span>
              </div>
            </div>
          </div>

          {/* Apply Button (Mobile) */}
          <div className="lg:hidden">
            <Button
              onClick={handleApplyClick}
              variant="primary"
              size="lg"
              disabled={hasApplied || job.status !== 'active'}
              className="w-full"
            >
              {hasApplied ? 'Applied' : 'Apply Now'}
            </Button>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <JobApplicationForm
          jobId={id || ''}
          jobTitle={job.title}
          companyName={job.company}
          onSuccess={handleApplicationSuccess}
          onCancel={() => setShowApplicationForm(false)}
        />
      )}
    </div>
  );
};