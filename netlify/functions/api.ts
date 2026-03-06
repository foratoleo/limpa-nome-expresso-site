/**
 * Netlify Function Handler
 * API simplificada para Netlify
 */

type NetlifyEvent = {
  httpMethod: string;
  path: string;
  rawUrl?: string;
  headers?: Record<string, string | undefined>;
  body?: string | null;
  queryStringParameters?: Record<string, string | undefined> | null;
};

type ApiResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

interface AccessStatusResponse {
  hasActiveAccess: boolean;
  hasManualAccess: boolean;
  accessType: 'subscription' | 'one_time' | 'manual' | null;
  expiresAt: string | null;
  manualAccessExpiresAt: string | null;
}

interface RegisterUserResult {
  userId: string;
  actionLink: string;
}

interface AdminAuthUser {
  id: string;
  email: string | null;
  user_metadata?: Record<string, unknown>;
}

interface AdminAuthContext {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  adminUser: AdminAuthUser;
}

interface ContactFormPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const CONTACT_EMAIL = 'limpanome@f2w2.com.br';

function jsonResponse(
  headers: Record<string, string>,
  statusCode: number,
  payload: unknown
): ApiResponse {
  return {
    statusCode,
    headers,
    body: JSON.stringify(payload),
  };
}

function getHeaderValue(event: NetlifyEvent, name: string): string | null {
  const headers = event.headers || {};
  const lowerName = name.toLowerCase();

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lowerName && typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return null;
}

function normalizeApiPath(event: NetlifyEvent): string {
  const candidate = event.rawUrl ?? event.path ?? '';
  let pathname = event.path ?? '';

  try {
    pathname = new URL(candidate, 'http://localhost').pathname;
  } catch {
    pathname = event.path ?? '';
  }

  const functionPrefix = '/.netlify/functions/api';
  if (pathname.startsWith(functionPrefix)) {
    const suffix = pathname.slice(functionPrefix.length);
    if (!suffix || suffix === '/') return '/api';
    return `/api${suffix.startsWith('/') ? suffix : `/${suffix}`}`;
  }

  return pathname;
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  return { supabaseUrl, supabaseServiceRoleKey };
}

function getSiteOrigin(event: NetlifyEvent): string {
  const directOrigin = getHeaderValue(event, 'origin');
  if (directOrigin) {
    return directOrigin.replace(/\/$/, '');
  }

  const host = getHeaderValue(event, 'x-forwarded-host') || getHeaderValue(event, 'host');
  const proto = getHeaderValue(event, 'x-forwarded-proto') || 'https';

  if (host) {
    return `${proto}://${host}`.replace(/\/$/, '');
  }

  return process.env.PUBLIC_SITE_URL || 'https://limpa-nome-expresso-site.netlify.app';
}

function getErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const err = payload as Record<string, unknown>;
  const msg = err.msg || err.message || err.error_description || err.error;
  return typeof msg === 'string' ? msg : '';
}

function parseJsonBody(event: NetlifyEvent): Record<string, unknown> {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body) as Record<string, unknown>;
  } catch {
    throw new Error('INVALID_JSON_BODY');
  }
}

function getQueryParam(event: NetlifyEvent, name: string): string | null {
  const direct = event.queryStringParameters?.[name];
  if (typeof direct === 'string' && direct.length > 0) {
    return direct;
  }

  const candidate = event.rawUrl ?? event.path ?? '';
  try {
    const value = new URL(candidate, 'http://localhost').searchParams.get(name);
    return value && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildConfirmationEmailHtml(email: string, actionLink: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Confirme seu e-mail</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 620px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #d39e17; margin-bottom: 12px;">Confirme seu e-mail</h1>
      <p style="margin: 0 0 12px;">Obrigado por criar sua conta no Limpa Nome Expresso.</p>
      <p style="margin: 0 0 24px;">Para ativar seu acesso, confirme o e-mail <strong>${email}</strong>.</p>
      <div style="text-align: center; margin: 20px 0 28px;">
        <a href="${actionLink}" style="background: #d39e17; color: #12110d; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 700;">
          Confirmar e-mail
        </a>
      </div>
      <p style="font-size: 13px; color: #6b7280;">Se o botão não funcionar, copie e cole este link no navegador:</p>
      <p style="font-size: 12px; color: #6b7280; word-break: break-all;">${actionLink}</p>
    </body>
    </html>
  `.trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getContactSubjectLabel(subject: string): string {
  const subjectMap: Record<string, string> = {
    duvida: 'Duvida sobre o processo',
    problema: 'Problema tecnico',
    sugestao: 'Sugestao',
    outro: 'Outro',
  };

  return subjectMap[subject] || subject || 'Contato';
}

function buildContactEmailHtml(payload: ContactFormPayload): string {
  const subjectLabel = getContactSubjectLabel(payload.subject);
  const submittedAt = new Date().toISOString();

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Novo contato - Limpa Nome Expresso</title>
    </head>
    <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#111827;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px;">
        <tr>
          <td align="center">
            <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
              <tr>
                <td style="background:#12110d;padding:20px 24px;">
                  <h1 style="margin:0;font-size:20px;line-height:1.3;color:#f9fafb;">Nova mensagem de suporte</h1>
                  <p style="margin:8px 0 0;color:#d1d5db;font-size:13px;">Limpa Nome Expresso</p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;width:160px;font-weight:700;color:#374151;">Nome</td>
                      <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;">${escapeHtml(payload.name)}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;width:160px;font-weight:700;color:#374151;">Email</td>
                      <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;">
                        <a href="mailto:${escapeHtml(payload.email)}" style="color:#1d4ed8;text-decoration:none;">${escapeHtml(payload.email)}</a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;width:160px;font-weight:700;color:#374151;">Assunto</td>
                      <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;">${escapeHtml(subjectLabel)}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;width:160px;font-weight:700;color:#374151;">Recebido em</td>
                      <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;">${escapeHtml(submittedAt)}</td>
                    </tr>
                  </table>

                  <h2 style="margin:24px 0 8px;font-size:16px;color:#111827;">Mensagem</h2>
                  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;white-space:pre-wrap;color:#111827;">${escapeHtml(payload.message)}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `.trim();
}

function buildContactEmailText(payload: ContactFormPayload): string {
  const subjectLabel = getContactSubjectLabel(payload.subject);
  const submittedAt = new Date().toISOString();

  return `
Novo contato - Limpa Nome Expresso

Nome: ${payload.name}
Email: ${payload.email}
Assunto: ${subjectLabel}
Recebido em: ${submittedAt}

Mensagem:
${payload.message}
  `.trim();
}

async function sendContactWithEmailIt(payload: ContactFormPayload): Promise<void> {
  const emailItApiKey = process.env.EMAILIT_API_KEY;
  const emailItFrom = process.env.EMAILIT_DEFAULT_FROM;

  if (!emailItApiKey || !emailItFrom) {
    throw new Error('EMAILIT_CONFIG_MISSING');
  }

  const subjectLabel = getContactSubjectLabel(payload.subject);

  const response = await fetch('https://api.emailit.com/v2/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${emailItApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: emailItFrom,
      to: [CONTACT_EMAIL],
      reply_to: `${payload.name} <${payload.email}>`,
      subject: `[Limpa Nome Expresso] ${subjectLabel} - ${payload.name}`,
      html: buildContactEmailHtml(payload),
      text: buildContactEmailText(payload),
      tags: ['contact-form', 'support'],
      metadata: {
        form_type: 'support_contact',
        subject_type: payload.subject,
      },
    }),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error('[Netlify API] Contact email send failed', {
      status: response.status,
      details: responseData,
    });
    throw new Error(`EMAILIT_CONTACT_SEND_FAILED_${response.status}`);
  }

  console.log('[Netlify API] Contact email queued via EmailIt', {
    emailId:
      typeof (responseData as Record<string, unknown>).id === 'string'
        ? (responseData as Record<string, unknown>).id
        : null,
    status:
      typeof (responseData as Record<string, unknown>).status === 'string'
        ? (responseData as Record<string, unknown>).status
        : null,
    to:
      Array.isArray((responseData as Record<string, unknown>).to)
        ? (responseData as Record<string, unknown>).to
        : [CONTACT_EMAIL],
  });
}

