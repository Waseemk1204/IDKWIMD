import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';
// Public pages
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { OnboardingEmployer as OnboardingEmployerOld } from './pages/auth/OnboardingEmployer';
import { OnboardingEmployee as OnboardingEmployeeOld } from './pages/auth/OnboardingEmployee';
import { AdditionalInfo } from './pages/auth/AdditionalInfo';
// New wizard-based onboarding
import { EmployeeOnboarding } from './pages/employee/Onboarding';
import { EmployerOnboarding } from './pages/employer/Onboarding';
// Employer pages
import { EmployerDashboard } from './pages/employer/Dashboard';
import { PostJob } from './pages/employer/PostJob';
import { EditJob } from './pages/employer/EditJob';
import { EmployerWallet } from './pages/employer/Wallet';
import { TimesheetApproval } from './pages/employer/TimesheetApproval';
import { JobManagement } from './pages/employer/JobManagement';
import { JobApplicants } from './pages/employer/JobApplicants';
// Employee pages
import { EmployeeDashboard } from './pages/employee/Dashboard';
import { BrowseJobs } from './pages/employee/BrowseJobs';
import { JobDetails } from './pages/employee/JobDetails';
import { MyApplications } from './pages/employee/MyApplications';
import { TimesheetSubmission } from './pages/employee/TimesheetSubmission';
import { EmployeeWallet } from './pages/employee/Wallet';
import { Connections } from './pages/employee/Connections';
import { UnifiedDashboardPage } from './pages/shared/UnifiedDashboard';
// Admin pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { VerificationRequests } from './pages/admin/VerificationRequests';
import { JobApproval } from './pages/admin/JobApproval';
import { DisputeManagement } from './pages/admin/DisputeManagement';
// Shared pages
// import { Notifications } from './pages/shared/Notifications';
import { EnhancedNotifications } from './pages/shared/EnhancedNotifications';
import { NotificationPreferences } from './pages/shared/NotificationPreferences';
import { EnhancedProfile } from './pages/shared/EnhancedProfile';
import { AboutUs } from './pages/shared/AboutUs';
import { Blogs } from './pages/shared/Blogs';
import { BlogPostPage } from './pages/shared/BlogPost';
import { ContactUs } from './pages/shared/ContactUs';
import { CustomerSupport } from './pages/shared/CustomerSupport';
import { SearchPage } from './pages/shared/SearchPage';
import { PrivacyPolicy } from './pages/shared/PrivacyPolicy';
import { NotFound } from './pages/NotFound';
// Auth pages
import { OAuthCallback } from './pages/auth/OAuthCallback';
import { GoogleAuthCallback } from './pages/auth/GoogleAuthCallback';
// UI Components
import { StickyFeedbackButton } from './components/ui/StickyFeedbackButton';
// Messaging pages
import { Comms } from './pages/Comms';
// Community pages
import { CommunityHub } from './pages/community/CommunityHub';
import { PostDetail } from './pages/community/PostDetail';
import { CreatePost } from './pages/community/CreatePost';
// Public Landing component that redirects logged-in users
const PublicLanding: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Check if there's a token in the URL (Google OAuth redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');
  
  // If there's a token in the URL, don't redirect - let AuthContext handle it
  if (tokenFromUrl) {
    console.log('PublicLanding - Token found in URL, waiting for AuthContext to process');
    return <Landing />;
  }
  
  // Only redirect if user is authenticated and no token processing is happening
  if (!isLoading && isAuthenticated && user) {
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
        <Route path="/additional-info" element={<AdditionalInfo />} />
        {/* New wizard-based onboarding */}
        <Route path="/onboarding/employer" element={<EmployerOnboarding />} />
        <Route path="/onboarding/employee" element={<EmployeeOnboarding />} />
        {/* Legacy onboarding (fallback) */}
        <Route path="/onboarding/employer/legacy" element={<OnboardingEmployerOld />} />
        <Route path="/onboarding/employee/legacy" element={<OnboardingEmployeeOld />} />
        <Route path="/auth/success" element={<OAuthCallback />} />
        <Route path="/auth/error" element={<OAuthCallback />} />
        <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:id" element={<BlogPostPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/help" element={<CustomerSupport />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* Employer Routes */}
        <Route path="/employer" element={<ProtectedRoute requiredRole="employer">
              <DashboardLayout />
            </ProtectedRoute>}>
          <Route index element={<EmployerDashboard />} />
          <Route path="dashboard" element={<EmployerDashboard />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="jobs/:id/edit" element={<EditJob />} />
          <Route path="jobs/:id/applicants" element={<JobApplicants />} />
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
          <Route path="applications" element={<MyApplications />} />
          <Route path="timesheet" element={<TimesheetSubmission />} />
          <Route path="wallet" element={<EmployeeWallet />} />
          <Route path="connections" element={<Connections />} />
        </Route>

        {/* Unified Dashboard - Available to all authenticated users */}
        <Route path="/unified-dashboard" element={<ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>}>
          <Route index element={<UnifiedDashboardPage />} />
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
        <Route path="/comms" element={<ProtectedRoute>
              <Comms />
            </ProtectedRoute>} />

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
          <Route index element={<EnhancedNotifications />} />
          <Route path="settings" element={<NotificationPreferences />} />
        </Route>
        <Route path="/profile" element={<ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>}>
          <Route index element={<EnhancedProfile />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <StickyFeedbackButton />
    </BrowserRouter>;
}