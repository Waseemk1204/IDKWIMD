import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, PhoneIcon, VideoIcon, InfoIcon } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { MessageItem } from '../../components/messaging/MessageItem';
import { ChatBox } from '../../components/messaging/ChatBox';
import { useAuth } from '../../hooks/useAuth';
// Mock data for the conversation
const mockConversation = {
  id: '1',
  name: 'Janu Patel',
  isGroup: false,
  profileImage: '',
  participants: [{
    id: '1',
    name: 'Janu Patel',
    profileImage: ''
  }, {
    id: '2',
    name: 'Current User',
    profileImage: ''
  }],
  messages: [{
    id: '1',
    content: 'Hi, I have a question about the design project.',
    sender: {
      id: '1',
      name: 'Janu Patel',
      profileImage: ''
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  }, {
    id: '2',
    content: 'Sure, what would you like to know?',
    sender: {
      id: '2',
      name: 'Current User',
      profileImage: ''
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.9) // 1.9 hours ago
  }, {
    id: '3',
    content: 'I was wondering if we could extend the deadline by a few days. I need some additional time to refine the animations.',
    sender: {
      id: '1',
      name: 'Janu Patel',
      profileImage: ''
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.8) // 1.8 hours ago
  }, {
    id: '4',
    content: 'I think that should be fine. How much additional time do you need?',
    sender: {
      id: '2',
      name: 'Current User',
      profileImage: ''
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.7) // 1.7 hours ago
  }, {
    id: '5',
    content: 'Thank you! I think 3 additional days would be enough.',
    sender: {
      id: '1',
      name: 'Janu Patel',
      profileImage: ''
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
  }]
};
export const Conversation: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const {
    user
  } = useAuth();
  const [messages, setMessages] = useState(mockConversation.messages);
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);
  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: `new-${Date.now()}`,
      content,
      sender: {
        id: user?._id || '2',
        name: user?.name || 'Current User',
        profileImage: user?.profileImage || ''
      },
      timestamp: new Date()
    };
    setMessages([...messages, newMessage]);
  };
  return <div className="h-full flex flex-col">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/messaging" className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <Avatar name={mockConversation.name} src={mockConversation.profileImage} size="sm" />
            <div className="ml-3">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {mockConversation.name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {mockConversation.isGroup ? 'Group Chat' : 'Online'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
              <PhoneIcon className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
              <VideoIcon className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" onClick={() => setShowInfo(!showInfo)}>
              <InfoIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        {/* Messages */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map(message => <MessageItem key={message.id} content={message.content} sender={message.sender} timestamp={message.timestamp} isCurrentUser={message.sender.id === (user?._id || '2')} />)}
            <div ref={messagesEndRef} />
          </div>
          {/* Info Panel */}
          {showInfo && <div className="w-72 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Details
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Participants
                  </h4>
                  <div className="space-y-2">
                    {mockConversation.participants.map(participant => <div key={participant.id} className="flex items-center">
                        <Avatar name={participant.name} src={participant.profileImage} size="xs" />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                          {participant.name}
                          {participant.id === (user?._id || '2') && ' (You)'}
                        </span>
                      </div>)}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Shared Files
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No files shared yet
                  </p>
                </div>
              </div>
            </div>}
        </div>
        {/* Chat Input */}
        <ChatBox onSendMessage={handleSendMessage} />
      </div>
    </div>;
};