import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, PlusIcon, UsersIcon } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
// Real data will be loaded from API
export const Inbox: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load conversations from API
  useEffect(() => {
    const loadConversations = async () => {
      try {
        // TODO: Implement API call to load conversations
        // const response = await apiService.getConversations();
        // setConversations(response.data.conversations);
        setConversations([]); // Empty for now
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConversations();
  }, []);
  
  const filteredConversations = conversations.filter(conversation => 
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return <div className="h-full flex flex-col">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Messages
          </h1>
          <Button variant="primary" size="sm" leftIcon={<PlusIcon className="h-4 w-4" />} onClick={() => setShowNewMessageModal(true)}>
            New Message
          </Button>
        </div>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Input type="text" placeholder="Search conversations..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} leftIcon={<SearchIcon className="h-4 w-4 text-gray-400" />} />
        </div>
        <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2">Loading conversations...</p>
              </div>
            ) : filteredConversations.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredConversations.map(conversation => <Link key={conversation.id} to={`/messaging/${conversation.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <div className="p-4 flex">
                    <div className="relative">
                      {conversation.isGroup ? <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <UsersIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div> : <Avatar name={conversation.name} src={conversation.profileImage} size="md" />}
                      {conversation.unread && <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-blue-600 ring-2 ring-white dark:ring-gray-800"></span>}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {conversation.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(conversation.timestamp)}
                        </p>
                      </div>
                      <p className={`text-sm truncate ${conversation.unread ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </div>
                </Link>)}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No conversations found
                </p>
              </div>
            )}
        </div>
      </div>
      {showNewMessageModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                New Message
              </h2>
            </div>
            <div className="p-4">
              <Input label="To:" placeholder="Search for a user or create a group..." className="mb-4" />
              <textarea className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm" rows={4} placeholder="Write your message..."></textarea>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowNewMessageModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm">
                Send
              </Button>
            </div>
          </div>
        </div>}
    </div>;
};
// Helper function to format timestamp
const formatTime = (date: Date | undefined) => {
  // Handle undefined dates
  if (!date || !(date instanceof Date)) {
    return 'Now';
  }
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  if (diffInHours < 1) {
    return 'Now';
  } else if (diffInHours < 24) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    });
  }
};