/**
 * EmailIt API Client
 *
 * Server-side client for sending emails via EmailIt API
 * Documentation: https://emailit.com/docs/api-reference/emails/send
 *
 * @module server/lib/emailit
 */

/**
 * Email recipient with optional name
 */
export interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * Email attachment
 */
export interface EmailAttachment {
  filename: string;
  content: string; // base64 encoded content
  content_type?: string; // e.g., 'application/pdf'
  disposition?: 'attachment' | 'inline';
}

/**
 * Email tracking options
 */
export interface EmailTracking {
  loads?: boolean;
  clicks?: boolean;
}

/**
 * Send email options
 */
export interface SendEmailOptions {
  /** Sender email address (must be from a verified domain) */
  from: string | EmailRecipient;
  /** Recipient email address(es) */
  to: string | string[] | EmailRecipient | EmailRecipient[];
  /** CC recipients (optional) */
  cc?: string | string[] | EmailRecipient | EmailRecipient[];
  /** BCC recipients (optional) */
  bcc?: string | string[] | EmailRecipient | EmailRecipient[];
  /** Reply-to address (optional) */
  reply_to?: string | EmailRecipient;
  /** Email subject */
  subject: string;
  /** HTML content (required if no template) */
  html?: string;
  /** Plain text content (optional) */
  text?: string;
  /** Template ID to use instead of html/text */
  template?: string;
  /** Variables to inject into template */
  variables?: Record<string, string | number | boolean>;
  /** File attachments */
  attachments?: EmailAttachment[];
  /** Email tags for organization */
  tags?: string[];
  /** Custom metadata */
  metadata?: Record<string, string | number | boolean>;
  /** Tracking options */
  tracking?: EmailTracking;
  /** Schedule email for later (ISO 8601 date string or natural language) */
  scheduled_at?: string;
}

/**
 * Email response from EmailIt API
 */
export interface EmailResponse {
  object: 'email';
  id: string;
  ids?: Record<string, string>;
  token: string;
  message_id: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  status: 'pending' | 'sent' | 'scheduled' | 'delivered' | 'failed' | 'bounced';
  scheduled_at?: string;
  created_at: string;
  tracking?: EmailTracking;
}

/**
 * EmailIt API error response
 */
export interface EmailItError {
  error: string;
  details?: string;
  validation_errors?: string[];
  message?: string;
  limit?: number;
  current?: number;
  retry_after?: number;
}

/**
 * EmailIt client configuration
 */
export interface EmailItConfig {
  apiKey: string;
  baseUrl?: string;
}

/**
 * EmailIt API Client
 *
 * Provides a type-safe interface for sending emails via the EmailIt API
 *
 * @example
 * ```typescript
 * const emailit = new EmailItClient({ apiKey: process.env.EMAILIT_API_KEY });
 *
 * // Send a simple email
 * await emailit.send({
 *   from: 'noreply@yourdomain.com',
 *   to: 'user@example.com',
 *   subject: 'Welcome!',
 *   html: '<h1>Welcome to our service!</h1>',
 * });
 *
 * // Send with template
 * await emailit.send({
 *   from: 'noreply@yourdomain.com',
 *   to: 'user@example.com',
 *   template: 'welcome_email',
 *   variables: { name: 'John Doe' },
 * });
 * ```
 */
