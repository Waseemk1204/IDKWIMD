// API service for communicating with the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

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
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // For validation errors, return the error response instead of throwing
        if (response.status === 400 && data.errors) {
          return {
            success: false,
            message: data.message || 'Validation failed',
            errors: data.errors
          };
        }
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
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

  async register(userData: {
    name: string;
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
    if (response.success && response.data?.jobs) {
      response.data.jobs = response.data.jobs.map((job: any) => this.transformJobData(job));
    }
    
    return response;
  }

  async getJobById(id: string): Promise<ApiResponse> {
    const response = await this.request(`/jobs/${id}`);
    
    // Transform job data if successful
    if (response.success && response.data?.job) {
      response.data.job = this.transformJobData(response.data.job);
    }
    
    return response;
  }

  async getFeaturedJobs(limit?: number): Promise<ApiResponse> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await this.request(`/jobs/featured${params}`);
    
    // Transform job data if successful
    if (response.success && response.data?.jobs) {
      response.data.jobs = response.data.jobs.map((job: any) => this.transformJobData(job));
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
    if (response.success && response.data?.jobs) {
      response.data.jobs = response.data.jobs.map((job: any) => this.transformJobData(job));
    }
    
    return response;
  }

  // Application methods
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

  // Message methods
  async getConversations(params?: any): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/messages/conversations?${queryParams.toString()}`);
  }

  async createConversation(conversationData: any): Promise<ApiResponse> {
    return this.request('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify(conversationData),
    });
  }

  async getMessages(conversationId: string, params?: any): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/messages/conversations/${conversationId}/messages?${queryParams.toString()}`);
  }

  async sendMessage(conversationId: string, messageData: any): Promise<ApiResponse> {
    return this.request(`/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async markMessagesAsRead(conversationId: string): Promise<ApiResponse> {
    return this.request(`/messages/conversations/${conversationId}/read`, {
      method: 'PUT',
    });
  }

  async getUnreadCount(): Promise<ApiResponse> {
    return this.request('/messages/unread-count');
  }

  // Notification methods
  async getNotifications(params?: any): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/notifications?${queryParams.toString()}`);
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
}

// Create and export a singleton instance
export const apiService = new ApiService(API_BASE_URL);
export default apiService;
