import React, { useState, useEffect } from 'react';
import { Users2, Star, MapPin, Building, TrendingUp } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/api';

interface MutualConnection {
  _id: string;
  fullName: string;
  username: string;
  profilePhoto?: string;
}

interface ConnectionInsightsProps {
  targetUserId: string;
  onClose?: () => void;
}

export const ConnectionInsights: React.FC<ConnectionInsightsProps> = ({
  targetUserId,
  onClose
}) => {
  const { user } = useAuth();
  const [mutualConnections, setMutualConnections] = useState<MutualConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<{
    sharedSkills: string[];
    sameLocation: boolean;
    sameCompany: boolean;
    connectionStrength: number;
  } | null>(null);

  useEffect(() => {
    if (targetUserId) {
      loadInsights();
    }
  }, [targetUserId]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      
      // Get mutual connections
      const mutualResponse = await apiService.getMutualConnections(targetUserId);
      if (mutualResponse.success) {
        setMutualConnections(mutualResponse.data.mutualConnections || []);
      }

      // Get user details for comparison
      const userResponse = await apiService.getUserById(targetUserId);
      if (userResponse.success && user && userResponse.data.user) {
        const targetUser = userResponse.data.user;
        
        // Calculate insights
        const sharedSkills = user.skills.filter(skill => 
          targetUser.skills.some((targetSkill: string) => 
            targetSkill.toLowerCase().includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(targetSkill.toLowerCase())
          )
        );

        const sameLocation = user.location && targetUser.location && 
          user.location.toLowerCase() === targetUser.location.toLowerCase();

        const sameCompany = user.companyInfo?.companyName && targetUser.companyInfo?.companyName &&
          user.companyInfo.companyName.toLowerCase() === targetUser.companyInfo.companyName.toLowerCase();

        // Calculate connection strength based on various factors
        let strength = 0;
        if (mutualConnections.length > 0) strength += Math.min(30, mutualConnections.length * 5);
        if (sharedSkills.length > 0) strength += Math.min(25, sharedSkills.length * 5);
        if (sameLocation) strength += 15;
        if (sameCompany) strength += 20;

        setInsights({
          sharedSkills,
          sameLocation,
          sameCompany,
          connectionStrength: Math.min(100, strength)
        });
      }
    } catch (error) {
      console.error('Error loading connection insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return 'text-green-600 dark:text-green-400';
    if (strength >= 60) return 'text-blue-600 dark:text-blue-400';
    if (strength >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getStrengthLabel = (strength: number) => {
    if (strength >= 80) return 'Strong';
    if (strength >= 60) return 'Good';
    if (strength >= 40) return 'Moderate';
    return 'Weak';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading connection insights...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Connection Insights
        </h3>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Connection Strength */}
        {insights && (
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Connection Strength
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-lg font-bold ${getStrengthColor(insights.connectionStrength)}`}>
                {insights.connectionStrength}%
              </span>
              <Badge variant={insights.connectionStrength >= 60 ? 'success' : 'warning'}>
                {getStrengthLabel(insights.connectionStrength)}
              </Badge>
            </div>
          </div>
        )}

        {/* Mutual Connections */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Users2 className="h-5 w-5 text-gray-500" />
            <h4 className="font-medium text-gray-900 dark:text-white">
              Mutual Connections ({mutualConnections.length})
            </h4>
          </div>
          
          {mutualConnections.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No mutual connections found
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mutualConnections.slice(0, 6).map((connection) => (
                <div key={connection._id} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Avatar name={connection.fullName} src={connection.profilePhoto} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {connection.fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      @{connection.username}
                    </p>
                  </div>
                </div>
              ))}
              {mutualConnections.length > 6 && (
                <div className="flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    +{mutualConnections.length - 6} more
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Shared Skills */}
        {insights && insights.sharedSkills.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Star className="h-5 w-5 text-gray-500" />
              <h4 className="font-medium text-gray-900 dark:text-white">
                Shared Skills ({insights.sharedSkills.length})
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {insights.sharedSkills.map((skill, index) => (
                <Badge key={index} variant="primary" size="sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Location & Company */}
        {insights && (
          <div className="space-y-3">
            {insights.sameLocation && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  Both located in the same area
                </span>
              </div>
            )}
            
            {insights.sameCompany && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Shared company experience
                </span>
              </div>
            )}
          </div>
        )}

        {/* Connection Recommendations */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Why Connect?
          </h4>
          <div className="space-y-2">
            {mutualConnections.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Users2 className="h-4 w-4" />
                <span>{mutualConnections.length} mutual connection{mutualConnections.length !== 1 ? 's' : ''} can introduce you</span>
              </div>
            )}
            {insights && insights.sharedSkills.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Star className="h-4 w-4" />
                <span>Share {insights.sharedSkills.length} skill{insights.sharedSkills.length !== 1 ? 's' : ''} for collaboration</span>
              </div>
            )}
            {insights && insights.sameLocation && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Same location for potential meetups</span>
              </div>
            )}
            {insights && insights.sameCompany && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Building className="h-4 w-4" />
                <span>Shared company background</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

