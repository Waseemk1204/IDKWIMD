import { body, param, query } from 'express-validator';

// User validation rules
export const validateRegister = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
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
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),
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
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Minimum hourly rate must be a positive number'),
  body('maxHourlyRate')
    .optional()
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
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Each requirement must be between 1 and 200 characters'),
  body('responsibilities')
    .optional()
    .isArray()
    .withMessage('Responsibilities must be an array'),
  body('responsibilities.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Each responsibility must be between 1 and 200 characters'),
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
  // Custom validation to ensure pay structure is valid
  body().custom((body) => {
    // Must have either hourlyRate OR both min/max hourly rates  
    const hasHourlyRate = body.hourlyRate !== undefined && body.hourlyRate !== null && body.hourlyRate !== '';
    const hasMinMax = (body.minHourlyRate !== undefined && body.minHourlyRate !== null && body.minHourlyRate !== '') &&
      (body.maxHourlyRate !== undefined && body.maxHourlyRate !== null && body.maxHourlyRate !== '');

    if (!hasHourlyRate && !hasMinMax) {
      throw new Error('Must provide either hourlyRate or both minHourlyRate and maxHourlyRate');
    }

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

// Community Post validation rules
export const validateCreateCommunityPost = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Post title must be between 5 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Post content must be between 10 and 5000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters')
];

export const validateUpdateCommunityPost = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Post title must be between 5 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Post content must be between 10 and 5000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters')
];

export const validateCreateCommunityComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  body('parentComment')
    .optional()
    .isMongoId()
    .withMessage('Parent comment must be a valid ID')
];

// Message validation rules
export const validateEditMessage = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters')
];

// Wallet validation rules
export const validateWalletTopUp = [
  body('amount')
    .isNumeric()
    .isFloat({ min: 100, max: 100000 })
    .withMessage('Amount must be between ₹100 and ₹1,00,000')
];

export const validateWithdrawal = [
  body('amount')
    .isNumeric()
    .isFloat({ min: 100 })
    .withMessage('Minimum withdrawal amount is ₹100'),
  body('bankDetails')
    .isObject()
    .withMessage('Bank details are required'),
  body('bankDetails.accountNumber')
    .isLength({ min: 9, max: 18 })
    .withMessage('Account number must be between 9 and 18 digits'),
  body('bankDetails.ifscCode')
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .withMessage('Invalid IFSC code format'),
  body('bankDetails.accountHolderName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Account holder name must be between 2 and 100 characters')
];

export const validateTransfer = [
  body('recipientId')
    .isMongoId()
    .withMessage('Invalid recipient ID'),
  body('amount')
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot be more than 200 characters'),
  body('relatedJobId')
    .optional()
    .isMongoId()
    .withMessage('Invalid job ID'),
  body('relatedApplicationId')
    .optional()
    .isMongoId()
    .withMessage('Invalid application ID')
];

// Verification validation rules
export const validateCreateVerification = [
  body('type')
    .isIn(['identity', 'employment', 'education', 'company'])
    .withMessage('Verification type must be identity, employment, education, or company'),
  body('documents')
    .isArray({ min: 1 })
    .withMessage('At least one document is required'),
  body('documents.*.type')
    .notEmpty()
    .withMessage('Document type is required'),
  body('documents.*.url')
    .isURL()
    .withMessage('Document URL must be valid'),
  body('documents.*.filename')
    .notEmpty()
    .withMessage('Document filename is required'),
  body('additionalData')
    .optional()
    .isObject()
    .withMessage('Additional data must be an object')
];

export const validateUpdateVerification = [
  body('status')
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Status must be pending, approved, or rejected'),
  body('rejectionReason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Rejection reason cannot be more than 500 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot be more than 1000 characters')
];
