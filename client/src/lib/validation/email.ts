/**
 * Email validation utilities
 * Provides real-time email format validation with user-friendly error messages
 */

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Validates email format using a practical regex pattern
 * Catches most invalid formats without being overly restrictive
 *
 * Pattern explanation:
 * - [^\s@]+: One or more characters that are not whitespace or @ (local part)
 * - @: Literal @ symbol
 * - [^\s@]+: One or more characters that are not whitespace or @ (domain name)
 * - \.: Literal . symbol
 * - [^\s@]+: One or more characters that are not whitespace or @ (TLD)
 *
 * This pattern allows:
 * - Standard emails: user@example.com
 * - Subdomains: user@sub.example.com
 * - Dots in local part: first.last@example.com
 * - Plus sign: user+tag@example.com
 * - Numbers: user123@example.com
 *
 * It rejects:
 * - Missing @: userexample.com
 * - Missing domain: user@
 * - Missing TLD: user@example
 * - Spaces: user @example.com
 */
export function validateEmail(email: string): ValidationResult {
  // Trim whitespace
  const trimmedEmail = email.trim();

  // Check if empty
  if (!trimmedEmail) {
    return {
      valid: false,
      message: "Email é obrigatório",
    };
  }

  // Check length (RFC 5321 specifies max 254 characters for email address)
  if (trimmedEmail.length > 254) {
    return {
      valid: false,
      message: "Email muito longo",
    };
  }

  // Check for multiple @ symbols
  const atCount = (trimmedEmail.match(/@/g) || []).length;
  if (atCount === 0) {
    return {
      valid: false,
      message: "Insira um endereço de email válido",
    };
  }
  if (atCount > 1) {
    return {
      valid: false,
      message: "Email inválido: múltiplos símbolos @",
    };
  }

  // Check basic format with regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return {
      valid: false,
      message: "Insira um endereço de email válido",
    };
  }

  // Check for invalid characters
  // Email should only contain printable ASCII characters (RFC 5322)
  const validCharsRegex = /^[\x20-\x7E]+$/;
  if (!validCharsRegex.test(trimmedEmail)) {
    return {
      valid: false,
      message: "Email contém caracteres inválidos",
    };
  }

  // Check if domain has at least one dot
  const [localPart, domain] = trimmedEmail.split("@");
  if (!domain || !domain.includes(".")) {
    return {
      valid: false,
      message: "Domínio de email inválido",
    };
  }

  // Check if TLD is at least 2 characters
  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2) {
    return {
      valid: false,
      message: "Domínio de email inválido",
    };
  }

  // All checks passed
  return { valid: true };
}

/**
 * Validates email format and returns detailed error information
 * Useful for logging and debugging
 */
export function validateEmailDetailed(email: string): ValidationResult & {
  details?: {
    trimmed: string;
    length: number;
    hasAtSymbol: boolean;
    hasDomain: boolean;
    hasTld: boolean;
  };
} {
  const trimmedEmail = email.trim();
  const result = validateEmail(email);

  return {
    ...result,
    details: {
      trimmed: trimmedEmail,
      length: trimmedEmail.length,
      hasAtSymbol: trimmedEmail.includes("@"),
      hasDomain: trimmedEmail.includes("@") && trimmedEmail.split("@")[1]?.includes("."),
      hasTld: trimmedEmail.split(".").pop()?.length ?? 0 >= 2,
    },
  };
}

/**
 * Debounce utility for real-time validation
 * Prevents excessive validation calls while user is typing
 */
export function createValidationDebounce(
  validate: (value: string) => ValidationResult,
  delay: number = 300
): (value: string) => ValidationResult | null {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (value: string) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Return null immediately to indicate debouncing
    // The actual validation result will be available after the delay
    timeoutId = setTimeout(() => {
      timeoutId = null;
    }, delay);

    return null; // Caller should handle null as "validating..."
  };
}
