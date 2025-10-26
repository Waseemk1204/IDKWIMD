import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, AuthRequest } from '../middlewares/auth';
import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  deleteConversation,
  getUnreadCount,
  editMessage,
  deleteMessage,
  getConversationParticipants,
  addReaction,
  createThread,
  searchMessages
} from '../controllers/socketMessageController';
import {
  validateCreateMessage,
  validateEditMessage,
  validatePagination
} from '../utils/validation';

const router = express.Router();

// Multer configuration for file uploads
const uploadDir = path.join(__dirname, '../../uploads/messages');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, PDFs, and common document types
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, PDFs, and documents are allowed.'));
    }
  }
});

// All routes require authentication
router.use(authenticate);

// Conversation routes
router.get('/conversations', validatePagination, getConversations as any);
router.post('/conversations', createConversation as any);
router.delete('/conversations/:conversationId', deleteConversation as any);

// Message routes
router.get('/conversations/:conversationId/messages', validatePagination, getMessages as any);
router.post('/conversations/:conversationId/messages', validateCreateMessage, sendMessage as any);
router.put('/conversations/:conversationId/read', markMessagesAsRead as any);
router.put('/messages/:messageId', validateEditMessage, editMessage as any);
router.delete('/messages/:messageId', deleteMessage as any);

// Enhanced features
router.post('/messages/:messageId/reactions', addReaction as any);
router.post('/conversations/:conversationId/threads', createThread as any);
router.get('/search', searchMessages as any);

// Conversation routes
router.get('/conversations/:conversationId/participants', getConversationParticipants as any);

// Utility routes
router.get('/unread-count', getUnreadCount as any);

// File upload handler
const uploadFileHandler = async (req: any, res: any) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
      return;
    }

    const uploadedFiles = (req.files as Express.Multer.File[]).map(file => ({
      url: `/uploads/messages/${file.filename}`,
      filename: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      path: file.path
    }));

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: { files: uploadedFiles }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files'
    });
  }
};

// File upload route
router.post('/upload', upload.array('files', 10), uploadFileHandler);

// File download/serve route
router.get('/files/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(uploadDir, filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
      return;
    }

    // Serve the file
    res.sendFile(filepath);
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file'
    });
  }
});

export default router;
