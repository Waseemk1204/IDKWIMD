import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  CheckCircle,
  XCircle,
  Star,
  Eye
} from 'lucide-react';

interface Application {
  _id: string;
  applicant: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    profileImage?: string;
    bio?: string;
    skills?: string[];
    experience?: string;
    education?: string;
    rating?: number;
    totalJobs?: number;
  };
  coverLetter: string;
  salaryExpectation?: number;
  availability?: string;
  portfolio?: string;
  linkedinProfile?: string;
  githubProfile?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  appliedDate: string;
  reviewedDate?: string;
  notes?: string;
  employerNotes?: string;
}

export const JobApplicants: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Load job and applications
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError('Job ID is required');
        setIsLoading(false);
        return;
      }

      try {
        // Load job details
        const jobResponse = await apiService.getJobById(id);
        if (jobResponse.success && jobResponse.data?.job) {
          const jobData = jobResponse.data.job;
          setJob(jobData);

          // Debug logging
          console.log('=== JOB APPLICANTS AUTHORIZATION DEBUG ===');
          console.log('Job employer object:', jobData.employer);
          console.log('Job employer._id:', jobData.employer._id);
          console.log('Job employer._id (string):', jobData.employer._id?.toString());
          console.log('Current user object:', user);
          console.log('Current user.id:', user?.id);
          console.log('Current user.id (string):', user?.id?.toString());
          console.log('IDs match:', jobData.employer._id?.toString() === user?.id?.toString());
          console.log('=========================================');

          // Check if user owns this job
          // Note: user object uses 'id' property, not '_id'
          if (jobData.employer._id?.toString() !== user?.id?.toString()) {
            console.log('❌ AUTHORIZATION FAILED - IDs do not match');
            setError('You can only view applicants for your own jobs');
            setIsLoading(false);
            return;
          }

          console.log('✅ AUTHORIZATION PASSED - User owns this job');
        } else {
          setError('Job not found');
          setIsLoading(false);
          return;
        }

        // Load applications
        const applicationsResponse = await apiService.getJobApplications(id);
        if (applicationsResponse.success && applicationsResponse.data?.applications) {
          setApplications(applicationsResponse.data.applications);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load job applications');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, user]);

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const response = await apiService.updateApplicationStatus(applicationId, { status: newStatus });
      if (response.success) {
        // Update local state
        setApplications(prev => prev.map(app =>
          app._id === applicationId
            ? { ...app, status: newStatus as any, reviewedDate: new Date().toISOString() }
            : app
        ));

        // Update selected application if it's the one being updated
        if (selectedApplication?._id === applicationId) {
          setSelectedApplication(prev => prev ? { ...prev, status: newStatus as any, reviewedDate: new Date().toISOString() } : null);
        }
      } else {
        setError(response.message || 'Failed to update application status');
      }
    } catch (error: any) {
      console.error('Error updating application status:', error);
      setError(error.message || 'Failed to update application status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', text: 'Pending' },
      reviewed: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', text: 'Reviewed' },
      shortlisted: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', text: 'Shortlisted' },
      accepted: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'Rejected' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
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

  const filteredApplications = applications.filter(app =>
    selectedStatus === 'all' || app.status === selectedStatus
  );

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
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/employer/jobs')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
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
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/employer/jobs')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Job Applicants
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {job?.title} - {job?.company}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {applications.length} total applications
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        {filteredApplications.length === 0 ? (
          <div className="p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No applications found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedStatus === 'all'
                ? 'No one has applied for this job yet.'
                : `No applications with status "${selectedStatus}".`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredApplications.map((application) => (
              <div key={application._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                      {application.applicant.profileImage ? (
                        <img
                          src={application.applicant.profileImage}
                          alt={application.applicant.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {application.applicant.fullName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {application.applicant.fullName}
                        </h3>
                        {application.applicant.rating && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                              {application.applicant.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {application.applicant.email}
                        </div>
                        {application.applicant.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {application.applicant.location}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Applied {formatDate(application.appliedDate)}
                        </div>
                      </div>
                      {application.salaryExpectation && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Expected: ₹{application.salaryExpectation}/hour
                        </p>
                      )}
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {application.coverLetter}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getStatusBadge(application.status)}
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewApplication(application)}
                        className="flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {application.status === 'pending' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStatusUpdate(application._id, 'shortlisted')}
                            disabled={isUpdatingStatus}
                            className="flex items-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Shortlist
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStatusUpdate(application._id, 'rejected')}
                            disabled={isUpdatingStatus}
                            className="flex items-center text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {application.status === 'shortlisted' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStatusUpdate(application._id, 'accepted')}
                            disabled={isUpdatingStatus}
                            className="flex items-center bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStatusUpdate(application._id, 'rejected')}
                            disabled={isUpdatingStatus}
                            className="flex items-center text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
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
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
                  {selectedApplication.applicant.profileImage ? (
                    <img
                      src={selectedApplication.applicant.profileImage}
                      alt={selectedApplication.applicant.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-xl font-medium">
                      {selectedApplication.applicant.fullName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                    {selectedApplication.applicant.fullName}
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Application for {job?.title}
                  </p>
                </div>
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
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-neutral-500 mr-2" />
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {selectedApplication.applicant.email}
                      </span>
                    </div>
                    {selectedApplication.applicant.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-neutral-500 mr-2" />
                        <span className="text-neutral-700 dark:text-neutral-300">
                          {selectedApplication.applicant.phone}
                        </span>
                      </div>
                    )}
                    {selectedApplication.applicant.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-neutral-500 mr-2" />
                        <span className="text-neutral-700 dark:text-neutral-300">
                          {selectedApplication.applicant.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                    Application Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">Status:</span>
                      {getStatusBadge(selectedApplication.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">Applied:</span>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {formatDate(selectedApplication.appliedDate)}
                      </span>
                    </div>
                    {selectedApplication.salaryExpectation && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Expected Rate:</span>
                        <span className="text-neutral-700 dark:text-neutral-300">
                          ₹{selectedApplication.salaryExpectation}/hour
                        </span>
                      </div>
                    )}
                    {selectedApplication.availability && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Availability:</span>
                        <span className="text-neutral-700 dark:text-neutral-300">
                          {selectedApplication.availability}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                  Cover Letter
                </h3>
                <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {selectedApplication.coverLetter}
                  </p>
                </div>
              </div>

              {/* Links */}
              {(selectedApplication.portfolio || selectedApplication.linkedinProfile || selectedApplication.githubProfile) && (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                    Links
                  </h3>
                  <div className="space-y-2">
                    {selectedApplication.portfolio && (
                      <div className="flex items-center">
                        <ExternalLink className="w-4 h-4 text-neutral-500 mr-2" />
                        <a
                          href={selectedApplication.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          Portfolio
                        </a>
                      </div>
                    )}
                    {selectedApplication.linkedinProfile && (
                      <div className="flex items-center">
                        <ExternalLink className="w-4 h-4 text-neutral-500 mr-2" />
                        <a
                          href={selectedApplication.linkedinProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                    {selectedApplication.githubProfile && (
                      <div className="flex items-center">
                        <ExternalLink className="w-4 h-4 text-neutral-500 mr-2" />
                        <a
                          href={selectedApplication.githubProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          GitHub Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Skills */}
              {selectedApplication.applicant.skills && selectedApplication.applicant.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.applicant.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                      >
                        {skill}
                      </span>
                    ))}
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
                {selectedApplication.status === 'pending' && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => handleStatusUpdate(selectedApplication._id, 'shortlisted')}
                      disabled={isUpdatingStatus}
                      className="flex-1 flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Shortlist
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleStatusUpdate(selectedApplication._id, 'rejected')}
                      disabled={isUpdatingStatus}
                      className="flex-1 flex items-center justify-center text-red-600 hover:text-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
