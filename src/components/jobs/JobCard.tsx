import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  TrendingUp, 
  BookmarkPlus, 
  Bookmark, 
  Share2,
  Building2,
  Calendar,
  DollarSign,
  Users
} from 'lucide-react';

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
  responsibilities?: string[];
  requirements?: string[];
  experienceLevel?: 'entry' | 'mid' | 'senior';
  isRemote?: boolean;
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
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays < 30 ? `${diffInDays} days ago` : '30+ days ago';
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300 border-error-200 dark:border-error-800';
      case 'medium':
        return 'bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 border-warning-200 dark:border-warning-800';
      case 'low':
        return 'bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300 border-success-200 dark:border-success-800';
      default:
        return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-600';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300 border-success-200';
      case 'paused':
        return 'bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 border-warning-200';
      case 'closed':
        return 'bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300 border-error-200';
      default:
        return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border-neutral-200';
    }
  };

  const formatPayRate = (job: Job) => {
    if (job.minHourlyRate && job.maxHourlyRate) {
      return `₹${job.minHourlyRate.toLocaleString()}-${job.maxHourlyRate.toLocaleString()}/hr`;
    }
    return `₹${job.hourlyRate.toLocaleString()}/hr`;
  };

  const handleJobClick = () => {
    if (isAuthenticated) {
      navigate(`/employee/jobs/${job.id}`);
    } else {
      localStorage.setItem('intendedJobId', job.id);
      navigate('/login');
    }
  };

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    // TODO: Integrate with backend API
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job: ${job.title} at ${job.company}`,
        url: window.location.origin + `/employee/jobs/${job.id}`
      });
    }
  };

  const baseClasses = "bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 transition-all duration-200";
  const hoverClasses = "hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700";
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

  // Default variant - Naukri.com inspired design
  return (
    <div className={`${baseClasses} ${clickableClasses} ${hoverClasses} ${className} group`} onClick={!showActions ? handleJobClick : undefined}>
      {/* Header with title and actions */}
      <div className="p-5 border-b border-neutral-100 dark:border-neutral-700">
        <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {job.title}
          </h3>
              {job.urgency === 'high' && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300 rounded border border-error-200 dark:border-error-800">
                  <TrendingUp className="w-3 h-3" />
                  Urgent
                </span>
              )}
              {job.type && (
                <span className="px-2 py-0.5 text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded border border-primary-200 dark:border-primary-800 capitalize">
                  {job.type}
          </span>
        )}
      </div>
      
            <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              <Building2 className="w-4 h-4" />
              <span className="font-medium">{job.company}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
              {job.experienceLevel && (
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span className="capitalize">{job.experienceLevel} level</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{job.location}</span>
                {job.isRemote && <span className="text-primary-600 dark:text-primary-400">(Remote)</span>}
              </div>
              {job.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{job.duration}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmarkToggle}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              title={isBookmarked ? 'Remove bookmark' : 'Save job'}
            >
              {isBookmarked ? (
                <Bookmark className="w-5 h-5 text-primary-600 dark:text-primary-400 fill-current" />
              ) : (
                <BookmarkPlus className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
              )}
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              title="Share job"
            >
              <Share2 className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Job description */}
      <div className="p-5 border-b border-neutral-100 dark:border-neutral-700">
        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
        {job.description}
      </p>
      </div>

      {/* Skills */}
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-700">
        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, 5).map((skill, skillIndex) => (
          <span 
            key={skillIndex}
              className="px-3 py-1 bg-neutral-50 dark:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300 text-xs font-medium rounded-md border border-neutral-200 dark:border-neutral-600"
          >
            {skill}
          </span>
        ))}
          {job.skills.length > 5 && (
            <span className="px-3 py-1 text-neutral-500 dark:text-neutral-400 text-xs font-medium">
              +{job.skills.length - 5} more
          </span>
        )}
        </div>
      </div>
      
      {/* Footer with salary and posted date */}
      <div className="px-5 py-4">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-success-600 dark:text-success-400" />
              <span className="text-base font-bold text-success-700 dark:text-success-400">
          {formatPayRate(job)}
        </span>
            </div>
            {job.applicantCount !== undefined && job.applicantCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                <Users className="w-3.5 h-3.5" />
                <span>{job.applicantCount} applicant{job.applicantCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(job.postedDate)}</span>
          </div>
      </div>
      
      {!isAuthenticated && !showActions && (
          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
            <p className="text-xs text-primary-700 dark:text-primary-300 text-center font-medium">
              🔒 Sign in to apply and view full details
          </p>
        </div>
      )}
      </div>
    </div>
  );
};

export default JobCard;
