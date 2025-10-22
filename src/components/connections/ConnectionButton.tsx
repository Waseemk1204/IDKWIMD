import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, UserX, Heart, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/api';

interface ConnectionButtonProps {
  targetUserId: string;
  targetUserRole: 'employee' | 'employer';
  className?: string;
}

type ConnectionStatus = 'none' | 'connected' | 'pending_sent' | 'pending_received' | 'following' | 'loading';

export const ConnectionButton: React.FC<ConnectionButtonProps> = ({
  targetUserId,
  targetUserRole,
  className = ''
}) => {
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<ConnectionStatus>('loading');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && targetUserId !== user._id) {
      checkConnectionStatus();
    } else {
      setStatus('none');
    }
  }, [isAuthenticated, user, targetUserId]);

  const checkConnectionStatus = async () => {
    try {
      const response = await apiService.getConnectionStatus(targetUserId);
      if (response.success) {
        setStatus(response.data.status);
      } else {
        setStatus('none');
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      setStatus('none');
    }
  };

  const handleConnectionAction = async (action: string) => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    try {
      setIsLoading(true);
      let response;

      switch (action) {
        case 'connect':
          response = await apiService.sendConnectionRequest(targetUserId);
          break;
        case 'accept':
          // This would need the connection ID, which we'd need to get from the status response
          // For now, we'll handle this in the GangMembers page
          break;
        case 'reject':
          // This would need the connection ID
          break;
        case 'cancel':
          // This would need the connection ID
          break;
        case 'remove':
          // This would need the connection ID
          break;
        case 'follow':
          response = await apiService.followEmployer(targetUserId);
          break;
        case 'unfollow':
          // This would need the follow ID
          break;
        default:
          return;
      }

      if (response?.success) {
        await checkConnectionStatus();
      }
    } catch (error) {
      console.error(`Error ${action}ing:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button for own profile
  if (!isAuthenticated || !user || targetUserId === user._id) {
    return null;
  }

  // Don't show connection button for employers if current user is also an employer
  if (targetUserRole === 'employer' && user.role === 'employer') {
    return null;
  }

  const renderButton = () => {
    if (isLoading) {
      return (
        <Button variant="outline" size="sm" disabled className={className}>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading...
        </Button>
      );
    }

    switch (status) {
      case 'connected':
        return (
          <Button variant="outline" size="sm" className={className}>
            <UserCheck className="h-4 w-4 mr-2" />
            Connected
          </Button>
        );

      case 'pending_sent':
        return (
          <Button variant="outline" size="sm" disabled className={className}>
            <UserPlus className="h-4 w-4 mr-2" />
            Request Sent
          </Button>
        );

      case 'pending_received':
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleConnectionAction('accept')}
              className={className}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleConnectionAction('reject')}
              className={className}
            >
              <UserX className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        );

      case 'following':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleConnectionAction('unfollow')}
            className={className}
          >
            <Heart className="h-4 w-4 mr-2" />
            Following
          </Button>
        );

      case 'none':
      default:
        if (targetUserRole === 'employer' && user.role === 'employee') {
          return (
            <Button
              size="sm"
              onClick={() => handleConnectionAction('follow')}
              className={className}
            >
              <Heart className="h-4 w-4 mr-2" />
              Follow
            </Button>
          );
        } else if (targetUserRole === 'employee' && user.role === 'employee') {
          return (
            <Button
              size="sm"
              onClick={() => handleConnectionAction('connect')}
              className={className}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add to Gang
            </Button>
          );
        }
        return null;
    }
  };

  return renderButton();
};
