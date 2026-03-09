/**
 * Kiwify Payment Logger
 *
 * Centralized logging utility for Kiwify webhook events and payment processing.
 * Provides structured logging with context-rich entries for:
 * - Webhook event reception and verification
 * - Payment approval, refusal, refund, and chargeback handling
 * - User access provisioning and revocation
 * - API communication with Kiwify
 * - Error tracking and debugging
 *
 * @module server/lib/kiwify-logger
 */

import { createClient } from '@supabase/supabase-js';
import type { KiwifyWebhookTrigger } from './kiwify-config';
import type { KiwifySale, KiwifyWebhookPayload } from './kiwify';

// ============================================================================
// Supabase Admin Client (Service Role)
// ============================================================================

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// ============================================================================
// TypeScript Types
// ============================================================================

/**
 * Kiwify webhook event action types for logging
 */
export type KiwifyLogAction =
  | 'webhook_received'
  | 'webhook_verified'
  | 'webhook_verification_failed'
  | 'webhook_duplicate'
  | 'payment_approved'
  | 'payment_refused'
  | 'payment_refunded'
  | 'payment_chargeback'
  | 'subscription_canceled'
  | 'subscription_renewed'
  | 'access_granted'
  | 'access_revoked'
  | 'access_extended'
  | 'email_sent'
  | 'email_failed'
  | 'api_request'
  | 'api_error'
  | 'token_refresh'
  | 'processing_error';

/**
 * Processing status for log entries
 */
export type KiwifyProcessingStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'skipped';

/**
 * Log level for console output
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Kiwify log entry structure for database persistence
 */
export interface KiwifyLogEntry {
  id?: string;
  action: KiwifyLogAction;
  status: KiwifyProcessingStatus;
  sale_id: string | null;
  order_id: string | null;
  customer_email: string | null;
  event_type: KiwifyWebhookTrigger | null;
  message: string;
  metadata: Record<string, unknown>;
  error_details: Record<string, unknown> | null;
  timestamp: string;
  processing_duration_ms?: number;
}

/**
 * Parameters for logging a Kiwify event
 */
export interface LogKiwifyEventParams {
  action: KiwifyLogAction;
  status?: KiwifyProcessingStatus;
  saleId?: string | null;
  orderId?: string | null;
  customerEmail?: string | null;
  eventType?: KiwifyWebhookTrigger | null;
  message: string;
  metadata?: Record<string, unknown>;
  error?: Error | unknown;
  processingDurationMs?: number;
}

/**
 * Webhook processing context for tracking
 */
export interface WebhookProcessingContext {
  requestId: string;
  startTime: number;
  payload: Partial<KiwifyWebhookPayload>;
}

// ============================================================================
// Console Logging Helpers
// ============================================================================

const LOG_PREFIX = '[Kiwify]';

/**
 * Format timestamp for console output
 */
function formatTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Get log level styling for console
 */
function getLogPrefix(level: LogLevel): string {
  const timestamp = formatTimestamp();
  switch (level) {
    case 'error':
      return `\x1b[31m${timestamp} ${LOG_PREFIX}\x1b[0m`; // Red
    case 'warn':
      return `\x1b[33m${timestamp} ${LOG_PREFIX}\x1b[0m`; // Yellow
    case 'debug':
      return `\x1b[36m${timestamp} ${LOG_PREFIX}\x1b[0m`; // Cyan
    default:
      return `\x1b[32m${timestamp} ${LOG_PREFIX}\x1b[0m`; // Green
  }
}

/**
 * Console log with consistent formatting
 */
function consoleLog(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  const prefix = getLogPrefix(level);
  const formattedMessage = data ? `${message}` : message;

  switch (level) {
    case 'error':
      console.error(prefix, formattedMessage, data || '');
      break;
    case 'warn':
      console.warn(prefix, formattedMessage, data || '');
      break;
    case 'debug':
      console.debug(prefix, formattedMessage, data || '');
      break;
    default:
      console.log(prefix, formattedMessage, data || '');
  }
}

