import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile, X, FileIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface ComposeBoxProps {
  onSendMessage: (content: string, attachments?: any[]) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
}

export const ComposeBox: React.FC<ComposeBoxProps> = ({
  onSendMessage,
  onStartTyping,
  onStopTyping
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onStartTyping();
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      onStopTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onStopTyping();
      }
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
      
      if (isTyping) {
        setIsTyping(false);
        onStopTyping();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      filename: file.name,
      fileType: file.type,
      fileSize: file.size
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index: number) => {
    const attachment = attachments[index];
    if (attachment.url) {
      URL.revokeObjectURL(attachment.url);
    }
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const newAttachments = files.map(file => ({
        file,
        url: URL.createObjectURL(file),
        filename: file.name,
        fileType: file.type,
        fileSize: file.size
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div 
      className={`p-4 border-t border-gray-200 dark:border-gray-700 ${
        isDragging ? 'bg-primary-50 dark:bg-primary-900/20' : ''
      }`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag and Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary-100/80 dark:bg-primary-900/40 border-2 border-dashed border-primary-500 rounded-lg z-10">
          <div className="text-center">
            <Paperclip className="h-12 w-12 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
            <p className="text-lg font-medium text-primary-900 dark:text-primary-100">
              Drop files here
            </p>
          </div>
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 space-y-2">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2"
            >
              {/* File Icon/Thumbnail */}
              {attachment.fileType?.startsWith('image/') ? (
                <img 
                  src={attachment.url} 
                  alt={attachment.filename}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <FileIcon className="h-6 w-6 text-gray-500" />
              )}
              
              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {attachment.filename}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(attachment.fileSize)}
                </p>
                {/* Progress bar if uploading */}
                {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                  <div className="mt-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                    <div 
                      className="bg-primary-600 h-1 rounded-full transition-all"
                      style={{ width: `${uploadProgress[index]}%` }}
                    />
                  </div>
                )}
              </div>
              
              {/* Remove Button */}
              <button
                onClick={() => removeAttachment(index)}
                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full px-4 py-2 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
            rows={1}
          />
          
          {/* Action Buttons */}
          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={!message.trim() && attachments.length === 0}
          className="px-4"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
