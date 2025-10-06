import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { HelmetProvider } from 'react-helmet-async';

// Import all pages
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { OnboardingEmployee } from './pages/auth/OnboardingEmployee';
import { OnboardingEmployer } from './pages/auth/OnboardingEmployer';
import { NotFound } from './pages/NotFound';
import { PrivacyPolicy } from './pages/shared/PrivacyPolicy';

// Employee pages
import { EmployeeDashboard } from './pages/employee/Dashboard';
import { BrowseJobs } from './pages/employee/BrowseJobs';
import { JobDetails } from './pages/employee/JobDetails';
import { MyApplications } from './pages/employee/MyApplications';
import { GangMembers } from './pages/employee/GangMembers';
import { TimesheetSubmission } from './pages/employee/TimesheetSubmission';
import { EmployeeWallet } from './pages/employee/Wallet';

// Employer pages
import { EmployerDashboard } from './pages/employer/Dashboard';
import { PostJob } from './pages/employer/PostJob';
import { EditJob } from './pages/employer/EditJob';
import { JobManagement } from './pages/employer/JobManagement';
import { JobApplicants } from './pages/employer/JobApplicants';
import { TimesheetApproval } from './pages/employer/TimesheetApproval';
import { EmployerWallet } from './pages/employer/Wallet';

// Admin pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { EnhancedDashboard } from './pages/admin/EnhancedDashboard';
import { JobApproval } from './pages/admin/JobApproval';
import { VerificationRequests } from './pages/admin/VerificationRequests';
import { DisputeManagement } from './pages/admin/DisputeManagement';

// Community pages
import { CommunityHub } from './pages/community/CommunityHub';
import { CreatePost } from './pages/community/CreatePost';
import { PostDetail } from './pages/community/PostDetail';
import { CommunityDashboard } from './pages/community/CommunityDashboard';
import { CreateEnhancedPost } from './pages/community/CreateEnhancedPost';

// Messaging pages
import { Inbox } from './pages/messaging/Inbox';
import { Conversation } from './pages/messaging/Conversation';
import { Messaging } from './pages/Messaging';

// Shared pages
import { Profile } from './pages/shared/Profile';
import { EnhancedProfile } from './pages/shared/EnhancedProfile';
import { SearchPage } from './pages/shared/SearchPage';
import { Verification } from './pages/shared/Verification';
import { Wallet } from './pages/shared/Wallet';
import { BlogPostPage as BlogPost } from './pages/shared/BlogPost';
import { Blogs as BlogList } from './pages/shared/Blogs';
import { AboutUs as About } from './pages/shared/AboutUs';
import { ContactUs as Contact } from './pages/shared/ContactUs';
import { CustomerSupport as Help } from './pages/shared/CustomerSupport';

// Components
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicRoute } from './components/auth/PublicRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { DevelopmentNotice } from './components/ui/DevelopmentNotice';
import { StickyFeedbackButton } from './components/ui/StickyFeedbackButton';

// Import Analytics
import { Analytics } from '@vercel/analytics/react';

// Protected route wrapper
const ProtectedRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
};

// Public route wrapper
const PublicRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PublicRoute>
      {children}
    </PublicRoute>
  );
};

