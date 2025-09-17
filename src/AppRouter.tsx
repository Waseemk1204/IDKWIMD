import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';
// Public pages
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { OnboardingEmployer } from './pages/auth/OnboardingEmployer';
import { OnboardingEmployee } from './pages/auth/OnboardingEmployee';
// Employer pages
import { EmployerDashboard } from './pages/employer/Dashboard';
import { PostJob } from './pages/employer/PostJob';
import { EditJob } from './pages/employer/EditJob';
import { EmployerWallet } from './pages/employer/Wallet';
import { TimesheetApproval } from './pages/employer/TimesheetApproval';
import { JobManagement } from './pages/employer/JobManagement';
// Employee pages
import { EmployeeDashboard } from './pages/employee/Dashboard';
import { BrowseJobs } from './pages/employee/BrowseJobs';
import { JobDetails } from './pages/employee/JobDetails';
import { TimesheetSubmission } from './pages/employee/TimesheetSubmission';
import { EmployeeWallet } from './pages/employee/Wallet';
// Admin pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { VerificationRequests } from './pages/admin/VerificationRequests';
import { JobApproval } from './pages/admin/JobApproval';
import { DisputeManagement } from './pages/admin/DisputeManagement';
// Shared pages
import { Notifications } from './pages/shared/Notifications';
import { Profile } from './pages/shared/Profile';
import { AboutUs } from './pages/shared/AboutUs';
import { Blogs } from './pages/shared/Blogs';
import { BlogPostPage } from './pages/shared/BlogPost';
import { ContactUs } from './pages/shared/ContactUs';
import { CustomerSupport } from './pages/shared/CustomerSupport';
import { NotFound } from './pages/NotFound';
// Auth pages
import { OAuthCallback } from './pages/auth/OAuthCallback';
// Messaging pages
import { Inbox } from './pages/messaging/Inbox';
import { Conversation } from './pages/messaging/Conversation';
// Community pages
import { CommunityHub } from './pages/community/CommunityHub';
import { PostDetail } from './pages/community/PostDetail';
import { CreatePost } from './pages/community/CreatePost';
// Public Landing component that redirects logged-in users
const PublicLanding: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on user role
    if (user.role === 'employer') {
      return <Navigate to="/employer" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/employee" replace />;
    }
  }
  
  return <Landing />;
};

// Protected route component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: string;
}> = ({
  children,
  requiredRole
}) => {
  const {
    user,
    isAuthenticated,
    isLoading
  } = useAuth();
  
  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
};
export function AppRouter() {
  return <BrowserRouter future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLanding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding/employer" element={<OnboardingEmployer />} />
        <Route path="/onboarding/employee" element={<OnboardingEmployee />} />
        <Route path="/auth/success" element={<OAuthCallback />} />
        <Route path="/auth/error" element={<OAuthCallback />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:id" element={<BlogPostPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/help" element={<CustomerSupport />} />

        {/* Employer Routes */}
        <Route path="/employer" element={<ProtectedRoute requiredRole="employer">
              <DashboardLayout />
            </ProtectedRoute>}>
          <Route index element={<EmployerDashboard />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="jobs/:id/edit" element={<EditJob />} />
          <Route path="wallet" element={<EmployerWallet />} />
          <Route path="timesheets" element={<TimesheetApproval />} />
          <Route path="jobs" element={<JobManagement />} />
        </Route>

        {/* Employee Routes */}
        <Route path="/employee" element={<ProtectedRoute requiredRole="employee">
              <DashboardLayout />
            </ProtectedRoute>}>
          <Route index element={<EmployeeDashboard />} />
          <Route path="jobs" element={<BrowseJobs />} />
          <Route path="jobs/:id" element={<JobDetails />} />
          <Route path="timesheet" element={<TimesheetSubmission />} />
          <Route path="wallet" element={<EmployeeWallet />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin">
              <DashboardLayout />
            </ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="verification" element={<VerificationRequests />} />
          <Route path="job-approval" element={<JobApproval />} />
          <Route path="disputes" element={<DisputeManagement />} />
        </Route>

        {/* Messaging Routes - Available to all authenticated users */}
        <Route path="/messaging" element={<ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>}>
          <Route index element={<Inbox />} />
          <Route path=":id" element={<Conversation />} />
        </Route>

        {/* Community Routes - Available to all authenticated users */}
        <Route path="/community" element={<ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>}>
          <Route index element={<CommunityHub />} />
          <Route path="post/:id" element={<PostDetail />} />
          <Route path="create" element={<CreatePost />} />
        </Route>

        {/* Shared Routes */}
        <Route path="/notifications" element={<ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>}>
          <Route index element={<Notifications />} />
        </Route>
        <Route path="/profile" element={<ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>}>
          <Route index element={<Profile />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>;
}