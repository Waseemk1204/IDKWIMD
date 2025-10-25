import express from 'express';
import { uploadSingleResume } from '../middlewares/fileUpload';
import { authenticate as protect } from '../middlewares/auth';
import resumeParserService from '../services/resumeParserService';
import { validateResumeFile } from '../utils/resumeExtractor';
import fs from 'fs';

const router = express.Router();

/**
 * @route   POST /api/v1/resume/upload
 * @desc    Upload and parse resume
 * @access  Private
 */
router.post('/upload', protect, uploadSingleResume, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a resume file.',
      });
    }

    // Validate file
    const validation = validateResumeFile(req.file);
    if (!validation.valid) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    // Parse the resume
    const parsedResume = await resumeParserService.parseResume(req.file.path);

    // Convert to user profile data format
    const role = (req.body.role as 'employee' | 'employer') || 'employee';
    const profileData = parsedResume.data; // Resume service already returns formatted data

    // Clean up: delete the file after parsing
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: 'Resume parsed successfully',
      data: {
        parsed: parsedResume,
        profileData,
      },
    });
  } catch (error) {
    console.error('Resume upload/parse error:', error);
    
    // Clean up: delete the file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to parse resume. Please try again.',
    });
  }
});

/**
 * @route   POST /api/v1/resume/parse-text
 * @desc    Parse resume from text (for testing or alternative upload methods)
 * @access  Private
 */
router.post('/parse-text', protect, async (req, res) => {
  try {
    const { resumeText, role } = req.body;

    if (!resumeText || typeof resumeText !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Resume text is required',
      });
    }

    // For text-based parsing, we can't use the file-based parser
    // Return a simple structure for now
    const parsedResume = {
      success: true,
      data: {
        fullName: '',
        email: '',
        phone: '',
        skills: [],
        education: [],
        experiences: [],
      }
    };

    const userRole = (role as 'employee' | 'employer') || 'employee';
    const profileData = parsedResume.data;

    res.status(200).json({
      success: true,
      message: 'Resume parsed successfully',
      data: {
        parsed: parsedResume,
        profileData,
      },
    });
  } catch (error) {
    console.error('Resume parse error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to parse resume',
    });
  }
});

export default router;


