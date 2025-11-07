import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Part-Time Pay$ API',
      version: '1.0.0',
      description: 'A comprehensive professional network platform API with job marketplace, messaging, wallet, and verification features',
      contact: {
        name: 'Part-Time Pay$ Team',
        email: 'support@parttimepay.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: config.NODE_ENV === 'production' 
          ? 'https://api.parttimepay.com/api/v1'
          : `http://localhost:${config.PORT}/api/v1`,
        description: config.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            fullName: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['employee', 'employer', 'admin'] },
            isActive: { type: 'boolean' },
            isVerified: { type: 'boolean' },
            profilePhoto: { type: 'string' },
            headline: { type: 'string' },
            about: { type: 'string' },
            location: { type: 'string' },
            skills: { type: 'array', items: { type: 'string' } },
            experiences: { type: 'array' },
            education: { type: 'array' },
            companyInfo: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Job: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            company: { type: 'string' },
            location: { type: 'string' },
            type: { type: 'string', enum: ['full-time', 'part-time', 'contract', 'internship'] },
            salary: { type: 'object' },
            requirements: { type: 'array', items: { type: 'string' } },
            benefits: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['active', 'paused', 'closed'] },
            employer: { type: 'string' },
            applications: { type: 'array' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Application: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            job: { type: 'string' },
            applicant: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'] },
            coverLetter: { type: 'string' },
            resumeUrl: { type: 'string' },
            appliedAt: { type: 'string', format: 'date-time' }
          }
        },
        Message: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            conversation: { type: 'string' },
            sender: { type: 'string' },
            content: { type: 'string' },
            messageType: { type: 'string', enum: ['text', 'image', 'file', 'system'] },
            isRead: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            recipient: { type: 'string' },
            sender: { type: 'string' },
            type: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            data: { type: 'object' },
            isRead: { type: 'boolean' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Wallet: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            balance: { type: 'number' },
            currency: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            walletId: { type: 'string' },
            type: { type: 'string', enum: ['credit', 'debit', 'refund', 'withdrawal', 'payment'] },
            amount: { type: 'number' },
            currency: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'completed', 'failed', 'cancelled'] },
            description: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Verification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            type: { type: 'string', enum: ['identity', 'employment', 'education', 'company'] },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
            documents: { type: 'array' },
            verifiedBy: { type: 'string' },
            verifiedAt: { type: 'string', format: 'date-time' },
            rejectionReason: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
