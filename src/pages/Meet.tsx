import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoCall } from '../components/comms/VideoCall';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const Meet: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Please log in to join the meeting</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Invalid meeting link</p>
          <Button onClick={() => navigate('/comms')}>Go to Comms</Button>
        </div>
      </div>
    );
  }

  const handleCallEnd = () => {
    navigate('/comms');
  };

  return (
    <div className="h-screen relative">
      {/* Back button */}
      <Button
        onClick={handleCallEnd}
        className="absolute top-4 left-4 z-50"
        variant="outline"
        size="sm"
        leftIcon={<ArrowLeft className="h-4 w-4" />}
      >
        Leave Meeting
      </Button>

      <VideoCall
        callId={roomId}
        user={{
          id: user.id,
          name: user.fullName,
          email: user.email,
          avatar: user.profilePhoto
        }}
        onCallEnd={handleCallEnd}
        callType="video"
      />
    </div>
  );
};

