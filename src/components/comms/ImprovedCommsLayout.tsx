import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { socketService } from '../../services/socketService';
import { ConversationList } from './ConversationList';
import { MessageArea } from './MessageArea';
import { VideoMeetPanel } from './VideoMeetPanel';
import { CallNotification } from './CallNotification';
import { VideoCall } from './VideoCall';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { MessageSquare, Video, Users, Phone } from 'lucide-react';

interface ImprovedCommsLayoutProps {
  className?: string;
}

export const ImprovedCommsLayout: React.FC<ImprovedCommsLayoutProps> = ({ className }) => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'messages' | 'meetings'>('messages');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    socketService.connect();

    // Listen for incoming calls
    socketService.on('incoming_call', (callData: any) => {
      setIncomingCall(callData);
    });

    socketService.on('call_answered', () => {
      setActiveCall(true);
      setIncomingCall(null);
    });

    socketService.on('call_ended', () => {
      setActiveCall(null);
    });

    socketService.on('call_rejected', () => {
      setIncomingCall(null);
    });

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setSelectedChannel(null);
    setMobileView('chat');
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    setSelectedConversation(null);
    setMobileView('chat');
  };

  const handleBackToList = () => {
    setMobileView('list');
    setSelectedConversation(null);
    setSelectedChannel(null);
  };

  const handleStartCall = (type: 'audio' | 'video', targetId?: string) => {
    if (selectedConversation) {
      socketService.emit('call_initiate', {
        targetUserId: targetId,
        conversationId: selectedConversation,
        callType: type
      });
    }
  };

  const handleAnswerCall = () => {
    if (incomingCall) {
      socketService.emit('call_answer', {
        callId: incomingCall.callId,
        conversationId: incomingCall.conversationId,
        channelId: incomingCall.channelId
      });
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      socketService.emit('call_reject', {
        callId: incomingCall.callId,
        conversationId: incomingCall.conversationId,
        channelId: incomingCall.channelId
      });
    }
  };

  const handleEndCall = () => {
    if (activeCall) {
      socketService.emit('call_end', {
        callId: activeCall.callId,
        conversationId: activeCall.conversationId,
        channelId: activeCall.channelId
      });
    }
  };

  // Full-screen video call
  if (activeCall) {
    return (
      <VideoCall
        callId={activeCall.callId}
        user={{
          id: user?.id || '',
          name: user?.fullName || '',
          email: user?.email || '',
          avatar: user?.profilePhoto
        }}
        onCallEnd={handleEndCall}
        callType={activeCall.callType || 'video'}
      />
    );
  }

  return (
    <div className={`flex h-full bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Main Container with Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'messages' | 'meetings')} className="flex-1 flex flex-col">
        {/* Tab Selector - Mobile & Desktop */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <TabsList className="w-full justify-start px-4 py-2">
            <TabsTrigger value="messages" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
            </TabsTrigger>
            <TabsTrigger value="meetings" className="flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span>Meetings</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Messages Tab */}
        <TabsContent value="messages" className="flex-1 flex m-0">
          {/* Left: Conversation List */}
          <div className={`${
            mobileView === 'list' ? 'flex' : 'hidden'
          } lg:flex w-full lg:w-80 xl:w-96 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-col`}>
            <ConversationList
              selectedConversation={selectedConversation}
              selectedChannel={selectedChannel}
              onConversationSelect={handleConversationSelect}
              onChannelSelect={handleChannelSelect}
            />
          </div>

          {/* Right: Message Area */}
          <div className={`${
            mobileView === 'chat' ? 'flex' : 'hidden'
          } lg:flex flex-1 flex-col`}>
            <MessageArea
              conversationId={selectedConversation}
              channelId={selectedChannel}
              onStartCall={handleStartCall}
              onToggleRightPanel={() => {}}
              onBack={handleBackToList}
            />
          </div>
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="meetings" className="flex-1 m-0">
          <VideoMeetPanel />
        </TabsContent>
      </Tabs>

      {/* Call Notifications */}
      {incomingCall && (
        <CallNotification
          call={incomingCall}
          onAnswer={handleAnswerCall}
          onReject={handleRejectCall}
        />
      )}
    </div>
  );
};

