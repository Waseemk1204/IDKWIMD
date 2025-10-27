import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import resumeService, { ParsedResumeData } from '../../services/resumeService';

interface ResumeUploadProps {
  onParseComplete?: (data: ParsedResumeData) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onParseComplete,
  onError,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    setError('');
    setSuccess(false);
    setUploadProgress(0);

    // Validate file
    const validation = resumeService.validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      onError?.(validation.error || 'Invalid file');
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload and parse resume
      const result = await resumeService.uploadResume(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!result.success) {
        throw new Error(result.error || 'Failed to parse resume');
      }

      setSuccess(true);
      
      if (result.data?.parsedData) {
        onParseComplete?.(result.data.parsedData);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse resume';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8
          transition-all duration-200
          ${isDragging 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' 
            : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800'
          }
          ${isUploading ? 'pointer-events-none opacity-75' : 'cursor-pointer hover:border-primary-400 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'}
        `}
        onClick={handleBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Upload State */}
        {!uploadedFile && !isUploading && !success && (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Upload your resume
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Drag and drop your resume here, or click to browse
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500">
              Supported formats: PDF, DOC, DOCX (Max 5MB)
            </p>
          </div>
        )}

        {/* Uploading State */}
        {isUploading && (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Parsing your resume...
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              {uploadedFile?.name}
            </p>
            <div className="max-w-xs mx-auto">
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
                {uploadProgress}% complete
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {success && uploadedFile && (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-success-100 dark:bg-success-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-success-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Resume parsed successfully!
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              {uploadedFile.name}
            </p>
            <p className="text-xs text-success-600 dark:text-success-400 mb-4">
              ✓ Your information has been extracted and auto-filled
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadedFile(null);
                  setSuccess(false);
                  setUploadProgress(0);
                  setError('');
                }}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Change Resume
              </Button>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-3">
              Upload a different resume to update your information
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-error-900 dark:text-error-100">
              Upload Failed
            </p>
            <p className="text-sm text-error-700 dark:text-error-300 mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* File Type Info */}
      {!uploadedFile && !error && (
        <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 text-neutral-600 dark:text-neutral-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                What we extract from your resume
              </p>
              <ul className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 space-y-1">
                <li>• Contact information (name, email, phone)</li>
                <li>• Skills and expertise</li>
                <li>• Work experience and job history</li>
                <li>• Education and qualifications</li>
                <li>• Certifications (if mentioned)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

