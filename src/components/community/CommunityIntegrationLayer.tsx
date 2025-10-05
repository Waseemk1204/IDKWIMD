import React, { useState } from 'react';
import { MessageCircle, Users, Share2, Bell, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';

interface CommunityIntegrationLayerProps {
  post: any;
  onMessageSent?: () => void;
  onInvitationSent?: () => void;
}

export const CommunityIntegrationLayer: React.FC<CommunityIntegrationLayerProps> = ({
  post,
  onMessageSent,
  onInvitationSent
}) => {
  const { user } = useAuth();
  const [isMessaging, setIsMessaging] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [showGangInvite, setShowGangInvite] = useState(false);

  const handleMessageAuthor = async () => {
    if (!user || user._id === post.author._id) return;

    try {
      setIsMessaging(true);
      const response = await apiService.messagePostAuthor(post._id, post.author._id);
      
      if (response.success) {
        // Navigate to conversation or show success
        onMessageSent?.();
      }
    } catch (error) {
      console.error('Error messaging author:', error);
    } finally {
      setIsMessaging(false);
    }
  };

  const handleInviteGang = async () => {
    try {
      setIsInviting(true);
      const response = await apiService.inviteGangToDiscussion(post._id, []);
      
      if (response.success) {
        onInvitationSent?.();
        setShowGangInvite(false);
      }
    } catch (error) {
      console.error('Error inviting gang:', error);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      {/* Message Author */}
      {user && user._id !== post.author._id && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleMessageAuthor}
          disabled={isMessaging}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          {isMessaging ? 'Messaging...' : 'Message Author'}
        </Button>
      )}

      {/* Invite Gang */}
      {user && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGangInvite(true)}
          disabled={isInviting}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Invite Gang
        </Button>
      )}

      {/* Share Post */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}
        className="flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      {/* Gang Invite Modal */}
      {showGangInvite && (
        <GangInviteModal
          postId={post._id}
          onClose={() => setShowGangInvite(false)}
          onInvite={handleInviteGang}
        />
      )}
    </div>
  );
};

// Gang Invite Modal Component
const GangInviteModal: React.FC<{
  postId: string;
  onClose: () => void;
  onInvite: () => void;
}> = ({ postId, onClose, onInvite }) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [gangMembers, setGangMembers] = useState<any[]>([]);

  React.useEffect(() => {
    loadGangMembers();
  }, []);

  const loadGangMembers = async () => {
    try {
      const response = await apiService.getUserConnections('accepted');
      if (response.success) {
        setGangMembers(response.data.connections || []);
      }
    } catch (error) {
      console.error('Error loading gang members:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Invite Gang Members</h3>
        
        <div className="space-y-2 mb-4">
          {gangMembers.map((member) => (
            <label key={member._id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedMembers.includes(member.user._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMembers([...selectedMembers, member.user._id]);
                  } else {
                    setSelectedMembers(selectedMembers.filter(id => id !== member.user._id));
                  }
                }}
              />
              <span>{member.user.fullName}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button 
            onClick={onInvite} 
            disabled={selectedMembers.length === 0}
          >
            Invite Selected
          </Button>
        </div>
      </div>
    </div>
  );
};
