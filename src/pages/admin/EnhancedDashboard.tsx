import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Users, 
  Briefcase, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  UserCheck,
  Clock,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  ArrowRight,
  Calendar,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface DashboardAnalytics {
  overview: {
    totalUsers: number;
    totalEmployers: number;
    totalEmployees: number;
    totalJobs: number;
    totalApplications: number;
    totalTransactions: number;
    totalRevenue: number;
    pendingVerifications: number;
    pendingJobApprovals: number;
    activeDisputes: number;
  };
  growth: {
    newUsers: number;
    newJobs: number;
    newApplications: number;
    revenue: number;
    period: number;
  };
  metrics: {
    activeUsers: number;
    jobCompletionRate: number;
    applicationSuccessRate: number;
  };
}

interface UserAnalytics {
  registrationTrends: Array<{
    _id: { year: number; month: number; day: number };
    count: number;
  }>;
  roleDistribution: Array<{
    _id: string;
    count: number;
  }>;
  verificationStatus: Array<{
    _id: string;
    count: number;
  }>;
  topEarners: Array<{
    userId: string;
    name: string;
    email: string;
    totalEarnings: number;
  }>;
  activityLevels: Array<{
    _id: string;
    count: number;
  }>;
}

interface JobAnalytics {
  jobTrends: Array<{
    _id: { year: number; month: number; day: number };
    count: number;
  }>;
  jobStatusDistribution: Array<{
    _id: string;
    count: number;
  }>;
  categoryDistribution: Array<{
    _id: string;
    count: number;
  }>;
  topEmployers: Array<{
    employerId: string;
    name: string;
    email: string;
    jobCount: number;
  }>;
  jobDurationStats: {
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
  } | null;
}

interface FinancialAnalytics {
  revenueTrends: Array<{
    _id: { year: number; month: number; day: number };
    revenue: number;
  }>;
  transactionTypes: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  topEarningCategories: Array<{
    _id: string;
    totalEarnings: number;
  }>;
  walletStats: {
    totalBalance: number;
    avgBalance: number;
    activeWallets: number;
  } | null;
  monthlyRevenue: Array<{
    _id: { year: number; month: number };
    revenue: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const EnhancedDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [jobAnalytics, setJobAnalytics] = useState<JobAnalytics | null>(null);
  const [financialAnalytics, setFinancialAnalytics] = useState<FinancialAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [dashboardResponse, userResponse, jobResponse, financialResponse] = await Promise.all([
          apiService.getDashboardAnalytics(selectedPeriod),
          apiService.getUserAnalytics(selectedPeriod),
          apiService.getJobAnalytics(selectedPeriod),
          apiService.getFinancialAnalytics(selectedPeriod)
        ]);

        if (dashboardResponse.success) {
          setDashboardData(dashboardResponse.data);
        }

        if (userResponse.success) {
          setUserAnalytics(userResponse.data);
        }

        if (jobResponse.success) {
          setJobAnalytics(jobResponse.data);
        }

        if (financialResponse.success) {
          setFinancialAnalytics(financialResponse.data);
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      loadAnalytics();
    }
  }, [user, selectedPeriod]);

  const formatChartData = (data: Array<{ _id: { year: number; month: number; day: number }; count?: number; revenue?: number }>) => {
    return data.map(item => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
      value: item.count || item.revenue || 0
    }));
  };

  const formatMonthlyData = (data: Array<{ _id: { year: number; month: number }; revenue: number }>) => {
    return data.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      revenue: item.revenue
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <BarChart3 className="h-8 w-8 mr-3" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Comprehensive analytics and moderation tools
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                  <option value={365}>Last year</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'jobs', label: 'Jobs', icon: Briefcase },
              { id: 'financial', label: 'Financial', icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.overview.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{dashboardData.growth.newUsers} this {selectedPeriod === 7 ? 'week' : 'month'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.overview.totalJobs.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{dashboardData.growth.newJobs} this {selectedPeriod === 7 ? 'week' : 'month'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{dashboardData.overview.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +₹{dashboardData.growth.revenue.toLocaleString()} this {selectedPeriod === 7 ? 'week' : 'month'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.metrics.activeUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {((dashboardData.metrics.activeUsers / dashboardData.overview.totalUsers) * 100).toFixed(1)}% of total users
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Pending Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-yellow-200 dark:border-yellow-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Pending Verifications</CardTitle>
                  <UserCheck className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                    {dashboardData.overview.pendingVerifications}
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">
                    Review Requests
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">Pending Job Approvals</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                    {dashboardData.overview.pendingJobApprovals}
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">
                    Review Jobs
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-red-200 dark:border-red-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">Active Disputes</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                    {dashboardData.overview.activeDisputes}
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">
                    Resolve Disputes
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {dashboardData.metrics.jobCompletionRate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Percentage of jobs that have been completed successfully
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Application Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {dashboardData.metrics.applicationSuccessRate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Percentage of applications that have been accepted
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && userAnalytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Registration Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>User Registration Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatChartData(userAnalytics.registrationTrends)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Role Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>User Role Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={userAnalytics.roleDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ _id, count }) => `${_id}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {userAnalytics.roleDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Earners */}
            <Card>
              <CardHeader>
                <CardTitle>Top Earning Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userAnalytics.topEarners.slice(0, 10).map((earner, index) => (
                    <div key={earner.userId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{earner.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{earner.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          ₹{earner.totalEarnings.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && jobAnalytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Job Posting Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Posting Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={formatChartData(jobAnalytics.jobTrends)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Job Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {jobAnalytics.categoryDistribution.slice(0, 10).map((category, index) => (
                      <div key={category._id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{category._id}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{category.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Employers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Employers by Job Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobAnalytics.topEmployers.slice(0, 10).map((employer, index) => (
                    <div key={employer.employerId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{employer.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{employer.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600 dark:text-blue-400">
                          {employer.jobCount} jobs
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && financialAnalytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatChartData(financialAnalytics.revenueTrends)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                      <Line type="monotone" dataKey="value" stroke="#00C49F" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Revenue */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={formatMonthlyData(financialAnalytics.monthlyRevenue)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#FFBB28" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Wallet Statistics */}
            {financialAnalytics.walletStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Wallet Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{financialAnalytics.walletStats.totalBalance.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Average Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{financialAnalytics.walletStats.avgBalance.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Wallets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {financialAnalytics.walletStats.activeWallets.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