// ============================================================================
// Main Logging Functions
// ============================================================================

/**
 * Log a Kiwify webhook event to both console and database
 *
 * @param params - Event log parameters
 * @returns The created log entry (if database available)
 *
 * @example
 * ```typescript
 * await logKiwifyEvent({
 *   action: 'payment_approved',
 *   status: 'completed',
 *   saleId: 'sale_123',
 *   customerEmail: 'user@example.com',
 *   eventType: 'compra_aprovada',
 *   message: 'Payment approved and access granted',
 *   metadata: { amount: 149.90, currency: 'BRL' }
 * });
 * ```
 */
export async function logKiwifyEvent(
  params: LogKiwifyEventParams
): Promise<KiwifyLogEntry | null> {
  const {
    action,
    status = 'completed',
    saleId = null,
    orderId = null,
    customerEmail = null,
    eventType = null,
    message,
    metadata = {},
    error,
    processingDurationMs,
  } = params;

  // Determine log level based on action and status
  const logLevel: LogLevel = status === 'failed' || action.includes('error') || action.includes('failed')
    ? 'error'
    : status === 'skipped' || action.includes('duplicate')
    ? 'warn'
    : 'info';

  // Build error details if present
  const errorDetails = error
    ? {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }
    : null;

  // Build log entry
  const logEntry: KiwifyLogEntry = {
    action,
    status,
    sale_id: saleId,
    order_id: orderId,
    customer_email: customerEmail,
    event_type: eventType,
    message,
    metadata,
    error_details: errorDetails,
    timestamp: new Date().toISOString(),
    processing_duration_ms: processingDurationMs,
  };

  // Console output with contextual data
  const consoleData = {
    action,
    status,
    saleId,
    customerEmail,
    eventType,
    ...(Object.keys(metadata).length > 0 && { metadata }),
    ...(errorDetails && { error: errorDetails }),
    ...(processingDurationMs && { durationMs: processingDurationMs }),
  };

  consoleLog(logLevel, message, consoleData);

  // Persist to database if available
  if (supabaseAdmin) {
    try {
      const { data, error: dbError } = await supabaseAdmin
        .from('kiwify_webhook_logs')
        .insert(logEntry)
        .select()
        .single();

      if (dbError) {
        // Log database error but don't throw - logging failures shouldn't break processing
        console.error('Failed to persist Kiwify log to database:', dbError);
        return null;
      }

      return data as KiwifyLogEntry;
    } catch (dbException) {
      console.error('Exception while logging to database:', dbException);
      return null;
    }
  }

  return logEntry;
}

// ============================================================================
// Specialized Logging Functions
// ============================================================================

/**
 * Log webhook receipt
 */
export async function logWebhookReceived(
  payload: Partial<KiwifyWebhookPayload>,
  requestId?: string
): Promise<KiwifyLogEntry | null> {
  return logKiwifyEvent({
    action: 'webhook_received',
    status: 'pending',
    saleId: payload.sale_id,
    orderId: payload.order_id,
    customerEmail: payload.customer_email,
    eventType: payload.event,
    message: 'Webhook received from Kiwify',
    metadata: {
      request_id: requestId,
      has_token: !!payload.webhook_token,
    },
  });
}

/**
 * Log webhook verification result
 */
export async function logWebhookVerification(
  success: boolean,
  saleId?: string,
  reason?: string
): Promise<KiwifyLogEntry | null> {
  return logKiwifyEvent({
    action: success ? 'webhook_verified' : 'webhook_verification_failed',
    status: success ? 'completed' : 'failed',
    saleId: saleId || null,
    message: success
      ? 'Webhook token verified successfully'
      : `Webhook verification failed: ${reason || 'Invalid token'}`,
    metadata: { reason },
  });
}

/**
 * Log duplicate webhook (idempotency)
 */
