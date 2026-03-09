/**
 * Kiwify Webhook Routes
 *
 * Handles webhook events from Kiwify payment platform
 * Implements compra_aprovada, refund, and chargeback handlers
 *
 * @module server/routes/kiwify
 */

import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import {
  kiwifyClient,
  KiwifySale,
  KiwifyWebhookPayload,
} from '../lib/kiwify.js';
import {
  ACCESS_DURATION_MS,
  KIWIFY_PRODUCT,
  KIWIFY_WEBHOOK_EVENTS,
  KiwifyWebhookEventType,
} from '../lib/kiwify-config.js';
import { emailService } from '../services/email.service.js';

const router = Router();

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Log webhook event for audit trail
 */
function logWebhookEvent(
  event: string,
  data: {
    saleId?: string;
    customerEmail?: string;
    status?: string;
    error?: string;
    [key: string]: unknown;
  }
): void {
  const timestamp = new Date().toISOString();
  console.log(`[Kiwify Webhook] [${timestamp}] ${event}`, JSON.stringify(data, null, 2));
}

/**
 * Find or create user by email
 * Returns user ID if found or created
 */
async function findOrCreateUser(
  email: string,
  name: string,
  cpf?: string
): Promise<{ userId: string; isNewUser: boolean }> {
  // First, try to find existing user by email
  const { data: existingUser, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (userError) {
    console.error('[Kiwify] Error finding user:', userError);
    throw userError;
  }

  if (existingUser) {
    return { userId: existingUser.id, isNewUser: false };
  }

  // Create new user via Supabase Auth
  // Generate a random password for the new user
  const tempPassword = crypto.randomUUID();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: tempPassword,
    options: {
      data: {
        full_name: name,
        cpf: cpf || null,
      },
      emailRedirectTo: `${process.env.VITE_APP_URL}/login`,
    },
  });

  if (authError) {
    // Check if user already exists (race condition)
    if (authError.message.includes('already registered')) {
      const { data: retryUser, error: retryError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (retryError) throw retryError;
      if (retryUser) return { userId: retryUser.id, isNewUser: false };
    }

    console.error('[Kiwify] Error creating user:', authError);
    throw authError;
  }

  if (!authData.user) {
    throw new Error('Failed to create user - no user returned');
  }

  return { userId: authData.user.id, isNewUser: true };
}

/**
 * Check if payment has already been processed (idempotency)
 */
async function isPaymentProcessed(kiwifySaleId: string): Promise<boolean> {
  const { data: existingPayment, error } = await supabase
    .from('payments')
    .select('id')
    .eq('kiwify_sale_id', kiwifySaleId)
    .maybeSingle();

  if (error) {
    console.error('[Kiwify] Error checking existing payment:', error);
    throw error;
  }

  return !!existingPayment;
}

/**
 * Record payment in database
 */
async function recordPayment(
  userId: string,
  sale: KiwifySale
): Promise<void> {
  const expiresAt = new Date(Date.now() + ACCESS_DURATION_MS).toISOString();

  const { error } = await supabase.from('payments').insert({
    user_id: userId,
    payment_provider: 'kiwify',
    kiwify_sale_id: sale.id,
    amount: sale.total,
    currency: sale.currency || 'BRL',
    status: 'succeeded',
    access_expires_at: expiresAt,
  });

  if (error) {
    console.error('[Kiwify] Error recording payment:', error);
    throw error;
  }
}

/**
 * Grant user access
 */
