import React, { useState } from 'react';
import { SendIcon } from 'lucide-react';
interface ChatBoxProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
}
export const ChatBox: React.FC<ChatBoxProps> = ({
  onSendMessage,
  placeholder = 'Type a message...'
}) => {
  const [message, setMessage] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };
  return <form onSubmit={handleSubmit} className="flex items-center bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder={placeholder} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm" />
      <button type="submit" className="px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" disabled={!message.trim()}>
        <SendIcon className="h-5 w-5" />
      </button>
    </form>;
};