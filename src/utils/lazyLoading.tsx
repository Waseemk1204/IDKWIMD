import React, { Suspense, lazy, ComponentType } from 'react';
import { SkeletonCard } from '../components/ui/Skeleton';

// Generic lazy loading wrapper with error boundary
interface LazyWrapperProps {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export const createLazyComponent = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFunc);

  return (props: P) => (
    <Suspense fallback={fallback || <SkeletonCard />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Error boundary for lazy components
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class LazyErrorBoundary extends React.Component<
  React.PropsWithChildren<LazyWrapperProps>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<LazyWrapperProps>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.errorFallback || (
        <div className="p-6 text-center">
          <div className="text-red-500 mb-2">Failed to load component</div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-blue-500 hover:underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for lazy loading with error boundary
export const withLazyLoading = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode,
  errorFallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFunc);

  return (props: P) => (
    <LazyErrorBoundary fallback={fallback} errorFallback={errorFallback}>
      <Suspense fallback={fallback || <SkeletonCard />}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyErrorBoundary>
  );
};

// Preload components for better performance
export const preloadComponent = (importFunc: () => Promise<any>) => {
  return () => {
    importFunc();
  };
};

// Route-based code splitting
export const createLazyRoute = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) => {
  return withLazyLoading(importFunc, fallback);
};

// Specific lazy components for the application
export const LazyJobDetails = createLazyComponent(
  () => import('../pages/employee/JobDetails').then(module => ({ default: module.JobDetails })),
  <SkeletonCard />
);

export const LazyProfile = createLazyComponent(
  () => import('../pages/shared/Profile').then(module => ({ default: module.Profile })),
  <SkeletonCard />
);

export const LazyMessaging = createLazyComponent(
  () => import('../pages/Messaging').then(module => ({ default: module.Messaging })),
  <SkeletonCard />
);

export const LazyConnections = createLazyComponent(
  () => import('../pages/employee/Connections').then(module => ({ default: module.Connections })),
  <SkeletonCard />
);

// Removed non-existent components

// Admin components (loaded only when needed)
export const LazyAdminDashboard = createLazyComponent(
  () => import('../pages/admin/Dashboard').then(module => ({ default: module.AdminDashboard })),
  <SkeletonCard />
);

// Removed non-existent admin components: Users, Jobs

// Employer components
export const LazyEmployerDashboard = createLazyComponent(
  () => import('../pages/employer/Dashboard').then(module => ({ default: module.EmployerDashboard })),
  <SkeletonCard />
);

// Removed non-existent employer components: Jobs, Applications

// Utility for preloading routes
export const preloadRoute = (routeName: string) => {
  const preloadMap: Record<string, () => Promise<any>> = {
    'job-details': () => import('../pages/employee/JobDetails'),
    'profile': () => import('../pages/shared/Profile'),
    'messaging': () => import('../pages/Messaging'),
    'connections': () => import('../pages/employee/Connections'),
    'admin-dashboard': () => import('../pages/admin/Dashboard'),
    'employer-dashboard': () => import('../pages/employer/Dashboard'),
  };

  const preloadFunc = preloadMap[routeName];
  if (preloadFunc) {
    preloadFunc();
  }
};

// Hook for preloading components on hover
export const usePreloadOnHover = (preloadFunc: () => void) => {
  const [hasPreloaded, setHasPreloaded] = React.useState(false);

  const handleMouseEnter = React.useCallback(() => {
    if (!hasPreloaded) {
      preloadFunc();
      setHasPreloaded(true);
    }
  }, [preloadFunc, hasPreloaded]);

  return { handleMouseEnter };
};
