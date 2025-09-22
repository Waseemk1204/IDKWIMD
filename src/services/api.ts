// API service for communicating with the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

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
    fullName: string;
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
    return this.request(`/messages/conversations?${queryParams.toString()}`);
  }

  async createConversation(data: {
    participants: string[];
    title?: string;
    conversationType?: 'direct' | 'group' | 'job_related';
    job?: string;
  }): Promise<ApiResponse> {
    return this.request('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMessages(conversationId: string, page?: number, limit?: number): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    return this.request(`/messages/conversations/${conversationId}/messages?${queryParams.toString()}`);
  }

  async sendMessage(conversationId: string, data: {
    content: string;
    messageType?: 'text' | 'image' | 'file' | 'system';
    attachments?: string[];
    replyTo?: string;
  }): Promise<ApiResponse> {
    return this.request(`/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markMessagesAsRead(conversationId: string): Promise<ApiResponse> {
    return this.request(`/messages/conversations/${conversationId}/read`, {
      method: 'PUT',
    });
  }

  async editMessage(messageId: string, content: string): Promise<ApiResponse> {
    return this.request(`/messages/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteMessage(messageId: string): Promise<ApiResponse> {
    return this.request(`/messages/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async getConversationParticipants(conversationId: string): Promise<ApiResponse> {
    return this.request(`/messages/conversations/${conversationId}/participants`);
  }

  async deleteConversation(conversationId: string): Promise<ApiResponse> {
    return this.request(`/messages/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }

  async getUnreadCount(): Promise<ApiResponse> {
    return this.request('/messages/unread-count');
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
}

// Create and export a singleton instance
export const apiService = new ApiService(API_BASE_URL);
export default apiService;
