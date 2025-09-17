import { body, param, query } from 'express-validator';

// User validation rules
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['employee', 'employer', 'admin'])
    .withMessage('Role must be employee, employer, or admin')
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot be more than 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('skills.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each skill must be between 1 and 50 characters'),
  body('experience')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Experience cannot be more than 1000 characters'),
  body('education')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Education cannot be more than 500 characters')
];

export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Job validation rules
export const validateCreateJob = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Job title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Job description must be between 50 and 2000 characters'),
  body('company')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('location')
    .optional()
    .custom((value) => {
      if (value && value.trim().length < 2) {
        throw new Error('Location must be at least 2 characters if provided');
      }
      if (value && value.trim().length > 100) {
        throw new Error('Location cannot be more than 100 characters');
      }
      return true;
    }),
  body('hourlyRate')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
  body('minHourlyRate')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Minimum hourly rate must be a positive number'),
  body('maxHourlyRate')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Maximum hourly rate must be a positive number'),
  body('hoursPerWeek')
    .trim()
    .notEmpty()
    .withMessage('Hours per week is required'),
  body('duration')
    .trim()
    .notEmpty()
    .withMessage('Job duration is required'),
  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),
  body('skills.*')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each skill must be between 1 and 50 characters'),
  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array'),
  body('requirements.*')
    .optional()
    .custom((value) => {
      if (value && value.trim().length < 5) {
        throw new Error('Each requirement must be at least 5 characters');
      }
      if (value && value.trim().length > 200) {
        throw new Error('Each requirement cannot be more than 200 characters');
      }
      return true;
    }),
  body('responsibilities')
    .optional()
    .isArray()
    .withMessage('Responsibilities must be an array'),
  body('responsibilities.*')
    .optional()
    .custom((value) => {
      if (value && value.trim().length < 5) {
        throw new Error('Each responsibility must be at least 5 characters');
      }
      if (value && value.trim().length > 200) {
        throw new Error('Each responsibility cannot be more than 200 characters');
      }
      return true;
    }),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Job category is required'),
  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Urgency must be low, medium, or high'),
  body('experienceLevel')
    .optional()
    .isIn(['entry', 'mid', 'senior'])
    .withMessage('Experience level must be entry, mid, or senior'),
  body('isRemote')
    .optional()
    .isBoolean()
    .withMessage('isRemote must be a boolean value'),
  // Custom validation to ensure pay range is valid
  body().custom((body) => {
    if (body.minHourlyRate && body.maxHourlyRate && body.minHourlyRate > body.maxHourlyRate) {
      throw new Error('Minimum hourly rate cannot be higher than maximum hourly rate');
    }
    
    return true;
  })
];

export const validateUpdateJob = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Job title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Job description must be between 50 and 2000 characters'),
  body('company')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('hourlyRate')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
  body('status')
    .optional()
    .isIn(['active', 'paused', 'closed', 'draft'])
    .withMessage('Status must be active, paused, closed, or draft'),
  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Urgency must be low, medium, or high')
];

// Application validation rules
export const validateCreateApplication = [
  body('coverLetter')
    .trim()
    .isLength({ min: 50, max: 1000 })
    .withMessage('Cover letter must be between 50 and 1000 characters'),
  body('salaryExpectation')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Salary expectation must be a positive number'),
  body('availability')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Availability cannot be more than 200 characters'),
  body('portfolio')
    .optional()
    .isURL()
    .withMessage('Portfolio must be a valid URL'),
  body('linkedinProfile')
    .optional()
    .isURL()
    .withMessage('LinkedIn profile must be a valid URL'),
  body('githubProfile')
    .optional()
    .isURL()
    .withMessage('GitHub profile must be a valid URL')
];

// Blog validation rules
export const validateCreateBlog = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Blog title must be between 10 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 100, max: 10000 })
    .withMessage('Blog content must be between 100 and 10000 characters'),
  body('excerpt')
    .trim()
    .isLength({ min: 50, max: 500 })
    .withMessage('Blog excerpt must be between 50 and 500 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Blog category is required'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  body('thumbnail')
    .isURL()
    .withMessage('Thumbnail must be a valid URL')
];

// Comment validation rules
export const validateCreateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
];

// Message validation rules
export const validateCreateMessage = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file', 'system'])
    .withMessage('Message type must be text, image, file, or system')
];

// Parameter validation
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

export const validateJobId = [
  param('jobId')
    .isMongoId()
    .withMessage('Invalid job ID format')
];

export const validateUserId = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID format')
];

// Query validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
];
