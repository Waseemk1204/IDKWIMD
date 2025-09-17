import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { JobCard, Job } from '../../components/jobs/JobCard';
import { apiService } from '../../services/api';


interface JobFilters {
  status: string;
  search: string;
}

export const JobManagement: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilters>({
    status: 'all',
    search: ''
  });

  // Get jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getJobsByEmployer();
        if (response.success && response.data?.jobs) {
          setJobs(response.data.jobs);
        }
      } catch (error) {
        console.error('Failed to load jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on status and search
  useEffect(() => {
    let filtered = jobs;

    if (filters.status !== 'all') {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    if (filters.search) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, filters]);


  const handleViewApplicants = (jobId: string) => {
    // Navigate to applicants page for this job
    navigate(`/employer/jobs/${jobId}/applicants`);
  };

  const handleEditJob = (jobId: string) => {
    // Navigate to edit job page
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
      } else {
        console.error('Failed to update job status:', response.message);
        alert('Failed to update job status. Please try again.');
      }
    } catch (error) {
      console.error('Failed to update job status:', error);
      alert('Failed to update job status. Please try again.');
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
      } else {
        console.error('Failed to delete job:', response.message);
        alert('Failed to delete job. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
      alert('Failed to delete job. Please try again.');
    }
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Job Management
        </h1>
        <Link to="/employer/post-job">
          <button 
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            type="button"
          >
            Post New Job
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search jobs by title, description, or skills..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Your Jobs ({filteredJobs.length})
            </h2>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {filters.search || filters.status !== 'all' 
                  ? 'No jobs found matching your filters.' 
                  : 'You haven\'t posted any jobs yet.'}
              </p>
              {!filters.search && filters.status === 'all' && (
                <Link to="/employer/post-job">
                  <button 
                    className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    type="button"
                  >
                    Post Your First Job
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="detailed"
                  showActions={true}
                  onViewApplicants={handleViewApplicants}
                  onEdit={handleEditJob}
                  onStatusChange={handleJobStatusChange}
                  onDelete={handleDeleteJob}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};