export async function logDuplicateWebhook(
  saleId: string,
  previousStatus?: string
): Promise<KiwifyLogEntry | null> {
  return logKiwifyEvent({
    action: 'webhook_duplicate',
    status: 'skipped',
    saleId,
    message: 'Duplicate webhook detected, skipping processing',
    metadata: { previous_status: previousStatus },
  });
}

/**
 * Log payment approval with access provisioning
 */
export async function logPaymentApproved(
  sale: KiwifySale,
  userId?: string,
  processingDurationMs?: number
): Promise<KiwifyLogEntry | null> {
  return logKiwifyEvent({
    action: 'payment_approved',
    status: 'completed',
    saleId: sale.id,
    orderId: sale.order_id,
    customerEmail: sale.customer.email,
    eventType: 'compra_aprovada',
    message: `Payment approved for ${sale.customer.email}`,
    metadata: {
      amount: sale.total,
      currency: sale.currency,
      payment_method: sale.payment_method,
      installments: sale.payment_installments,
      user_id: userId,
      customer_name: sale.customer.name,
      customer_document: sale.customer.document ? '***' : undefined, // Masked for privacy
      product_name: sale.products[0]?.name,
    },
    processingDurationMs,
  });
}

/**
 * Log payment refusal
 */
export async function logPaymentRefused(
  saleId: string,
  customerEmail: string,
  reason?: string
): Promise<KiwifyLogEntry | null> {
  return logKiwifyEvent({
    action: 'payment_refused',
    status: 'completed',
    saleId,
    customerEmail,
    eventType: 'compra_recusada',
    message: `Payment refused for ${customerEmail}`,
    metadata: { reason },
  });
}

/**
 * Log refund or chargeback
 */
export async function logRefundOrChargeback(
  saleId: string,
  customerEmail: string,
  isChargeback: boolean,
  accessRevoked: boolean
): Promise<KiwifyLogEntry | null> {
  return logKiwifyEvent({
    action: isChargeback ? 'payment_chargeback' : 'payment_refunded',
    status: 'completed',
    saleId,
    customerEmail,
    eventType: isChargeback ? 'chargeback' : 'compra_reembolsada',
    message: `${isChargeback ? 'Chargeback' : 'Refund'} processed for ${customerEmail}`,
    metadata: {
      access_revoked: accessRevoked,
    },
  });
}

/**
 * Log access provisioning
 */
export async function logAccessGranted(
  userId: string,
  saleId: string,
  expiresAt: string,
  isNewUser: boolean
): Promise<KiwifyLogEntry | null> {
  return logKiwifyEvent({
    action: 'access_granted',
    status: 'completed',
    saleId,
    message: `${isNewUser ? 'New user created and a' : 'A'}ccess granted until ${expiresAt}`,
    metadata: {
      user_id: userId,
      expires_at: expiresAt,
      is_new_user: isNewUser,
    },
  });
}

/**
 * Log access revocation
 */
export async function logAccessRevoked(
  userId: string,
  saleId: string,
  reason: string
): Promise<KiwifyLogEntry | null> {
  return logKiwifyEvent({
    action: 'access_revoked',
    status: 'completed',
    saleId,
    message: `Access revoked for user: ${reason}`,
    metadata: {
      user_id: userId,
      reason,
    },
  });
}

/**
 * Log email notification
 */
export async function logEmailNotification(
  customerEmail: string,
  saleId: string,
  emailType: 'payment_confirmation' | 'access_granted' | 'refund_notification',
  success: boolean,
  error?: Error
): Promise<KiwifyLogEntry | null> {
  return logKiwifyEvent({
    action: success ? 'email_sent' : 'email_failed',
    status: success ? 'completed' : 'failed',
    saleId,
    customerEmail,
    message: success
      ? `${emailType} email sent to ${customerEmail}`
      : `Failed to send ${emailType} email to ${customerEmail}`,
    metadata: { email_type: emailType },
    error,
  });
}

/**
 * Log processing error
 */