async function createSupabaseUserAndLink(
  email: string,
  password: string,
  redirectTo: string
): Promise<RegisterUserResult> {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseConfig();
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('SUPABASE_CONFIG_MISSING');
  }

  const createUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: false,
      user_metadata: { created_at: new Date().toISOString() },
    }),
  });

  const createUserPayload = await createUserResponse.json().catch(() => ({}));
  if (!createUserResponse.ok) {
    const message = getErrorMessage(createUserPayload).toLowerCase();
    if (message.includes('already') || message.includes('registered') || message.includes('exists')) {
      throw new Error('USER_EXISTS');
    }
    if (createUserResponse.status === 400 || createUserResponse.status === 422) {
      throw new Error('VALIDATION_FAILED');
    }
    throw new Error('CREATE_USER_FAILED');
  }

  const generateLinkResponse = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'signup',
      email,
      password,
      redirect_to: redirectTo,
    }),
  });

  const generateLinkPayload = await generateLinkResponse.json().catch(() => ({}));
  const actionLink =
    (generateLinkPayload as Record<string, unknown>)?.action_link &&
    typeof (generateLinkPayload as Record<string, unknown>).action_link === 'string'
      ? ((generateLinkPayload as Record<string, unknown>).action_link as string)
      : null;

  if (!generateLinkResponse.ok || !actionLink) {
    throw new Error('GENERATE_LINK_FAILED');
  }

  const userId =
    typeof (createUserPayload as Record<string, unknown>).id === 'string'
      ? ((createUserPayload as Record<string, unknown>).id as string)
      : '';

  return {
    userId,
    actionLink,
  };
}

async function sendWithEmailIt(email: string, actionLink: string): Promise<boolean> {
  const emailItApiKey = process.env.EMAILIT_API_KEY;
  const emailItFrom = process.env.EMAILIT_DEFAULT_FROM;

  if (!emailItApiKey || !emailItFrom) {
    return false;
  }

  const response = await fetch('https://api.emailit.com/v2/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${emailItApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: emailItFrom,
      to: [email],
      subject: 'Confirme seu e-mail - Limpa Nome Expresso',
      html: buildConfirmationEmailHtml(email, actionLink),
      text: `Confirme seu e-mail: ${actionLink}`,
      tags: ['auth', 'signup', 'confirmation'],
    }),
  });

  if (!response.ok) {
    throw new Error(`EMAILIT_SEND_FAILED_${response.status}`);
  }

  return true;
}

