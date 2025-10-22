import React, { useState, useEffect } from 'react';
import { Lightbulb, Briefcase, Users, Heart, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import apiService from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface CrossModuleRecommendation {
  type: 'job' | 'connection' | 'community';
  title: string;
  description: string;
  reason: string;
  relevanceScore: number;
  data: any;
  sourceModule: string;
  targetModule: string;
}

interface CrossModuleRecommendationsProps {
  className?: string;
  showHeader?: boolean;
  limit?: number;
}

export const CrossModuleRecommendations: React.FC<CrossModuleRecommendationsProps> = ({
  className = '',
  showHeader = true
}) => {
  const { user: _user } = useAuth();
  const [recommendations, setRecommendations] = useState<CrossModuleRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'jobs' | 'connections' | 'community'>('all');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCrossModuleRecommendations();
      
      if (response.success) {
        const { jobRecommendations, connectionRecommendations, communityRecommendations } = response.data;
        
        const allRecommendations: CrossModuleRecommendation[] = [
          ...jobRecommendations.map((job: any) => ({
            type: 'job' as const,
            title: job.title,
            description: job.description,
            reason: 'Based on your gang member activity',
            relevanceScore: 85,
            data: job,
            sourceModule: 'gang',
            targetModule: 'jobs'
          })),
          ...connectionRecommendations.map((user: any) => ({
            type: 'connection' as const,
            title: user.fullName,
            description: user.headline || 'Active community member',
            reason: 'Shares interests with your network',
            relevanceScore: 75,
            data: user,
            sourceModule: 'community',
            targetModule: 'gang'
          })),
          ...communityRecommendations.map((post: any) => ({
            type: 'community' as const,
            title: post.title,
            description: post.content.substring(0, 100) + '...',
            reason: 'Relevant to your job interests',
            relevanceScore: 70,
            data: post,
            sourceModule: 'jobs',
            targetModule: 'community'
          }))
        ];

        setRecommendations(allRecommendations);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'job': return <Briefcase className="h-5 w-5 text-blue-500" />;
      case 'connection': return <Heart className="h-5 w-5 text-red-500" />;
      case 'community': return <Users className="h-5 w-5 text-green-500" />;
      default: return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'job': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'connection': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'community': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20';
    }
  };

  const getRelevanceBadge = (score: number) => {
    if (score >= 80) return <Badge variant="primary" className="bg-green-500">Highly Relevant</Badge>;
    if (score >= 70) return <Badge variant="secondary" className="bg-yellow-500">Relevant</Badge>;
    return <Badge variant="secondary">Somewhat Relevant</Badge>;
  };

  const handleRecommendationAction = async (recommendation: CrossModuleRecommendation) => {
    try {
      // Track the action
      await apiService.trackActivity(
        recommendation.targetModule,
        `recommendation_${recommendation.type}_clicked`,
        recommendation.data._id,
        recommendation.type,
        { recommendationId: recommendation.data._id }
      );

      // Navigate based on type
      switch (recommendation.type) {
        case 'job':
          window.location.href = `/employee/jobs/${recommendation.data._id}`;
          break;
        case 'connection':
          // Send connection request
          await apiService.sendConnectionRequest(recommendation.data._id);
          break;
        case 'community':
          window.location.href = `/community/${recommendation.data._id}`;
          break;
      }
    } catch (error) {
      console.error('Error handling recommendation action:', error);
    }
  };

  const filteredRecommendations = activeTab === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.type === activeTab);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Smart Recommendations
            </h2>
          </div>
          <Badge variant="secondary" className="text-sm">
            {filteredRecommendations.length} suggestions
          </Badge>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All', icon: Star },
          { key: 'jobs', label: 'Jobs', icon: Briefcase },
          { key: 'connections', label: 'Connections', icon: Heart },
          { key: 'community', label: 'Community', icon: Users }
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={activeTab === key ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(key as any)}
            className="flex items-center space-x-1"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Button>
        ))}
      </div>

      {/* Recommendations */}
      {filteredRecommendations.length === 0 ? (
        <Card className="p-8 text-center">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No recommendations yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            We'll suggest relevant content as you use the platform
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRecommendations.map((recommendation, index) => (
            <Card 
              key={index} 
              className={`p-4 hover:shadow-md transition-shadow border-l-4 ${getRecommendationColor(recommendation.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    {getRecommendationIcon(recommendation.type)}
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {recommendation.title}
                    </h3>
                    {getRelevanceBadge(recommendation.relevanceScore)}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {recommendation.description}
                  </p>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{recommendation.reason}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <ArrowRight className="h-3 w-3" />
                      <span>{recommendation.sourceModule} → {recommendation.targetModule}</span>
                    </span>
                  </div>
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleRecommendationAction(recommendation)}
                    className="whitespace-nowrap"
                  >
                    {recommendation.type === 'connection' ? 'Connect' : 'View'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

