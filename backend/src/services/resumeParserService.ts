import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

interface ParsedResumeData {
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
  resumePages?: number;
}

interface ResumeParserResult {
  success: boolean;
  data?: ParsedResumeData;
  error?: string;
  raw_data?: any;
}

class ResumeParserService {
  private uploadDir: string;
  private pythonScript: string;
  private pythonExecutable: string;

  constructor() {
    // Set up directories
    this.uploadDir = path.join(__dirname, '../../uploads/resumes');
    this.pythonScript = path.join(__dirname, '../../python-services/resume_parser.py');
    
    // Determine Python executable (use venv if available)
    const venvPython = path.join(__dirname, '../../python-services/venv/bin/python');
    const venvPythonWindows = path.join(__dirname, '../../python-services/venv/Scripts/python.exe');
    
    if (process.platform === 'win32') {
      this.pythonExecutable = venvPythonWindows;
    } else {
      this.pythonExecutable = venvPython;
    }
    
    // Create upload directory if it doesn't exist
    this.ensureUploadDir();
  }

  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directory:', error);
    }
  }

  /**
   * Configure multer for file upload
   */
  getMulterConfig(): multer.Multer {
    const storage = multer.diskStorage({
      destination: async (req, file, cb) => {
        await this.ensureUploadDir();
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });

    const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      const allowedTypes = /pdf|doc|docx/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (extname && (mimetype || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
      }
    };

    return multer({
      storage,
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
      },
      fileFilter
    });
  }

  /**
   * Parse resume using Python script
   */
  async parseResume(filePath: string): Promise<ResumeParserResult> {
    return new Promise((resolve, reject) => {
      console.log('Starting resume parsing...');
      console.log('File path:', filePath);
      console.log('Python executable:', this.pythonExecutable);
      console.log('Python script:', this.pythonScript);

      // Spawn Python process
      const pythonProcess = spawn(this.pythonExecutable, [this.pythonScript, filePath]);

      let stdoutData = '';
      let stderrData = '';

      // Collect stdout data
      pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      // Collect stderr data
      pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
        console.error('Python stderr:', data.toString());
      });

      // Handle process completion
      pythonProcess.on('close', async (code) => {
        console.log('Python process exited with code:', code);
        
        // Clean up the uploaded file
        try {
          await fs.unlink(filePath);
          console.log('Cleaned up temporary file:', filePath);
        } catch (unlinkError) {
          console.error('Failed to delete temporary file:', unlinkError);
        }

        if (code !== 0) {
          console.error('Python script failed with stderr:', stderrData);
          resolve({
            success: false,
            error: `Resume parsing failed: ${stderrData || 'Unknown error'}`
          });
          return;
        }

        try {
          // Parse JSON output from Python
          const result: ResumeParserResult = JSON.parse(stdoutData);
          console.log('Parsed result:', result);
          resolve(result);
        } catch (parseError) {
          console.error('Failed to parse Python output:', parseError);
          console.error('Raw output:', stdoutData);
          resolve({
            success: false,
            error: `Failed to parse Python output: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
          });
        }
      });

      // Handle process errors
      pythonProcess.on('error', async (error) => {
        console.error('Failed to start Python process:', error);
        
        // Clean up the uploaded file
        try {
          await fs.unlink(filePath);
        } catch (unlinkError) {
          console.error('Failed to delete temporary file:', unlinkError);
        }

        resolve({
          success: false,
          error: `Failed to start Python process: ${error.message}. Make sure Python environment is set up (run setup.sh/setup.bat)`
        });
      });
    });
  }

  /**
   * Parse uploaded resume file
   */
  async parseUploadedResume(file: Express.Multer.File): Promise<ResumeParserResult> {
    if (!file) {
      return {
        success: false,
        error: 'No file provided'
      };
    }

    console.log('Processing uploaded file:', file.originalname);
    console.log('File size:', file.size, 'bytes');
    console.log('File path:', file.path);

    return await this.parseResume(file.path);
  }

  /**
   * Validate file before parsing
   */
  validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`
      };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`
      };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const resumeParserService = new ResumeParserService();
export default resumeParserService;

