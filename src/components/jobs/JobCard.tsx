import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  hourlyRate: number;
  minHourlyRate?: number;
  maxHourlyRate?: number;
  postedDate: string;
  applicantCount?: number;
  status?: 'active' | 'paused' | 'closed';
  skills: string[];
  duration?: string;
  urgency?: 'high' | 'medium' | 'low';
  type?: 'part-time' | 'full-time' | 'contract' | 'internship';
}

interface JobCardProps {
  job: Job;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onViewApplicants?: (jobId: string) => void;
  onEdit?: (jobId: string) => void;
  onStatusChange?: (jobId: string, status: string) => void;
  onDelete?: (jobId: string) => void;
  className?: string;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  variant = 'default',
  showActions = false,
  onViewApplicants,
  onEdit,
  onStatusChange,
  onDelete,
  className = ''
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      default:
        return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'paused':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'closed':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200';
    }
  };

  const formatPayRate = (job: Job) => {
    if (job.minHourlyRate && job.maxHourlyRate) {
      return `₹${job.minHourlyRate}-${job.maxHourlyRate}/hr`;
    }
    return `₹${job.hourlyRate}/hr`;
  };

  const handleJobClick = () => {
    if (isAuthenticated) {
      navigate(`/employee/jobs/${job.id}`);
    } else {
      // Store the intended job ID for redirect after login
      localStorage.setItem('intendedJobId', job.id);
      navigate('/login');
    }
  };

  const baseClasses = "bg-white dark:bg-neutral-800 rounded-xl shadow-soft border border-neutral-200 dark:border-neutral-700 transition-all duration-300";
  const hoverClasses = "hover:shadow-medium hover:-translate-y-1";
  const clickableClasses = showActions ? "" : "cursor-pointer";

  if (variant === 'compact') {
    return (
      <div className={`${baseClasses} p-4 ${clickableClasses} ${hoverClasses} ${className}`} onClick={!showActions ? handleJobClick : undefined}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-medium text-neutral-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {job.title}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {job.company}
            </p>
            <div className="mt-2">
              {job.skills.slice(0, 2).map((skill, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 mr-2"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {formatPayRate(job)}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatDate(job.postedDate)}
            </p>
          </div>
        </div>
        {!showActions && (
          <div className="mt-4">
            <Link to={isAuthenticated ? `/employee/jobs/${job.id}` : '/login'}>
              <button className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
                View Details
              </button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`${baseClasses} p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {job.title}
              </h3>
              {job.status && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              )}
              {job.urgency && (
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getUrgencyColor(job.urgency)}`}>
                  {job.urgency.toUpperCase()} PRIORITY
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              {formatDate(job.postedDate)} • {job.location} • {job.duration}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 line-clamp-2">
              {job.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {job.skills.slice(0, 3).map((skill, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 3 && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  +{job.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
          <div className="text-right ml-4">
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {formatPayRate(job)}
            </p>
            {job.applicantCount !== undefined && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {job.applicantCount} applicant{job.applicantCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="mt-4 flex flex-wrap gap-2 justify-end">
            {onViewApplicants && (
              <button 
                onClick={() => onViewApplicants(job.id)}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                type="button"
              >
                View Applicants ({job.applicantCount || 0})
              </button>
            )}
            {onEdit && (
              <button 
                onClick={() => onEdit(job.id)}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-sm font-medium rounded-md text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                type="button"
              >
                Edit
              </button>
            )}
            
            {/* Status Toggle */}
            {onStatusChange && job.status === 'active' && (
              <button 
                onClick={() => onStatusChange(job.id, 'paused')}
                className="px-4 py-2 border border-yellow-300 dark:border-yellow-600 text-sm font-medium rounded-md text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
                type="button"
              >
                Pause
              </button>
            )}
            {onStatusChange && job.status === 'paused' && (
              <button 
                onClick={() => onStatusChange(job.id, 'active')}
                className="px-4 py-2 border border-green-300 dark:border-green-600 text-sm font-medium rounded-md text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                type="button"
              >
                Activate
              </button>
            )}

            {onDelete && (
              <button 
                onClick={() => onDelete(job.id)}
                className="px-4 py-2 border border-red-300 dark:border-red-600 text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                type="button"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`${baseClasses} p-6 ${clickableClasses} ${hoverClasses} ${className}`} onClick={!showActions ? handleJobClick : undefined}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {job.title}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            {job.company} • {job.location}
          </p>
        </div>
        {job.urgency && (
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getUrgencyColor(job.urgency)}`}>
            {job.urgency === 'high' ? 'Urgent' : job.urgency === 'medium' ? 'Medium' : 'Low'}
          </span>
        )}
      </div>
      
      <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-2">
        {job.description}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.slice(0, 3).map((skill, skillIndex) => (
          <span 
            key={skillIndex}
            className="bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs px-2 py-1 rounded-md"
          >
            {skill}
          </span>
        ))}
        {job.skills.length > 3 && (
          <span className="bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs px-2 py-1 rounded-md">
            +{job.skills.length - 3} more
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-success-600 dark:text-success-400">
          {formatPayRate(job)}
        </span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {formatDate(job.postedDate)}
        </span>
      </div>
      
      {!isAuthenticated && !showActions && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
            Sign in to view full details
          </p>
        </div>
      )}
    </div>
  );
};

export default JobCard;
