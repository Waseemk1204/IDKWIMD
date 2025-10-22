import React, { useEffect, useRef } from 'react';
import { apiService } from '../../services/api';

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

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export const VideoCall: React.FC<VideoCallProps> = ({
  callId,
  user,
  onCallEnd,
  callType
}) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  useEffect(() => {
    const initializeJitsi = async () => {
      try {
        // Create meeting room
        const response = await apiService.createMeetingRoom({
          callType,
          participants: [user.id]
        });

        if (response.success) {
          const { jitsiRoomUrl } = response.data;
          
          // Load Jitsi Meet API script
          if (!window.JitsiMeetExternalAPI) {
            const script = document.createElement('script');
            script.src = 'https://meet.jit.si/external_api.js';
            script.async = true;
            document.head.appendChild(script);
            
            script.onload = () => {
              createJitsiMeeting(jitsiRoomUrl);
            };
          } else {
            createJitsiMeeting(jitsiRoomUrl);
          }
        }
      } catch (error) {
        console.error('Error initializing Jitsi meeting:', error);
      }
    };

    const createJitsiMeeting = (_roomUrl: string) => {
      if (!jitsiContainerRef.current) return;

      const domain = 'meet.jit.si';
      const options = {
        roomName: callId,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: user.name,
          email: user.email,
          avatar: user.avatar
        },
        configOverwrite: {
          startWithAudioMuted: callType === 'video',
          startWithVideoMuted: callType === 'audio',
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          hideDisplayName: false,
          hideEmail: false,
          enableLayerSizing: true,
          enableNoisyMicDetection: true
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_POWERED_BY: false
        }
      };

      jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

      // Event listeners
      jitsiApiRef.current.addEventListeners({
        readyToClose: () => {
          onCallEnd();
        },
        videoConferenceLeft: () => {
          onCallEnd();
        },
        videoConferenceJoined: () => {
          console.log('Joined video conference');
        },
        participantJoined: (participant: any) => {
          console.log('Participant joined:', participant);
        },
        participantLeft: (participant: any) => {
          console.log('Participant left:', participant);
        }
      });
    };

    initializeJitsi();

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, [callId, user, callType, onCallEnd]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex-1" ref={jitsiContainerRef} />
    </div>
  );
};
