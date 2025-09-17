import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, ElevatedCard, TrustCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TrustBadge, VerifiedBadge, SecureBadge } from '../../components/ui/TrustBadge';
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
  Building2,
  Target,
  Eye,
  MessageSquare,
  Calendar,
  DollarSign,
  UserCheck,
  UserX
} from 'lucide-react';

export const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Mock data for the dashboard
  const stats = {
    activeJobs: 3,
    totalApplications: 27,
    pendingTimesheets: 5,
    walletBalance: 25000,
    totalSpent: 45000,
    averageRating: 4.7,
    activeWorkers: 8
  };

  const recentApplications = [
    {
      id: 1,
      name: 'Aditya Sharma',
      position: 'Content Writer',
      date: '2 days ago',
      status: 'pending',
      rating: 4.8,
      experience: '2 years',
      skills: ['Blog Writing', 'SEO', 'Copywriting'],
      avatar: 'AS'
    },
    {
      id: 2,
      name: 'Janu Patel',
      position: 'Web Developer',
      date: '3 days ago',
      status: 'approved',
      rating: 4.9,
      experience: '3 years',
      skills: ['React', 'Node.js', 'TypeScript'],
      avatar: 'JP'
    },
    {
      id: 3,
      name: 'Rahul Singh',
      position: 'Digital Marketer',
      date: '1 week ago',
      status: 'rejected',
      rating: 4.2,
      experience: '1 year',
      skills: ['Social Media', 'PPC', 'Analytics'],
      avatar: 'RS'
    }
  ];

  const pendingTimesheets = [
    {
      id: 1,
      name: 'Janu Patel',
      date: 'Today',
      hours: 4,
      status: 'pending',
      job: 'Web Development',
      rate: 800
    },
    {
      id: 2,
      name: 'Vikram Mehta',
      date: 'Yesterday',
      hours: 5,
      status: 'pending',
      job: 'Content Writing',
      rate: 500
    },
    {
      id: 3,
      name: 'Sneha Gupta',
      date: 'Yesterday',
      hours: 3.5,
      status: 'pending',
      job: 'Data Entry',
      rate: 300
    }
  ];

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
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Company'}!</h1>
            <p className="text-primary-100 text-lg">
              Manage your team and find new talent to grow your business.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <VerifiedBadge size="lg" text="Verified Employer" />
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.averageRating}★</div>
              <div className="text-sm text-primary-100">Company Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Balance Alert */}
      {stats.walletBalance < 10000 && (
        <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-warning-600 dark:text-warning-400 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warning-800 dark:text-warning-200">
                Your wallet balance is running low. Add funds to ensure uninterrupted service.
              </p>
            </div>
            <Link to="/employer/wallet">
              <Button variant="outline" size="sm">
                Add Funds
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ElevatedCard hover className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Active Jobs</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.activeJobs}</p>
                <p className="text-xs text-success-600 dark:text-success-400 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +1 this week
                </p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                <Briefcase className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </ElevatedCard>

        <ElevatedCard hover className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-success-100 dark:bg-success-900/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Applications</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.totalApplications}</p>
                <p className="text-xs text-success-600 dark:text-success-400 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8 this week
                </p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-xl">
                <Users className="h-6 w-6 text-success-600" />
              </div>
            </div>
          </CardContent>
        </ElevatedCard>

        <ElevatedCard hover className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-warning-100 dark:bg-warning-900/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Pending Timesheets</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.pendingTimesheets}</p>
                <p className="text-xs text-warning-600 dark:text-warning-400 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Needs review
                </p>
              </div>
              <div className="p-3 bg-warning-100 dark:bg-warning-900/30 rounded-xl">
                <Clock className="h-6 w-6 text-warning-600" />
              </div>
            </div>
          </CardContent>
        </ElevatedCard>

        <ElevatedCard hover className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-trust-100 dark:bg-trust-900/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Wallet Balance</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">₹{stats.walletBalance.toLocaleString()}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Total spent: ₹{stats.totalSpent.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-trust-100 dark:bg-trust-900/30 rounded-xl">
                <Wallet className="h-6 w-6 text-trust-600" />
              </div>
            </div>
          </CardContent>
        </ElevatedCard>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <ElevatedCard hover className="h-full">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                    action.color === 'primary' ? 'bg-primary-100 dark:bg-primary-900/30' :
                    action.color === 'secondary' ? 'bg-secondary-100 dark:bg-secondary-900/30' :
                    action.color === 'warning' ? 'bg-warning-100 dark:bg-warning-900/30' :
                    'bg-trust-100 dark:bg-trust-900/30'
                  }`}>
                    <action.icon className={`h-6 w-6 ${
                      action.color === 'primary' ? 'text-primary-600' :
                      action.color === 'secondary' ? 'text-secondary-600' :
                      action.color === 'warning' ? 'text-warning-600' :
                      'text-trust-600'
                    }`} />
                  </div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
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
                      {timesheet.name.split(' ').map(n => n[0]).join('')}
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