// API service for communicating with the backend
const getApiBaseUrl = () => {
  // In production, use relative URLs for Vercel API routes
  if (import.meta.env.PROD) {
    return '/api';
  }
  // In development, use the environment variable or default
  return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

// Debug: Log the API URL being used
console.log('API_BASE_URL:', API_BASE_URL);
console.log('VITE_API_URL env var:', import.meta.env.VITE_API_URL);
console.log('Environment:', import.meta.env.MODE);
console.log('Is production:', import.meta.env.PROD);

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`Making API request to: ${url}`);
      console.log('Request config:', { method: config.method || 'GET', headers: config.headers });
      
      const response = await fetch(url, config);
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError);
          throw new Error('Invalid JSON response from server');
        }
      } else {
        // If it's not JSON, read as text
        const textResponse = await response.text();
        console.error('Non-JSON response received:', textResponse.substring(0, 200));
        throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 100)}`);
      }

      if (!response.ok) {
        console.error('API Error Response:', data);
        // For validation errors, return the error response instead of throwing
        if (response.status === 400 && data.errors) {
          return {
            success: false,
            message: data.message || 'Validation failed',
            errors: data.errors
          };
        }
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      console.log('API Success Response:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      console.error('Request URL:', url);
      console.error('Request config:', config);
      throw error;
    }
  }

  // Test connectivity
  async testConnection(): Promise<ApiResponse> {
    return this.request('/test');
  }

  async getHealth(): Promise<ApiResponse> {
    return this.request('/health');
  }

  async ping(): Promise<ApiResponse> {
    return this.request('/ping');
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data && typeof response.data === 'object' && 'token' in response.data) {
      this.setToken((response.data as any).token);
    }

    return response;
  }

  async loginWithGoogle(googleData: {
    googleId: string;
    email: string;
    fullName: string;
    profilePhoto?: string;
    givenName?: string;
    familyName?: string;
  }): Promise<ApiResponse> {
    const response = await this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleData),
    });

    if (response.success && response.data && typeof response.data === 'object' && 'token' in response.data) {
      this.setToken((response.data as any).token);
    }

    return response;
  }

  async register(userData: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<ApiResponse> {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data && typeof response.data === 'object' && 'token' in response.data) {
      this.setToken((response.data as any).token);
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });

    this.clearToken();
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return this.request('/auth/me');
  }

  async updateProfile(userData: any): Promise<ApiResponse> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Helper function to transform MongoDB data to frontend format
  private transformJobData(job: any): any {
    return {
      ...job,
      id: job._id || job.id,
      postedDate: job.createdAt || job.postedDate,
      applicantCount: job.applications?.length || 0
    };
  }

  // Job methods
  async getJobs(params?: {
    page?: number;
    limit?: number;
    category?: string;
    location?: string;
    skills?: string[];
    minRate?: number;
    maxRate?: number;
    experienceLevel?: string;
    isRemote?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => queryParams.append(key, item));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const response = await this.request(`/jobs?${queryParams.toString()}`);
    
    // Transform job data if successful
    if (response.success && response.data && typeof response.data === 'object' && response.data !== null && 'jobs' in response.data) {
      const data = response.data as { jobs: any[] };
      data.jobs = data.jobs.map((job: any) => this.transformJobData(job));
    }
    
    return response;
  }

  async getJobById(id: string): Promise<ApiResponse> {
    const response = await this.request(`/jobs/${id}`);
    
    // Transform job data if successful
    if (response.success && response.data && typeof response.data === 'object' && response.data !== null && 'job' in response.data) {
      const data = response.data as { job: any };
      data.job = this.transformJobData(data.job);
    }
    
    return response;
  }

  async getFeaturedJobs(limit?: number): Promise<ApiResponse> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await this.request(`/jobs/featured${params}`);
    
    // Transform job data if successful
    if (response.success && response.data && typeof response.data === 'object' && response.data !== null && 'jobs' in response.data) {
      const data = response.data as { jobs: any[] };
      data.jobs = data.jobs.map((job: any) => this.transformJobData(job));
    }
    
    return response;
  }

  async getJobCategories(): Promise<ApiResponse> {
    return this.request('/jobs/categories');
  }

  async createJob(jobData: any): Promise<ApiResponse> {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateJob(id: string, jobData: any): Promise<ApiResponse> {
    return this.request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async deleteJob(id: string): Promise<ApiResponse> {
    return this.request(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  async getJobsByEmployer(employerId?: string, params?: any): Promise<ApiResponse> {
    const endpoint = employerId ? `/jobs/employer/${employerId}` : '/jobs/employer';
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await this.request(`${endpoint}?${queryParams.toString()}`);
    
    // Transform job data if successful
    if (response.success && response.data && typeof response.data === 'object' && response.data !== null && 'jobs' in response.data) {
      const data = response.data as { jobs: any[] };
      data.jobs = data.jobs.map((job: any) => this.transformJobData(job));
    }
    
    return response;
  }

  // Application methods
  async getUserApplications(): Promise<ApiResponse> {
    return this.request('/applications/user');
  }

  async getApplications(params?: any): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/applications?${queryParams.toString()}`);
  }

  async submitApplication(jobId: string, applicationData: any): Promise<ApiResponse> {
    return this.request(`/applications/job/${jobId}`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async getApplicationById(id: string): Promise<ApiResponse> {
    return this.request(`/applications/${id}`);
  }

  async updateApplicationStatus(id: string, statusData: any): Promise<ApiResponse> {
    return this.request(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  async withdrawApplication(id: string): Promise<ApiResponse> {
    return this.request(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  async getJobApplications(jobId: string, params?: any): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/applications/job/${jobId}?${queryParams.toString()}`);
  }

  // Blog methods
  async getBlogs(params?: any): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => queryParams.append(key, item));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    return this.request(`/blogs?${queryParams.toString()}`);
  }

  async getBlogById(id: string): Promise<ApiResponse> {
    return this.request(`/blogs/${id}`);
  }

  async getFeaturedBlogs(limit?: number): Promise<ApiResponse> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/blogs/featured${params}`);
  }

  async getBlogCategories(): Promise<ApiResponse> {
    return this.request('/blogs/categories');
  }

  async getRelatedBlogs(id: string, limit?: number): Promise<ApiResponse> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/blogs/${id}/related${params}`);
  }

  async createBlog(blogData: any): Promise<ApiResponse> {
    return this.request('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  }

  async updateBlog(id: string, blogData: any): Promise<ApiResponse> {
    return this.request(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData),
    });
  }

  async deleteBlog(id: string): Promise<ApiResponse> {
    return this.request(`/blogs/${id}`, {
      method: 'DELETE',
    });
  }

  async addComment(blogId: string, commentData: any): Promise<ApiResponse> {
    return this.request(`/blogs/${blogId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  async getBlogComments(blogId: string, params?: any): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/blogs/${blogId}/comments?${queryParams.toString()}`);
  }

  async likeBlog(id: string): Promise<ApiResponse> {
    return this.request(`/blogs/${id}/like`, {
      method: 'POST',
    });
  }

  // User methods
  async getUserById(id: string): Promise<ApiResponse> {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, userData: any): Promise<ApiResponse> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getUserDashboard(): Promise<ApiResponse> {
    return this.request('/users/dashboard');
  }

  async getUserStats(id?: string): Promise<ApiResponse> {
    const endpoint = id ? `/users/stats/${id}` : '/users/stats';
    return this.request(endpoint);
  }



  // Token management
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }



  async addBlogComment(id: string, commentData: any): Promise<ApiResponse> {
    return this.request(`/blogs/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  async toggleLikeBlog(id: string): Promise<ApiResponse> {
    return this.request(`/blogs/${id}/like`, {
      method: 'POST',
    });
  }

  async toggleBookmarkBlog(id: string): Promise<ApiResponse> {
    return this.request(`/blogs/${id}/bookmark`, {
      method: 'POST',
    });
  }

  async getUserBlogInteractions(blogIds: string[]): Promise<ApiResponse> {
    return this.request('/blogs/interactions', {
      method: 'POST',
      body: JSON.stringify({ blogIds }),
    });
  }

  // Community Post methods
  async getCommunityPosts(params?: any): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/community?${queryParams.toString()}`);
  }

  async getCommunityPostById(id: string): Promise<ApiResponse> {
    return this.request(`/community/${id}`);
  }

  async createCommunityPost(postData: any): Promise<ApiResponse> {
    return this.request('/community', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updateCommunityPost(id: string, postData: any): Promise<ApiResponse> {
    return this.request(`/community/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deleteCommunityPost(id: string): Promise<ApiResponse> {
    return this.request(`/community/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleLikeCommunityPost(id: string): Promise<ApiResponse> {
    return this.request(`/community/${id}/like`, {
      method: 'POST',
    });
  }

  async addCommunityComment(postId: string, commentData: any): Promise<ApiResponse> {
    return this.request(`/community/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  async getCommunityPostComments(postId: string, params?: any): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/community/${postId}/comments?${queryParams.toString()}`);
  }

  async getCommunityTags(): Promise<ApiResponse> {
    return this.request('/community/tags');
  }

  // Enhanced Community Hub methods
  async getEnhancedCommunityPosts(params?: {
    page?: number;
    limit?: number;
    sortBy?: 'newest' | 'trending' | 'top' | 'most_helpful' | 'expert_endorsed' | 'professional_relevance';
    search?: string;
    category?: string;
    type?: 'discussion' | 'question' | 'insight' | 'announcement' | 'project' | 'mentorship';
    industry?: string;
    skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    skills?: string[];
    author?: string;
    isMentorshipRequest?: boolean;
    isTrending?: boolean;
    isFeatured?: boolean;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => queryParams.append(key, item));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    return this.request(`/community-enhanced/posts?${queryParams.toString()}`);
  }

  async getEnhancedCommunityPostById(id: string): Promise<ApiResponse> {
    return this.request(`/community-enhanced/posts/${id}`);
  }

  async createEnhancedCommunityPost(postData: {
    title: string;
    content: string;
    category: string;
    type?: 'discussion' | 'question' | 'insight' | 'announcement' | 'project' | 'mentorship';
    tags?: string[];
    professionalContext?: {
      industry?: string;
      skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      relatedSkills?: string[];
      jobRelevance?: boolean;
      projectConnection?: string;
    };
    mentorship?: {
      isMentorshipRequest?: boolean;
      menteeLevel?: 'beginner' | 'intermediate' | 'advanced';
      preferredMentorSkills?: string[];
      mentorshipType?: 'career' | 'technical' | 'business' | 'general';
    };
  }): Promise<ApiResponse> {
    return this.request('/community-enhanced/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updateEnhancedCommunityPost(id: string, postData: any): Promise<ApiResponse> {
    return this.request(`/community-enhanced/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deleteEnhancedCommunityPost(id: string): Promise<ApiResponse> {
    return this.request(`/community-enhanced/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleEnhancedPostLike(id: string): Promise<ApiResponse> {
    return this.request(`/community-enhanced/posts/${id}/like`, {
      method: 'POST',
    });
  }

  async addHelpfulVote(id: string): Promise<ApiResponse> {
    return this.request(`/community-enhanced/posts/${id}/helpful`, {
      method: 'POST',
    });
  }

  async addExpertEndorsement(id: string): Promise<ApiResponse> {
    return this.request(`/community-enhanced/posts/${id}/expert-endorsement`, {
      method: 'POST',
    });
  }

  async togglePostBookmark(id: string): Promise<ApiResponse> {
    return this.request(`/community-enhanced/posts/${id}/bookmark`, {
      method: 'POST',
    });
  }

  async sharePost(id: string): Promise<ApiResponse> {
    return this.request(`/community-enhanced/posts/${id}/share`, {
      method: 'POST',
    });
  }

  async getTrendingPosts(limit?: number): Promise<ApiResponse> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/community-enhanced/posts/trending${params}`);
  }

  async getPostsByProfessionalContext(params?: {
    industry?: string;
    skillLevel?: string;
    skills?: string[];
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => queryParams.append(key, item));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    return this.request(`/community-enhanced/posts/professional-context?${queryParams.toString()}`);
  }

  async getUserBookmarks(params?: { page?: number; limit?: number }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/community-enhanced/bookmarks?${queryParams.toString()}`);
  }

  // Community Categories
  async getCommunityCategories(parentOnly?: boolean): Promise<ApiResponse> {
    const params = parentOnly ? '?parentOnly=true' : '';
    return this.request(`/community-enhanced/categories${params}`);
  }

  async createCommunityCategory(categoryData: {
    name: string;
    description: string;
    icon?: string;
    color?: string;
    parentCategory?: string;
  }): Promise<ApiResponse> {
    return this.request('/community-enhanced/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  // User Reputation
  async getUserReputation(): Promise<ApiResponse> {
    return this.request('/community-enhanced/reputation');
  }

  async getReputationLeaderboard(params?: {
    limit?: number;
    timeframe?: 'weekly' | 'monthly' | 'yearly' | 'alltime';
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/community-enhanced/reputation/leaderboard?${queryParams.toString()}`);
  }

  // Community Badges
  async getCommunityBadges(params?: {
    category?: 'contribution' | 'expertise' | 'leadership' | 'mentorship' | 'special';
    isActive?: boolean;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/community-enhanced/badges?${queryParams.toString()}`);
  }

  async createCommunityBadge(badgeData: {
    name: string;
    description: string;
    icon: string;
    color: string;
    category: 'contribution' | 'expertise' | 'leadership' | 'mentorship' | 'special';
    requirements: {
      type: 'points' | 'posts' | 'comments' | 'likes' | 'helpful' | 'expert' | 'mentorship' | 'events';
      value: number;
      timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'alltime';
    };
    isRare?: boolean;
  }): Promise<ApiResponse> {
    return this.request('/community-enhanced/badges', {
      method: 'POST',
      body: JSON.stringify(badgeData),
    });
  }

  // Community Events
  async getCommunityEvents(params?: {
    page?: number;
    limit?: number;
    status?: 'upcoming' | 'live' | 'completed' | 'cancelled';
    type?: 'discussion' | 'workshop' | 'networking' | 'challenge' | 'qna';
    category?: string;
    host?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/community-enhanced/events?${queryParams.toString()}`);
  }

  async createCommunityEvent(eventData: {
    title: string;
    description: string;
    category: string;
    type: 'discussion' | 'workshop' | 'networking' | 'challenge' | 'qna';
    startDate: string;
    endDate?: string;
    maxParticipants?: number;
    tags?: string[];
    isPublic?: boolean;
    requirements?: {
      minReputation?: number;
      requiredSkills?: string[];
      maxParticipants?: number;
    };
    location?: {
      type: 'online' | 'physical';
      address?: string;
      meetingLink?: string;
    };
    agenda?: Array<{
      time: string;
      title: string;
      description?: string;
      speaker?: string;
    }>;
    resources?: Array<{
      title: string;
      url: string;
      type: 'document' | 'video' | 'link';
    }>;
  }): Promise<ApiResponse> {
    return this.request('/community-enhanced/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async joinCommunityEvent(id: string): Promise<ApiResponse> {
    return this.request(`/community-enhanced/events/${id}/join`, {
      method: 'POST',
    });
  }

  async leaveCommunityEvent(id: string): Promise<ApiResponse> {
    return this.request(`/community-enhanced/events/${id}/leave`, {
      method: 'POST',
    });
  }

  async submitEventFeedback(id: string, feedbackData: {
    rating: number;
    comment?: string;
  }): Promise<ApiResponse> {
    return this.request(`/community-enhanced/events/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  }

  // Connection methods (Gang Members)
  async sendConnectionRequest(recipientId: string): Promise<ApiResponse> {
    return this.request('/connections/request', {
      method: 'POST',
      body: JSON.stringify({ recipientId }),
    });
  }

  async acceptConnectionRequest(connectionId: string): Promise<ApiResponse> {
    return this.request(`/connections/accept/${connectionId}`, {
      method: 'POST',
    });
  }

  async rejectConnectionRequest(connectionId: string): Promise<ApiResponse> {
    return this.request(`/connections/reject/${connectionId}`, {
      method: 'POST',
    });
  }

  async cancelConnectionRequest(connectionId: string): Promise<ApiResponse> {
    return this.request(`/connections/cancel/${connectionId}`, {
      method: 'POST',
    });
  }

  async removeConnection(connectionId: string): Promise<ApiResponse> {
    return this.request(`/connections/${connectionId}`, {
      method: 'DELETE',
    });
  }

  async getUserConnections(status?: string): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (status) {
      queryParams.append('status', status);
    }
    return this.request(`/connections/my-connections?${queryParams.toString()}`);
  }

  async getPendingRequests(type?: 'sent' | 'received'): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (type) {
      queryParams.append('type', type);
    }
    return this.request(`/connections/pending-requests?${queryParams.toString()}`);
  }

  // Follow methods (Employee to Employer)
  async followEmployer(employerId: string): Promise<ApiResponse> {
    return this.request('/connections/follow', {
      method: 'POST',
      body: JSON.stringify({ employerId }),
    });
  }

  async unfollowEmployer(followId: string): Promise<ApiResponse> {
    return this.request(`/connections/follow/${followId}`, {
      method: 'DELETE',
    });
  }

  async getUserFollows(): Promise<ApiResponse> {
    return this.request('/connections/my-follows');
  }

  async getConnectionStatus(userId: string): Promise<ApiResponse> {
    return this.request(`/connections/status/${userId}`);
  }

  async getAvailableEmployees(search?: string, page?: number, limit?: number): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (search) {
      queryParams.append('search', search);
    }
    if (page) {
      queryParams.append('page', page.toString());
    }
    if (limit) {
      queryParams.append('limit', limit.toString());
    }
    return this.request(`/connections/discover?${queryParams.toString()}`);
  }

  // Enhanced Gang Members methods
  async getConnectionRecommendations(page?: number, limit?: number): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (page) {
      queryParams.append('page', page.toString());
    }
    if (limit) {
      queryParams.append('limit', limit.toString());
    }
    return this.request(`/connections/recommendations?${queryParams.toString()}`);
  }

  async dismissRecommendation(recommendationId: string): Promise<ApiResponse> {
    return this.request(`/connections/recommendations/${recommendationId}/dismiss`, {
      method: 'POST',
    });
  }

  async getConnectionAnalytics(): Promise<ApiResponse> {
    return this.request('/connections/analytics');
  }

  async getMutualConnections(userId: string): Promise<ApiResponse> {
    return this.request(`/connections/mutual/${userId}`);
  }

  async bulkConnectionActions(action: 'connect' | 'follow', userIds: string[]): Promise<ApiResponse> {
    return this.request('/connections/bulk-actions', {
      method: 'POST',
      body: JSON.stringify({ action, userIds }),
    });
  }

  // Unified Integration methods
  async getUnifiedActivityFeed(page?: number, limit?: number): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    return this.request(`/integration/activity-feed?${queryParams.toString()}`);
  }

  async getCrossModuleRecommendations(): Promise<ApiResponse> {
    return this.request('/integration/recommendations');
  }

  async getUserContext(): Promise<ApiResponse> {
    return this.request('/integration/user-context');
  }

  async updateIntegrationPreferences(preferences: any): Promise<ApiResponse> {
    return this.request('/integration/preferences', {
      method: 'PUT',
      body: JSON.stringify({ preferences }),
    });
  }

  async trackActivity(module: string, action: string, targetId?: string, targetType?: string, metadata?: any): Promise<ApiResponse> {
    return this.request('/integration/track-activity', {
      method: 'POST',
      body: JSON.stringify({ module, action, targetId, targetType, metadata }),
    });
  }

  async getNetworkInsights(): Promise<ApiResponse> {
    return this.request('/integration/network-insights');
  }

  // Search methods
  async globalSearch(params: {
    q: string;
    type?: 'all' | 'jobs' | 'users' | 'blogs' | 'community';
    page?: number;
    limit?: number;
    location?: string;
    category?: string;
    skills?: string[];
    minRate?: number;
    maxRate?: number;
    experienceLevel?: string;
    isRemote?: boolean;
    userRole?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(key, item.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
    return this.request(`/search?${queryParams.toString()}`);
  }

  async getSearchSuggestions(query: string, type?: string): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (type) {
      queryParams.append('type', type);
    }
    return this.request(`/search/suggestions?${queryParams.toString()}`);
  }

  async getTrendingSearches(): Promise<ApiResponse> {
    return this.request('/search/trending');
  }

  async getSearchFilters(): Promise<ApiResponse> {
    return this.request('/search/filters');
  }

  // Messaging methods
  async getConversations(page?: number, limit?: number): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    return this.request(`/v1/messages/conversations?${queryParams.toString()}`);
  }

  async createConversation(data: {
    participants: string[];
    title?: string;
    conversationType?: 'direct' | 'group' | 'job_related';
    job?: string;
  }): Promise<ApiResponse> {
    return this.request('/v1/messages/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMessages(conversationId: string, page?: number, limit?: number): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    return this.request(`/v1/messages/conversations/${conversationId}/messages?${queryParams.toString()}`);
  }

  async sendMessage(conversationId: string, data: {
    content: string;
    messageType?: 'text' | 'image' | 'file' | 'system';
    attachments?: string[];
    replyTo?: string;
  }): Promise<ApiResponse> {
    return this.request(`/v1/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markMessagesAsRead(conversationId: string): Promise<ApiResponse> {
    return this.request(`/v1/messages/conversations/${conversationId}/read`, {
      method: 'PUT',
    });
  }

  async editMessage(messageId: string, content: string): Promise<ApiResponse> {
    return this.request(`/v1/messages/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteMessage(messageId: string): Promise<ApiResponse> {
    return this.request(`/v1/messages/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async getConversationParticipants(conversationId: string): Promise<ApiResponse> {
    return this.request(`/v1/messages/conversations/${conversationId}/participants`);
  }

  async deleteConversation(conversationId: string): Promise<ApiResponse> {
    return this.request(`/v1/messages/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }

  async getUnreadCount(): Promise<ApiResponse> {
    return this.request('/v1/messages/unread-count');
  }

  // Enhanced messaging methods
  async addReaction(messageId: string, reactionType: string): Promise<ApiResponse> {
    return this.request(`/v1/messages/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ reactionType }),
    });
  }

  async createThread(conversationId: string, data: {
    parentMessageId: string;
    title?: string;
  }): Promise<ApiResponse> {
    return this.request(`/v1/messages/conversations/${conversationId}/threads`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async searchMessages(query: string, conversationId?: string, page?: number, limit?: number): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (conversationId) queryParams.append('conversationId', conversationId);
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    return this.request(`/v1/messages/search?${queryParams.toString()}`);
  }

  // Unified messaging integration methods
  async createJobConversation(data: {
    applicationId: string;
    jobId: string;
  }): Promise<ApiResponse> {
    return this.request('/v1/unified-messaging/job-conversation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createCommunityConversation(data: {
    postId: string;
    authorId: string;
  }): Promise<ApiResponse> {
    return this.request('/v1/unified-messaging/community-conversation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createGangConversation(data: {
    connectionId: string;
    targetUserId: string;
  }): Promise<ApiResponse> {
    return this.request('/v1/unified-messaging/gang-conversation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConversationSuggestions(): Promise<ApiResponse> {
    return this.request('/v1/unified-messaging/suggestions');
  }

  async getMessagingAnalytics(timeframe?: '7d' | '30d' | '90d'): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (timeframe) queryParams.append('timeframe', timeframe);
    return this.request(`/v1/unified-messaging/analytics?${queryParams.toString()}`);
  }

  async updateConnectionStrength(conversationId: string): Promise<ApiResponse> {
    return this.request(`/v1/unified-messaging/conversations/${conversationId}/connection-strength`, {
      method: 'PUT',
    });
  }

  // Wallet methods
  async getWallet(): Promise<ApiResponse> {
    return this.request('/wallet');
  }

  async getWalletTransactions(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    return this.request(`/wallet/transactions?${queryParams.toString()}`);
  }

  async getWalletStats(period?: number): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (period) queryParams.append('period', period.toString());
    return this.request(`/wallet/stats?${queryParams.toString()}`);
  }

  async createTopUpOrder(amount: number): Promise<ApiResponse> {
    return this.request('/wallet/topup', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<ApiResponse> {
    return this.request('/wallet/verify-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async withdrawFunds(data: {
    amount: number;
    bankDetails: {
      accountNumber: string;
      ifscCode: string;
      accountHolderName: string;
    };
  }): Promise<ApiResponse> {
    return this.request('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async transferFunds(data: {
    recipientId: string;
    amount: number;
    description?: string;
    relatedJobId?: string;
    relatedApplicationId?: string;
  }): Promise<ApiResponse> {
    return this.request('/wallet/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin methods
  async getDashboardAnalytics(period?: number): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (period) queryParams.append('period', period.toString());
    return this.request(`/admin/analytics/dashboard?${queryParams.toString()}`);
  }

  async getUserAnalytics(period?: number): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (period) queryParams.append('period', period.toString());
    return this.request(`/admin/analytics/users?${queryParams.toString()}`);
  }

  async getJobAnalytics(period?: number): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (period) queryParams.append('period', period.toString());
    return this.request(`/admin/analytics/jobs?${queryParams.toString()}`);
  }

  async getFinancialAnalytics(period?: number): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (period) queryParams.append('period', period.toString());
    return this.request(`/admin/analytics/financial?${queryParams.toString()}`);
  }

  async getModerationData(): Promise<ApiResponse> {
    return this.request('/admin/moderation');
  }

  async approveUserVerification(userId: string, status: 'approved' | 'rejected', reason?: string): Promise<ApiResponse> {
    return this.request(`/admin/verification/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
  }

  async approveJob(jobId: string, status: 'approved' | 'rejected', reason?: string): Promise<ApiResponse> {
    return this.request(`/admin/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
  }

  async moderateCommunityContent(contentType: 'post' | 'comment', contentId: string, action: 'approve' | 'reject' | 'delete', reason?: string): Promise<ApiResponse> {
    return this.request(`/admin/moderate/${contentType}/${contentId}`, {
      method: 'PUT',
      body: JSON.stringify({ action, reason }),
    });
  }

  // Verification methods
  async getMyVerifications(): Promise<ApiResponse> {
    return this.request('/verification/my-verifications');
  }

  async submitVerification(data: {
    type: 'identity' | 'employment' | 'education' | 'company';
    documents: Array<{
      type: string;
      url: string;
      filename: string;
    }>;
    additionalData?: any;
  }): Promise<ApiResponse> {
    return this.request('/verification/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getVerificationById(id: string): Promise<ApiResponse> {
    return this.request(`/verification/${id}`);
  }

  async deleteVerification(id: string): Promise<ApiResponse> {
    return this.request(`/verification/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin verification methods
  async getAllVerifications(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    return this.request(`/verification/admin/all?${queryParams.toString()}`);
  }

  async updateVerification(id: string, data: {
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    notes?: string;
  }): Promise<ApiResponse> {
    return this.request(`/verification/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getVerificationStats(): Promise<ApiResponse> {
    return this.request('/verification/admin/stats');
  }

  // Notification methods
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.unreadOnly) queryParams.append('unreadOnly', params.unreadOnly.toString());
    return this.request(`/notifications?${queryParams.toString()}`);
  }

  async getNotificationStats(): Promise<ApiResponse> {
    return this.request('/notifications/stats');
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse> {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(id: string): Promise<ApiResponse> {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  async clearAllNotifications(): Promise<ApiResponse> {
    return this.request('/notifications', {
      method: 'DELETE',
    });
  }

  async getNotificationSettings(): Promise<ApiResponse> {
    return this.request('/notifications/settings');
  }

  async updateNotificationSettings(settings: any): Promise<ApiResponse> {
    return this.request('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
  }

  // Unified notification methods
  async getUnifiedNotifications(params?: {
    page?: number;
    limit?: number;
    module?: string;
    priority?: string;
    unreadOnly?: boolean;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.module) queryParams.append('module', params.module);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.unreadOnly) queryParams.append('unreadOnly', params.unreadOnly.toString());
    return this.request(`/v1/unified-notifications/notifications?${queryParams.toString()}`);
  }

  async markUnifiedNotificationAsRead(notificationId: string): Promise<ApiResponse> {
    return this.request(`/v1/unified-notifications/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllUnifiedNotificationsAsRead(): Promise<ApiResponse> {
    return this.request('/v1/unified-notifications/notifications/read-all', {
      method: 'PUT',
    });
  }

  async getNotificationPreferences(): Promise<ApiResponse> {
    return this.request('/v1/unified-notifications/preferences');
  }

  async updateNotificationPreferences(preferences: any): Promise<ApiResponse> {
    return this.request('/v1/unified-notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async getCrossModuleActivity(params?: {
    page?: number;
    limit?: number;
    module?: string;
    timeframe?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.module) queryParams.append('module', params.module);
    if (params?.timeframe) queryParams.append('timeframe', params.timeframe);
    return this.request(`/v1/unified-notifications/activity?${queryParams.toString()}`);
  }

  async getSmartNotificationSuggestions(): Promise<ApiResponse> {
    return this.request('/v1/unified-notifications/suggestions');
  }

  async getNotificationAnalytics(timeframe?: string): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (timeframe) queryParams.append('timeframe', timeframe);
    return this.request(`/v1/unified-notifications/analytics?${queryParams.toString()}`);
  }

  // Unified user context methods
  async getUnifiedUserContext(): Promise<ApiResponse> {
    return this.request('/v1/unified-context/context');
  }

  async getCrossModuleActivitySummary(timeframe?: string): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (timeframe) queryParams.append('timeframe', timeframe);
    return this.request(`/v1/unified-context/activity-summary?${queryParams.toString()}`);
  }

  async getUserNetworkInsights(): Promise<ApiResponse> {
    return this.request('/v1/unified-context/network-insights');
  }

  async getEcosystemIntegrationStatus(): Promise<ApiResponse> {
    return this.request('/v1/unified-context/integration-status');
  }

  async updateUserPreferences(preferences: any): Promise<ApiResponse> {
    return this.request('/v1/unified-context/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // ===== COMMUNITY HUB INTEGRATION METHODS =====

  // Message post author
  async messagePostAuthor(postId: string, targetUserId: string): Promise<ApiResponse> {
    return this.request(`/v1/community-enhanced/posts/${postId}/message-author`, {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    });
  }

  // Invite gang to discussion
  async inviteGangToDiscussion(postId: string, gangMemberIds: string[]): Promise<ApiResponse> {
    return this.request(`/v1/community-enhanced/posts/${postId}/invite-gang`, {
      method: 'POST',
      body: JSON.stringify({ gangMemberIds }),
    });
  }

  // Get personalized discussions
  async getPersonalizedDiscussions(limit: number = 10): Promise<ApiResponse> {
    return this.request(`/v1/community-enhanced/posts/personalized?limit=${limit}`);
  }

  // Update cross-module activity
  async updateCrossModuleActivity(module: string, action: string, data: any): Promise<ApiResponse> {
    return this.request('/v1/community-enhanced/activity', {
      method: 'POST',
      body: JSON.stringify({ module, action, data }),
    });
  }
}

// Create and export a singleton instance
export const apiService = new ApiService(API_BASE_URL);
export default apiService;
