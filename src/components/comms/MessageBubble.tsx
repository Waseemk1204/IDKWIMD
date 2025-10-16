import React, { useState } from 'react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { 
  Heart, 
  ThumbsUp, 
  Laugh, 
  MessageSquare,
  MoreHorizontal,
  Reply,
  Edit,
  Trash2,
  Smile,
  Frown,
  Zap,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  Flame,
  Rocket,
  Eye,
  PartyPopper
} from 'lucide-react';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    fullName: string;
    email: string;
    profilePhoto?: string;
  };
  messageType: 'text' | 'image' | 'file' | 'system' | 'call_start' | 'call_end';
  createdAt: Date;
  isRead: boolean;
  isEdited: boolean;
  editedAt?: Date;
  replyTo?: {
    content: string;
    sender: {
      fullName: string;
    };
  };
  reactions?: {
    reactionType: string;
    count: number;
    users: string[];
  }[];
  attachments?: {
    url: string;
    filename: string;
    fileType: string;
    fileSize: number;
  }[];
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onAddReaction: (reactionType: string) => void;
}

const reactionIcons = {
  like: ThumbsUp,
  love: Heart,
  laugh: Laugh,
  wow: Smile,
  sad: Frown,
  angry: Zap,
  thumbs_up: ThumbsUp,
  lightbulb: Lightbulb,
  checkmark: CheckCircle,
  question: HelpCircle,
  fire: Flame,
  rocket: Rocket,
  eyes: Eye,
  party: PartyPopper
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onAddReaction
}) => {
  const [showReactions, setShowReactions] = useState(false);

  const getReactionIcon = (reactionType: string) => {
    const IconComponent = reactionIcons[reactionType as keyof typeof reactionIcons];
    return IconComponent || ThumbsUp;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;

    return (
      <div className="space-y-2 mt-2">
        {message.attachments.map((attachment, index) => (
          <div key={index} className="max-w-xs">
            {attachment.fileType.startsWith('image/') ? (
              <img
                src={attachment.url}
                alt={attachment.filename}
                className="rounded-lg max-w-full h-auto"
              />
            ) : (
              <div className="flex items-center space-x-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {attachment.fileType.split('/')[0].charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {attachment.filename}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(attachment.fileSize)}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {message.reactions.map((reaction, index) => {
          const IconComponent = getReactionIcon(reaction.reactionType);
          return (
            <button
              key={index}
              onClick={() => onAddReaction(reaction.reactionType)}
              className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <IconComponent className="h-3 w-3" />
              <span>{reaction.count}</span>
            </button>
          );
        })}
      </div>
    );
  };

  if (message.messageType === 'system') {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm px-3 py-1 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isOwn && (
          <Avatar
            src={message.sender.profilePhoto}
            alt={message.sender.fullName}
            size="sm"
            className="mr-2 mt-1"
          />
        )}

        {/* Message Content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Sender Name */}
          {!isOwn && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {message.sender.fullName}
            </span>
          )}

          {/* Message Bubble */}
          <div
            className={`relative px-4 py-2 rounded-lg ${
              isOwn
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          >
            {/* Reply Context */}
            {message.replyTo && (
              <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-2 mb-2 text-xs opacity-75">
                <p className="font-medium">{message.replyTo.sender.fullName}</p>
                <p className="truncate">{message.replyTo.content}</p>
              </div>
            )}

            {/* Message Content */}
            <p className="whitespace-pre-wrap">{message.content}</p>

            {/* Attachments */}
            {renderAttachments()}

            {/* Reactions */}
            {renderReactions()}

            {/* Message Actions */}
            <div className="absolute -bottom-6 right-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReactions(!showReactions)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 h-6 w-6 p-0"
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Timestamp */}
          <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            {message.isEdited && (
              <span className="ml-1 italic">(edited)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
