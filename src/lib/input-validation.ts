import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Initialize DOMPurify with JSDOM for server-side usage
const window = new JSDOM('').window;
const DOMPurifyServer = DOMPurify(window as any);

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
}

export function validateVideoData(data: any): ValidationResult {
  const errors: string[] = [];

  // Title validation
  if (!data.title || typeof data.title !== 'string') {
    errors.push('Title is required and must be a string');
  } else if (data.title.length < 1 || data.title.length > 100) {
    errors.push('Title must be between 1 and 100 characters');
  }

  // Description validation
  if (!data.description || typeof data.description !== 'string') {
    errors.push('Description is required and must be a string');
  } else if (data.description.length > 1000) {
    errors.push('Description must not exceed 1000 characters');
  }

  // URL validation
  if (!data.url || typeof data.url !== 'string') {
    errors.push('URL is required and must be a string');
  } else {
    try {
      const url = new URL(data.url);
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.push('URL must use HTTP or HTTPS protocol');
      }
    } catch {
      errors.push('Invalid URL format');
    }
  }

  // Channel ID validation
  if (!data.channelId || typeof data.channelId !== 'string') {
    errors.push('Channel ID is required and must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: data
  };
}

export function validateUserData(data: any): ValidationResult {
  const errors: string[] = [];

  // Email validation
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required and must be a string');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Invalid email format');
    }
  }

  // Display name validation
  if (!data.displayName || typeof data.displayName !== 'string') {
    errors.push('Display name is required and must be a string');
  } else if (data.displayName.length < 2 || data.displayName.length > 50) {
    errors.push('Display name must be between 2 and 50 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: data
  };
}

export function sanitizeHtml(html: string): string {
  return DOMPurifyServer.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false
  });
}

export function sanitizeSearchQuery(query: string): string {
  // Remove potentially harmful characters and limit length
  return query
    .replace(/[<>'"&]/g, '')
    .trim()
    .substring(0, 200);
}

export function validateSearchQuery(query: string): ValidationResult {
  const errors: string[] = [];
  const sanitized = sanitizeSearchQuery(query);

  if (!query || typeof query !== 'string') {
    errors.push('Search query is required and must be a string');
  } else if (query.length > 200) {
    errors.push('Search query must not exceed 200 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitized
  };
}