import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '../ui/Button';

interface VideoCallProps {
  callId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  onCallEnd: () => void;
  callType: 'audio' | 'video';
}

export const VideoCall: React.FC<VideoCallProps> = ({
  callId,
  user,
  onCallEnd,
  callType
}) => {
  const [copied, setCopied] = useState(false);
  
  // Whereby embed URL with user display name
  const wherebyUrl = `https://whereby.com/${callId}?displayName=${encodeURIComponent(user.name)}&background=off`;
  const shareUrl = `${window.location.origin}/meet/${callId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show prejoin screen for a moment before auto-joining
  const [showPrejoin, setShowPrejoin] = useState(true);

  useEffect(() => {
    // Auto-join after 1 second
    const timer = setTimeout(() => {
      setShowPrejoin(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header with controls */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-white font-semibold">Part-Time Pay$ Meet</h2>
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gray-700 rounded-lg">
            <span className="text-gray-300 text-sm">Meeting ID:</span>
            <span className="text-white text-sm font-mono">{callId}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onCallEnd}
            className="bg-red-600 border-red-700 text-white hover:bg-red-700"
          >
            Leave Meeting
          </Button>
        </div>
      </div>

      {/* Whereby iframe */}
      {showPrejoin ? (
        <div className="flex-1 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Joining meeting...</p>
            <p className="text-gray-400 text-sm mt-2">Please allow camera and microphone access</p>
          </div>
        </div>
      ) : (
        <iframe
          src={wherebyUrl}
          allow="camera; microphone; fullscreen; speaker; display-capture"
          className="flex-1 w-full h-full border-0"
          title="Whereby Video Call"
        />
      )}

      {/* Footer info */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <p className="text-gray-400 text-xs text-center">
          Powered by Whereby • End-to-end encrypted • No downloads required
        </p>
      </div>
    </div>
  );
};