async function grantUserAccess(userId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + ACCESS_DURATION_MS).toISOString();

  // Check if user already has active access
  const { data: existingAccess, error: accessCheckError } = await supabase
    .from('user_access')
    .select('id, expires_at')
    .eq('user_id', userId)
    .eq('access_type', 'one_time')
    .maybeSingle();

  if (accessCheckError) {
    console.error('[Kiwify] Error checking existing access:', accessCheckError);
    throw accessCheckError;
  }

  if (existingAccess) {
    // Extend access if current access is still valid
    const currentExpiry = new Date(existingAccess.expires_at);
    const now = new Date();

    if (currentExpiry > now) {
      // Extend from current expiry
      const newExpiry = new Date(currentExpiry.getTime() + ACCESS_DURATION_MS);
      const { error: updateError } = await supabase
        .from('user_access')
        .update({
          expires_at: newExpiry.toISOString(),
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAccess.id);

      if (updateError) {
        console.error('[Kiwify] Error extending access:', updateError);
        throw updateError;
      }

      logWebhookEvent('access_extended', {
        userId,
        previousExpiry: existingAccess.expires_at,
        newExpiry: newExpiry.toISOString(),
      });
    } else {
      // Expired access - update with new expiry
      const { error: updateError } = await supabase
        .from('user_access')
        .update({
          expires_at: expiresAt,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAccess.id);

      if (updateError) {
        console.error('[Kiwify] Error renewing access:', updateError);
        throw updateError;
      }
    }
  } else {
    // Create new access record
    const { error: insertError } = await supabase.from('user_access').insert({
      user_id: userId,
      access_type: 'one_time',
      expires_at: expiresAt,
      is_active: true,
    });

    if (insertError) {
      console.error('[Kiwify] Error creating access:', insertError);
      throw insertError;
    }
  }
}

/**
 * Send payment confirmation email
 */
async function sendPaymentConfirmationEmail(
  email: string,
  name: string,
  expiresAt: Date
): Promise<void> {
  try {
    await emailService.sendCustomEmail({
      to: email,
      subject: 'Pagamento Confirmado - CPF Blindado',
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pagamento Confirmado - CPF Blindado</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #16a34a; color: white; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 28px;">Pagamento Confirmado!</h1>
          </div>

          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <p style="font-size: 18px;">Ola, <strong>${escapeHtml(name)}</strong>!</p>

            <p>Seu pagamento foi processado com sucesso! Voce agora tem acesso premium ao CPF Blindado.</p>

            <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Detalhes do seu acesso:</strong></p>
              <ul style="margin: 10px 0 0 20px; padding: 0;">
                <li>Produto: ${KIWIFY_PRODUCT.title}</li>
                <li>Valor: R$ ${KIWIFY_PRODUCT.unit_price.toFixed(2).replace('.', ',')}</li>
                <li>Duracao: ${KIWIFY_PRODUCT.duration_months} meses</li>
                <li>Expira em: ${expiresAt.toLocaleDateString('pt-BR')}</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.VITE_APP_URL}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Acessar Dashboard
              </a>
            </div>

            <p>Se voce tiver alguma duvida, entre em contato conosco.</p>

            <p style="margin-top: 30px;">
              Atenciosamente,<br>
              <strong>Equipe CPF Blindado</strong>
            </p>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center;">
            <p>CPF Blindado - Sua solucao para limpar o nome</p>
          </div>
        </body>
        </html>
      `,
      text: `
Ola, ${name}!

Seu pagamento foi processado com sucesso! Voce agora tem acesso premium ao CPF Blindado.

Detalhes do seu acesso:
- Produto: ${KIWIFY_PRODUCT.title}
- Valor: R$ ${KIWIFY_PRODUCT.unit_price.toFixed(2).replace('.', ',')}
- Duracao: ${KIWIFY_PRODUCT.duration_months} meses
- Expira em: ${expiresAt.toLocaleDateString('pt-BR')}

Acesse seu dashboard em: ${process.env.VITE_APP_URL}/dashboard

Atenciosamente,
Equipe CPF Blindado
      `.trim(),
    });

    logWebhookEvent('email_sent', { email, name });
  } catch (error) {
    // Don't fail the webhook if email fails
    console.error('[Kiwify] Failed to send confirmation email:', error);
    logWebhookEvent('email_failed', { email, error: String(error) });
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// ============================================================================
// Webhook Handlers
// ============================================================================

/**
 * Handle compra_aprovada event
 * Creates user, records payment, grants access, and sends confirmation email
 */
async function handleCompraAprovada(
  saleId: string,
  webhookData?: KiwifyWebhookPayload
): Promise<{ success: boolean; userId?: string; error?: string }> {
  logWebhookEvent('compra_aprovada_started', { saleId });

  try {
    // Idempotency check
    if (await isPaymentProcessed(saleId)) {
      logWebhookEvent('compra_aprovada_duplicate', { saleId });
      return { success: true }; // Already processed, return success
    }

    // Get full sale details from Kiwify API
    const sale = await kiwifyClient.getSale(saleId);

    logWebhookEvent('sale_retrieved', {
      saleId: sale.id,
      status: sale.status,
      customerEmail: sale.customer.email,
      customerName: sale.customer.name,
      total: sale.total,
    });

    // Verify sale is actually paid
    if (sale.status !== 'paid') {
      logWebhookEvent('sale_not_paid', {
        saleId: sale.id,
        status: sale.status,
      });
      return { success: false, error: `Sale status is ${sale.status}, not paid` };
    }

    // Find or create user
    const { userId, isNewUser } = await findOrCreateUser(
      sale.customer.email,
      sale.customer.name,
      sale.customer.document
    );

    logWebhookEvent('user_resolved', {
      userId,
      isNewUser,
      email: sale.customer.email,
    });

    // Record payment
    await recordPayment(userId, sale);

    // Grant access
    await grantUserAccess(userId);

    // Calculate expiry date for email
    const expiresAt = new Date(Date.now() + ACCESS_DURATION_MS);

    // Send confirmation email
    await sendPaymentConfirmationEmail(sale.customer.email, sale.customer.name, expiresAt);

    logWebhookEvent('compra_aprovada_completed', {
      saleId: sale.id,
      userId,
      email: sale.customer.email,
      expiresAt: expiresAt.toISOString(),
    });

    return { success: true, userId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logWebhookEvent('compra_aprovada_failed', {
      saleId,
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Find user by email address
 */
async function findUserByEmail(email: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('[Kiwify] Error finding user by email:', error);
    return null;
  }

  return data?.id || null;
}

/**
 * Revoke user access (for refunds and chargebacks)
 */
async function revokeUserAccess(
  userId: string,
  kiwifySaleId: string,
  reason: 'refund' | 'chargeback'
): Promise<{ success: boolean; error?: string }> {
  logWebhookEvent('access_revocation_started', {
    userId,
    kiwifySaleId,
    reason,
  });

  try {
    // Update payment status to cancelled
    const { error: paymentUpdateError } = await supabase
      .from('payments')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('kiwify_sale_id', kiwifySaleId);

    if (paymentUpdateError) {
      console.error('[Kiwify] Error updating payment status:', paymentUpdateError);
      // Continue to revoke access even if payment update fails
    }

    // Deactivate user access
    const { error: accessError, count } = await supabase
      .from('user_access')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('access_type', 'one_time');

    if (accessError) {
      console.error('[Kiwify] Error revoking user access:', accessError);
      throw accessError;
    }

    logWebhookEvent('access_revoked', {
      userId,
      kiwifySaleId,
      reason,
      recordsUpdated: count,
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logWebhookEvent('access_revocation_failed', {
      userId,
      kiwifySaleId,
      reason,
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Flag user account for manual review (for chargebacks)
 */
async function flagAccountForReview(
  userId: string,
  kiwifySaleId: string,
  reason: string
): Promise<void> {
  try {
    // Try to insert into admin_notes table if it exists
    const { error } = await supabase.from('admin_notes').insert({
      user_id: userId,
      note: `CHARGEBACK ALERT: ${reason}. Kiwify Sale ID: ${kiwifySaleId}. Access revoked automatically.`,
      created_by: 'system',
      created_at: new Date().toISOString(),
    });

    if (error) {
      // Table might not exist - log the flag for manual review instead
      console.warn('[Kiwify] Could not flag account in admin_notes table:', error.message);
      logWebhookEvent('account_flagged_manual', {
        userId,
        kiwifySaleId,
        reason,
        note: 'Manual review required - admin_notes table not available',
      });
    } else {
      logWebhookEvent('account_flagged', {
        userId,
        kiwifySaleId,
        reason,
      });
    }
  } catch (error) {
    // Don't throw - flagging is not critical
    console.error('[Kiwify] Error flagging account for review:', error);
  }
}

/**
 * Send access revocation notification email
 */
async function sendAccessRevocationEmail(
  email: string,
  name: string,
  reason: 'refund' | 'chargeback'
): Promise<void> {
  try {
    const reasonText = reason === 'chargeback' ? 'chargeback' : 'reembolso';

    await emailService.sendCustomEmail({
      to: email,
      subject: 'Acesso Atualizado - CPF Blindado',
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Acesso Atualizado - CPF Blindado</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #dc2626; color: white; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 28px;">Acesso Atualizado</h1>
          </div>

          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <p style="font-size: 18px;">Ola, <strong>${escapeHtml(name)}</strong>!</p>

            <p>Informamos que seu acesso premium foi atualizado devido a um ${reasonText} processado.</p>

            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b;">
                <strong>Importante:</strong> Seu acesso premium foi desativado. Se voce acredita que isso e um erro, entre em contato com nosso suporte.
              </p>
            </div>

            <p>Para mais informacoes ou para regularizar sua situacao, entre em contato conosco atraves do nosso suporte.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.VITE_APP_URL}/suporte" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Falar com Suporte
              </a>
            </div>

            <p style="margin-top: 30px;">
              Atenciosamente,<br>
              <strong>Equipe CPF Blindado</strong>
            </p>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center;">
            <p>CPF Blindado - Sua solucao para limpar o nome</p>
          </div>
        </body>
        </html>
      `,
      text: `
Ola, ${name}!

Informamos que seu acesso premium foi atualizado devido a um ${reasonText} processado.

Seu acesso premium foi desativado. Se voce acredita que isso e um erro, entre em contato com nosso suporte em: ${process.env.VITE_APP_URL}/suporte

Atenciosamente,
Equipe CPF Blindado
      `.trim(),
    });

    logWebhookEvent('revocation_email_sent', { email, name, reason });
  } catch (error) {
    // Don't fail the webhook if email fails
    console.error('[Kiwify] Failed to send revocation email:', error);
    logWebhookEvent('revocation_email_failed', { email, error: String(error) });
  }
}

