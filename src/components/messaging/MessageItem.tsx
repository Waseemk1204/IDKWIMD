import React from 'react';
import { Avatar } from '../ui/Avatar';
import { formatDistanceToNow } from 'date-fns';
interface MessageItemProps {
  content: string;
  sender: {
    id: string;
    name: string;
    profileImage?: string;
  };
  timestamp: Date;
  isCurrentUser: boolean;
}
export const MessageItem: React.FC<MessageItemProps> = ({
  content,
  sender,
  timestamp,
  isCurrentUser
}) => {
  return <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isCurrentUser && <div className="mr-2 flex-shrink-0">
          <Avatar name={sender.name} src={sender.profileImage} size="sm" />
        </div>}
      <div className={`max-w-[70%] ${isCurrentUser ? 'bg-blue-600 text-white rounded-tl-lg rounded-tr-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tr-lg rounded-tl-none'} rounded-bl-lg rounded-br-lg px-4 py-2 shadow-sm`}>
        <div className="flex flex-col">
          {!isCurrentUser && <span className="text-xs font-medium mb-1">{sender.name}</span>}
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          <span className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
            {formatDistanceToNow(timestamp, {
            addSuffix: true
          })}
          </span>
        </div>
      </div>
      {isCurrentUser && <div className="ml-2 flex-shrink-0">
          <Avatar name={sender.name} src={sender.profileImage} size="sm" />
        </div>}
    </div>;
};