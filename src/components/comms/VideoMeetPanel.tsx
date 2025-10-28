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
      // Open Google Meet deep link for instant meeting
      const meetUrl = 'https://meet.google.com/new';
      window.open(meetUrl, '_blank', 'noopener');

      // Update UI with helpful message
      setMeetingLink(meetUrl);
    } catch (error) {
      console.error('Error launching Google Meet:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMeeting = () => {
    const input = prompt('Enter Google Meet link or code (e.g., abc-defg-hij):');
    if (!input) return;

    const value = input.trim();

    // If full URL, open as-is
    if (/^https?:\/\//i.test(value)) {
      window.open(value, '_blank', 'noopener');
      return;
    }

    // If only the code
    const code = value.match(/[a-zA-Z0-9-]+/g)?.join('-') || '';
    if (code && /^[a-zA-Z0-9-]{3,}$/i.test(code)) {
      const meetUrl = `https://meet.google.com/${code}`;
      window.open(meetUrl, '_blank', 'noopener');
      return;
    }

    alert('Please enter a valid Google Meet link or code');
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
              Instant meetings powered by Google Meet (opens in a new tab)
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
                value={meetingLink || 'https://meet.google.com/new'}
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
              A new Google Meet tab has opened. If not, click the Copy button and paste in a new tab.
            </p>
          </div>
        )}

        {/* Removed marketing/features and cost info per requirement */}
      </div>
    </div>
  );
};

