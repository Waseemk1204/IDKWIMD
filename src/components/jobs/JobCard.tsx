import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Briefcase, 
  Clock,
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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-400';
      case 'paused':
        return 'bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-400';
      case 'closed':
        return 'bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
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

  // Industry-standard card styling
  const baseClasses = "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200";
  const hoverClasses = "hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm";
  const clickableClasses = showActions ? "" : "cursor-pointer";

  if (variant === 'compact') {
    return (
      <div className={`${baseClasses} p-5 ${clickableClasses} ${hoverClasses} ${className} h-full flex flex-col shadow-sm hover:shadow-md transition-all duration-200`} onClick={!showActions ? handleJobClick : undefined}>
        {/* Header with Company Logo Placeholder and Title */}
        <div className="flex items-start gap-3 mb-4">
          {/* Company Logo Placeholder - Naukri Style */}
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center border border-primary-200 dark:border-primary-800">
            <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Job Title - Prominent */}
            <h3 className="font-semibold text-base text-gray-900 dark:text-white transition-colors line-clamp-2 leading-6 mb-1.5 group-hover:text-primary-600 dark:group-hover:text-primary-400">
              {job.title}
            </h3>
            {/* Company Name */}
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate mb-1">
              {job.company}
            </p>
            {/* Location and Experience */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{job.location}</span>
              {job.experienceLevel && (
                <>
                  <span>•</span>
                  <span className="capitalize">{job.experienceLevel}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Salary and Posted Date - Right aligned */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-sm font-semibold text-success-600 dark:text-success-400">
              {formatPayRate(job)}
            </p>
            {job.type && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                {job.type.replace('-', ' ')}
              </p>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {formatDate(job.postedDate)}
          </p>
        </div>
        
        {/* Skills Tags - Naukri Style */}
        <div className="mb-4 flex-1">
          <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
            {job.skills.slice(0, 4).map((skill, index) => (
              <span 
                key={index}
                className="px-2.5 py-1 text-xs font-medium bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-600"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-2.5 py-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        </div>
        
        {/* Action Button - Always at bottom */}
        {!showActions && (
          <div className="mt-auto pt-3">
            <Link to={isAuthenticated ? `/employee/jobs/${job.id}` : '/login'}>
              <button className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors duration-200 shadow-sm hover:shadow-md">
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
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {job.title}
              </h3>
              {job.status && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(job.status)}`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              )}
              {job.type && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded capitalize">
                  {job.type}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>{formatDate(job.postedDate)}</span>
              <span>•</span>
              <span>{job.location}</span>
              {job.duration && (
                <>
                  <span>•</span>
                  <span>{job.duration}</span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {job.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.slice(0, 4).map((skill, index) => (
                <span 
                  key={index}
                  className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5">
                  +{job.skills.length - 4}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-base font-semibold text-success-600 dark:text-success-400">
              {formatPayRate(job)}
            </p>
            {job.applicantCount !== undefined && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
                className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
                type="button"
              >
                View Applicants ({job.applicantCount || 0})
              </button>
            )}
            {onEdit && (
              <button 
                onClick={() => onEdit(job.id)}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
                type="button"
              >
                Edit
              </button>
            )}
            
            {/* Status Toggle */}
            {onStatusChange && job.status === 'active' && (
              <button 
                onClick={() => onStatusChange(job.id, 'paused')}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-warning-700 dark:text-warning-400 bg-warning-50 dark:bg-warning-900/20 hover:bg-warning-100 dark:hover:bg-warning-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warning-500 transition-colors duration-150"
                type="button"
              >
                Pause
              </button>
            )}
            {onStatusChange && job.status === 'paused' && (
              <button 
                onClick={() => onStatusChange(job.id, 'active')}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-success-700 dark:text-success-400 bg-success-50 dark:bg-success-900/20 hover:bg-success-100 dark:hover:bg-success-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500 transition-colors duration-150"
                type="button"
              >
                Activate
              </button>
            )}

            {onDelete && (
              <button 
                onClick={() => onDelete(job.id)}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-error-700 dark:text-error-400 bg-error-50 dark:bg-error-900/20 hover:bg-error-100 dark:hover:bg-error-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500 transition-colors duration-150"
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

  // Default variant - Clean, Industry-standard design
  return (
    <div className={`${baseClasses} ${clickableClasses} ${hoverClasses} ${className} h-full flex flex-col`} onClick={!showActions ? handleJobClick : undefined}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 h-12 leading-6">
              {job.title}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <Building2 className="w-4 h-4" />
              <span className="font-medium truncate max-w-[16rem] sm:max-w-[20rem]">{job.company}</span>
            </div>
          </div>
          {job.type && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded capitalize">
              {job.type}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
          {job.experienceLevel && (
            <div className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span className="capitalize">{job.experienceLevel}</span>
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
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(job.postedDate)}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 h-10">
          {job.description}
        </p>
      </div>

      {/* Skills */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap gap-1.5 h-8 overflow-hidden">
          {job.skills.slice(0, 6).map((skill, skillIndex) => (
            <span 
              key={skillIndex}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 6 && (
            <span className="px-2.5 py-1 text-gray-500 dark:text-gray-400 text-xs font-medium">
              +{job.skills.length - 6}
            </span>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-success-600 dark:text-success-400" />
              <span className="text-sm font-semibold text-success-600 dark:text-success-400">
                {formatPayRate(job)}
              </span>
            </div>
            {job.applicantCount !== undefined && job.applicantCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Users className="w-3.5 h-3.5" />
                <span>{job.applicantCount} applicant{job.applicantCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
        
        {!isAuthenticated && !showActions && (
          <div className="mt-3 p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <p className="text-xs text-primary-700 dark:text-primary-400 text-center font-medium">
              Sign in to apply and view full details
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
