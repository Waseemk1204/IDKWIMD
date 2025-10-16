// Comprehensive validation utilities for client-side and server-side validation
import React, { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  email?: boolean;
  url?: boolean;
  phone?: boolean;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FieldValidation {
  value: any;
  rules: ValidationRule;
  fieldName: string;
}

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[\d\s\-\(\)]{10,}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  username: /^[a-zA-Z0-9_]{3,30}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  indianPhone: /^(\+91|91)?[6-9]\d{9}$/,
  pincode: /^[1-9][0-9]{5}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  aadhar: /^[2-9]{1}[0-9]{11}$/
};

// Validation functions
export const validators = {
  required: (value: any): string | null => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required';
    }
    return null;
  },

  minLength: (value: string, min: number): string | null => {
    if (value && value.length < min) {
      return `Minimum length is ${min} characters`;
    }
    return null;
  },

  maxLength: (value: string, max: number): string | null => {
    if (value && value.length > max) {
      return `Maximum length is ${max} characters`;
    }
    return null;
  },

  pattern: (value: string, pattern: RegExp, message?: string): string | null => {
    if (value && !pattern.test(value)) {
      return message || 'Invalid format';
    }
    return null;
  },

  min: (value: number, min: number): string | null => {
    if (value !== null && value !== undefined && value < min) {
      return `Minimum value is ${min}`;
    }
    return null;
  },

  max: (value: number, max: number): string | null => {
    if (value !== null && value !== undefined && value > max) {
      return `Maximum value is ${max}`;
    }
    return null;
  },

  email: (value: string): string | null => {
    if (value && !patterns.email.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  phone: (value: string): string | null => {
    if (value && !patterns.phone.test(value)) {
      return 'Please enter a valid phone number';
    }
    return null;
  },

  indianPhone: (value: string): string | null => {
    if (value && !patterns.indianPhone.test(value)) {
      return 'Please enter a valid Indian phone number';
    }
    return null;
  },

  url: (value: string): string | null => {
    if (value && !patterns.url.test(value)) {
      return 'Please enter a valid URL';
    }
    return null;
  },

  username: (value: string): string | null => {
    if (value && !patterns.username.test(value)) {
      return 'Username must be 3-30 characters long and contain only letters, numbers, and underscores';
    }
    return null;
  },

  password: (value: string): string | null => {
    if (value && !patterns.password.test(value)) {
      return 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }
    return null;
  },

  pincode: (value: string): string | null => {
    if (value && !patterns.pincode.test(value)) {
      return 'Please enter a valid 6-digit PIN code';
    }
    return null;
  },

  pan: (value: string): string | null => {
    if (value && !patterns.pan.test(value)) {
      return 'Please enter a valid PAN number';
    }
    return null;
  },

  aadhar: (value: string): string | null => {
    if (value && !patterns.aadhar.test(value)) {
      return 'Please enter a valid 12-digit Aadhar number';
    }
    return null;
  },

  confirmPassword: (password: string, confirmPassword: string): string | null => {
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  },

  age: (value: number): string | null => {
    if (value < 18) {
      return 'You must be at least 18 years old';
    }
    if (value > 100) {
      return 'Please enter a valid age';
    }
    return null;
  },

  salary: (value: number): string | null => {
    if (value < 0) {
      return 'Salary cannot be negative';
    }
    if (value > 10000000) {
      return 'Please enter a realistic salary amount';
    }
    return null;
  },

  experience: (value: number): string | null => {
    if (value < 0) {
      return 'Experience cannot be negative';
    }
    if (value > 50) {
      return 'Please enter a realistic experience in years';
    }
    return null;
  }
};

// Main validation function
export const validateField = (field: FieldValidation): string | null => {
  const { value, rules, fieldName } = field;

  // Required validation
  if (rules.required) {
    const requiredError = validators.required(value);
    if (requiredError) return requiredError;
  }

  // Skip other validations if value is empty and not required
  if (!value && !rules.required) {
    return null;
  }

  // String validations
  if (typeof value === 'string') {
    if (rules.minLength !== undefined) {
      const error = validators.minLength(value, rules.minLength);
      if (error) return error;
    }

    if (rules.maxLength !== undefined) {
      const error = validators.maxLength(value, rules.maxLength);
      if (error) return error;
    }

    if (rules.pattern) {
      const error = validators.pattern(value, rules.pattern);
      if (error) return error;
    }

    if (rules.email) {
      const error = validators.email(value);
      if (error) return error;
    }

    if (rules.phone) {
      const error = validators.phone(value);
      if (error) return error;
    }

    if (rules.url) {
      const error = validators.url(value);
      if (error) return error;
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (rules.min !== undefined) {
      const error = validators.min(value, rules.min);
      if (error) return error;
    }

    if (rules.max !== undefined) {
      const error = validators.max(value, max);
      if (error) return error;
    }
  }

  // Custom validation
  if (rules.custom) {
    const error = rules.custom(value);
    if (error) return error;
  }

  return null;
};

// Validate multiple fields
export const validateFields = (fields: Record<string, FieldValidation>): ValidationResult => {
  const errors: Record<string, string> = {};
  let isValid = true;

  Object.entries(fields).forEach(([fieldName, field]) => {
    const error = validateField(field);
    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
};

// Form validation schemas
export const schemas = {
  userRegistration: {
    fullName: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    email: {
      required: true,
      email: true
    },
    password: {
      required: true,
      minLength: 8,
      custom: (value: string) => validators.password(value)
    },
    confirmPassword: {
      required: true,
      custom: (value: string, formData: any) => 
        validators.confirmPassword(formData.password, value)
    },
    phone: {
      phone: true
    },
    role: {
      required: true,
      custom: (value: string) => 
        ['employee', 'employer'].includes(value) ? null : 'Invalid role'
    }
  },

  jobPosting: {
    title: {
      required: true,
      minLength: 5,
      maxLength: 100
    },
    description: {
      required: true,
      minLength: 50,
      maxLength: 2000
    },
    location: {
      required: true,
      minLength: 2,
      maxLength: 100
    },
    hourlyRate: {
      required: true,
      min: 100,
      max: 10000,
      custom: (value: number) => validators.salary(value)
    },
    skills: {
      required: true,
      custom: (value: string[]) => 
        Array.isArray(value) && value.length > 0 ? null : 'At least one skill is required'
    },
    experience: {
      min: 0,
      max: 20,
      custom: (value: number) => validators.experience(value)
    }
  },

  profileUpdate: {
    fullName: {
      minLength: 2,
      maxLength: 50
    },
    phone: {
      phone: true
    },
    about: {
      maxLength: 1000
    },
    location: {
      maxLength: 100
    },
    website: {
      url: true
    },
    linkedin: {
      url: true
    },
    github: {
      url: true
    }
  },

  applicationSubmission: {
    coverLetter: {
      required: true,
      minLength: 100,
      maxLength: 1000
    },
    expectedSalary: {
      min: 0,
      max: 1000000,
      custom: (value: number) => validators.salary(value)
    },
    availability: {
      required: true,
      custom: (value: string) => 
        ['immediate', '1-week', '2-weeks', '1-month', 'flexible'].includes(value) 
          ? null : 'Invalid availability option'
    }
  }
};

// Real-time validation hook
export const useValidation = (schema: Record<string, ValidationRule>) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((fieldName: string, value: any, formData?: any) => {
    const fieldSchema = schema[fieldName];
    if (!fieldSchema) return null;

    const field: FieldValidation = {
      value,
      rules: fieldSchema,
      fieldName
    };

    // Handle confirmPassword validation
    if (fieldName === 'confirmPassword' && formData) {
      field.rules.custom = (val: any) => validators.confirmPassword(formData.password, val);
    }

    return validateField(field);
  }, [schema]);

  const validateAll = useCallback((formData: Record<string, any>) => {
    const newErrors: Record<string, string> = {};
    
    Object.keys(schema).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName], formData);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [schema, validateField]);

  const handleFieldChange = useCallback((fieldName: string, value: any, formData?: any) => {
    const error = validateField(fieldName, value, formData);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: error || ''
    }));
  }, [validateField]);

  const handleFieldBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  }, []);

  const getFieldError = useCallback((fieldName: string) => {
    return touched[fieldName] ? errors[fieldName] : '';
  }, [errors, touched]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validateField,
    validateAll,
    handleFieldChange,
    handleFieldBlur,
    getFieldError,
    clearErrors
  };
};

// Server-side validation helpers
export const serverValidation = {
  sanitizeInput: (input: any): any => {
    if (typeof input === 'string') {
      return input.trim();
    }
    return input;
  },

  validateRequestBody: (body: any, schema: Record<string, ValidationRule>) => {
    const sanitizedBody = Object.keys(body).reduce((acc, key) => {
      acc[key] = serverValidation.sanitizeInput(body[key]);
      return acc;
    }, {} as any);

    const fields: Record<string, FieldValidation> = {};
    Object.keys(schema).forEach(fieldName => {
      fields[fieldName] = {
        value: sanitizedBody[fieldName],
        rules: schema[fieldName],
        fieldName
      };
    });

    return validateFields(fields);
  }
};
