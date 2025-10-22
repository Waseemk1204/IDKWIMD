import React from 'react';
import { Phone, Video, X, Users } from 'lucide-react';
import { Button } from '../ui/Button';

interface ActiveCallBarProps {
  call: {
    callId: string;
    callType: 'audio' | 'video';
    participants?: number;
  };
  onEndCall: () => void;
}

export const ActiveCallBar: React.FC<ActiveCallBarProps> = ({
  call,
  onEndCall
}) => {
  return (
    <div className="bg-blue-500 text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {call.callType === 'video' ? (
            <Video className="h-4 w-4" />
          ) : (
            <Phone className="h-4 w-4" />
          )}
          <span className="font-medium">
            {call.callType === 'video' ? 'Video' : 'Audio'} Call Active
          </span>
        </div>
        
        {call.participants && (
          <div className="flex items-center space-x-1 text-sm">
            <Users className="h-3 w-3" />
            <span>{call.participants} participants</span>
          </div>
        )}
      </div>
      
      <Button
        onClick={onEndCall}
        variant="ghost"
        size="sm"
        className="text-white hover:bg-blue-600"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