async function sendSupabaseConfirmationFallback(email: string, redirectTo: string): Promise<boolean> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/resend`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    }),
  });

  return response.ok;
}

interface MercadoPagoItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

function isValidMercadoPagoItem(item: unknown): item is MercadoPagoItem {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.quantity === 'number' &&
    candidate.quantity > 0 &&
    typeof candidate.unit_price === 'number' &&
    candidate.unit_price > 0
  );
}

async function createMercadoPagoPreference(
  event: NetlifyEvent
): Promise<{
  success: boolean;
  preferenceId: string;
  initPoint: string | null;
  sandboxInitPoint: string | null;
  checkoutUrl: string | null;
}> {
  const body = JSON.parse(event.body || '{}') as {
    items?: unknown[];
    metadata?: Record<string, unknown>;
    userId?: string;
  };

  const rawItems = body.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('INVALID_ITEMS');
  }

  const items = rawItems.filter(isValidMercadoPagoItem);
  if (items.length !== rawItems.length) {
    throw new Error('INVALID_ITEMS');
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('MERCADOPAGO_CONFIG_MISSING');
  }

  const siteOrigin = getSiteOrigin(event);
  const userId =
    typeof body.userId === 'string' && body.userId.trim().length > 0 ? body.userId.trim() : null;

  const mercadopagoResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: item.currency_id || 'BRL',
      })),
      metadata: {
        ...(body.metadata || {}),
        userId: userId || (body.metadata?.userId as string | undefined) || null,
      },
      external_reference: userId || (body.metadata?.userId as string | undefined) || null,
      back_urls: {
        success: `${siteOrigin}/checkout/sucesso`,
        failure: `${siteOrigin}/checkout/falha`,
        pending: `${siteOrigin}/checkout/pendente`,
      },
    }),
  });

  const preferencePayload = await mercadopagoResponse.json().catch(() => ({}));
  if (!mercadopagoResponse.ok) {
    const message = getErrorMessage(preferencePayload);
    throw new Error(`MERCADOPAGO_API_ERROR:${message || mercadopagoResponse.status}`);
  }

  const payload = preferencePayload as Record<string, unknown>;
  const preferenceId = typeof payload.id === 'string' ? payload.id : '';
  const initPoint = typeof payload.init_point === 'string' ? payload.init_point : null;
  const sandboxInitPoint =
    typeof payload.sandbox_init_point === 'string' ? payload.sandbox_init_point : null;
  const checkoutUrl = sandboxInitPoint || initPoint;

  if (!preferenceId || !checkoutUrl) {
    throw new Error('MERCADOPAGO_INVALID_RESPONSE');
  }

  return {
    success: true,
    preferenceId,
    initPoint,
    sandboxInitPoint,
    checkoutUrl,
  };
}

async function fetchAccessStatus(event: NetlifyEvent): Promise<AccessStatusResponse> {
  const authHeader = getHeaderValue(event, 'Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('UNAUTHORIZED');
  }

  const token = authHeader.slice('Bearer '.length).trim();
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('SUPABASE_CONFIG_MISSING');
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseServiceRoleKey,
    },
  });

  if (!userResponse.ok) {
    throw new Error('INVALID_TOKEN');
  }

  const user = await userResponse.json();
  if (!user?.id) {
    throw new Error('INVALID_USER');
  }

  const nowIso = new Date().toISOString();

  const accessParams = new URLSearchParams({
    user_id: `eq.${user.id}`,
    is_active: 'eq.true',
    expires_at: `gte.${nowIso}`,
    select: '*',
  });

  const accessResponse = await fetch(`${supabaseUrl}/rest/v1/user_access?${accessParams}`, {
    method: 'GET',
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!accessResponse.ok) {
    throw new Error('ACCESS_QUERY_FAILED');
  }

  const accessRows = await accessResponse.json();
  const paidAccess = Array.isArray(accessRows) && accessRows.length > 0 ? accessRows[0] : null;

  const manualParams = new URLSearchParams({
    user_id: `eq.${user.id}`,
    is_active: 'eq.true',
    select: '*',
    or: `(expires_at.is.null,expires_at.gte.${nowIso})`,
  });

  const manualResponse = await fetch(
    `${supabaseUrl}/rest/v1/user_manual_access?${manualParams}`,
    {
      method: 'GET',
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!manualResponse.ok) {
    throw new Error('MANUAL_ACCESS_QUERY_FAILED');
  }

  const manualRows = await manualResponse.json();
  const manualAccess =
    Array.isArray(manualRows) && manualRows.length > 0 ? manualRows[0] : null;

  const hasManualAccess = !!manualAccess;
  const hasPaidAccess = !!paidAccess;

  return {
    hasActiveAccess: hasPaidAccess || hasManualAccess,
    hasManualAccess,
    accessType: paidAccess?.access_type || (hasManualAccess ? 'manual' : null),
    expiresAt: paidAccess?.expires_at || manualAccess?.expires_at || null,
    manualAccessExpiresAt: manualAccess?.expires_at || null,
  };
}

async function verifyAdminAuth(event: NetlifyEvent): Promise<AdminAuthContext> {
  const authHeader = getHeaderValue(event, 'Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('UNAUTHORIZED');
  }

  const token = authHeader.slice('Bearer '.length).trim();
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseConfig();
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('SUPABASE_CONFIG_MISSING');
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseServiceRoleKey,
    },
  });

  if (!userResponse.ok) {
    throw new Error('INVALID_TOKEN');
  }

  const adminUser = (await userResponse.json()) as AdminAuthUser;
  if (!adminUser?.id) {
    throw new Error('INVALID_USER');
  }

  const role = adminUser.user_metadata?.role;
  if (role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  return {
    supabaseUrl,
    supabaseServiceRoleKey,
    adminUser: {
      id: adminUser.id,
      email: typeof adminUser.email === 'string' ? adminUser.email : null,
      user_metadata: adminUser.user_metadata,
    },
  };
}

async function listSupabaseAuthUsers(
  supabaseUrl: string,
  supabaseServiceRoleKey: string
): Promise<AdminAuthUser[]> {
  const usersResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1000`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      apikey: supabaseServiceRoleKey,
    },
  });

  if (!usersResponse.ok) {
    throw new Error('USERS_LIST_FAILED');
  }

  const payload = (await usersResponse.json()) as { users?: AdminAuthUser[] };
  return Array.isArray(payload.users) ? payload.users : [];
}

function isAccessRecordActive(access: Record<string, unknown>): boolean {
  if (access.is_active !== true) {
    return false;
  }

  if (typeof access.expires_at === 'string' && access.expires_at.length > 0) {
    if (new Date(access.expires_at) < new Date()) {
      return false;
    }
  }

  return true;
}

