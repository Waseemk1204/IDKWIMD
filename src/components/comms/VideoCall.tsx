import React, { useEffect, useRef } from 'react';

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
    const initializeJitsi = () => {
      // Load Jitsi Meet API script
      if (!window.JitsiMeetExternalAPI) {
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        document.head.appendChild(script);
        
        script.onload = () => {
          createJitsiMeeting();
        };
      } else {
        createJitsiMeeting();
      }
    };

    const createJitsiMeeting = () => {
      if (!jitsiContainerRef.current) return;

      const domain = 'meet.jit.si';
      const options = {
        roomName: callId,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: user.name,
          email: user.email
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: callType === 'audio',
          enableWelcomePage: false,
          // Skip prejoin page to join directly
          prejoinPageEnabled: false,
          hideDisplayName: false,
          disableModeratorIndicator: false,
          enableLayerSuspension: true,
          enableNoisyMicDetection: true,
          requireDisplayName: false,
          // Disable lobby/waiting room completely
          disableLobbyPassword: true,
          enableLobbyChat: false,
          // Room security settings - make room open by default
          roomPasswordNumberOfDigits: false,
          // Ensure everyone can join without approval
          autoKnockLobby: false,
          enableAutomaticUrlCopy: false
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
          SHOW_POWERED_BY: false,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          HIDE_INVITE_MORE_HEADER: false
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