export async function logProcessingError(
  error: Error | unknown,
  context: {
    saleId?: string;
    customerEmail?: string;
    eventType?: KiwifyWebhookTrigger;
    stage: string;
  }
): Promise<KiwifyLogEntry | null> {
  return logKiwifyEvent({
    action: 'processing_error',
    status: 'failed',
    saleId: context.saleId,
    customerEmail: context.customerEmail,
    eventType: context.eventType,
    message: `Error during ${context.stage}: ${error instanceof Error ? error.message : String(error)}`,
    metadata: { stage: context.stage },
    error,
  });
}

/**
 * Log API request to Kiwify
 */
export async function logApiRequest(
  method: string,
  endpoint: string,
  statusCode: number,
  durationMs: number,
  saleId?: string
): Promise<KiwifyLogEntry | null> {
  const isSuccess = statusCode >= 200 && statusCode < 300;

  return logKiwifyEvent({
    action: isSuccess ? 'api_request' : 'api_error',
    status: isSuccess ? 'completed' : 'failed',
    saleId: saleId || null,
    message: `${method} ${endpoint} - ${statusCode}`,
    metadata: {
      method,
      endpoint,
      status_code: statusCode,
      duration_ms: durationMs,
    },
    processingDurationMs: durationMs,
  });
}

/**
 * Log OAuth token refresh
 */
export async function logTokenRefresh(
  success: boolean,
  expiresInMs?: number,
  error?: Error
): Promise<KiwifyLogEntry | null> {
  return logKiwifyEvent({
    action: 'token_refresh',
    status: success ? 'completed' : 'failed',
    message: success
      ? `OAuth token refreshed, expires in ${Math.floor((expiresInMs || 0) / 1000 / 60)} minutes`
      : 'Failed to refresh OAuth token',
    metadata: {
      expires_in_ms: expiresInMs,
    },
    error,
  });
}

// ============================================================================
// Context Tracking Helpers
// ============================================================================

/**
 * Create a webhook processing context for tracking duration
 */
export function createWebhookContext(
  payload: Partial<KiwifyWebhookPayload>
): WebhookProcessingContext {
  return {
    requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
    startTime: Date.now(),
    payload,
  };
}

/**
 * Get processing duration from context
 */
export function getProcessingDuration(context: WebhookProcessingContext): number {
  return Date.now() - context.startTime;
}

// ============================================================================
// Query Functions for Admin/Debugging
// ============================================================================

/**
 * Query logs for a specific sale
 */
export async function getLogsForSale(saleId: string, limit = 50): Promise<KiwifyLogEntry[]> {
  if (!supabaseAdmin) {
    console.warn('Database not available for log queries');
    return [];
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('kiwify_webhook_logs')
      .select('*')
      .eq('sale_id', saleId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to query logs: ${error.message}`);
    }

    return (data || []) as KiwifyLogEntry[];
  } catch (error) {
    console.error('Error querying logs for sale:', error);
    return [];
  }
}

/**
 * Query logs for a specific customer email
 */
export async function getLogsForCustomer(
  customerEmail: string,
  limit = 100
): Promise<KiwifyLogEntry[]> {
  if (!supabaseAdmin) {
    console.warn('Database not available for log queries');
    return [];
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('kiwify_webhook_logs')
      .select('*')
      .eq('customer_email', customerEmail)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to query logs: ${error.message}`);
    }

    return (data || []) as KiwifyLogEntry[];
  } catch (error) {
    console.error('Error querying logs for customer:', error);
    return [];
  }
}

/**
 * Query recent failed events
 */
export async function getRecentFailedLogs(limit = 50): Promise<KiwifyLogEntry[]> {
  if (!supabaseAdmin) {
    console.warn('Database not available for log queries');
    return [];
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('kiwify_webhook_logs')
      .select('*')
      .eq('status', 'failed')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to query logs: ${error.message}`);
    }

    return (data || []) as KiwifyLogEntry[];
  } catch (error) {
    console.error('Error querying failed logs:', error);
    return [];
  }
}

// ============================================================================
// Export Default
// ============================================================================

export default logKiwifyEvent;
