import React, { useState, useEffect } from 'react';
import { Bell, Settings, CheckCircle, AlertCircle, Clock, DollarSign, MessageSquare, Users, Briefcase, Star, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Switch } from '../ui/Switch';
import { Select } from '../ui/Select';
import { useAuth } from '../../hooks/useAuth';
import { apiService as api } from '../../services/api';

interface NotificationPreferences {
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  types: {
    [key: string]: {
      enabled: boolean;
      channels: string[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
    };
  };
  timing: {
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
      timezone: string;
    };
    maxFrequency: {
      enabled: boolean;
      maxPerHour: number;
      maxPerDay: number;
    };
    digest: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string;
    };
  };
  advanced: {
    smartGrouping: boolean;
    relevanceThreshold: number;
    aiRecommendations: boolean;
    crossModuleIntegration: boolean;
  };
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: Array<{ _id: string; count: number }>;
  byPriority: Array<{ _id: string; count: number }>;
  recentActivity: Array<{
    type: string;
    createdAt: string;
    'interaction.isRead': boolean;
    'smart.priority': string;
  }>;
}

export const NotificationSettings: React.FC = () => {
  const { user: _user } = useAuth(); // TODO: Use user for personalized settings
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'types' | 'timing' | 'advanced'>('general');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [preferencesRes, statsRes] = await Promise.all([
        api.getNotificationPreferences(),
        api.getNotificationStats()
      ]);

        if (preferencesRes.success) {
          setPreferences(preferencesRes.data);
        }

        if (statsRes.success) {
          setStats(statsRes.data);
        }
    } catch (error) {
      console.error('Failed to load notification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    setIsSaving(true);
    try {
      const response = await api.updateNotificationPreferences(preferences);
      
      if (response.success) {
        setPreferences(response.data);
        // Show success message
        console.log('Preferences saved successfully');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateChannelPreference = (channel: keyof NotificationPreferences['channels'], enabled: boolean) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      channels: {
        ...preferences.channels,
        [channel]: enabled
      }
    });
  };

  const updateTypePreference = (type: string, field: 'enabled' | 'priority', value: boolean | string) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      types: {
        ...preferences.types,
        [type]: {
          ...preferences.types[type],
          [field]: value
        }
      }
    });
  };

  const updateTimingPreference = (section: keyof NotificationPreferences['timing'], field: string, value: any) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      timing: {
        ...preferences.timing,
        [section]: {
          ...preferences.timing[section],
          [field]: value
        }
      }
    });
  };

  const updateAdvancedPreference = (field: keyof NotificationPreferences['advanced'], value: boolean | number) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      advanced: {
        ...preferences.advanced,
        [field]: value
      }
    });
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'jobApplication':
      case 'jobApproved':
      case 'jobRejected':
      case 'jobMatch':
        return <Briefcase className="h-4 w-4" />;
      case 'connectionRequest':
      case 'connectionAccepted':
        return <Users className="h-4 w-4" />;
      case 'newMessage':
      case 'messageReaction':
        return <MessageSquare className="h-4 w-4" />;
      case 'paymentReceived':
      case 'paymentSent':
        return <DollarSign className="h-4 w-4" />;
      case 'communityMention':
      case 'communityLike':
      case 'communityComment':
        return <Star className="h-4 w-4" />;
      case 'systemUpdate':
      case 'verificationUpdate':
        return <Shield className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'low':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading notification settings...</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to Load Settings
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Unable to load notification preferences. Please try again.
        </p>
        <Button onClick={loadData} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notification Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Customize how and when you receive notifications
          </p>
        </div>
        <Button
          onClick={savePreferences}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.unread}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.recentActivity.filter(a => {
                      const today = new Date();
                      const activityDate = new Date(a.createdAt);
                      return activityDate.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Types</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Object.keys(preferences.types).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { key: 'general', label: 'General', icon: Settings },
          { key: 'types', label: 'Types', icon: Bell },
          { key: 'timing', label: 'Timing', icon: Clock },
          { key: 'advanced', label: 'Advanced', icon: Star }
        ].map(tab => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.key as any)}
            className="flex-1"
            leftIcon={<tab.icon className="h-4 w-4" />}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delivery Channels
              </h3>
              <div className="space-y-4">
                {[
                  { key: 'push', label: 'Push Notifications', description: 'Browser and mobile push notifications' },
                  { key: 'email', label: 'Email', description: 'Email notifications and digests' },
                  { key: 'sms', label: 'SMS', description: 'Text message notifications (premium)' },
                  { key: 'inApp', label: 'In-App', description: 'Notifications within the application' }
                ].map(channel => (
                  <div key={channel.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {channel.label}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {channel.description}
                      </p>
                    </div>
                    <Switch
                      checked={preferences.channels[channel.key as keyof typeof preferences.channels]}
                      onCheckedChange={(checked) => updateChannelPreference(channel.key as keyof typeof preferences.channels, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notification Types */}
        {activeTab === 'types' && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notification Types
              </h3>
              <div className="space-y-4">
                {Object.entries(preferences.types).map(([type, config]) => (
                  <div key={type} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getNotificationTypeIcon(type)}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                            {type.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <Badge className={getPriorityColor(config.priority)}>
                            {config.priority}
                          </Badge>
                        </div>
                      </div>
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(checked) => updateTypePreference(type, 'enabled', checked)}
                      />
                    </div>
                    
                    {config.enabled && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Priority Level
                          </label>
                          <Select
                            value={config.priority}
                            onValueChange={(value) => updateTypePreference(type, 'priority', value)}
                            options={[
                              { value: 'low', label: 'Low' },
                              { value: 'medium', label: 'Medium' },
                              { value: 'high', label: 'High' },
                              { value: 'urgent', label: 'Urgent' }
                            ]}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timing Settings */}
        {activeTab === 'timing' && (
          <div className="space-y-6">
            {/* Quiet Hours */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Quiet Hours
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pause notifications during specific hours
                    </p>
                  </div>
                  <Switch
                    checked={preferences.timing.quietHours.enabled}
                    onCheckedChange={(checked) => updateTimingPreference('quietHours', 'enabled', checked)}
                  />
                </div>
                
                {preferences.timing.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={preferences.timing.quietHours.start}
                        onChange={(e) => updateTimingPreference('quietHours', 'start', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={preferences.timing.quietHours.end}
                        onChange={(e) => updateTimingPreference('quietHours', 'end', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Frequency Limits */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Frequency Limits
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Limit the number of notifications you receive
                    </p>
                  </div>
                  <Switch
                    checked={preferences.timing.maxFrequency.enabled}
                    onCheckedChange={(checked) => updateTimingPreference('maxFrequency', 'enabled', checked)}
                  />
                </div>
                
                {preferences.timing.maxFrequency.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Max per Hour
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={preferences.timing.maxFrequency.maxPerHour}
                        onChange={(e) => updateTimingPreference('maxFrequency', 'maxPerHour', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Max per Day
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={preferences.timing.maxFrequency.maxPerDay}
                        onChange={(e) => updateTimingPreference('maxFrequency', 'maxPerDay', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Digest Settings */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Email Digest
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive a summary of notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={preferences.timing.digest.enabled}
                    onCheckedChange={(checked) => updateTimingPreference('digest', 'enabled', checked)}
                  />
                </div>
                
                {preferences.timing.digest.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Frequency
                      </label>
                      <Select
                        value={preferences.timing.digest.frequency}
                        onValueChange={(value) => updateTimingPreference('digest', 'frequency', value)}
                        options={[
                          { value: 'daily', label: 'Daily' },
                          { value: 'weekly', label: 'Weekly' },
                          { value: 'monthly', label: 'Monthly' }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Time
                      </label>
                      <input
                        type="time"
                        value={preferences.timing.digest.time}
                        onChange={(e) => updateTimingPreference('digest', 'time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Advanced Settings */}
        {activeTab === 'advanced' && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Advanced Features
              </h3>
              <div className="space-y-4">
                {[
                  {
                    key: 'smartGrouping',
                    label: 'Smart Grouping',
                    description: 'Group similar notifications together to reduce clutter',
                    type: 'boolean' as const
                  },
                  {
                    key: 'aiRecommendations',
                    label: 'AI Recommendations',
                    description: 'Use AI to personalize notification content and timing',
                    type: 'boolean' as const
                  },
                  {
                    key: 'crossModuleIntegration',
                    label: 'Cross-Module Integration',
                    description: 'Show notifications from related features and modules',
                    type: 'boolean' as const
                  }
                ].map(feature => (
                  <div key={feature.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {feature.label}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                    <Switch
                      checked={preferences.advanced[feature.key as keyof typeof preferences.advanced] as boolean}
                      onCheckedChange={(checked) => updateAdvancedPreference(feature.key as keyof typeof preferences.advanced, checked)}
                    />
                  </div>
                ))}

                {/* Relevance Threshold */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Relevance Threshold
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Only show notifications above this relevance score (0-100)
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={preferences.advanced.relevanceThreshold}
                      onChange={(e) => updateAdvancedPreference('relevanceThreshold', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white min-w-0">
                      {preferences.advanced.relevanceThreshold}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
