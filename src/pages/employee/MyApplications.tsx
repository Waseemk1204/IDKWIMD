import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { 
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    company: string;
    location: string;
    hourlyRate?: number;
    minHourlyRate?: number;
    maxHourlyRate?: number;
    status: string;
  };
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  appliedDate: string;
  reviewedDate?: string;
  coverLetter: string;
  salaryExpectation?: number;
  availability?: string;
}

export const MyApplications: React.FC = () => {
  const navigate = useNavigate();
  const { user: _user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  // Load applications
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.getUserApplications();
        if (response.success && response.data?.applications) {
          setApplications(response.data.applications);
        } else {
          setError(response.message || 'Failed to load applications');
        }
      } catch (error) {
        console.error('Failed to load applications:', error);
        setError('Failed to load applications. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, []);

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/employee/jobs/${jobId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', 
        text: 'Pending Review',
        icon: Clock
      },
      reviewed: { 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', 
        text: 'Under Review',
        icon: Eye
      },
      shortlisted: { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', 
        text: 'Shortlisted',
        icon: CheckCircle
      },
      accepted: { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', 
        text: 'Accepted',
        icon: CheckCircle
      },
      rejected: { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', 
        text: 'Not Selected',
        icon: XCircle
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <IconComponent className="w-4 h-4 mr-1" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatPayRate = (job: Application['job']) => {
    if (job.minHourlyRate && job.maxHourlyRate) {
      return `₹${job.minHourlyRate}-${job.maxHourlyRate}/hr`;
    }
    return `₹${job.hourlyRate}/hr`;
  };

  const filteredApplications = applications.filter(app => 
    selectedStatus === 'all' || app.status === selectedStatus
  );

  const getStatusCounts = () => {
    const counts = {
      all: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      reviewed: applications.filter(app => app.status === 'reviewed').length,
      shortlisted: applications.filter(app => app.status === 'shortlisted').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Applications
        </h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Applications
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track the status of your job applications
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/employee/jobs')}
          className="flex items-center"
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Browse Jobs
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { key: 'all', label: 'All', count: statusCounts.all },
          { key: 'pending', label: 'Pending', count: statusCounts.pending },
          { key: 'reviewed', label: 'Reviewed', count: statusCounts.reviewed },
          { key: 'shortlisted', label: 'Shortlisted', count: statusCounts.shortlisted },
          { key: 'accepted', label: 'Accepted', count: statusCounts.accepted },
          { key: 'rejected', label: 'Rejected', count: statusCounts.rejected }
        ].map(({ key, label, count }) => (
          <div
            key={key}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedStatus === key
                ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800'
                : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => setSelectedStatus(key)}
          >
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                selectedStatus === key
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {count}
              </div>
              <div className={`text-sm ${
                selectedStatus === key
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Applications List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        {filteredApplications.length === 0 ? (
          <div className="p-8 text-center">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {selectedStatus === 'all' ? 'No applications yet' : `No ${selectedStatus} applications`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {selectedStatus === 'all' 
                ? 'Start applying to jobs to see your applications here.' 
                : `You don't have any ${selectedStatus} applications.`}
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/employee/jobs')}
              className="flex items-center"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Browse Jobs
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredApplications.map((application) => (
              <div key={application._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {application.job.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1" />
                            {application.job.company}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {application.job.location}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {formatPayRate(application.job)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(application.status)}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Applied {formatDate(application.appliedDate)}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
                      {application.coverLetter}
                    </p>

                    <div className="flex items-center space-x-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewApplication(application)}
                        className="flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Application
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewJob(application.job._id)}
                        className="flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Job
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Application Details
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {selectedApplication.job.title} - {selectedApplication.job.company}
                </p>
              </div>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Application Status */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                    Application Status
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Applied on {formatDate(selectedApplication.appliedDate)}
                  </p>
                </div>
                {getStatusBadge(selectedApplication.status)}
              </div>

              {/* Job Details */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                  Job Details
                </h3>
                <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Position:</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {selectedApplication.job.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Company:</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {selectedApplication.job.company}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Location:</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {selectedApplication.job.location}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Pay Rate:</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {formatPayRate(selectedApplication.job)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                  Your Cover Letter
                </h3>
                <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {selectedApplication.coverLetter}
                  </p>
                </div>
              </div>

              {/* Additional Details */}
              {(selectedApplication.salaryExpectation || selectedApplication.availability) && (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                    Additional Information
                  </h3>
                  <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4 space-y-2">
                    {selectedApplication.salaryExpectation && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Expected Rate:</span>
                        <span className="font-medium text-neutral-900 dark:text-white">
                          ₹{selectedApplication.salaryExpectation}/hour
                        </span>
                      </div>
                    )}
                    {selectedApplication.availability && (
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-400">Availability:</span>
                        <p className="text-neutral-700 dark:text-neutral-300 mt-1">
                          {selectedApplication.availability}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-4 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <Button
                  variant="secondary"
                  onClick={() => setShowApplicationModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleViewJob(selectedApplication.job._id)}
                  className="flex-1 flex items-center justify-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Job
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
