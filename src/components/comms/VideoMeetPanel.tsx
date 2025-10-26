import React, { useState } from 'react';
import { Video, Users, Copy, Check, Calendar, Clock, Link as LinkIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';

export const VideoMeetPanel: React.FC = () => {
  const { user } = useAuth();
  const [meetingLink, setMeetingLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateInstantMeeting = async () => {
    setIsCreating(true);
    try {
      const roomId = `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const link = `${window.location.origin}/meet/${roomId}`;
      setMeetingLink(link);
      
      // Open in new window
      window.open(`/meet/${roomId}`, '_blank');
    } catch (error) {
      console.error('Error creating meeting:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMeeting = () => {
    const roomId = prompt('Enter meeting ID or link:');
    if (roomId) {
      // Extract room ID from link if full URL provided
      const match = roomId.match(/\/meet\/([^\/]+)/);
      const finalRoomId = match ? match[1] : roomId;
      window.open(`/meet/${finalRoomId}`, '_blank');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="h-10 w-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Video Meetings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Free, unlimited video calls with screen sharing powered by Jitsi Meet
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Create Instant Meeting */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Video className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Create Instant Meeting
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Start a video meeting right now
                </p>
                <Button
                  variant="primary"
                  onClick={handleCreateInstantMeeting}
                  isLoading={isCreating}
                  className="w-full"
                  leftIcon={<Video className="h-4 w-4" />}
                >
                  New Meeting
                </Button>
              </div>
            </div>
          </div>

          {/* Join Meeting */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <LinkIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Join Meeting
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Enter meeting ID or link
                </p>
                <Button
                  variant="outline"
                  onClick={handleJoinMeeting}
                  className="w-full"
                  leftIcon={<Users className="h-4 w-4" />}
                >
                  Join
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Link Display */}
        {meetingLink && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Your meeting is ready!
              </h3>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={meetingLink}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
              />
              <Button
                variant="outline"
                onClick={copyToClipboard}
                leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Share this link with participants. The meeting has already opened in a new window.
            </p>
          </div>
        )}

        {/* Features List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Meeting Features
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">HD Video</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Crystal clear video quality</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">Unlimited Participants</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">No limits on attendees</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Video className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">Screen Sharing</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Share your screen easily</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">No Time Limit</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Meet as long as you need</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Info */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💰 <strong className="text-green-600 dark:text-green-400">100% Free Forever</strong> - Powered by Jitsi Meet
          </p>
        </div>
      </div>
    </div>
  );
};

