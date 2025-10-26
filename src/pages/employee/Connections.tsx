import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserCheck, UserX, Heart, Search, Star, BarChart3 } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/layout/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/api';
import { ConnectionInsights } from '../../components/connections/ConnectionInsights';

interface User {
  _id: string;
  fullName: string;
  displayName?: string;
  username: string;
  email: string;
  profilePhoto?: string;
  role: string;
  company?: string;
  about?: string;
  skills?: string[];
}

interface Connection {
  _id: string;
  user: User;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Follow {
  _id: string;
  following: User;
  createdAt: string;
}

interface ConnectionRequest {
  _id: string;
  requester: User;
  recipient: User;
  status: string;
  createdAt: string;
}

export const Connections: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'connections' | 'requests' | 'follows' | 'discover' | 'recommendations' | 'analytics'>('discover');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [follows, setFollows] = useState<Follow[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'discover') {
      loadAvailableUsers();
    } else if (activeTab === 'recommendations') {
      loadRecommendations();
    } else if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [searchTerm, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'connections') {
        const response = await apiService.getUserConnections('accepted');
        if (response.success) {
          setConnections(response.data.connections || []);
        }
      } else if (activeTab === 'requests') {
        const [sentResponse, receivedResponse] = await Promise.all([
          apiService.getPendingRequests('sent'),
          apiService.getPendingRequests('received')
        ]);
        
        // Keep sent and received requests separate for proper display
        const sentRequests = sentResponse.data?.requests || [];
        const receivedRequests = receivedResponse.data?.requests || [];
        setPendingRequests([...sentRequests, ...receivedRequests]);
      } else if (activeTab === 'follows') {
        const response = await apiService.getUserFollows();
        if (response.success) {
          setFollows(response.data.follows || []);
        }
      } else if (activeTab === 'discover') {
        // Load available users (employees not connected)
        await loadAvailableUsers();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const response = await apiService.getAvailableEmployees(searchTerm);
      if (response.success) {
        setAvailableUsers(response.data.employees || []);
      }
    } catch (error) {
      console.error('Error loading available users:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await apiService.getConnectionRecommendations();
      if (response.success) {
        setRecommendations(response.data.recommendations || []);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await apiService.getConnectionAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleConnectionAction = async (action: string, connectionId: string) => {
    try {
      setActionLoading(connectionId);
      
      let response;
      switch (action) {
        case 'accept':
          response = await apiService.acceptConnectionRequest(connectionId);
          break;
        case 'reject':
          response = await apiService.rejectConnectionRequest(connectionId);
          break;
        case 'cancel':
          response = await apiService.cancelConnectionRequest(connectionId);
          break;
        case 'remove':
          response = await apiService.removeConnection(connectionId);
          break;
        default:
          return;
      }

      if (response.success) {
        await loadData();
      }
    } catch (error) {
      console.error(`Error ${action}ing connection:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      setActionLoading(userId);
      const response = await apiService.sendConnectionRequest(userId);
      if (response.success) {
        await loadData();
        // Refresh available users to remove the user we just sent a request to
        if (activeTab === 'discover') {
          await loadAvailableUsers();
        }
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFollowAction = async (followId: string) => {
    try {
      setActionLoading(followId);
      const response = await apiService.unfollowEmployer(followId);
      if (response.success) {
        await loadData();
      }
    } catch (error) {
      console.error('Error unfollowing employer:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismissRecommendation = async (recommendationId: string) => {
    try {
      setActionLoading(recommendationId);
      const response = await apiService.dismissRecommendation(recommendationId);
      if (response.success) {
        await loadRecommendations();
      }
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'warning' | 'success' | 'danger' | 'secondary', text: string }> = {
      pending: { variant: 'warning', text: 'Pending' },
      accepted: { variant: 'success', text: 'Connected' },
      rejected: { variant: 'danger', text: 'Rejected' },
      cancelled: { variant: 'secondary', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const renderRecommendations = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search recommendations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading recommendations...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No recommendations available</p>
          <p className="text-sm">We'll suggest connections based on your profile and network</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Found {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''}
          </p>
          {recommendations.map((recommendation) => (
            <Card key={recommendation._id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Avatar 
                    name={recommendation.recommendedUserId.fullName} 
                    src={recommendation.recommendedUserId.profilePhoto} 
                    size="md" 
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {recommendation.recommendedUserId.fullName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {recommendation.recommendedUserId.email}
                    </p>
                    {recommendation.recommendedUserId.headline && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {recommendation.recommendedUserId.headline}
                      </p>
                    )}
                    
                    {/* Recommendation reasons */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {recommendation.reasons.slice(0, 3).map((reason: any, index: number) => (
                        <div key={index} className="flex items-center space-x-1 text-xs text-gray-500">
                          <span>{reason.details}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="primary">{recommendation.score}% match</Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleSendRequest(recommendation.recommendedUserId._id)}
                      disabled={actionLoading === recommendation.recommendedUserId._id}
                    >
                      {actionLoading === recommendation.recommendedUserId._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Connect
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDismissRecommendation(recommendation._id)}
                      disabled={actionLoading === recommendation._id}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      ) : analytics ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Connections</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.summary.totalConnections}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Strong Connections</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.summary.strongConnections}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.summary.totalMessages}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Star className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg Strength</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.summary.avgStrength}%
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No analytics data available</p>
          <p className="text-sm">Analytics will appear as you build connections</p>
        </div>
      )}
    </div>
  );

  const renderConnections = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8">Loading connections...</div>
      ) : connections.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No connections yet</p>
          <p className="text-sm">Start connecting with other employees!</p>
        </div>
      ) : (
        connections.map((connection) => (
          <Card key={connection._id} className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Avatar name={connection.user.fullName} src={connection.user.profilePhoto} size="md" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {connection.user.fullName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {connection.user.email}
                  </p>
                  {connection.user.skills && connection.user.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {connection.user.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="primary" size="sm">{skill}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
                <div className="flex-shrink-0">
                  {getStatusBadge(connection.status)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConnectionAction('remove', connection._id)}
                  disabled={actionLoading === connection._id}
                  className="w-full sm:w-auto"
                >
                  <UserX className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8">Loading requests...</div>
      ) : pendingRequests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No pending requests</p>
        </div>
      ) : (
        pendingRequests.map((request) => {
          const isReceived = request.recipient._id === user?._id;
          const otherUser = isReceived ? request.requester : request.recipient;
          
          return (
            <Card key={request._id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Avatar name={otherUser.fullName} src={otherUser.profilePhoto} size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {otherUser.fullName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {otherUser.email}
                    </p>
                    <p className="text-xs text-gray-400">
                      {isReceived ? `${otherUser.fullName} sent you a request` : `You sent a request to ${otherUser.fullName}`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
                  <div className="flex-shrink-0">
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {isReceived && request.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConnectionAction('accept', request._id)}
                          disabled={actionLoading === request._id}
                          className="w-full sm:w-auto"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConnectionAction('reject', request._id)}
                          disabled={actionLoading === request._id}
                          className="w-full sm:w-auto"
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {!isReceived && request.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConnectionAction('cancel', request._id)}
                        disabled={actionLoading === request._id}
                        className="w-full sm:w-auto"
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );

  const renderFollows = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8">Loading follows...</div>
      ) : follows.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Not following any employers yet</p>
          <p className="text-sm">Follow employers to stay updated on their posts and jobs!</p>
        </div>
      ) : (
        follows.map((follow) => (
          <Card key={follow._id} className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Avatar name={follow.following.fullName} src={follow.following.profilePhoto} size="md" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {follow.following.fullName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {follow.following.email}
                  </p>
                  {follow.following.company && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 truncate">
                      {follow.following.company}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
                <div className="flex-shrink-0">
                  <Badge variant="success">Following</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFollowAction(follow._id)}
                  disabled={actionLoading === follow._id}
                  className="w-full sm:w-auto"
                >
                  <UserX className="h-4 w-4 mr-1" />
                  Unfollow
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  const renderDiscover = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search employees by name, email, or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading available employees...</p>
        </div>
      ) : availableUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No available employees found</p>
          <p className="text-sm">
            {searchTerm ? 'Try adjusting your search terms' : 'All employees might already be connected!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Found {availableUsers.length} available employee{availableUsers.length !== 1 ? 's' : ''}
          </p>
          {availableUsers.map((user) => (
            <Card key={user._id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Avatar name={user.fullName} src={user.profilePhoto} size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {user.fullName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                    {user.about && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {user.about}
                      </p>
                    )}
                    {user.skills && user.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.skills.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="primary" size="sm">{skill}</Badge>
                        ))}
                        {user.skills.length > 4 && (
                          <Badge variant="secondary" size="sm">+{user.skills.length - 4} more</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleSendRequest(user._id)}
                    disabled={actionLoading === user._id}
                    className="w-full sm:w-auto"
                  >
                    {actionLoading === user._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'recommendations', label: 'Recommendations', icon: Star, count: recommendations.length },
    { id: 'discover', label: 'Discover', icon: Search, count: availableUsers.length },
    { id: 'connections', label: 'My Connections', icon: Users, count: connections.length },
    { id: 'requests', label: 'Requests', icon: UserPlus, count: pendingRequests.length },
    { id: 'follows', label: 'Following', icon: Heart, count: follows.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, count: analytics?.summary.totalConnections || 0 }
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <PageHeader
          title="My Connections"
          description="Connect with other employees and follow employers to stay updated"
        />

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex flex-wrap gap-2 sm:gap-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  {tab.count > 0 && (
                    <Badge variant="primary" size="sm">{tab.count}</Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'recommendations' && renderRecommendations()}
        {activeTab === 'discover' && renderDiscover()}
        {activeTab === 'connections' && renderConnections()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'follows' && renderFollows()}
        {activeTab === 'analytics' && renderAnalytics()}
        
        {/* Connection Insights Modal */}
        {showInsights && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <ConnectionInsights 
                targetUserId={showInsights} 
                onClose={() => setShowInsights(null)} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
