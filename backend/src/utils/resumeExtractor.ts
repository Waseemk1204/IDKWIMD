import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export interface ResumeTextExtractionResult {
  text: string;
  success: boolean;
  error?: string;
}

/**
 * Extract text from PDF file
 */
export const extractTextFromPDF = async (filePath: string): Promise<ResumeTextExtractionResult> => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    return {
      text: data.text,
      success: true,
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return {
      text: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Extract text from DOCX file
 */
export const extractTextFromDOCX = async (filePath: string): Promise<ResumeTextExtractionResult> => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    
    return {
      text: result.value,
      success: true,
    };
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    return {
      text: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Extract text from resume file (supports PDF and DOCX)
 */
export const extractTextFromResume = async (filePath: string): Promise<ResumeTextExtractionResult> => {
  const extension = path.extname(filePath).toLowerCase();
  
  switch (extension) {
    case '.pdf':
      return extractTextFromPDF(filePath);
    case '.docx':
      return extractTextFromDOCX(filePath);
    case '.doc':
      // For .doc files, we'll try DOCX parser (may not work for all cases)
      console.warn('DOC files may not be fully supported. Consider using DOCX format.');
      return extractTextFromDOCX(filePath);
    default:
      return {
        text: '',
        success: false,
        error: `Unsupported file format: ${extension}. Please upload PDF or DOCX files.`,
      };
  }
};

/**
 * Validate resume file
 */
export const validateResumeFile = (file: Express.Multer.File): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/msword', // DOC
  ];
  const allowedExtensions = ['.pdf', '.docx', '.doc'];

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 5MB limit. Please upload a smaller file.',
    };
  }

  // Check MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.mimetype}. Please upload PDF or DOCX files only.`,
    };
  }

  // Check file extension
  const extension = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file extension: ${extension}. Please upload .pdf or .docx files only.`,
    };
  }

  return { valid: true };
};