export function AppRouter() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <div className="min-h-screen bg-background">
                <DevelopmentNotice />
                <StickyFeedbackButton />
                
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<PublicRouteWrapper><Landing /></PublicRouteWrapper>} />
                  <Route path="/login" element={<PublicRouteWrapper><Login /></PublicRouteWrapper>} />
                  <Route path="/signup" element={<PublicRouteWrapper><Signup /></PublicRouteWrapper>} />
                  <Route path="/onboarding/employee" element={<ProtectedRouteWrapper><OnboardingEmployee /></ProtectedRouteWrapper>} />
                  <Route path="/onboarding/employer" element={<ProtectedRouteWrapper><OnboardingEmployer /></ProtectedRouteWrapper>} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/blogs" element={<BlogList />} />
                  <Route path="/blog/:id" element={<BlogPost />} />

                  {/* Employee Routes */}
                  <Route path="/employee/dashboard" element={<ProtectedRouteWrapper><EmployeeDashboard /></ProtectedRouteWrapper>} />
                  <Route path="/employee/jobs" element={<ProtectedRouteWrapper><BrowseJobs /></ProtectedRouteWrapper>} />
                  <Route path="/employee/jobs/:id" element={<ProtectedRouteWrapper><JobDetails /></ProtectedRouteWrapper>} />
                  <Route path="/employee/applications" element={<ProtectedRouteWrapper><MyApplications /></ProtectedRouteWrapper>} />
                  <Route path="/employee/gang-members" element={<ProtectedRouteWrapper><GangMembers /></ProtectedRouteWrapper>} />
                  <Route path="/employee/timesheet" element={<ProtectedRouteWrapper><TimesheetSubmission /></ProtectedRouteWrapper>} />
                  <Route path="/employee/wallet" element={<ProtectedRouteWrapper><EmployeeWallet /></ProtectedRouteWrapper>} />

                  {/* Employer Routes */}
                  <Route path="/employer/dashboard" element={<ProtectedRouteWrapper><EmployerDashboard /></ProtectedRouteWrapper>} />
                  <Route path="/employer/post-job" element={<ProtectedRouteWrapper><PostJob /></ProtectedRouteWrapper>} />
                  <Route path="/employer/edit-job/:id" element={<ProtectedRouteWrapper><EditJob /></ProtectedRouteWrapper>} />
                  <Route path="/employer/jobs" element={<ProtectedRouteWrapper><JobManagement /></ProtectedRouteWrapper>} />
                  <Route path="/employer/jobs/:id/applicants" element={<ProtectedRouteWrapper><JobApplicants /></ProtectedRouteWrapper>} />
                  <Route path="/employer/timesheet-approval" element={<ProtectedRouteWrapper><TimesheetApproval /></ProtectedRouteWrapper>} />
                  <Route path="/employer/wallet" element={<ProtectedRouteWrapper><EmployerWallet /></ProtectedRouteWrapper>} />

                  {/* Admin Routes */}
                  <Route path="/admin/dashboard" element={<ProtectedRouteWrapper><AdminDashboard /></ProtectedRouteWrapper>} />
                  <Route path="/admin/enhanced-dashboard" element={<ProtectedRouteWrapper><EnhancedDashboard /></ProtectedRouteWrapper>} />
                  <Route path="/admin/job-approval" element={<ProtectedRouteWrapper><JobApproval /></ProtectedRouteWrapper>} />
                  <Route path="/admin/verification-requests" element={<ProtectedRouteWrapper><VerificationRequests /></ProtectedRouteWrapper>} />
                  <Route path="/admin/disputes" element={<ProtectedRouteWrapper><DisputeManagement /></ProtectedRouteWrapper>} />

                  {/* Community Routes */}
                  <Route path="/community" element={<ProtectedRouteWrapper><CommunityHub /></ProtectedRouteWrapper>} />
                  <Route path="/community/dashboard" element={<ProtectedRouteWrapper><CommunityDashboard /></ProtectedRouteWrapper>} />
                  <Route path="/community/create-post" element={<ProtectedRouteWrapper><CreatePost /></ProtectedRouteWrapper>} />
                  <Route path="/community/create-enhanced-post" element={<ProtectedRouteWrapper><CreateEnhancedPost /></ProtectedRouteWrapper>} />
                  <Route path="/community/post/:id" element={<ProtectedRouteWrapper><PostDetail /></ProtectedRouteWrapper>} />

                  {/* Messaging Routes */}
                  <Route path="/messaging" element={<ProtectedRouteWrapper><Messaging /></ProtectedRouteWrapper>} />
                  <Route path="/messaging/inbox" element={<ProtectedRouteWrapper><Inbox /></ProtectedRouteWrapper>} />
                  <Route path="/messaging/conversation/:id" element={<ProtectedRouteWrapper><Conversation /></ProtectedRouteWrapper>} />

                  {/* Shared Routes */}
                  <Route path="/profile" element={<ProtectedRouteWrapper><Profile /></ProtectedRouteWrapper>} />
                  <Route path="/profile/enhanced" element={<ProtectedRouteWrapper><EnhancedProfile /></ProtectedRouteWrapper>} />
                  <Route path="/search" element={<ProtectedRouteWrapper><SearchPage /></ProtectedRouteWrapper>} />
                  <Route path="/verification" element={<ProtectedRouteWrapper><Verification /></ProtectedRouteWrapper>} />
                  <Route path="/wallet" element={<ProtectedRouteWrapper><Wallet /></ProtectedRouteWrapper>} />

                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                
                <Analytics />
              </div>
            </ErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}