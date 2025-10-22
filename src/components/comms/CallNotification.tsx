import React from 'react';
import { Phone, Video, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface CallNotificationProps {
  call: {
    callId: string;
    callerName: string;
    callType: 'audio' | 'video';
    conversationId?: string;
    channelId?: string;
  };
  onAnswer: () => void;
  onReject: () => void;
}

export const CallNotification: React.FC<CallNotificationProps> = ({
  call,
  onAnswer,
  onReject
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            {call.callType === 'video' ? (
              <Video className="h-8 w-8 text-white" />
            ) : (
              <Phone className="h-8 w-8 text-white" />
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Incoming {call.callType === 'video' ? 'Video' : 'Audio'} Call
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {call.callerName} is calling you
          </p>
          
          <div className="flex space-x-3">
            <Button
              onClick={onReject}
              variant="outline"
              className="flex-1 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
            
            <Button
              onClick={onAnswer}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              {call.callType === 'video' ? (
                <Video className="h-4 w-4 mr-2" />
              ) : (
                <Phone className="h-4 w-4 mr-2" />
              )}
              Answer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