/**
 * Handle compra_reembolsada event (refund)
 * Revokes user access and sends notification email
 */
async function handleCompraReembolsada(
  saleId: string,
  webhookData?: KiwifyWebhookPayload
): Promise<{ success: boolean; userId?: string; error?: string }> {
  logWebhookEvent('compra_reembolsada_started', { saleId });

  try {
    // Get sale details from Kiwify API
    const sale = await kiwifyClient.getSale(saleId);

    logWebhookEvent('refund_sale_retrieved', {
      saleId: sale.id,
      status: sale.status,
      customerEmail: sale.customer.email,
      customerName: sale.customer.name,
    });

    // Find user by email
    const userId = await findUserByEmail(sale.customer.email);

    if (!userId) {
      logWebhookEvent('refund_user_not_found', {
        saleId: sale.id,
        email: sale.customer.email,
      });
      // User not found - nothing to revoke
      return { success: true };
    }

    // Revoke access
    const revokeResult = await revokeUserAccess(userId, sale.id, 'refund');

    if (!revokeResult.success) {
      return { success: false, userId, error: revokeResult.error };
    }

    // Send notification email
    await sendAccessRevocationEmail(sale.customer.email, sale.customer.name, 'refund');

    logWebhookEvent('compra_reembolsada_completed', {
      saleId: sale.id,
      userId,
      email: sale.customer.email,
    });

    return { success: true, userId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logWebhookEvent('compra_reembolsada_failed', {
      saleId,
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Handle chargeback event
 * Revokes access immediately, flags account for review, and sends notification
 */
async function handleChargeback(
  saleId: string,
  webhookData?: KiwifyWebhookPayload
): Promise<{ success: boolean; userId?: string; error?: string }> {
  logWebhookEvent('chargeback_started', { saleId });

  try {
    // Get sale details from Kiwify API
    const sale = await kiwifyClient.getSale(saleId);

    logWebhookEvent('chargeback_sale_retrieved', {
      saleId: sale.id,
      status: sale.status,
      customerEmail: sale.customer.email,
      customerName: sale.customer.name,
    });

    // Find user by email
    const userId = await findUserByEmail(sale.customer.email);

    if (!userId) {
      logWebhookEvent('chargeback_user_not_found', {
        saleId: sale.id,
        email: sale.customer.email,
      });
      // User not found - nothing to revoke
      return { success: true };
    }

    // Revoke access immediately
    const revokeResult = await revokeUserAccess(userId, sale.id, 'chargeback');

    if (!revokeResult.success) {
      return { success: false, userId, error: revokeResult.error };
    }

    // Flag account for manual review
    await flagAccountForReview(
      userId,
      sale.id,
      `Chargeback received for sale ${sale.id}`
    );

    // Send notification email
    await sendAccessRevocationEmail(sale.customer.email, sale.customer.name, 'chargeback');

    logWebhookEvent('chargeback_completed', {
      saleId: sale.id,
      userId,
      email: sale.customer.email,
      flagged: true,
    });

    return { success: true, userId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logWebhookEvent('chargeback_failed', {
      saleId,
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

// ============================================================================
// Routes
// ============================================================================

/**
 * POST /api/webhooks/kiwify
 * Handle webhook events from Kiwify
 *
 * Headers:
 * - x-kiwify-token: Webhook verification token
 *
 * Body:
 * {
 *   "trigger": "compra_aprovada" | "compra_recusada" | ...,
 *   "sale_id": "sale_123",
 *   "token": "webhook_token",
 *   "occurred_at": "2024-01-15T10:30:00Z",
 *   "data": { ... }
 * }
 */
router.post('/webhooks/kiwify', async (req: Request, res: Response) => {
  // Check if Kiwify is configured
  if (!kiwifyClient.isConfigured()) {
    console.error('[Kiwify] Webhook received but integration not configured');
    return res.status(503).json({
      error: 'Kiwify integration not configured',
      received: false,
    });
  }

  const webhookToken = req.headers['x-kiwify-token'] as string || req.body?.webhook_token;

  // Verify webhook token
  if (!webhookToken || !kiwifyClient.verifyWebhookToken(webhookToken)) {
    logWebhookEvent('unauthorized', {
      providedToken: webhookToken ? '[REDACTED]' : '[MISSING]',
    });
    return res.status(401).json({
      error: 'Invalid webhook token',
      received: false,
    });
  }

  const event = req.body as KiwifyWebhookPayload;

  // Validate required fields
  if (!event.event || !event.sale_id) {
    logWebhookEvent('invalid_payload', { body: req.body });
    return res.status(400).json({
      error: 'Missing required fields: event, sale_id',
      received: false,
    });
  }

  logWebhookEvent('webhook_received', {
    event: event.event,
    saleId: event.sale_id,
    timestamp: event.timestamp,
  });

  try {
    let result: { success: boolean; userId?: string; error?: string };

    switch (event.event as KiwifyWebhookEventType) {
      case KIWIFY_WEBHOOK_EVENTS.COMPRA_APROVADA:
        result = await handleCompraAprovada(event.sale_id, event);
        break;

      case KIWIFY_WEBHOOK_EVENTS.COMPRA_RECUSADA:
        // Log refused payment - no action needed
        logWebhookEvent('compra_recusada', {
          saleId: event.sale_id,
          data: event,
        });
        result = { success: true };
        break;

      case KIWIFY_WEBHOOK_EVENTS.COMPRA_REEMBOLSADA:
        // Refund - revoke access and send notification
        result = await handleCompraReembolsada(event.sale_id, event);
        break;

      case KIWIFY_WEBHOOK_EVENTS.CHARGEBACK:
        // Chargeback - revoke access, flag account, and send notification
        result = await handleChargeback(event.sale_id, event);
        break;

      case KIWIFY_WEBHOOK_EVENTS.SUBSCRIPTION_CANCELED:
        // TODO: Implement subscription cancellation handling
        logWebhookEvent('subscription_canceled', {
          saleId: event.sale_id,
          data: event,
        });
        result = { success: true };
        break;

      case KIWIFY_WEBHOOK_EVENTS.SUBSCRIPTION_RENEWED:
        // TODO: Implement subscription renewal handling
        logWebhookEvent('subscription_renewed', {
          saleId: event.sale_id,
          data: event,
        });
        result = { success: true };
        break;

      default:
        logWebhookEvent('unknown_event', {
          event: event.event,
          saleId: event.sale_id,
        });
        result = { success: true }; // Acknowledge but don't process
    }

    // Always return 200 to prevent Kiwify retries
    return res.status(200).json({
      received: true,
      event: event.event,
      saleId: event.sale_id,
      success: result.success,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logWebhookEvent('webhook_error', {
      event: event.event,
      saleId: event.sale_id,
      error: errorMessage,
    });

    // Still return 200 to prevent Kiwify retries
    // Log the error for manual investigation
    return res.status(200).json({
      received: true,
      error: errorMessage,
    });
  }
});

/**
 * GET /api/kiwify/config
 * Get Kiwify configuration status (public info only)
 */
router.get('/config', (_req: Request, res: Response) => {
  return res.status(200).json({
    configured: kiwifyClient.isConfigured(),
    productId: KIWIFY_PRODUCT.id,
    productTitle: KIWIFY_PRODUCT.title,
    price: KIWIFY_PRODUCT.unit_price,
    currency: KIWIFY_PRODUCT.currency_id,
    durationMonths: KIWIFY_PRODUCT.duration_months,
  });
});

/**
 * GET /api/kiwify/health
 * Health check for Kiwify integration
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    if (!kiwifyClient.isConfigured()) {
      return res.status(503).json({
        status: 'not_configured',
        message: 'Kiwify integration not configured',
      });
    }

    // For health check, we just verify the client is configured
    // Token retrieval is private, so we can't call it directly

    return res.status(200).json({
      status: 'ok',
      message: 'Kiwify integration is healthy',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(503).json({
      status: 'error',
      message: errorMessage,
    });
  }
});

export { router as kiwifyRouter };
