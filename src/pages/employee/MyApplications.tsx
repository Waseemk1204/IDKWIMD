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
  ExternalLink,
  TrendingUp,
  MessageSquare,
  Filter,
  Search,
  BarChart3,
  Target,
  Award,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

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
    category?: string;
    skills?: string[];
  };
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  appliedDate: string;
  reviewedDate?: string;
  coverLetter: string;
  salaryExpectation?: number;
  availability?: string;
  notes?: string;
  timeline?: Array<{
    status: string;
    date: string;
    note?: string;
  }>;
}

interface ApplicationStats {
  total: number;
  pending: number;
  reviewed: number;
  shortlisted: number;
  accepted: number;
  rejected: number;
  successRate: number;
  averageResponseTime: number;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<ApplicationStats | null>(null);

  // Load applications
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.getUserApplications();
        if (response.success && response.data?.applications) {
          setApplications(response.data.applications);
          calculateStats(response.data.applications);
        } else {
          setError(response.message || 'Failed to load applications');
          toast.error('Failed to load applications');
        }
      } catch (error) {
        console.error('Failed to load applications:', error);
        setError('Failed to load applications. Please try again.');
        toast.error('Failed to load applications. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, []);

  const calculateStats = (apps: Application[]) => {
    const total = apps.length;
    const pending = apps.filter(app => app.status === 'pending').length;
    const reviewed = apps.filter(app => app.status === 'reviewed').length;
    const shortlisted = apps.filter(app => app.status === 'shortlisted').length;
    const accepted = apps.filter(app => app.status === 'accepted').length;
    const rejected = apps.filter(app => app.status === 'rejected').length;
    
    const successRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
    
    // Calculate average response time (simplified)
    const respondedApps = apps.filter(app => app.reviewedDate);
    const averageResponseTime = respondedApps.length > 0 
      ? respondedApps.reduce((sum, app) => {
          const appliedDate = new Date(app.appliedDate);
          const reviewedDate = new Date(app.reviewedDate!);
          return sum + (reviewedDate.getTime() - appliedDate.getTime());
        }, 0) / respondedApps.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    setStats({
      total,
      pending,
      reviewed,
      shortlisted,
      accepted,
      rejected,
      successRate,
      averageResponseTime: Math.round(averageResponseTime)
    });
  };

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
        icon: Award
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

  const filteredApplications = applications.filter(app => {
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      app.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Applications
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track the status of your job applications
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => setShowStats(!showStats)}
            className="flex items-center"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/browse-jobs')}
            className="flex items-center"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Browse Jobs
          </Button>
        </div>
      </div>

      {/* Application Analytics */}
      {showStats && stats && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Application Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Success Rate</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.successRate}%</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Accepted</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.accepted}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Avg Response</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.averageResponseTime}d</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Applied</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.total}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredApplications.length} of {applications.length} applications
            </span>
          </div>
        </div>
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
              onClick={() => navigate('/browse-jobs')}
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
                          {application.job.category && (
                            <div className="flex items-center">
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">
                                {application.job.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(application.status)}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Applied {formatDate(application.appliedDate)}
                        </p>
                        {application.reviewedDate && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Reviewed {formatDate(application.reviewedDate)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
                      {application.coverLetter}
                    </p>

                    {/* Skills */}
                    {application.job.skills && application.job.skills.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {application.job.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                          {application.job.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                              +{application.job.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

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
                      {application.status === 'accepted' && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex items-center"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Message Employer
                        </Button>
                      )}
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
                  {selectedApplication.job.category && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">Category:</span>
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {selectedApplication.job.category}
                      </span>
                    </div>
                  )}
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
                {selectedApplication.status === 'accepted' && (
                  <Button
                    variant="primary"
                    className="flex items-center justify-center"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message Employer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};