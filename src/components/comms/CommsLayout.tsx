import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { ConversationList } from './ConversationList';
import { MessageArea } from './MessageArea';
import { RightPanel } from './RightPanel';
import { CallNotification } from './CallNotification';
import { ActiveCallBar } from './ActiveCallBar';
import { socketService } from '../../services/socketService';

interface CommsLayoutProps {
  className?: string;
}

export const CommsLayout: React.FC<CommsLayoutProps> = ({ className }) => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat' | 'panel'>('list');

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    socketService.connect();

    // Listen for incoming calls
    socketService.on('incoming_call', (callData: any) => {
      setIncomingCall(callData);
    });

    // Listen for call events
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
    setRightPanelOpen(false);
    setMobileView('chat'); // Switch to chat view on mobile
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    setSelectedConversation(null);
    setRightPanelOpen(false);
    setMobileView('chat'); // Switch to chat view on mobile
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
    } else if (selectedChannel) {
      // For channels, we'll create a meeting room
      // This will be handled by the call controller
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

  return (
    <div className={`flex h-full bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onConversationSelect={handleConversationSelect}
          onChannelSelect={handleChannelSelect}
          selectedConversation={selectedConversation}
          selectedChannel={selectedChannel}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Active Call Bar */}
        {activeCall && (
          <ActiveCallBar 
            call={activeCall}
            onEndCall={handleEndCall}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Conversation List - Responsive */}
          <div className={`${
            mobileView === 'list' ? 'flex' : 'hidden'
          } lg:flex ${
            sidebarCollapsed ? 'lg:w-80' : 'lg:w-64'
          } w-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800`}>
            <ConversationList
              selectedConversation={selectedConversation}
              selectedChannel={selectedChannel}
              onConversationSelect={handleConversationSelect}
              onChannelSelect={handleChannelSelect}
            />
          </div>

          {/* Message Area - Responsive */}
          <div className={`${
            mobileView === 'chat' ? 'flex' : 'hidden'
          } lg:flex flex-1 flex-col`}>
            <MessageArea
              conversationId={selectedConversation}
              channelId={selectedChannel}
              onStartCall={handleStartCall}
              onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
              onBack={handleBackToList}
            />
          </div>

          {/* Right Panel - Responsive */}
          {rightPanelOpen && (
            <div className="hidden lg:block w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <RightPanel
                conversationId={selectedConversation}
                channelId={selectedChannel}
                onClose={() => setRightPanelOpen(false)}
              />
            </div>
          )}
        </div>
      </div>

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
