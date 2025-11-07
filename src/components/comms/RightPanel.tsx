import React from 'react';
import { X, Settings, Hash } from 'lucide-react';
import { Button } from '../ui/Button';

interface RightPanelProps {
  conversationId?: string | null;
  channelId?: string | null;
  onClose: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  conversationId: _conversationId, // TODO: Use conversationId for conversation-specific features
  channelId,
  onClose
}) => {
  const isChannel = !!channelId;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isChannel ? 'Channel Info' : 'Conversation Info'}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isChannel ? (
          <div className="space-y-6">
            {/* Channel Details */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Channel Details
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    #general
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  General discussion channel for the team
                </p>
              </div>
            </div>

            {/* Members */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Members (12)
              </h4>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        U{i}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        User {i}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Online
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Channel Settings
              </h4>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-600 dark:text-gray-300"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Channel Settings
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Conversation Details */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Conversation Details
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Direct message conversation
                </p>
              </div>
            </div>

            {/* Participants */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Participants (2)
              </h4>
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        U{i}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        User {i}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Online
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
