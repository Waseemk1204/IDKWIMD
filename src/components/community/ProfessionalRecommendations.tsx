import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { 
  LightbulbIcon, 
  TrendingUpIcon, 
  UsersIcon, 
  BriefcaseIcon,
  StarIcon,
  ArrowRightIcon,
  EyeIcon,
  MessageSquareIcon,
  AwardIcon,
  MapPinIcon,
  ClockIcon
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/api';

interface Recommendation {
  _id: string;
  recommendedUser: {
    _id: string;
    name: string;
    email: string;
    profilePhoto?: string;
    role: string;
    headline?: string;
    skills?: string[];
    location?: string;
  };
  score: number;
  reasons: string[];
  mutualConnections?: number;
  sharedSkills?: string[];
  sameLocation?: boolean;
  sameCompany?: boolean;
}

interface TrendingPost {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    profilePhoto?: string;
    role: string;
  };
  category: {
    name: string;
    color: string;
  };
  type: string;
  createdAt: string;
  likes: number;
  views: number;
  engagement: {
    helpfulVotes: number;
    expertEndorsements: number;
  };
  professionalContext?: {
    industry?: string;
    skillLevel?: string;
    relatedSkills?: string[];
  };
}

interface JobRecommendation {
  _id: string;
  title: string;
  company: string;
  location: string;
  hourlyRate: number;
  skills: string[];
  category: string;
  postedDate: string;
  views: number;
  applications: any[];
}

