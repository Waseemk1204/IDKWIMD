import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  FileImage, 
  FileVideo, 
  File as FileIcon,
  ZoomIn,
  Play,
  Pause
} from 'lucide-react';
import { Button } from '../ui/Button';

interface FilePreviewProps {
  file: {
    url: string;
    filename: string;
    fileType: string;
    fileSize: number;
    thumbnailUrl?: string;
  };
  onClose?: () => void;
  onDownload?: () => void;
  showControls?: boolean;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onClose,
  onDownload,
  showControls = true
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (file.fileType.startsWith('image/')) {
      return <FileImage className="h-8 w-8 text-blue-500" />;
    } else if (file.fileType.startsWith('video/')) {
      return <FileVideo className="h-8 w-8 text-purple-500" />;
    } else if (file.fileType.includes('pdf')) {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else {
      return <FileIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      if (onDownload) onDownload();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  const renderPreview = () => {
    // Image preview
    if (file.fileType.startsWith('image/')) {
      return (
        <div className="relative group">
          <img
            src={file.url}
            alt={file.filename}
            className="max-w-full max-h-[600px] object-contain rounded-lg cursor-pointer"
            onClick={() => setIsFullscreen(true)}
          />
          {showControls && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsFullscreen(true)}
                leftIcon={<ZoomIn className="h-4 w-4" />}
              >
                View Full
              </Button>
            </div>
          )}
        </div>
      );
    }

    // Video preview
    if (file.fileType.startsWith('video/')) {
      return (
        <div className="relative">
          <video
            ref={videoRef}
            src={file.url}
            className="max-w-full max-h-[600px] rounded-lg"
            controls={showControls}
            onClick={toggleVideoPlayback}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // PDF preview (iframe)
    if (file.fileType.includes('pdf')) {
      return (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <iframe
            src={file.url}
            className="w-full h-[600px]"
            title={file.filename}
          />
        </div>
      );
    }

    // Generic file preview
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {getFileIcon()}
        <p className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          {file.filename}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {formatFileSize(file.fileSize)}
        </p>
        <Button
          variant="primary"
          onClick={handleDownload}
          leftIcon={<Download className="h-4 w-4" />}
          className="mt-4"
        >
          Download
        </Button>
      </div>
    );
  };

  return (
    <>
      {/* Main Preview */}
      <div className="relative">
        {/* Header with controls */}
        {showControls && (
          <div className="flex items-center justify-between mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {getFileIcon()}
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {file.filename}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatFileSize(file.fileSize)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                leftIcon={<Download className="h-4 w-4" />}
              >
                Download
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Preview Content */}
        {renderPreview()}
      </div>

      {/* Fullscreen Modal for Images */}
      {isFullscreen && file.fileType.startsWith('image/') && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setIsFullscreen(false)}
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={file.url}
            alt={file.filename}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

// Compact file attachment display (for message bubbles)
export const FileAttachment: React.FC<{
  file: {
    url: string;
    filename: string;
    fileType: string;
    fileSize: number;
    thumbnailUrl?: string;
  };
  onClick?: () => void;
}> = ({ file, onClick }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (file.fileType.startsWith('image/')) {
      return <FileImage className="h-5 w-5 text-blue-500" />;
    } else if (file.fileType.startsWith('video/')) {
      return <FileVideo className="h-5 w-5 text-purple-500" />;
    } else if (file.fileType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Image thumbnail
  if (file.fileType.startsWith('image/')) {
    return (
      <div
        onClick={onClick}
        className="relative inline-block cursor-pointer rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
      >
        <img
          src={file.thumbnailUrl || file.url}
          alt={file.filename}
          className="max-w-xs max-h-48 object-cover"
        />
      </div>
    );
  }

  // File card for non-images
  return (
    <div
      onClick={onClick}
      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors max-w-sm"
    >
      {getFileIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {file.filename}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {formatFileSize(file.fileSize)}
        </p>
      </div>
      <Download className="h-4 w-4 text-gray-400" />
    </div>
  );
};

