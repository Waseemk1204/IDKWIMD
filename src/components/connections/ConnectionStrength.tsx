import React from 'react';
import { TrendingUp, MessageCircle, Users2, Star, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface ConnectionStrengthProps {
  strength: number;
  messageCount: number;
  lastInteraction: string;
  mutualConnections: number;
  sharedJobApplications: number;
  skillEndorsements: number;
  profileViews: number;
  contentInteractions: number;
}

export const ConnectionStrength: React.FC<ConnectionStrengthProps> = ({
  strength,
  messageCount,
  lastInteraction,
  mutualConnections,
  sharedJobApplications,
  skillEndorsements,
  profileViews,
  contentInteractions
}) => {
  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return 'text-green-600 dark:text-green-400';
    if (strength >= 60) return 'text-blue-600 dark:text-blue-400';
    if (strength >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getStrengthBgColor = (strength: number) => {
    if (strength >= 80) return 'bg-green-500';
    if (strength >= 60) return 'bg-blue-500';
    if (strength >= 40) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getStrengthLabel = (strength: number) => {
    if (strength >= 80) return 'Strong';
    if (strength >= 60) return 'Good';
    if (strength >= 40) return 'Moderate';
    return 'Weak';
  };

  const getStrengthBadgeVariant = (strength: number) => {
    if (strength >= 80) return 'success';
    if (strength >= 60) return 'primary';
    if (strength >= 40) return 'warning';
    return 'secondary';
  };

  const formatLastInteraction = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Connection Strength
        </h3>
        <Badge variant={getStrengthBadgeVariant(strength)}>
          {getStrengthLabel(strength)}
        </Badge>
      </div>

      {/* Strength Meter */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Strength
          </span>
          <span className={`text-2xl font-bold ${getStrengthColor(strength)}`}>
            {strength}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getStrengthBgColor(strength)}`}
            style={{ width: `${strength}%` }}
          ></div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{messageCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Messages</p>
        </div>
        
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Users2 className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{mutualConnections}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Mutual</p>
        </div>
        
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{skillEndorsements}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Endorsements</p>
        </div>
        
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{sharedJobApplications}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Shared Jobs</p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Last Interaction</span>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatLastInteraction(lastInteraction)}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Profile Views</span>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {profileViews}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Content Interactions</span>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {contentInteractions}
          </span>
        </div>
      </div>

      {/* Strength Breakdown */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Strength Factors
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Message Activity</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {messageCount > 50 ? 'High' : messageCount > 20 ? 'Medium' : 'Low'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Network Overlap</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {mutualConnections > 10 ? 'High' : mutualConnections > 5 ? 'Medium' : 'Low'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Recent Activity</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatLastInteraction(lastInteraction).includes('Today') || 
               formatLastInteraction(lastInteraction).includes('Yesterday') ? 'High' : 
               formatLastInteraction(lastInteraction).includes('days ago') ? 'Medium' : 'Low'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

