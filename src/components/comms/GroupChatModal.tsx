import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Users, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';

interface User {
  _id: string;
  fullName: string;
  email: string;
  profilePhoto?: string;
  headline?: string;
  role: string;
  isOnline?: boolean;
}

interface GroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (groupId: string) => void;
  existingGroupId?: string;
  existingMembers?: string[];
}

export const GroupChatModal: React.FC<GroupChatModalProps> = ({
  isOpen,
  onClose,
  onGroupCreated,
  existingGroupId,
  existingMembers = []
}) => {
  const { user: currentUser } = useAuth();
  const [step, setStep] = useState<'members' | 'details'>(existingGroupId ? 'details' : 'members');
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(existingMembers);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const response = await apiService.searchUsers({ query: '', limit: 100 });
      if (response.success && response.data?.users) {
        // Filter out current user
        setAllUsers(response.data.users.filter((u: User) => u._id !== currentUser?.id));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    }
  };

  const filteredUsers = allUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleNext = () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one member');
      return;
    }
    setError('');
    setStep('details');
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('Please select at least one member');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.createConversation({
        participants: selectedUsers,
        title: groupName,
        conversationType: 'group',
        description: groupDescription
      });

      if (response.success && response.data?.conversation) {
        onGroupCreated(response.data.conversation._id);
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMembers = async () => {
    if (!existingGroupId) return;

    setLoading(true);
    setError('');

    try {
      const response = await apiService.addGroupMembers(existingGroupId, selectedUsers);
      if (response.success) {
        onGroupCreated(existingGroupId);
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error('Error adding members:', error);
      setError('Failed to add members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('members');
    setSearchQuery('');
    setSelectedUsers([]);
    setGroupName('');
    setGroupDescription('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {existingGroupId ? 'Add Members' : 'Create Group Chat'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {step === 'members'
                  ? `${selectedUsers.length} member${selectedUsers.length !== 1 ? 's' : ''} selected`
                  : 'Set group details'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg text-error-700 dark:text-error-300 text-sm">
              {error}
            </div>
          )}

          {step === 'members' ? (
            <>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* User List */}
              <div className="space-y-2">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No users found
                  </div>
                ) : (
                  filteredUsers.map(user => (
                    <div
                      key={user._id}
                      onClick={() => toggleUserSelection(user._id)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUsers.includes(user._id)
                          ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={user.profilePhoto}
                          alt={user.fullName}
                          size="md"
                          fallbackText={user.fullName.substring(0, 2)}
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {user.fullName}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {user.headline || user.role}
                          </div>
                        </div>
                      </div>
                      {selectedUsers.includes(user._id) && (
                        <Check className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              {/* Group Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Group Name <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name"
                    maxLength={100}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="What's this group about?"
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {groupDescription.length}/500 characters
                  </p>
                </div>

                {/* Selected Members Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Members ({selectedUsers.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allUsers
                      .filter(u => selectedUsers.includes(u._id))
                      .map(user => (
                        <div
                          key={user._id}
                          className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1"
                        >
                          <Avatar
                            src={user.profilePhoto}
                            alt={user.fullName}
                            size="xs"
                            fallbackText={user.fullName.substring(0, 2)}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {user.fullName.split(' ')[0]}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          {step === 'members' ? (
            <>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={selectedUsers.length === 0}
                rightIcon={<UserPlus className="h-4 w-4" />}
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep('members')}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={existingGroupId ? handleAddMembers : handleCreateGroup}
                disabled={loading || !groupName.trim()}
                isLoading={loading}
                loadingText={existingGroupId ? 'Adding...' : 'Creating...'}
                rightIcon={<Users className="h-4 w-4" />}
              >
                {existingGroupId ? 'Add Members' : 'Create Group'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