export class EmailItClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: EmailItConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.emailit.com/v2';
  }

  /**
   * Format an email address for the API
   */
  private formatAddress(address: string | EmailRecipient): string {
    if (typeof address === 'string') {
      return address;
    }
    return address.name ? `${address.name} <${address.email}>` : address.email;
  }

  /**
   * Format multiple email addresses for the API
   */
  private formatAddresses(
    addresses?: string | string[] | EmailRecipient | EmailRecipient[]
  ): string[] | undefined {
    if (!addresses) return undefined;

    if (typeof addresses === 'string') {
      return [addresses];
    }

    if (Array.isArray(addresses)) {
      return addresses.map((addr) =>
        typeof addr === 'string' ? addr : this.formatAddress(addr)
      );
    }

    return [this.formatAddress(addresses)];
  }

  /**
   * Send an email via EmailIt API
   *
   * @throws {Error} If the API request fails or validation fails
   */
  async send(options: SendEmailOptions): Promise<EmailResponse> {
    const payload: Record<string, unknown> = {
      from: this.formatAddress(options.from),
      to: this.formatAddresses(options.to),
      subject: options.subject,
    };

    // Add optional fields
    if (options.cc) payload.cc = this.formatAddresses(options.cc);
    if (options.bcc) payload.bcc = this.formatAddresses(options.bcc);
    if (options.reply_to) {
      payload.reply_to =
        typeof options.reply_to === 'string'
          ? options.reply_to
          : this.formatAddress(options.reply_to);
    }
    if (options.html) payload.html = options.html;
    if (options.text) payload.text = options.text;
    if (options.template) payload.template = options.template;
    if (options.variables) payload.variables = options.variables;
    if (options.attachments) payload.attachments = options.attachments;
    if (options.tags) payload.tags = options.tags;
    if (options.metadata) payload.metadata = options.metadata;
    if (options.tracking) payload.tracking = options.tracking;
    if (options.scheduled_at) payload.scheduled_at = options.scheduled_at;

    try {
      const response = await fetch(`${this.baseUrl}/emails`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = data as EmailItError;
        throw new EmailItApiError(
          error.error || 'Failed to send email',
          response.status,
          error
        );
      }

      return data as EmailResponse;
    } catch (error) {
      if (error instanceof EmailItApiError) {
        throw error;
      }
      throw new Error(
        `EmailIt API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Send a simple email with HTML content
   *
   * @example
   * ```typescript
   * await emailit.sendSimple({
   *   to: 'user@example.com',
   *   subject: 'Hello!',
   *   html: '<p>Welcome!</p>',
   * });
   * ```
   */
  async sendSimple(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
  }): Promise<EmailResponse> {
    return this.send({
      from: options.from || process.env.EMAILIT_DEFAULT_FROM || '',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }

  /**
   * Send an email using a template
   *
   * @example
   * ```typescript
   * await emailit.sendWithTemplate({
   *   to: 'user@example.com',
   *   template: 'welcome_email',
   *   variables: { name: 'John', activation_url: 'https://...' },
   * });
   * ```
   */
  async sendWithTemplate(options: {
    to: string;
    template: string;
    variables?: Record<string, string | number | boolean>;
    from?: string;
    subject?: string;
  }): Promise<EmailResponse> {
    return this.send({
      from: options.from || process.env.EMAILIT_DEFAULT_FROM || '',
      to: options.to,
      template: options.template,
      variables: options.variables,
      subject: options.subject || '',
    });
  }

  /**
   * Schedule an email for later delivery
   *
   * @example
   * ```typescript
   * await emailit.schedule({
   *   to: 'user@example.com',
   *   subject: 'Reminder',
   *   html: '<p>Your appointment is tomorrow</p>',
   *   scheduled_at: '2024-01-15T09:00:00Z',
   * });
   * ```
   */
  async schedule(options: SendEmailOptions & { scheduled_at: string }): Promise<EmailResponse> {
    return this.send(options);
  }

  /**
   * Get email status by ID
   */
  async getEmail(emailId: string): Promise<EmailResponse> {
    const response = await fetch(`${this.baseUrl}/emails/${emailId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as EmailItError;
      throw new EmailItApiError(
        error.error || 'Failed to get email',
        response.status,
        error
      );
    }

    return data as EmailResponse;
  }

  /**
   * Cancel a scheduled email
   */
  async cancelEmail(emailId: string): Promise<EmailResponse> {
    const response = await fetch(`${this.baseUrl}/emails/${emailId}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as EmailItError;
      throw new EmailItApiError(
        error.error || 'Failed to cancel email',
        response.status,
        error
      );
    }

    return data as EmailResponse;
  }
}

/**
 * Custom error class for EmailIt API errors
 */
export class EmailItApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: EmailItError;

  constructor(message: string, statusCode: number, details?: EmailItError) {
    super(message);
    this.name = 'EmailItApiError';
    this.statusCode = statusCode;
    this.details = details;

    // Set the prototype explicitly
    Object.setPrototypeOf(this, EmailItApiError.prototype);
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(): boolean {
    return this.statusCode === 400;
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  /**
   * Check if error is a rate limit error
   */
  isRateLimitError(): boolean {
    return this.statusCode === 429;
  }

  /**
   * Get validation errors if available
   */
  getValidationErrors(): string[] | undefined {
    return this.details?.validation_errors;
  }

  /**
   * Get retry-after seconds for rate limit errors
   */
  getRetryAfter(): number | undefined {
    return this.details?.retry_after;
  }
}

/**
 * Default EmailIt client instance
 *
 * Initialize with your API key from environment variable EMAILIT_API_KEY
 */
export const emailit = new EmailItClient({
  apiKey: process.env.EMAILIT_API_KEY || '',
});

/**
 * Initialize EmailIt client with custom configuration
 */
export function createEmailItClient(config: EmailItConfig): EmailItClient {
  return new EmailItClient(config);
}
