/**
 * Validation utilities export
 * Centralizes all validation functions and schemas
 */

// Email validation
export { validateEmail, validateEmailDetailed, createValidationDebounce } from "./email";
export type { ValidationResult } from "./email";

// Registration schema validation
export {
  registrationSchema,
  validateRegistrationForm,
  extractFieldErrors,
  validateRegistrationField,
} from "./registration-schema";
export type { RegistrationFormData } from "./registration-schema";
