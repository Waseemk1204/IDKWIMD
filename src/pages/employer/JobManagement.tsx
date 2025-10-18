import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobCard, Job } from '../../components/jobs/JobCard';
import { apiService } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { 
  Plus, 
  Search, 
  Eye, 
  Trash2, 
  Play, 
  Pause, 
  Archive,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  CheckSquare,
  Square,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface JobFilters {
  status: string;
  search: string;
  category: string;
  sortBy: string;
}

interface JobStats {
  total: number;
  active: number;
  paused: number;
  closed: number;
  totalApplications: number;
  totalViews: number;
  averageApplicationsPerJob: number;
}

export const JobManagement: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [filters, setFilters] = useState<JobFilters>({
    status: 'all',
    search: '',
    category: 'all',
    sortBy: 'newest'
  });

  // Get jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getJobsByEmployer();
        if (response.success && response.data?.jobs) {
          setJobs(response.data.jobs);
          calculateStats(response.data.jobs);
        } else {
          toast.error('Failed to load jobs');
        }
      } catch (error) {
        console.error('Failed to load jobs:', error);
        toast.error('Failed to load jobs. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const calculateStats = (jobsList: Job[]) => {
    const total = jobsList.length;
    const active = jobsList.filter(job => job.status === 'active').length;
    const paused = jobsList.filter(job => job.status === 'paused').length;
    const closed = jobsList.filter(job => job.status === 'closed').length;
    
    const totalApplications = jobsList.reduce((sum, job) => sum + (job.applicantCount || 0), 0);
    const totalViews = jobsList.reduce((sum, job) => sum + (job.applicantCount || 0), 0);
    const averageApplicationsPerJob = total > 0 ? Math.round(totalApplications / total) : 0;

    setStats({
      total,
      active,
      paused,
      closed,
      totalApplications,
      totalViews,
      averageApplicationsPerJob
    });
  };

  // Filter and sort jobs
  useEffect(() => {
    let filtered = [...jobs];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    // Category filter - removed as Job interface doesn't have category property

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime());
        break;
      case 'applications':
        filtered.sort((a, b) => (b.applicantCount || 0) - (a.applicantCount || 0));
        break;
      case 'views':
        filtered.sort((a, b) => (b.applicantCount || 0) - (a.applicantCount || 0));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredJobs(filtered);
  }, [jobs, filters]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await apiService.getJobsByEmployer();
      if (response.success && response.data?.jobs) {
        setJobs(response.data.jobs);
        calculateStats(response.data.jobs);
        toast.success('Jobs refreshed successfully');
      }
    } catch (error) {
      console.error('Failed to refresh jobs:', error);
      toast.error('Failed to refresh jobs');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewApplicants = (jobId: string) => {
    navigate(`/employer/jobs/${jobId}/applicants`);
  };

  const handleEditJob = (jobId: string) => {
    navigate(`/employer/jobs/${jobId}/edit`);
  };

  const handleJobStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const response = await apiService.updateJob(jobId, { status: newStatus });
      
      if (response.success) {
        setJobs(prevJobs =>
          prevJobs.map(job =>
            job.id === jobId ? { ...job, status: newStatus as Job['status'] } : job
          )
        );
        toast.success(`Job status updated to ${newStatus}`);
      } else {
        toast.error('Failed to update job status');
      }
    } catch (error) {
      console.error('Failed to update job status:', error);
      toast.error('Failed to update job status');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiService.deleteJob(jobId);
      
      if (response.success) {
        setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
        toast.success('Job deleted successfully');
      } else {
        toast.error('Failed to delete job');
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
      toast.error('Failed to delete job');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedJobs.size === 0) {
      toast.error('Please select jobs first');
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} ${selectedJobs.size} job(s)?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const promises = Array.from(selectedJobs).map(jobId => {
        switch (action) {
          case 'activate':
            return apiService.updateJob(jobId, { status: 'active' });
          case 'pause':
            return apiService.updateJob(jobId, { status: 'paused' });
          case 'close':
            return apiService.updateJob(jobId, { status: 'closed' });
          case 'delete':
            return apiService.deleteJob(jobId);
          default:
            return Promise.resolve({ success: false });
        }
      });

      const results = await Promise.all(promises);
      const successCount = results.filter(result => result.success).length;

      if (successCount > 0) {
        // Refresh jobs
        await handleRefresh();
        setSelectedJobs(new Set());
        toast.success(`${successCount} job(s) ${action}d successfully`);
      } else {
        toast.error('Failed to perform bulk action');
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  const toggleJobSelection = (jobId: string) => {
    const newSelected = new Set(selectedJobs);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobs(newSelected);
  };

  const selectAllJobs = () => {
    if (selectedJobs.size === filteredJobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(filteredJobs.map(job => job.id)));
    }
  };

  const getUniqueCategories = () => {
    // Return empty array since Job interface doesn't have category property
    return [];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
                <div className="flex justify-end space-x-2">
                  <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                  <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
              </div>
            ))}
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
            Job Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your job postings and track performance
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
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/employer/post-job')}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* Job Analytics */}
      {showStats && stats && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Job Performance Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Applications</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalApplications}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-green-600 dark:text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Views</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.totalViews}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Avg Applications</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.averageApplicationsPerJob}</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Active Jobs</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.active}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Categories</option>
            {getUniqueCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="applications">Most Applications</option>
            <option value="views">Most Views</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedJobs.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {selectedJobs.size} job(s) selected
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('activate')}
                className="flex items-center"
              >
                <Play className="w-4 h-4 mr-1" />
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('pause')}
                className="flex items-center"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('close')}
                className="flex items-center"
              >
                <Archive className="w-4 h-4 mr-1" />
                Close
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                className="flex items-center text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Your Jobs ({filteredJobs.length})
            </h2>
            {filteredJobs.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={selectAllJobs}
                  className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {selectedJobs.size === filteredJobs.length ? (
                    <CheckSquare className="w-4 h-4 mr-1" />
                  ) : (
                    <Square className="w-4 h-4 mr-1" />
                  )}
                  {selectedJobs.size === filteredJobs.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            )}
          </div>

          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {filters.search || filters.status !== 'all' || filters.category !== 'all'
                  ? 'No jobs found' 
                  : 'No jobs posted yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filters.search || filters.status !== 'all' || filters.category !== 'all'
                  ? 'Try adjusting your filters to find jobs.' 
                  : 'Start by posting your first job to attract talented candidates.'}
              </p>
              {!filters.search && filters.status === 'all' && filters.category === 'all' && (
                <Button
                  variant="primary"
                  onClick={() => navigate('/employer/post-job')}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Job
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="relative">
                  <div className="absolute left-4 top-4 z-10">
                    <button
                      onClick={() => toggleJobSelection(job.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      {selectedJobs.has(job.id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="ml-8">
                    <JobCard
                      job={job}
                      variant="detailed"
                      showActions={true}
                      onViewApplicants={handleViewApplicants}
                      onEdit={handleEditJob}
                      onStatusChange={handleJobStatusChange}
                      onDelete={handleDeleteJob}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};