import { Request, Response, NextFunction } from 'express';

/**
 * Validation middleware for registration requests
 * Validates email and password format before reaching Supabase
 *
 * Error codes:
 * - INVALID_EMAIL: Email format is invalid
 * - INVALID_PASSWORD: Password doesn't meet requirements
 * - MISSING_FIELDS: Required fields are missing
 */

interface RegistrationBody {
  email?: string;
  password?: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
}

/**
 * Email validation regex
 * Practical pattern that catches most invalid formats without being overly restrictive
 * Allows: local@domain.tld format with common special characters in local part
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Minimum password requirements
 */
const MIN_PASSWORD_LENGTH = 6;

/**
 * Mask email for privacy in logs
 * Shows first 3 chars + *** + domain
 * @example "joh***@example.com"
 */
function maskEmail(email: string): string {
  if (!email) return '[no-email]';
  const parts = email.split('@');
  if (parts.length !== 2) return '[invalid-email]';
  const [local, domain] = parts;
  const prefix = local.substring(0, 3);
  return `${prefix}***@${domain}`;
}

/**
 * Validate email format
 */
function validateEmailFormat(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email é obrigatório', code: 'MISSING_EMAIL' };
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (trimmedEmail.length === 0) {
    return { valid: false, error: 'Email é obrigatório', code: 'MISSING_EMAIL' };
  }

  if (trimmedEmail.length > 255) {
    return { valid: false, error: 'Email muito longo', code: 'INVALID_EMAIL' };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { valid: false, error: 'Formato de email inválido', code: 'INVALID_EMAIL' };
  }

  // Check for consecutive dots which are invalid
  if (trimmedEmail.includes('..')) {
    return { valid: false, error: 'Formato de email inválido', code: 'INVALID_EMAIL' };
  }

  // Check that domain has at least one dot
  const domainPart = trimmedEmail.split('@')[1];
  if (!domainPart || !domainPart.includes('.')) {
    return { valid: false, error: 'Formato de email inválido', code: 'INVALID_EMAIL' };
  }

  return { valid: true };
}

/**
 * Validate password format
 */
function validatePasswordFormat(password: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Senha é obrigatória', code: 'MISSING_PASSWORD' };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`,
      code: 'INVALID_PASSWORD',
    };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Senha muito longa', code: 'INVALID_PASSWORD' };
  }

  return { valid: true };
}

/**
 * Request validation middleware for registration endpoint
 * Performs client-side validation before Supabase API call
 *
 * Logs structured JSON for easier parsing and monitoring
 */
export function validateRegistrationRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = req.headers['x-request-id'] || generateRequestId();
  const timestamp = new Date().toISOString();

  // Attach request ID to request for tracing
  req.headers['x-request-id'] = requestId as string;

  const body = req.body as RegistrationBody;

  // Log incoming request
  console.log(JSON.stringify({
    type: 'registration_request',
    requestId,
    timestamp,
    email: body.email ? maskEmail(body.email) : '[missing]',
    hasPassword: !!body.password,
    ip: req.ip || req.socket.remoteAddress || '[unknown]',
    userAgent: req.headers['user-agent'] ? req.headers['user-agent'].substring(0, 100) : '[unknown]',
  }));

  // Validate required fields
  if (!body.email && !body.password) {
    console.log(JSON.stringify({
      type: 'validation_error',
      requestId,
      timestamp,
      code: 'MISSING_FIELDS',
      error: 'Email e senha são obrigatórios',
    }));
    res.status(400).json({
      success: false,
      error: 'Email e senha são obrigatórios',
      code: 'MISSING_FIELDS',
    });
    return;
  }

  // Validate email
  const emailValidation = validateEmailFormat(body.email || '');
  if (!emailValidation.valid) {
    console.log(JSON.stringify({
      type: 'validation_error',
      requestId,
      timestamp,
      code: emailValidation.code,
      error: emailValidation.error,
      email: body.email ? maskEmail(body.email) : '[missing]',
    }));
    res.status(400).json({
      success: false,
      error: emailValidation.error,
      code: emailValidation.code,
    });
    return;
  }

  // Validate password
  const passwordValidation = validatePasswordFormat(body.password || '');
  if (!passwordValidation.valid) {
    console.log(JSON.stringify({
      type: 'validation_error',
      requestId,
      timestamp,
      code: passwordValidation.code,
      error: passwordValidation.error,
    }));
    res.status(400).json({
      success: false,
      error: passwordValidation.error,
      code: passwordValidation.code,
    });
    return;
  }

  // Trim and normalize email before proceeding
  req.body.email = body.email.trim().toLowerCase();

  next();
}

/**
 * Generate a unique request ID for tracing
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Logging helper for successful registration
 * Call this after successful user creation
 */
export interface RegistrationSuccessLogOptions {
  requestId: string;
  userId: string;
  email: string;
  emailSent?: boolean;
}

export function logRegistrationSuccess(options: RegistrationSuccessLogOptions): void {
  console.log(JSON.stringify({
    type: 'registration_success',
    requestId: options.requestId,
    timestamp: new Date().toISOString(),
    userId: options.userId,
    email: maskEmail(options.email),
    emailSent: options.emailSent ?? false,
  }));
}

/**
 * Logging helper for Supabase errors during registration
 */
export interface RegistrationErrorLogOptions {
  requestId: string;
  error: any;
  stage: 'user_creation' | 'link_generation' | 'email_sending';
}

export function logRegistrationError(options: RegistrationErrorLogOptions): void {
  console.error(JSON.stringify({
    type: 'registration_error',
    requestId: options.requestId,
    timestamp: new Date().toISOString(),
    stage: options.stage,
    errorCode: options.error?.code,
    errorStatus: options.error?.status,
    errorMessage: options.error?.message,
    errorName: options.error?.name,
  }));
}
