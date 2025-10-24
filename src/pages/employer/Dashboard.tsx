import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CardContent, CardHeader, CardTitle, CardDescription, ElevatedCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { VerifiedBadge } from '../../components/ui/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { 
  Briefcase, 
  Users, 
  Clock, 
  Wallet, 
  AlertCircle, 
  ArrowRight, 
  Plus, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Star,
  Target,
  Eye
} from 'lucide-react';

export const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Real data will be loaded from API
  const [stats, _setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    pendingTimesheets: 0,
    walletBalance: 0,
    totalSpent: 0,
    averageRating: 0,
    activeWorkers: 0
  });

  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [_isLoading, _setIsLoading] = useState(true);
  
  // Load dashboard data from API
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // TODO: Implement API calls to load dashboard data
        // const [statsResponse, applicationsResponse] = await Promise.all([
        //   apiService.getEmployerStats(),
        //   apiService.getRecentApplications()
        // ]);
        // setStats(statsResponse.data.stats);
        // setRecentApplications(applicationsResponse.data.applications);
        
        // For now, set empty data
        setRecentApplications([]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        _setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);
  
  const [pendingTimesheets, _setPendingTimesheets] = useState<any[]>([]);

  const quickActions = [
    {
      title: 'Post New Job',
      description: 'Find talented students',
      icon: Plus,
      href: '/employer/post-job',
      color: 'primary'
    },
    {
      title: 'Manage Jobs',
      description: 'View all your jobs',
      icon: Briefcase,
      href: '/employer/jobs',
      color: 'secondary'
    },
    {
      title: 'Review Timesheets',
      description: 'Approve work hours',
      icon: Clock,
      href: '/employer/timesheets',
      color: 'warning'
    },
    {
      title: 'View Analytics',
      description: 'Track performance',
      icon: Target,
      href: '/employer/analytics',
      color: 'trust'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header - Simple & Professional */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <div className="flex items-center gap-4">
          {stats.averageRating > 0 && (
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-base font-medium text-gray-900 dark:text-white">
                {stats.averageRating.toFixed(1)}
              </span>
            </div>
          )}
          <VerifiedBadge size="sm" />
        </div>
      </div>

      {/* Wallet Balance Alert */}
      {stats.walletBalance < 10000 && (
        <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-warning-600 dark:text-warning-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warning-800 dark:text-warning-300">
                Your wallet balance is running low. Add funds to ensure uninterrupted service.
              </p>
            </div>
            <Link to="/employer/wallet">
              <Button variant="secondary" size="sm">
                Add Funds
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ElevatedCard>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Jobs</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{stats.activeJobs}</p>
              </div>
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <Briefcase className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </CardContent>
        </ElevatedCard>

        <ElevatedCard>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{stats.totalApplications}</p>
              </div>
              <div className="p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
                <Users className="h-6 w-6 text-success-600 dark:text-success-400" />
              </div>
            </div>
          </CardContent>
        </ElevatedCard>

        <ElevatedCard>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Timesheets</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{stats.pendingTimesheets}</p>
              </div>
              <div className="p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </CardContent>
        </ElevatedCard>

        <ElevatedCard>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Wallet Balance</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">₹{stats.walletBalance.toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Spent: ₹{stats.totalSpent.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
                <Wallet className="h-6 w-6 text-success-600 dark:text-success-400" />
              </div>
            </div>
          </CardContent>
        </ElevatedCard>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <ElevatedCard hover className="h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <action.icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                </CardContent>
              </ElevatedCard>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <ElevatedCard>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Recent Applications</CardTitle>
              <Link to="/employer/jobs">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {application.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {application.name}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {application.position} • {application.experience} experience
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center text-xs text-neutral-500">
                          <Star className="h-3 w-3 mr-1 fill-current text-warning-500" />
                          {application.rating}
                        </div>
                        <span className="text-xs text-neutral-500">•</span>
                        <span className="text-xs text-neutral-500">{application.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {application.status === 'pending' && (
                      <TrustBadge variant="pending" size="sm" text="Pending" />
                    )}
                    {application.status === 'approved' && (
                      <TrustBadge variant="verified" size="sm" text="Approved" />
                    )}
                    {application.status === 'rejected' && (
                      <TrustBadge variant="warning" size="sm" text="Rejected" />
                    )}
                    <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </ElevatedCard>

        {/* Pending Timesheets */}
        <ElevatedCard>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Pending Timesheets</CardTitle>
              <Link to="/employer/timesheets">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTimesheets.map((timesheet) => (
                <div key={timesheet.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-trust-500 to-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {timesheet.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {timesheet.name}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {timesheet.job} • {timesheet.hours} hours
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-neutral-500">{timesheet.date}</span>
                        <span className="text-xs text-neutral-500">•</span>
                        <span className="text-xs font-medium text-success-600">₹{timesheet.rate}/hr</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" leftIcon={<CheckCircle className="h-4 w-4 text-success-500" />}>
                      Approve
                    </Button>
                    <Button variant="outline" size="sm" leftIcon={<XCircle className="h-4 w-4 text-error-500" />}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </ElevatedCard>
      </div>

      {/* Team Performance */}
      <TrustCard>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-trust-600" />
            Team Performance
          </CardTitle>
          <CardDescription>
            Track your team's productivity and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/50 dark:bg-neutral-700/50 rounded-xl">
              <div className="text-3xl font-bold text-primary-600 mb-2">{stats.activeWorkers}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Active Workers</div>
              <div className="text-xs text-success-600 dark:text-success-400">+2 this month</div>
            </div>
            <div className="text-center p-6 bg-white/50 dark:bg-neutral-700/50 rounded-xl">
              <div className="text-3xl font-bold text-success-600 mb-2">{stats.averageRating}★</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Average Rating</div>
              <div className="text-xs text-success-600 dark:text-success-400">+0.2 this month</div>
            </div>
            <div className="text-center p-6 bg-white/50 dark:bg-neutral-700/50 rounded-xl">
              <div className="text-3xl font-bold text-trust-600 mb-2">₹{stats.totalSpent.toLocaleString()}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Spent</div>
              <div className="text-xs text-neutral-500">This month</div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Button variant="trust" size="md" rightIcon={<Target className="h-4 w-4" />}>
              View Detailed Analytics
            </Button>
          </div>
        </CardContent>
      </TrustCard>
    </div>
  );
};