import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { 
  Chrome, 
  Facebook,
  Building2,
  GraduationCap,
  X
} from 'lucide-react';

interface StandardizedSocialSignInProps {
  mode: 'login' | 'signup';
  onGoogleSignIn?: (role?: string) => void;
  onFacebookSignIn?: (role?: string) => void;
  onAppleSignIn?: (role?: string) => void;
  isLoading?: boolean;
  className?: string;
  defaultRole?: 'employer' | 'employee';
}

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelect: (role: 'employer' | 'employee') => void;
  provider: string;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onClose,
  onRoleSelect,
  provider
}) => {
  if (!isOpen) return null;

  const roles = [
    {
      id: 'employee' as const,
      title: 'I\'m looking for work',
      subtitle: 'Student or Professional',
      description: 'Find part-time jobs, internships, and freelance opportunities',
      icon: GraduationCap,
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'employer' as const,
      title: 'I\'m hiring talent',
      subtitle: 'Business or Recruiter',
      description: 'Post jobs and find skilled students and professionals',
      icon: Building2,
      color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Choose Your Role
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            To complete your {provider} sign-up, please select your role:
          </p>
          
          <div className="space-y-4">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => onRoleSelect(role.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 ${role.color}`}
                aria-label={`Select ${role.title}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${role.iconColor} bg-white dark:bg-neutral-800`}>
                    <role.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                      {role.title}
                    </h3>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      {role.subtitle}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500">
                      {role.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors focus:outline-none focus:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StandardizedSocialSignIn: React.FC<StandardizedSocialSignInProps> = ({
  mode,
  onGoogleSignIn,
  onFacebookSignIn,
  onAppleSignIn,
  isLoading = false,
  className = '',
  defaultRole
}) => {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'google' | 'facebook' | 'apple' | null>(null);

  const handleSocialSignIn = (provider: 'google' | 'facebook' | 'apple') => {
    if (mode === 'signup' && !defaultRole) {
      // Show role selection modal for social signup
      setSelectedProvider(provider);
      setShowRoleModal(true);
    } else {
      // Direct sign-in for login or when role is already selected
      const role = defaultRole || undefined;
      switch (provider) {
        case 'google':
          if (onGoogleSignIn) {
            onGoogleSignIn(role);
          } else {
            const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
            window.location.href = `${apiUrl}/api/oauth/google${role ? `?role=${role}` : ''}`;
          }
          break;
        case 'facebook':
          if (onFacebookSignIn) {
            onFacebookSignIn(role);
          } else {
            const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
            window.location.href = `${apiUrl}/api/oauth/facebook${role ? `?role=${role}` : ''}`;
          }
          break;
        case 'apple':
          if (onAppleSignIn) {
            onAppleSignIn(role);
          } else {
            const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
            window.location.href = `${apiUrl}/api/oauth/apple${role ? `?role=${role}` : ''}`;
          }
          break;
      }
    }
  };

  const handleRoleSelect = (role: 'employer' | 'employee') => {
    setShowRoleModal(false);
    
    if (selectedProvider) {
      switch (selectedProvider) {
        case 'google':
          if (onGoogleSignIn) {
            onGoogleSignIn(role);
          } else {
            const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
            window.location.href = `${apiUrl}/api/oauth/google?role=${role}`;
          }
          break;
        case 'facebook':
          if (onFacebookSignIn) {
            onFacebookSignIn(role);
          } else {
            const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
            window.location.href = `${apiUrl}/api/oauth/facebook?role=${role}`;
          }
          break;
        case 'apple':
          if (onAppleSignIn) {
            onAppleSignIn(role);
          } else {
            const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
            window.location.href = `${apiUrl}/api/oauth/apple?role=${role}`;
          }
          break;
      }
    }
    
    setSelectedProvider(null);
  };

  const socialProviders = [
    {
      id: 'google' as const,
      name: 'Google',
      icon: Chrome,
      className: 'bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 shadow-sm hover:shadow-md transition-all duration-200',
      iconClassName: 'text-red-500'
    },
    {
      id: 'facebook' as const,
      name: 'Facebook',
      icon: Facebook,
      className: 'bg-[#1877F2] hover:bg-[#166FE5] border border-[#1877F2] text-white shadow-sm hover:shadow-md transition-all duration-200',
      iconClassName: 'text-white'
    },
    {
      id: 'apple' as const,
      name: 'Apple',
      icon: () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      ),
      className: 'bg-black dark:bg-neutral-900 hover:bg-gray-800 dark:hover:bg-neutral-800 border border-black dark:border-neutral-700 text-white shadow-sm hover:shadow-md transition-all duration-200',
      iconClassName: 'text-white'
    }
  ];

  return (
    <>
      <div className={`space-y-3 ${className}`}>
        {socialProviders.map((provider) => (
          <Button
            key={provider.id}
            variant="outline"
            size="lg"
            onClick={() => handleSocialSignIn(provider.id)}
            disabled={isLoading}
            className={`w-full flex items-center justify-start space-x-4 py-4 px-6 rounded-lg font-medium text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 ${provider.className}`}
            aria-label={`${mode === 'login' ? 'Sign in' : 'Sign up'} with ${provider.name}`}
          >
            {provider.id === 'apple' ? (
              <provider.icon />
            ) : (
              <provider.icon className={`h-5 w-5 ${provider.iconClassName}`} />
            )}
            <span className="text-left">
              {mode === 'login' ? 'Sign in' : 'Sign up'} with {provider.name}
            </span>
          </Button>
        ))}
      </div>

      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setSelectedProvider(null);
        }}
        onRoleSelect={handleRoleSelect}
        provider={selectedProvider ? selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1) : ''}
      />
    </>
  );
};

export default StandardizedSocialSignIn;
