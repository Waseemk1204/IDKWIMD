import React, { useState } from 'react';
import { Users, MessageCircle, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { apiService } from '../../services/api';
import { toast } from 'sonner';

interface GangMember {
  _id: string;
  fullName: string;
  email: string;
  profilePhoto?: string;
  skills?: string[];
  headline?: string;
}

interface GangGroupChatProps {
  gangMembers: GangMember[];
  currentUserId: string;
}

export const GangGroupChat: React.FC<GangGroupChatProps> = ({ gangMembers, currentUserId }) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreateGroupChat = async () => {
    if (selectedMembers.length < 2) {
      toast.error('Select at least 2 members to create a group chat');
      return;
    }

    setIsCreating(true);
    try {
      const response = await apiService.createConversation({
        participants: selectedMembers,
        conversationType: 'group',
        title: `Gang Group Chat (${selectedMembers.length + 1} members)`,
        gangId: 'gang_group' // Special identifier for gang group chats
      });

      if (response.success) {
        toast.success('Group chat created successfully!');
        setSelectedMembers([]);
        // Navigate to messaging
        window.location.href = '/messaging';
      } else {
        toast.error('Failed to create group chat');
      }
    } catch (error) {
      console.error('Error creating group chat:', error);
      toast.error('Failed to create group chat');
    } finally {
      setIsCreating(false);
    }
  };

  const handleQuickGroupChat = async () => {
    // Create group chat with all gang members
    const allMemberIds = gangMembers.map(member => member._id);
    
    setIsCreating(true);
    try {
      const response = await apiService.createConversation({
        participants: allMemberIds,
        conversationType: 'group',
        title: `Gang Group Chat (${gangMembers.length + 1} members)`,
        gangId: 'gang_group'
      });

      if (response.success) {
        toast.success('Group chat created with all gang members!');
        window.location.href = '/messaging';
      } else {
        toast.error('Failed to create group chat');
      }
    } catch (error) {
      console.error('Error creating group chat:', error);
      toast.error('Failed to create group chat');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gang Group Chat
          </h3>
        </div>
        <Button
          size="sm"
          onClick={handleQuickGroupChat}
          disabled={isCreating || gangMembers.length < 2}
          className="flex items-center space-x-1"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Quick Group Chat</span>
        </Button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Create a group chat with your gang members for collaboration and networking.
      </p>

      {gangMembers.length >= 2 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select members for group chat:
            </p>
            <span className="text-sm text-gray-500">
              {selectedMembers.length} selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {gangMembers.map((member) => (
              <div
                key={member._id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedMembers.includes(member._id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => handleMemberToggle(member._id)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={member.profilePhoto}
                    name={member.fullName}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {member.fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {member.headline || member.email}
                    </p>
                  </div>
                  {selectedMembers.includes(member._id) && (
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedMembers.length >= 2 
                ? `Ready to create group chat with ${selectedMembers.length + 1} members`
                : 'Select at least 2 members to create a group chat'
              }
            </div>
            <Button
              onClick={handleCreateGroupChat}
              disabled={selectedMembers.length < 2 || isCreating}
              className="flex items-center space-x-1"
            >
              {isCreating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create Group Chat</span>
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 dark:text-gray-400">
            You need at least 2 gang members to create a group chat.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Connect with more people to unlock group chat functionality.
          </p>
        </div>
      )}
    </Card>
  );
};