async function getLatestManualAccessRecord(
  supabaseUrl: string,
  supabaseServiceRoleKey: string,
  userId: string
): Promise<Record<string, unknown> | null> {
  const params = new URLSearchParams({
    user_id: `eq.${userId}`,
    select: '*',
    order: 'granted_at.desc',
    limit: '1',
  });

  const response = await fetch(`${supabaseUrl}/rest/v1/user_manual_access?${params.toString()}`, {
    method: 'GET',
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('ACCESS_LOOKUP_FAILED');
  }

  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  return rows[0] as Record<string, unknown>;
}

async function handleAdminAccessList(
  event: NetlifyEvent
): Promise<{ users: Record<string, unknown>[] }> {
  const { supabaseUrl, supabaseServiceRoleKey } = await verifyAdminAuth(event);
  const search = getQueryParam(event, 'search')?.trim().toLowerCase() || '';

  const manualAccessParams = new URLSearchParams({
    select: '*',
    order: 'granted_at.desc',
  });

  const manualAccessResponse = await fetch(
    `${supabaseUrl}/rest/v1/user_manual_access?${manualAccessParams.toString()}`,
    {
      method: 'GET',
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!manualAccessResponse.ok) {
    throw new Error('MANUAL_ACCESS_LIST_FAILED');
  }

  const paymentAccessParams = new URLSearchParams({
    select: '*',
    order: 'created_at.desc',
  });

  const paymentAccessResponse = await fetch(
    `${supabaseUrl}/rest/v1/user_access?${paymentAccessParams.toString()}`,
    {
      method: 'GET',
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!paymentAccessResponse.ok) {
    throw new Error('PAYMENT_ACCESS_LIST_FAILED');
  }

  const manualAccessRowsPayload = await manualAccessResponse.json();
  const paymentAccessRowsPayload = await paymentAccessResponse.json();

  const manualAccessRows = Array.isArray(manualAccessRowsPayload)
    ? (manualAccessRowsPayload as Record<string, unknown>[])
    : [];

  const paymentAccessRows = Array.isArray(paymentAccessRowsPayload)
    ? (paymentAccessRowsPayload as Record<string, unknown>[])
    : [];

  const latestManualByUser = new Map<string, Record<string, unknown>>();
  for (const row of manualAccessRows) {
    const userId = typeof row.user_id === 'string' ? row.user_id : null;
    if (!userId || latestManualByUser.has(userId)) continue;
    latestManualByUser.set(userId, row);
  }

  const latestPaymentByUser = new Map<string, Record<string, unknown>>();
  for (const row of paymentAccessRows) {
    const userId = typeof row.user_id === 'string' ? row.user_id : null;
    if (!userId || latestPaymentByUser.has(userId)) continue;
    latestPaymentByUser.set(userId, row);
  }

  const users = await listSupabaseAuthUsers(supabaseUrl, supabaseServiceRoleKey);
  const userById = new Map<string, AdminAuthUser>();
  for (const user of users) {
    if (typeof user?.id === 'string' && user.id.length > 0) {
      userById.set(user.id, user);
    }
  }

  let enrichedUsers = users.map((user) => {
    const userId = user.id;
    const manualAccess = latestManualByUser.get(userId) || null;
    const paymentAccess = latestPaymentByUser.get(userId) || null;
    const manualActive = manualAccess ? isAccessRecordActive(manualAccess) : false;
    const paymentActive = paymentAccess ? isAccessRecordActive(paymentAccess) : false;
    const userRole =
      user.user_metadata && typeof user.user_metadata.role === 'string'
        ? user.user_metadata.role
        : null;
    const isAdmin = userRole === 'admin';

    let status: 'active' | 'manual' | 'expired' | 'free' | 'pending' = 'free';
    if (manualActive) {
      status = 'manual';
    } else if (paymentActive || isAdmin) {
      status = 'active';
    } else if (manualAccess || paymentAccess) {
      status = 'expired';
    }

    const displayName =
      typeof user.user_metadata?.name === 'string'
        ? user.user_metadata.name
        : typeof user.user_metadata?.full_name === 'string'
          ? user.user_metadata.full_name
          : null;

    const emailConfirmedAt =
      typeof (user as Record<string, unknown>).email_confirmed_at === 'string'
        ? ((user as Record<string, unknown>).email_confirmed_at as string)
        : null;
    const activatedAt =
      emailConfirmedAt ||
      (typeof manualAccess?.granted_at === 'string' ? (manualAccess.granted_at as string) : null) ||
      (typeof paymentAccess?.created_at === 'string' ? (paymentAccess.created_at as string) : null);

    return {
      id: userId,
      email: typeof user.email === 'string' ? user.email : '',
      display_name: displayName,
      created_at:
        typeof (user as Record<string, unknown>).created_at === 'string'
          ? ((user as Record<string, unknown>).created_at as string)
          : null,
      activated_at: activatedAt,
      role: userRole,
      status,
      has_access: manualActive || paymentActive || isAdmin,
      manual_access: manualAccess
        ? {
            ...manualAccess,
            granter_email:
              typeof manualAccess.granted_by === 'string'
                ? userById.get(manualAccess.granted_by)?.email || null
                : null,
          }
        : null,
      payment_access: paymentAccess,
    };
  });

  if (search) {
    enrichedUsers = enrichedUsers.filter((user) => {
      const email = typeof user.email === 'string' ? user.email.toLowerCase() : '';
      const name =
        typeof user.display_name === 'string' ? user.display_name.toLowerCase() : '';
      return email.includes(search) || name.includes(search);
    });
  }

  enrichedUsers.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  return { users: enrichedUsers };
}

async function handleAdminAccessGrant(
  event: NetlifyEvent
): Promise<{ success: boolean; message: string; access: Record<string, unknown> }> {
  const { supabaseUrl, supabaseServiceRoleKey, adminUser } = await verifyAdminAuth(event);
  const body = parseJsonBody(event);

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
  const expiresAtRaw = typeof body.expires_at === 'string' ? body.expires_at : '';

  if (!email || !isValidEmail(email)) {
    throw new Error('INVALID_EMAIL');
  }

  const users = await listSupabaseAuthUsers(supabaseUrl, supabaseServiceRoleKey);
  const targetUser = users.find(
    (user) => typeof user.email === 'string' && user.email.toLowerCase() === email
  );

  if (!targetUser?.id) {
    throw new Error('TARGET_USER_NOT_FOUND');
  }

  const existingAccessParams = new URLSearchParams({
    user_id: `eq.${targetUser.id}`,
    is_active: 'eq.true',
    select: '*',
  });

  const existingAccessResponse = await fetch(
    `${supabaseUrl}/rest/v1/user_manual_access?${existingAccessParams.toString()}`,
    {
      method: 'GET',
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!existingAccessResponse.ok) {
    throw new Error('ACCESS_LIST_FAILED');
  }

  const existingAccesses = await existingAccessResponse.json();
  const existingRows = Array.isArray(existingAccesses) ? existingAccesses : [];
  const now = new Date();
  const hasActiveAccess = existingRows.some((row) => {
    const access = row as Record<string, unknown>;
    if (access.is_active !== true) return false;
    const expiresAt = typeof access.expires_at === 'string' ? access.expires_at : null;
    return !expiresAt || new Date(expiresAt) > now;
  });

  if (hasActiveAccess) {
    throw new Error('ACCESS_ALREADY_ACTIVE');
  }

  if (expiresAtRaw && Number.isNaN(Date.parse(expiresAtRaw))) {
    throw new Error('INVALID_EXPIRATION_DATE');
  }

  const accessData = {
    user_id: targetUser.id,
    granted_by: adminUser.id,
    granted_at: new Date().toISOString(),
    reason: reason || null,
    expires_at: expiresAtRaw || null,
    is_active: true,
  };

  const grantResponse = await fetch(`${supabaseUrl}/rest/v1/user_manual_access`, {
    method: 'POST',
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(accessData),
  });

  if (!grantResponse.ok) {
    throw new Error('GRANT_ACCESS_FAILED');
  }

  const grantPayload = await grantResponse.json();
  const access = Array.isArray(grantPayload) ? grantPayload[0] : grantPayload;

  if (!access || typeof access !== 'object') {
    throw new Error('GRANT_ACCESS_FAILED');
  }

  return {
    success: true,
    message: 'Access granted successfully',
    access: access as Record<string, unknown>,
  };
}

async function handleAdminAccessRevoke(
  event: NetlifyEvent,
  userId: string
): Promise<{ success: boolean; message: string; access: Record<string, unknown> }> {
  const { supabaseUrl, supabaseServiceRoleKey } = await verifyAdminAuth(event);
  const body = parseJsonBody(event);
  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';

  const updateData: Record<string, unknown> = { is_active: false };
  if (reason) {
    updateData.reason = reason;
  }

  const updateParams = new URLSearchParams({
    user_id: `eq.${userId}`,
    is_active: 'eq.true',
  });

  const updateResponse = await fetch(
    `${supabaseUrl}/rest/v1/user_manual_access?${updateParams.toString()}`,
    {
      method: 'PATCH',
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(updateData),
    }
  );

  if (!updateResponse.ok) {
    throw new Error('REVOKE_ACCESS_FAILED');
  }

  const updatePayload = await updateResponse.json();
  const access = Array.isArray(updatePayload) ? updatePayload[0] : updatePayload;

  if (!access || typeof access !== 'object') {
    throw new Error('ACTIVE_ACCESS_NOT_FOUND');
  }

  return {
    success: true,
    message: 'Access revoked successfully',
    access: access as Record<string, unknown>,
  };
}

async function handleAdminAccessReactivate(
  event: NetlifyEvent,
  userId: string
): Promise<{ success: boolean; message: string; access: Record<string, unknown> }> {
  const { supabaseUrl, supabaseServiceRoleKey } = await verifyAdminAuth(event);
  const latestAccess = await getLatestManualAccessRecord(supabaseUrl, supabaseServiceRoleKey, userId);

  if (!latestAccess) {
    throw new Error('ACCESS_NOT_FOUND');
  }

  const accessId = typeof latestAccess.id === 'string' ? latestAccess.id : '';
  if (!accessId) {
    throw new Error('ACCESS_NOT_FOUND');
  }

  const patchParams = new URLSearchParams({
    id: `eq.${accessId}`,
  });

  const updateResponse = await fetch(
    `${supabaseUrl}/rest/v1/user_manual_access?${patchParams.toString()}`,
    {
      method: 'PATCH',
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ is_active: true }),
    }
  );

  if (!updateResponse.ok) {
    throw new Error('REACTIVATE_ACCESS_FAILED');
  }

  const updatePayload = await updateResponse.json();
  const access = Array.isArray(updatePayload) ? updatePayload[0] : updatePayload;

  if (!access || typeof access !== 'object') {
    throw new Error('ACCESS_NOT_FOUND');
  }

  return {
    success: true,
    message: 'Access reactivated successfully',
    access: access as Record<string, unknown>,
  };
}

async function setAdminManagedUserStatus(
  supabaseUrl: string,
  supabaseServiceRoleKey: string,
  adminUserId: string,
  userId: string,
  status: 'active' | 'inactive'
): Promise<void> {
  if (status === 'active') {
    const latestAccess = await getLatestManualAccessRecord(supabaseUrl, supabaseServiceRoleKey, userId);

    if (latestAccess && typeof latestAccess.id === 'string') {
      const patchParams = new URLSearchParams({ id: `eq.${latestAccess.id}` });
      const reactivateResponse = await fetch(
        `${supabaseUrl}/rest/v1/user_manual_access?${patchParams.toString()}`,
        {
          method: 'PATCH',
          headers: {
            apikey: supabaseServiceRoleKey,
            Authorization: `Bearer ${supabaseServiceRoleKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({ is_active: true }),
        }
      );

      if (!reactivateResponse.ok) {
        throw new Error('STATUS_UPDATE_FAILED');
      }

      return;
    }

    const createResponse = await fetch(`${supabaseUrl}/rest/v1/user_manual_access`, {
      method: 'POST',
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        user_id: userId,
        granted_by: adminUserId,
        granted_at: new Date().toISOString(),
        reason: 'Ativado pelo admin',
        expires_at: null,
        is_active: true,
      }),
    });

    if (!createResponse.ok) {
      throw new Error('STATUS_UPDATE_FAILED');
    }

    return;
  }

  const deactivateManualParams = new URLSearchParams({
    user_id: `eq.${userId}`,
    is_active: 'eq.true',
  });

  const deactivateManualResponse = await fetch(
    `${supabaseUrl}/rest/v1/user_manual_access?${deactivateManualParams.toString()}`,
    {
      method: 'PATCH',
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_active: false }),
    }
  );

  if (!deactivateManualResponse.ok) {
    throw new Error('STATUS_UPDATE_FAILED');
  }

  const deactivatePaidParams = new URLSearchParams({
    user_id: `eq.${userId}`,
    is_active: 'eq.true',
  });

  const deactivatePaidResponse = await fetch(
    `${supabaseUrl}/rest/v1/user_access?${deactivatePaidParams.toString()}`,
    {
      method: 'PATCH',
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_active: false }),
    }
  );

  if (!deactivatePaidResponse.ok) {
    throw new Error('STATUS_UPDATE_FAILED');
  }
}

async function handleAdminUserUpdate(
  event: NetlifyEvent,
  userId: string
): Promise<{ success: boolean; message: string; userId: string }> {
  const { supabaseUrl, supabaseServiceRoleKey, adminUser } = await verifyAdminAuth(event);
  const body = parseJsonBody(event);

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const displayName = typeof body.display_name === 'string' ? body.display_name.trim() : '';
  const role = typeof body.role === 'string' ? body.role.trim().toLowerCase() : '';
  const accessStatus =
    typeof body.access_status === 'string' ? body.access_status.trim().toLowerCase() : '';

  if (email && !isValidEmail(email)) {
    throw new Error('INVALID_EMAIL');
  }

  if (role && role !== 'admin' && role !== 'user') {
    throw new Error('INVALID_ROLE');
  }

  if (accessStatus && accessStatus !== 'active' && accessStatus !== 'inactive') {
    throw new Error('INVALID_STATUS');
  }

  const getUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      apikey: supabaseServiceRoleKey,
    },
  });

  if (getUserResponse.status === 404) {
    throw new Error('TARGET_USER_NOT_FOUND');
  }

  if (!getUserResponse.ok) {
    throw new Error('TARGET_USER_FETCH_FAILED');
  }

  const getUserPayload = (await getUserResponse.json()) as { user?: Record<string, unknown> };
  const currentUser = (getUserPayload.user || getUserPayload) as Record<string, unknown>;
  const currentMetadata =
    currentUser.user_metadata && typeof currentUser.user_metadata === 'object'
      ? ({ ...(currentUser.user_metadata as Record<string, unknown>) } as Record<string, unknown>)
      : {};

  let hasProfileChanges = false;
  const updatePayload: Record<string, unknown> = {};

  if (email) {
    updatePayload.email = email;
    hasProfileChanges = true;
  }

  if (displayName) {
    currentMetadata.name = displayName;
    currentMetadata.full_name = displayName;
    hasProfileChanges = true;
  }

  if (role) {
    currentMetadata.role = role;
    hasProfileChanges = true;
  }

  if (hasProfileChanges) {
    updatePayload.user_metadata = currentMetadata;
    const updateResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        apikey: supabaseServiceRoleKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    if (!updateResponse.ok) {
      throw new Error('USER_UPDATE_FAILED');
    }
  }

  if (accessStatus) {
    await setAdminManagedUserStatus(
      supabaseUrl,
      supabaseServiceRoleKey,
      adminUser.id,
      userId,
      accessStatus as 'active' | 'inactive'
    );
  }

  if (!hasProfileChanges && !accessStatus) {
    throw new Error('NO_UPDATES');
  }

  return {
    success: true,
    message: 'User updated successfully',
    userId,
  };
}

async function handleAdminUserDelete(
  event: NetlifyEvent,
  userId: string
): Promise<{ success: boolean; message: string; userId: string }> {
  const { supabaseUrl, supabaseServiceRoleKey, adminUser } = await verifyAdminAuth(event);

  if (adminUser.id === userId) {
    throw new Error('CANNOT_DELETE_SELF');
  }

  const deleteManualParams = new URLSearchParams({ user_id: `eq.${userId}` });
  const deletePaidParams = new URLSearchParams({ user_id: `eq.${userId}` });

  await fetch(`${supabaseUrl}/rest/v1/user_manual_access?${deleteManualParams.toString()}`, {
    method: 'DELETE',
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
    },
  });

  await fetch(`${supabaseUrl}/rest/v1/user_access?${deletePaidParams.toString()}`, {
    method: 'DELETE',
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
    },
  });

  const deleteUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      apikey: supabaseServiceRoleKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ should_soft_delete: false }),
  });

  if (deleteUserResponse.status === 404) {
    throw new Error('TARGET_USER_NOT_FOUND');
  }

  if (!deleteUserResponse.ok) {
    throw new Error('USER_DELETE_FAILED');
  }

  return {
    success: true,
    message: 'User deleted successfully',
    userId,
  };
}

export const handler = async (event: any, context: any) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  const normalizedPath = normalizeApiPath(event as NetlifyEvent);

  // Health check endpoint
  if (normalizedPath === '/api/health' || normalizedPath === '/api') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'limpa-nome-expresso-site-api',
      }),
    };
  }

  // Access status endpoint
  if (normalizedPath === '/api/payments/status') {
    if (event.httpMethod !== 'GET') {
      return jsonResponse(headers, 405, {
        success: false,
        error: 'Method not allowed',
      });
    }

    try {
      const status = await fetchAccessStatus(event as NetlifyEvent);
      return jsonResponse(headers, 200, status);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

      if (message === 'UNAUTHORIZED' || message === 'INVALID_TOKEN' || message === 'INVALID_USER') {
        return jsonResponse(headers, 401, {
          success: false,
          error: 'Unauthorized',
        });
      }

      if (message === 'SUPABASE_CONFIG_MISSING') {
        console.error('[Netlify API] Missing Supabase configuration for /api/payments/status');
        return jsonResponse(headers, 500, {
          success: false,
          error: 'Server configuration error',
        });
      }

      console.error('[Netlify API] Failed to fetch payment status', error);
      return jsonResponse(headers, 500, {
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Admin list endpoint
  if (normalizedPath === '/api/admin/access/list') {
    if (event.httpMethod !== 'GET') {
      return jsonResponse(headers, 405, {
        success: false,
        error: 'Method not allowed',
      });
    }

    try {
      const payload = await handleAdminAccessList(event as NetlifyEvent);
      return jsonResponse(headers, 200, payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

      if (message === 'UNAUTHORIZED' || message === 'INVALID_TOKEN' || message === 'INVALID_USER') {
        return jsonResponse(headers, 401, { success: false, error: 'Unauthorized' });
      }

      if (message === 'FORBIDDEN') {
        return jsonResponse(headers, 403, {
          success: false,
          error: 'Forbidden: Admin access required',
        });
      }

      if (message === 'SUPABASE_CONFIG_MISSING') {
        return jsonResponse(headers, 500, {
          success: false,
          error: 'Server configuration error',
        });
      }

      console.error('[Netlify API] Failed to list admin accesses', error);
      return jsonResponse(headers, 500, {
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Admin grant endpoint
  if (normalizedPath === '/api/admin/access/grant') {
    if (event.httpMethod !== 'POST') {
      return jsonResponse(headers, 405, {
        success: false,
        error: 'Method not allowed',
      });
    }

    try {
      const payload = await handleAdminAccessGrant(event as NetlifyEvent);
      return jsonResponse(headers, 201, payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

      if (message === 'UNAUTHORIZED' || message === 'INVALID_TOKEN' || message === 'INVALID_USER') {
        return jsonResponse(headers, 401, { success: false, error: 'Unauthorized' });
      }

      if (message === 'FORBIDDEN') {
        return jsonResponse(headers, 403, {
          success: false,
          error: 'Forbidden: Admin access required',
        });
      }

      if (message === 'INVALID_JSON_BODY') {
        return jsonResponse(headers, 400, {
          success: false,
          error: 'Invalid request body',
        });
      }

      if (message === 'INVALID_EMAIL') {
        return jsonResponse(headers, 400, {
          success: false,
          error: 'Invalid email format',
        });
      }

      if (message === 'INVALID_EXPIRATION_DATE') {
        return jsonResponse(headers, 400, {
          success: false,
          error: 'Invalid expiration date',
        });
      }

      if (message === 'TARGET_USER_NOT_FOUND') {
        return jsonResponse(headers, 404, {
          success: false,
          error: 'User not found',
        });
      }

      if (message === 'ACCESS_ALREADY_ACTIVE') {
        return jsonResponse(headers, 409, {
          success: false,
          error: 'User already has active manual access',
        });
      }

      if (message === 'SUPABASE_CONFIG_MISSING') {
        return jsonResponse(headers, 500, {
          success: false,
          error: 'Server configuration error',
        });
      }

      console.error('[Netlify API] Failed to grant admin access', error);
      return jsonResponse(headers, 500, {
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Admin user management endpoints
  const adminUserPathMatch = normalizedPath.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (adminUserPathMatch) {
    const targetUserId = decodeURIComponent((adminUserPathMatch[1] || '').trim());
    if (!targetUserId) {
      return jsonResponse(headers, 400, {
        success: false,
        error: 'User ID is required',
      });
    }

    if (event.httpMethod !== 'PATCH' && event.httpMethod !== 'DELETE') {
      return jsonResponse(headers, 405, {
        success: false,
        error: 'Method not allowed',
      });
    }

    try {
      const payload =
        event.httpMethod === 'PATCH'
          ? await handleAdminUserUpdate(event as NetlifyEvent, targetUserId)
          : await handleAdminUserDelete(event as NetlifyEvent, targetUserId);

      return jsonResponse(headers, 200, payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

      if (message === 'UNAUTHORIZED' || message === 'INVALID_TOKEN' || message === 'INVALID_USER') {
        return jsonResponse(headers, 401, { success: false, error: 'Unauthorized' });
      }

      if (message === 'FORBIDDEN') {
        return jsonResponse(headers, 403, {
          success: false,
          error: 'Forbidden: Admin access required',
        });
      }

      if (
        message === 'INVALID_JSON_BODY' ||
        message === 'INVALID_EMAIL' ||
        message === 'INVALID_ROLE' ||
        message === 'INVALID_STATUS' ||
        message === 'NO_UPDATES'
      ) {
        return jsonResponse(headers, 400, {
          success: false,
          error:
            message === 'INVALID_EMAIL'
              ? 'Invalid email format'
              : message === 'INVALID_ROLE'
                ? 'Invalid role'
                : message === 'INVALID_STATUS'
                  ? 'Invalid status'
                  : message === 'NO_UPDATES'
                    ? 'No fields provided for update'
                    : 'Invalid request body',
        });
      }

      if (message === 'TARGET_USER_NOT_FOUND') {
        return jsonResponse(headers, 404, {
          success: false,
          error: 'User not found',
        });
      }

      if (message === 'CANNOT_DELETE_SELF') {
        return jsonResponse(headers, 409, {
          success: false,
          error: 'You cannot delete your own admin account',
        });
      }

      if (message === 'SUPABASE_CONFIG_MISSING') {
        return jsonResponse(headers, 500, {
          success: false,
          error: 'Server configuration error',
        });
      }

      console.error('[Netlify API] Failed admin user management operation', error);
      return jsonResponse(headers, 500, {
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Admin revoke/reactivate endpoints
  const reactivatePathMatch = normalizedPath.match(/^\/api\/admin\/access\/([^/]+)\/reactivate$/);
  const userAccessPathMatch = normalizedPath.match(/^\/api\/admin\/access\/([^/]+)$/);

  if (reactivatePathMatch || userAccessPathMatch) {
    const targetUserId = decodeURIComponent((reactivatePathMatch?.[1] || userAccessPathMatch?.[1] || '').trim());
    if (!targetUserId) {
      return jsonResponse(headers, 400, {
        success: false,
        error: 'User ID is required',
      });
    }

    const isReactivateRoute = Boolean(reactivatePathMatch);
    const isRevokeRequest = !isReactivateRoute && event.httpMethod === 'DELETE';
    const isReactivateRequest = (isReactivateRoute && event.httpMethod === 'POST') || (!isReactivateRoute && event.httpMethod === 'POST');

    if (!isRevokeRequest && !isReactivateRequest) {
      return jsonResponse(headers, 405, {
        success: false,
        error: 'Method not allowed',
      });
    }

    try {
      const payload = isRevokeRequest
        ? await handleAdminAccessRevoke(event as NetlifyEvent, targetUserId)
        : await handleAdminAccessReactivate(event as NetlifyEvent, targetUserId);

      return jsonResponse(headers, 200, payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

      if (message === 'UNAUTHORIZED' || message === 'INVALID_TOKEN' || message === 'INVALID_USER') {
        return jsonResponse(headers, 401, { success: false, error: 'Unauthorized' });
      }

      if (message === 'FORBIDDEN') {
        return jsonResponse(headers, 403, {
          success: false,
          error: 'Forbidden: Admin access required',
        });
      }

      if (message === 'INVALID_JSON_BODY') {
        return jsonResponse(headers, 400, {
          success: false,
          error: 'Invalid request body',
        });
      }

      if (message === 'ACTIVE_ACCESS_NOT_FOUND' || message === 'ACCESS_NOT_FOUND') {
        return jsonResponse(headers, 404, {
          success: false,
          error: 'No access found for this user',
        });
      }

      if (message === 'SUPABASE_CONFIG_MISSING') {
        return jsonResponse(headers, 500, {
          success: false,
          error: 'Server configuration error',
        });
      }

      console.error('[Netlify API] Failed admin access update', error);
      return jsonResponse(headers, 500, {
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Auth endpoints
  if (normalizedPath === '/api/auth/register' && event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = typeof body.password === 'string' ? body.password : '';

      if (!email || !password) {
        return jsonResponse(headers, 400, {
          success: false,
          error: 'Email e senha sao obrigatorios',
          code: 'VALIDATION_FAILED',
        });
      }

      if (!isValidEmail(email) || password.length < 6) {
        return jsonResponse(headers, 400, {
          success: false,
          error: 'Formato de email invalido ou senha muito curta',
          code: 'VALIDATION_FAILED',
        });
      }

      const siteOrigin = getSiteOrigin(event as NetlifyEvent);
      const redirectTo = `${siteOrigin}/auth/callback`;

      const { userId, actionLink } = await createSupabaseUserAndLink(email, password, redirectTo);

      let emailSent = false;
      try {
        emailSent = await sendWithEmailIt(email, actionLink);
      } catch (emailError) {
        console.error('[Netlify API] EmailIt send failed, trying Supabase fallback', emailError);
      }

      if (!emailSent) {
        emailSent = await sendSupabaseConfirmationFallback(email, redirectTo);
      }

      if (!emailSent) {
        return jsonResponse(headers, 502, {
          success: false,
          error: 'Conta criada, mas nao foi possivel enviar o email de confirmacao',
          code: 'EMAIL_SEND_FAILED',
        });
      }

      return jsonResponse(headers, 200, {
        success: true,
        message: 'Conta criada com sucesso! Verifique seu email para confirmar.',
        data: {
          user: {
            id: userId || null,
            email,
          },
          emailSent: true,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

      if (message === 'USER_EXISTS') {
        return jsonResponse(headers, 409, {
          success: false,
          error: 'Este email ja esta cadastrado',
          code: 'USER_EXISTS',
        });
      }

      if (message === 'VALIDATION_FAILED') {
        return jsonResponse(headers, 400, {
          success: false,
          error: 'Formato de email invalido ou senha muito curta',
          code: 'VALIDATION_FAILED',
        });
      }

      if (message === 'SUPABASE_CONFIG_MISSING') {
        return jsonResponse(headers, 503, {
          success: false,
          error: 'Servico de autenticacao indisponivel',
          code: 'AUTH_SERVICE_UNAVAILABLE',
        });
      }

      console.error('[Netlify API] Register failed', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Erro ao criar conta. Tente novamente.',
          code: 'INTERNAL_ERROR',
        }),
      };
    }
  }

  if (normalizedPath === '/api/auth/check-user' && event.httpMethod === 'POST') {
    return jsonResponse(headers, 200, { success: true });
  }

  if (
    (normalizedPath === '/api/create-preference' ||
      normalizedPath === '/api/mercadopago/create-preference') &&
    event.httpMethod === 'POST'
  ) {
    try {
      const preference = await createMercadoPagoPreference(event as NetlifyEvent);
      return jsonResponse(headers, 200, preference);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

      if (message === 'INVALID_ITEMS') {
        return jsonResponse(headers, 400, {
          success: false,
          error: 'Items invalidos para criar preferencia de pagamento',
        });
      }

      if (message === 'MERCADOPAGO_CONFIG_MISSING') {
        return jsonResponse(headers, 503, {
          success: false,
          error: 'MercadoPago nao configurado no servidor',
        });
      }

      console.error('[Netlify API] Failed to create MercadoPago preference', error);
      return jsonResponse(headers, 500, {
        success: false,
        error: 'Failed to create payment preference',
        details: message,
      });
    }
  }

  // Contact form endpoint
  if (
    (normalizedPath === '/api/contact' || normalizedPath === '/api/contact/send') &&
    event.httpMethod === 'POST'
  ) {
    try {
      const body = parseJsonBody(event as NetlifyEvent);
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const subject = typeof body.subject === 'string' ? body.subject.trim().toLowerCase() : '';
      const message = typeof body.message === 'string' ? body.message.trim() : '';

      if (!name || !email || !subject || !message) {
        return jsonResponse(headers, 400, {
          success: false,
          error: 'Todos os campos sao obrigatorios',
        });
      }

      if (!isValidEmail(email)) {
        return jsonResponse(headers, 400, {
          success: false,
          error: 'Email invalido',
        });
      }

      await sendContactWithEmailIt({
        name,
        email,
        subject,
        message,
      });

      return jsonResponse(headers, 200, {
        success: true,
        message: 'Mensagem enviada com sucesso',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

      if (message === 'INVALID_JSON_BODY') {
        return jsonResponse(headers, 400, {
          success: false,
          error: 'Invalid request body',
        });
      }

      if (message === 'EMAILIT_CONFIG_MISSING') {
        return jsonResponse(headers, 503, {
          success: false,
          error: 'Servico de email indisponivel no momento',
        });
      }

      if (message.startsWith('EMAILIT_CONTACT_SEND_FAILED_')) {
        return jsonResponse(headers, 502, {
          success: false,
          error: 'Falha ao enviar email de suporte',
        });
      }

      console.error('[Netlify API] Unexpected contact endpoint error', error);
      return jsonResponse(headers, 500, {
        success: false,
        error: 'Erro ao enviar mensagem. Tente novamente.',
      });
    }
  }

  // 404 for undefined routes
  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({
      success: false,
      error: 'Route not found',
      path: normalizedPath,
    }),
  };
};
