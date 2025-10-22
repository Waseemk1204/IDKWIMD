import apiService from './api';

export interface ParsedResumeData {
  fullName?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  education?: Array<{
    degree: string;
    institution: string;
    field: string;
    current: boolean;
  }>;
  experiences?: Array<{
    company: string;
    title: string;
    description: string;
    duration?: string;
    current: boolean;
  }>;
  certifications?: string[];
  totalExperience?: number;
}

export interface ResumeUploadResponse {
  success: boolean;
  message?: string;
  data?: {
    parsedData: ParsedResumeData;
    suggestions: {
      message: string;
      missingFields: string[];
    };
  };
  error?: string;
}

class ResumeService {
  /**
   * Upload and parse resume file
   */
  async uploadResume(file: File): Promise<ResumeUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch(`${apiService['baseURL']}/v1/users/resume/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        },
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload resume');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Resume upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload resume'
      };
    }
  }

  /**
   * Apply parsed resume data to user profile
   */
  async applyParsedData(parsedData: ParsedResumeData): Promise<any> {
    try {
      const response = await fetch(`${apiService['baseURL']}/v1/users/resume/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiService.getToken()}`
        },
        credentials: 'include',
        body: JSON.stringify(parsedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply parsed data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Apply parsed data error:', error);
      throw error;
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload a PDF, DOC, or DOCX file.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File too large. Maximum size is 5MB.'
      };
    }

    return { valid: true };
  }
}

export const resumeService = new ResumeService();
export default resumeService;

