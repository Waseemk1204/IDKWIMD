import React, { useState } from 'react';
import { 
  MessageSquare, 
  Hash, 
  Phone, 
  Video, 
  Users, 
  Settings, 
  Search,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onConversationSelect: (id: string) => void;
  onChannelSelect: (id: string) => void;
  selectedConversation?: string | null;
  selectedChannel?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  onConversationSelect,
  onChannelSelect,
  selectedConversation,
  selectedChannel
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const sidebarItems = [
    {
      id: 'direct-messages',
      label: 'Direct Messages',
      icon: MessageSquare,
      type: 'section',
      count: 5
    },
    {
      id: 'channels',
      label: 'Channels',
      icon: Hash,
      type: 'section',
      count: 3
    },
    {
      id: 'calls',
      label: 'Calls',
      icon: Phone,
      type: 'section',
      count: 2
    }
  ];

  const conversations = [
    { id: 'conv1', name: 'John Doe', lastMessage: 'Hey, how are you?', unread: 2, online: true },
    { id: 'conv2', name: 'Jane Smith', lastMessage: 'Thanks for the update', unread: 0, online: false },
    { id: 'conv3', name: 'Mike Johnson', lastMessage: 'See you tomorrow', unread: 1, online: true }
  ];

  const channels = [
    { id: 'channel1', name: 'general', description: 'General discussion', unread: 5 },
    { id: 'channel2', name: 'development', description: 'Dev team chat', unread: 0 },
    { id: 'channel3', name: 'design', description: 'Design team', unread: 2 }
  ];

  if (collapsed) {
    return (
      <div className="w-16 bg-gray-800 dark:bg-gray-900 flex flex-col items-center py-4 space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-gray-400 hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        
        <div className="flex flex-col space-y-3">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Hash className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-800 dark:bg-gray-900 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Comms</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="text-gray-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Direct Messages */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
              Direct Messages
            </h3>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onConversationSelect(conv.id)}
                className={`w-full flex items-center p-2 rounded-lg text-left hover:bg-gray-700 transition-colors ${
                  selectedConversation === conv.id ? 'bg-gray-700' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {conv.name.charAt(0)}
                  </div>
                  {conv.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white truncate">{conv.name}</p>
                    {conv.unread > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Channels */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
              Channels
            </h3>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onChannelSelect(channel.id)}
                className={`w-full flex items-center p-2 rounded-lg text-left hover:bg-gray-700 transition-colors ${
                  selectedChannel === channel.id ? 'bg-gray-700' : ''
                }`}
              >
                <Hash className="h-4 w-4 text-gray-400 mr-3" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white truncate">#{channel.name}</p>
                    {channel.unread > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {channel.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{channel.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