export const ProfessionalRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [connectionRecommendations, setConnectionRecommendations] = useState<Recommendation[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [jobRecommendations, setJobRecommendations] = useState<JobRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      
      // Load connection recommendations
      const connectionsResponse = await apiService.getConnectionRecommendations();
      if (connectionsResponse.success) {
        setConnectionRecommendations(connectionsResponse.data.recommendations || []);
      }

      // Load trending posts
      const postsResponse = await apiService.getTrendingPosts(5);
      if (postsResponse.success) {
        setTrendingPosts(postsResponse.data.posts || []);
      }

      // Load job recommendations based on user skills
      if (user?.skills && user.skills.length > 0) {
        const jobsResponse = await apiService.getJobs({
          skills: user.skills.slice(0, 3), // Use top 3 skills
          limit: 5,
          sortBy: 'newest'
        });
        if (jobsResponse.success) {
          setJobRecommendations(jobsResponse.data.jobs || []);
        }
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setError('Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const dismissRecommendation = async (recommendationId: string) => {
    try {
      await apiService.dismissRecommendation(recommendationId);
      setConnectionRecommendations(prev => 
        prev.filter(rec => rec._id !== recommendationId)
      );
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    }
  };

  const getTimeAgo = (date: string): string => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return postDate.toLocaleDateString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    if (score >= 40) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return <MessageSquareIcon className="h-4 w-4" />;
      case 'insight': return <LightbulbIcon className="h-4 w-4" />;
      case 'announcement': return <AwardIcon className="h-4 w-4" />;
      case 'project': return <BriefcaseIcon className="h-4 w-4" />;
      case 'mentorship': return <UsersIcon className="h-4 w-4" />;
      default: return <MessageSquareIcon className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-2">{error}</p>
          <Button onClick={loadRecommendations} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Recommendations */}
      {connectionRecommendations.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Recommended Connections
              </h3>
              <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full">
                {connectionRecommendations.length}
              </span>
            </div>
            <Link to="/gang-members">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRightIcon className="h-4 w-4" />}>
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {connectionRecommendations.slice(0, 3).map(recommendation => (
              <div key={recommendation._id} className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      name={recommendation.recommendedUser.name} 
                      src={recommendation.recommendedUser.profilePhoto} 
                      size="md" 
                    />
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                        {recommendation.recommendedUser.name}
                      </h4>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {recommendation.recommendedUser.headline || recommendation.recommendedUser.role}
                      </p>
                      {recommendation.recommendedUser.location && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                          <MapPinIcon className="h-3 w-3" />
                          {recommendation.recommendedUser.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(recommendation.score)}`}>
                      {recommendation.score}% match
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissRecommendation(recommendation._id)}
                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                    >
                      ×
                    </Button>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-2">
                    Why we recommend them:
                  </p>
                  <ul className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
                    {recommendation.reasons.slice(0, 3).map((reason, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <StarIcon className="h-3 w-3 text-yellow-500" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {recommendation.sharedSkills && recommendation.sharedSkills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                      Shared skills:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {recommendation.sharedSkills.slice(0, 3).map(skill => (
                        <span key={skill} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                      {recommendation.sharedSkills.length > 3 && (
                        <span className="px-2 py-1 bg-neutral-200 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400 text-xs rounded-full">
                          +{recommendation.sharedSkills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                    {recommendation.mutualConnections && (
                      <span className="flex items-center gap-1">
                        <UsersIcon className="h-4 w-4" />
                        {recommendation.mutualConnections} mutual connections
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/gang-members?connect=${recommendation.recommendedUser._id}`}>
                      <Button variant="primary" size="sm">
                        Connect
                      </Button>
                    </Link>
                    <Link to={`/profile/${recommendation.recommendedUser._id}`}>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Professional Content */}
      {trendingPosts.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Trending Professional Content
              </h3>
            </div>
            <Link to="/community-enhanced">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRightIcon className="h-4 w-4" />}>
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {trendingPosts.map(post => (
              <div key={post._id} className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar 
                      name={post.author.name} 
                      src={post.author.profilePhoto} 
                      size="sm" 
                    />
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {post.author.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {getTimeAgo(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2 py-1 text-xs font-medium text-white rounded-full"
                      style={{ backgroundColor: post.category.color }}
                    >
                      {post.category.name}
                    </span>
                    <span className="p-1 bg-neutral-200 dark:bg-neutral-600 rounded">
                      {getPostTypeIcon(post.type)}
                    </span>
                  </div>
                </div>
                
                <Link to={`/community-enhanced/post/${post._id}`}>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 hover:text-primary-600 dark:hover:text-primary-400 mb-2 line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2 mb-3">
                    {post.content}
                  </p>
                </Link>

                {post.professionalContext && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2 text-xs">
                      {post.professionalContext.industry && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                          {post.professionalContext.industry}
                        </span>
                      )}
                      {post.professionalContext.skillLevel && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                          {post.professionalContext.skillLevel}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4" />
                      {post.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <AwardIcon className="h-4 w-4" />
                      {post.engagement.expertEndorsements}
                    </span>
                  </div>
                  <Link to={`/community-enhanced/post/${post._id}`}>
                    <Button variant="ghost" size="sm">
                      Read More
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Recommendations */}
      {jobRecommendations.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BriefcaseIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Recommended Jobs
              </h3>
            </div>
            <Link to="/jobs">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRightIcon className="h-4 w-4" />}>
                View All Jobs
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {jobRecommendations.map(job => (
              <div key={job._id} className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                      {job.title}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      {job.company} • {job.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      ${job.hourlyRate}/hr
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {job.applications.length} applications
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {job.skills.slice(0, 4).map(skill => (
                      <span key={skill} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="px-2 py-1 bg-neutral-200 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400 text-xs rounded-full">
                        +{job.skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4" />
                      {job.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {getTimeAgo(job.postedDate)}
                    </span>
                  </div>
                  <Link to={`/jobs/${job._id}`}>
                    <Button variant="primary" size="sm">
                      View Job
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {connectionRecommendations.length === 0 && trendingPosts.length === 0 && jobRecommendations.length === 0 && (
        <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
          <div className="text-center py-8">
            <LightbulbIcon className="h-12 w-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              No recommendations yet
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              Complete your profile and start engaging with the community to get personalized recommendations
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/profile">
                <Button variant="primary">
                  Complete Profile
                </Button>
              </Link>
              <Link to="/community-enhanced">
                <Button variant="outline">
                  Explore Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

