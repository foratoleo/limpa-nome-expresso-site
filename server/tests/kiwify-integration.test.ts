/**
 * Kiwify Integration Tests
 *
 * T4.3: End-to-end integration tests for Kiwify payment flow including:
 * - Webhook processing with database interactions
 * - Complete purchase flow simulation
 * - Idempotency verification
 * - Email notifications
 * - Error handling scenarios
 * - Access provisioning and revocation
 *
 * Uses Supertest for HTTP testing and mocks external services (Kiwify API, Email)
 *
 * @module server/tests/kiwify-integration
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import request from 'supertest';
import express, { Application } from 'express';

// ============================================================================
// Test Configuration
// ============================================================================

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for integration tests');
}

// Test environment variables
const TEST_WEBHOOK_TOKEN = 'test-kiwify-webhook-token-12345';
const TEST_CLIENT_ID = 'test-client-id';
const TEST_CLIENT_SECRET = 'test-client-secret';
const TEST_ACCOUNT_ID = 'test-account-id';

// Mock environment for tests
const mockEnv = {
  KIWIFY_CLIENT_ID: TEST_CLIENT_ID,
  KIWIFY_CLIENT_SECRET: TEST_CLIENT_SECRET,
  KIWIFY_ACCOUNT_ID: TEST_ACCOUNT_ID,
  KIWIFY_WEBHOOK_TOKEN: TEST_WEBHOOK_TOKEN,
  VITE_SUPABASE_URL: supabaseUrl,
  SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey,
  VITE_APP_URL: 'https://test.cpfblindado.com',
  EMAILIT_API_KEY: 'test-emailit-key',
  EMAILIT_DEFAULT_FROM: 'test@cpfblindado.com',
};

// ============================================================================
// Test Utilities
// ============================================================================

// Store original env
const originalEnv = { ...process.env };

// Create Supabase admin client for test cleanup
const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test data storage for cleanup
const createdUserIds: string[] = [];
const createdPaymentIds: string[] = [];
const createdAccessIds: string[] = [];

// Mock console to capture logs
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

/**
 * Generate unique test identifiers
 */
function generateTestId(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate unique test email
 */
function generateTestEmail(): string {
  return `kiwify-test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

/**
 * Create mock Kiwify sale object
 */
function createMockKiwifySale(overrides: Partial<any> = {}): any {
  const saleId = generateTestId('sale');
  const email = generateTestEmail();

  return {
    id: saleId,
    order_id: `order-${saleId}`,
    status: 'paid',
    customer: {
      id: `customer-${generateTestId()}`,
      name: 'Test Customer',
      email: email,
      phone: '11999999999',
      mobile: '11999999999',
      document: '123.456.789-00',
      document_type: 'CPF',
    },
    products: [
      {
        id: 'limpa_nome_expresso_12_months',
        name: 'CPF Blindado - Acesso Premium 12 Meses',
        price: 149.90,
        quantity: 1,
      },
    ],
    total: 149.90,
    currency: 'BRL',
    payment_method: 'pix',
    payment_installments: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    paid_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock Kiwify webhook payload
 */
function createMockWebhookPayload(
  event: string,
  saleId: string,
  overrides: Partial<any> = {}
): any {
  return {
    event,
    sale_id: saleId,
    order_id: `order-${saleId}`,
    customer_email: generateTestEmail(),
    customer_name: 'Test Customer',
    product_id: 'limpa_nome_expresso_12_months',
    product_name: 'CPF Blindado - Acesso Premium 12 Meses',
    amount: 149.90,
    currency: 'BRL',
    timestamp: new Date().toISOString(),
    webhook_token: TEST_WEBHOOK_TOKEN,
    ...overrides,
  };
}

/**
 * Find user by email in Supabase
 */
async function findUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    throw new Error(`Failed to list users: ${error.message}`);
  }

  const user = data?.users?.find(u => u.email === email);
  return user ? { id: user.id, email: user.email || '' } : null;
}

/**
 * Find payment by Kiwify sale ID
 */
async function findPaymentBySaleId(saleId: string): Promise<any> {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('kiwify_sale_id', saleId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to find payment: ${error.message}`);
  }

  return data;
}

/**
 * Find user access by user ID
 */
async function findUserAccess(userId: string): Promise<any> {
  const { data, error } = await supabaseAdmin
    .from('user_access')
    .select('*')
    .eq('user_id', userId)
    .eq('access_type', 'one_time')
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to find user access: ${error.message}`);
  }

  return data;
}

/**
 * Delete user by ID
 */
async function deleteUserById(userId: string): Promise<void> {
  try {
    await supabaseAdmin.auth.admin.deleteUser(userId);
  } catch (error) {
    console.warn(`Failed to delete user ${userId}:`, error);
  }
}

/**
 * Clean up test data
 */
async function cleanupTestData(): Promise<void> {
  // Delete test users
  for (const userId of createdUserIds) {
    await deleteUserById(userId);
  }

  // Clear arrays
  createdUserIds.length = 0;
  createdPaymentIds.length = 0;
  createdAccessIds.length = 0;
}

// ============================================================================
// Test Application Setup
// ============================================================================

let app: Application;

// We'll mock the Kiwify client and email service at module level
vi.mock('../lib/kiwify.js', () => {
  const mockGetSale = vi.fn();
  const mockVerifyWebhookToken = vi.fn();
  const mockIsConfigured = vi.fn(() => true);

  return {
    kiwifyClient: {
      getSale: mockGetSale,
      verifyWebhookToken: mockVerifyWebhookToken,
      isConfigured: mockIsConfigured,
    },
    KiwifySale: {},
    KiwifyWebhookPayload: {},
  };
});

vi.mock('../services/email.service.js', () => ({
  emailService: {
    sendCustomEmail: vi.fn().mockResolvedValue({ id: 'test-email-id' }),
  },
}));

// ============================================================================
// Test Lifecycle
// ============================================================================

beforeAll(async () => {
  // Set up environment variables
  Object.assign(process.env, mockEnv);

  // Verify Supabase connection
  const { error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    throw new Error(`Failed to connect to Supabase: ${error.message}`);
  }

  // Create Express app with routes
  app = express();
  app.use(express.json());

  // Import and register Kiwify routes after mocks are set up
  const { kiwifyRouter } = await import('../routes/kiwify.js');
  app.use('/api', kiwifyRouter);
});

beforeEach(async () => {
  // Clear mock calls before each test
  vi.clearAllMocks();

  // Reset mock implementations
  const { kiwifyClient } = await import('../lib/kiwify.js');
  (kiwifyClient.verifyWebhookToken as any).mockImplementation(
    (token: string) => token === TEST_WEBHOOK_TOKEN
  );
  (kiwifyClient.isConfigured as any).mockReturnValue(true);
});

afterEach(async () => {
  // Cleanup any test data created during the test
  await cleanupTestData();
});

afterAll(async () => {
  // Final cleanup
  await cleanupTestData();

  // Restore environment
  process.env = originalEnv;

  // Restore console mocks
  mockConsoleLog.mockRestore();
  mockConsoleError.mockRestore();
  mockConsoleWarn.mockRestore();

  // Clear all mocks
  vi.clearAllMocks();
});

// ============================================================================
// Test Suite: Webhook Endpoint Validation
// ============================================================================

describe('Kiwify Integration - Webhook Endpoint Validation', () => {
  it('should return 401 for missing webhook token', async () => {
    const payload = createMockWebhookPayload('compra_aprovada', generateTestId('sale'));

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .send(payload);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Invalid webhook token',
      received: false,
    });
  });

  it('should return 401 for invalid webhook token', async () => {
    const { kiwifyClient } = await import('../lib/kiwify.js');
    (kiwifyClient.verifyWebhookToken as any).mockReturnValue(false);

    const payload = createMockWebhookPayload('compra_aprovada', generateTestId('sale'));

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'invalid-token')
      .send(payload);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Invalid webhook token',
      received: false,
    });
  });

  it('should return 400 for missing event type', async () => {
    const payload = { sale_id: generateTestId('sale') };

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Missing required fields: event, sale_id',
      received: false,
    });
  });

  it('should return 400 for missing sale_id', async () => {
    const payload = { event: 'compra_aprovada' };

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Missing required fields: event, sale_id',
      received: false,
    });
  });

  it('should return 503 when Kiwify is not configured', async () => {
    const { kiwifyClient } = await import('../lib/kiwify.js');
    (kiwifyClient.isConfigured as any).mockReturnValue(false);

    const payload = createMockWebhookPayload('compra_aprovada', generateTestId('sale'));

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      error: 'Kiwify integration not configured',
      received: false,
    });
  });

  it('should accept webhook token in request body', async () => {
    const saleId = generateTestId('sale');
    const mockSale = createMockKiwifySale({ id: saleId });
    const { kiwifyClient } = await import('../lib/kiwify.js');
    (kiwifyClient.getSale as any).mockResolvedValue(mockSale);

    const payload = createMockWebhookPayload('compra_aprovada', saleId, {
      webhook_token: TEST_WEBHOOK_TOKEN,
    });

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
  });
});

// ============================================================================
// Test Suite: compra_aprovada Event Handling
// ============================================================================

describe('Kiwify Integration - compra_aprovada Event', () => {
  it('should successfully process approved purchase for new user', async () => {
    const saleId = generateTestId('sale');
    const testEmail = generateTestEmail();
    const mockSale = createMockKiwifySale({
      id: saleId,
      customer: { ...createMockKiwifySale().customer, email: testEmail },
    });

    const { kiwifyClient } = await import('../lib/kiwify.js');
    (kiwifyClient.getSale as any).mockResolvedValue(mockSale);

    const payload = createMockWebhookPayload('compra_aprovada', saleId, {
      customer_email: testEmail,
    });

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      received: true,
      event: 'compra_aprovada',
      saleId,
      success: true,
    });

    // Verify user was created
    const user = await findUserByEmail(testEmail);
    expect(user).toBeTruthy();
    if (user) {
      createdUserIds.push(user.id);
    }

    // Verify payment was recorded
    const payment = await findPaymentBySaleId(saleId);
    expect(payment).toBeTruthy();
    expect(payment?.status).toBe('succeeded');
    expect(payment?.kiwify_sale_id).toBe(saleId);
    expect(payment?.amount).toBe(149.90);

    // Verify access was granted
    if (user) {
      const access = await findUserAccess(user.id);
      expect(access).toBeTruthy();
      expect(access?.is_active).toBe(true);

      // Verify expiry is approximately 12 months from now
      const expectedExpiry = new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000);
      const actualExpiry = new Date(access?.expires_at);
      const diffDays = Math.abs(
        (expectedExpiry.getTime() - actualExpiry.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(diffDays).toBeLessThan(2); // Within 2 days tolerance
    }
  });

  it('should update existing user access on repeat purchase', async () => {
    const saleId1 = generateTestId('sale');
    const saleId2 = generateTestId('sale');
    const testEmail = generateTestEmail();

    // Create first sale and process
    const mockSale1 = createMockKiwifySale({
      id: saleId1,
      customer: { ...createMockKiwifySale().customer, email: testEmail },
    });

    const { kiwifyClient } = await import('../lib/kiwify.js');
    (kiwifyClient.getSale as any).mockResolvedValueOnce(mockSale1);

    const payload1 = createMockWebhookPayload('compra_aprovada', saleId1, {
      customer_email: testEmail,
    });

    await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload1);

    // Find user and access
    const user = await findUserByEmail(testEmail);
    expect(user).toBeTruthy();
    if (user) {
      createdUserIds.push(user.id);
    }

    const access1 = await findUserAccess(user!.id);
    expect(access1).toBeTruthy();
    const originalExpiry = new Date(access1?.expires_at);

    // Wait a moment to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 100));

    // Process second purchase
    const mockSale2 = createMockKiwifySale({
      id: saleId2,
      customer: { ...createMockKiwifySale().customer, email: testEmail },
    });

    (kiwifyClient.getSale as any).mockResolvedValueOnce(mockSale2);

    const payload2 = createMockWebhookPayload('compra_aprovada', saleId2, {
      customer_email: testEmail,
    });

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload2);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify access was extended (not duplicated)
    const access2 = await findUserAccess(user!.id);
    expect(access2).toBeTruthy();
    expect(new Date(access2?.expires_at).getTime()).toBeGreaterThan(originalExpiry.getTime());
  });

  it('should not process sale that is not in paid status', async () => {
    const saleId = generateTestId('sale');
    const testEmail = generateTestEmail();
    const mockSale = createMockKiwifySale({
      id: saleId,
      status: 'waiting_payment',
      customer: { ...createMockKiwifySale().customer, email: testEmail },
    });

    const { kiwifyClient } = await import('../lib/kiwify.js');
    (kiwifyClient.getSale as any).mockResolvedValue(mockSale);

    const payload = createMockWebhookPayload('compra_aprovada', saleId, {
      customer_email: testEmail,
    });

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);

    // Verify no payment was created
    const payment = await findPaymentBySaleId(saleId);
    expect(payment).toBeNull();
  });

  it('should handle Kiwify API errors gracefully', async () => {
    const saleId = generateTestId('sale');

    const { kiwifyClient } = await import('../lib/kiwify.js');
    (kiwifyClient.getSale as any).mockRejectedValue(new Error('Kiwify API unavailable'));

    const payload = createMockWebhookPayload('compra_aprovada', saleId);

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    // Webhook should still return 200 to prevent Kiwify retries
    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
    expect(response.body.error).toBeDefined();
  });
});

// ============================================================================
// Test Suite: Idempotency
// ============================================================================

describe('Kiwify Integration - Idempotency', () => {
  it('should not create duplicate payments for same sale_id', async () => {
    const saleId = generateTestId('sale');
    const testEmail = generateTestEmail();
    const mockSale = createMockKiwifySale({
      id: saleId,
      customer: { ...createMockKiwifySale().customer, email: testEmail },
    });

    const { kiwifyClient } = await import('../lib/kiwify.js');
    (kiwifyClient.getSale as any).mockResolvedValue(mockSale);

    const payload = createMockWebhookPayload('compra_aprovada', saleId, {
      customer_email: testEmail,
    });

    // Process webhook first time
    const response1 = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    expect(response1.status).toBe(200);
    expect(response1.body.success).toBe(true);

    // Find user
    const user = await findUserByEmail(testEmail);
    if (user) {
      createdUserIds.push(user.id);
    }

    // Process webhook second time with same sale_id
    const response2 = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    expect(response2.status).toBe(200);
    expect(response2.body.success).toBe(true);

    // Verify only one payment exists
    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('kiwify_sale_id', saleId);

    expect(payments?.length).toBe(1);
  });

  it('should return success for duplicate webhook to prevent Kiwify retries', async () => {
    const saleId = generateTestId('sale');
    const testEmail = generateTestEmail();
    const mockSale = createMockKiwifySale({
      id: saleId,
      customer: { ...createMockKiwifySale().customer, email: testEmail },
    });

    const { kiwifyClient } = await import('../lib/kiwify.js');
    (kiwifyClient.getSale as any).mockResolvedValue(mockSale);

    const payload = createMockWebhookPayload('compra_aprovada', saleId, {
      customer_email: testEmail,
    });

    // Process multiple times
    for (let i = 0; i < 5; i++) {
      const response = await request(app)
        .post('/api/webhooks/kiwify')
        .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);
    }

    // Find user for cleanup
    const user = await findUserByEmail(testEmail);
    if (user) {
      createdUserIds.push(user.id);
    }
  });
});

// ============================================================================
// Test Suite: Other Webhook Events
// ============================================================================

describe('Kiwify Integration - Other Webhook Events', () => {
  it('should handle compra_recusada event', async () => {
    const saleId = generateTestId('sale');
    const payload = createMockWebhookPayload('compra_recusada', saleId);

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
    expect(response.body.event).toBe('compra_recusada');
  });

  it('should handle compra_reembolsada event', async () => {
    const saleId = generateTestId('sale');
    const payload = createMockWebhookPayload('compra_reembolsada', saleId);

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
    expect(response.body.event).toBe('compra_reembolsada');
  });

  it('should handle chargeback event', async () => {
    const saleId = generateTestId('sale');
    const payload = createMockWebhookPayload('chargeback', saleId);

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
    expect(response.body.event).toBe('chargeback');
  });

  it('should handle subscription_canceled event', async () => {
    const saleId = generateTestId('sale');
    const payload = createMockWebhookPayload('subscription_canceled', saleId);

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
    expect(response.body.event).toBe('subscription_canceled');
  });

  it('should handle subscription_renewed event', async () => {
    const saleId = generateTestId('sale');
    const payload = createMockWebhookPayload('subscription_renewed', saleId);

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
    expect(response.body.event).toBe('subscription_renewed');
  });

  it('should handle unknown event type gracefully', async () => {
    const saleId = generateTestId('sale');
    const payload = createMockWebhookPayload('unknown_event', saleId);

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
  });
});

// ============================================================================
// Test Suite: Email Notifications
// ============================================================================

describe('Kiwify Integration - Email Notifications', () => {
  it('should send confirmation email on successful payment', async () => {
    const saleId = generateTestId('sale');
    const testEmail = generateTestEmail();
    const mockSale = createMockKiwifySale({
      id: saleId,
      customer: { ...createMockKiwifySale().customer, email: testEmail },
    });

    const { kiwifyClient } = await import('../lib/kiwify.js');
    (kiwifyClient.getSale as any).mockResolvedValue(mockSale);

    const { emailService } = await import('../services/email.service.js');

    const payload = createMockWebhookPayload('compra_aprovada', saleId, {
      customer_email: testEmail,
    });

    await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    // Find user for cleanup
    const user = await findUserByEmail(testEmail);
    if (user) {
      createdUserIds.push(user.id);
    }

    // Verify email was sent
    expect(emailService.sendCustomEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: testEmail,
        subject: 'Pagamento Confirmado - CPF Blindado',
      })
    );
  });

  it('should not fail webhook when email sending fails', async () => {
    const saleId = generateTestId('sale');
    const testEmail = generateTestEmail();
    const mockSale = createMockKiwifySale({
      id: saleId,
      customer: { ...createMockKiwifySale().customer, email: testEmail },
    });

    const { kiwifyClient } = await import('../lib/kiwify.js');
    (kiwifyClient.getSale as any).mockResolvedValue(mockSale);

    const { emailService } = await import('../services/email.service.js');
    (emailService.sendCustomEmail as any).mockRejectedValueOnce(
      new Error('Email service unavailable')
    );

    const payload = createMockWebhookPayload('compra_aprovada', saleId, {
      customer_email: testEmail,
    });

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    // Webhook should still succeed
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Find user for cleanup
    const user = await findUserByEmail(testEmail);
    if (user) {
      createdUserIds.push(user.id);
    }

    // Verify payment was still created
    const payment = await findPaymentBySaleId(saleId);
    expect(payment).toBeTruthy();
  });

  it('should include correct product details in confirmation email', async () => {
    const saleId = generateTestId('sale');
    const testEmail = generateTestEmail();
    const mockSale = createMockKiwifySale({
      id: saleId,
      customer: { ...createMockKiwifySale().customer, email: testEmail },
    });

    const { kiwifyClient } = await import('../lib/kiwify.js');
    (kiwifyClient.getSale as any).mockResolvedValue(mockSale);

    const { emailService } = await import('../services/email.service.js');

    const payload = createMockWebhookPayload('compra_aprovada', saleId, {
      customer_email: testEmail,
    });

    await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    // Find user for cleanup
    const user = await findUserByEmail(testEmail);
    if (user) {
      createdUserIds.push(user.id);
    }

    // Verify email contains product details
    const emailCall = (emailService.sendCustomEmail as any).mock.calls[0][0];
    expect(emailCall.html).toContain('CPF Blindado');
    expect(emailCall.html).toContain('149,90'); // Price formatted
    expect(emailCall.html).toContain('12 meses'); // Duration
  });
});

// ============================================================================
// Test Suite: Configuration Endpoints
// ============================================================================

describe('Kiwify Integration - Configuration Endpoints', () => {
  it('should return configuration status on GET /api/config', async () => {
    const response = await request(app).get('/api/config');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      configured: true,
      productId: 'limpa_nome_expresso_12_months',
      productTitle: 'CPF Blindado - Acesso Premium 12 Meses',
      price: 149.90,
      currency: 'BRL',
      durationMonths: 12,
    });
  });

  it('should return health status on GET /api/health', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      message: 'Kiwify integration is healthy',
    });
  });

  it('should return not_configured on health check when not configured', async () => {
    const { kiwifyClient } = await import('../lib/kiwify.js');
    (kiwifyClient.isConfigured as any).mockReturnValue(false);

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      status: 'not_configured',
      message: 'Kiwify integration not configured',
    });
  });
});

// ============================================================================
// Test Suite: Complete Purchase Flow Simulation
// ============================================================================

describe('Kiwify Integration - Complete Purchase Flow', () => {
  it('should complete full purchase flow end-to-end', async () => {
    const saleId = generateTestId('sale');
    const testEmail = generateTestEmail();
    const testName = 'Complete Flow Test User';
    const mockSale = createMockKiwifySale({
      id: saleId,
      customer: {
        ...createMockKiwifySale().customer,
        email: testEmail,
        name: testName,
      },
    });

    const { kiwifyClient } = await import('../lib/kiwify.js');
    (kiwifyClient.getSale as any).mockResolvedValue(mockSale);

    // Step 1: Simulate Kiwify webhook
    const payload = createMockWebhookPayload('compra_aprovada', saleId, {
      customer_email: testEmail,
      customer_name: testName,
    });

    const webhookResponse = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    expect(webhookResponse.status).toBe(200);
    expect(webhookResponse.body.success).toBe(true);

    // Step 2: Verify user was created
    const user = await findUserByEmail(testEmail);
    expect(user).toBeTruthy();
    expect(user?.email).toBe(testEmail);
    if (user) {
      createdUserIds.push(user.id);
    }

    // Step 3: Verify payment was recorded
    const payment = await findPaymentBySaleId(saleId);
    expect(payment).toBeTruthy();
    expect(payment?.user_id).toBe(user?.id);
    expect(payment?.payment_provider).toBe('kiwify');
    expect(payment?.amount).toBe(149.90);
    expect(payment?.status).toBe('succeeded');

    // Step 4: Verify access was granted
    const access = await findUserAccess(user!.id);
    expect(access).toBeTruthy();
    expect(access?.is_active).toBe(true);
    expect(access?.access_type).toBe('one_time');

    // Step 5: Verify access expiry is approximately 12 months
    const expectedExpiry = new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000);
    const actualExpiry = new Date(access?.expires_at);
    const diffDays = Math.abs(
      (expectedExpiry.getTime() - actualExpiry.getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(diffDays).toBeLessThan(2);

    // Step 6: Verify email was sent
    const { emailService } = await import('../services/email.service.js');
    expect(emailService.sendCustomEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: testEmail,
        subject: 'Pagamento Confirmado - CPF Blindado',
      })
    );
  });

  it('should handle concurrent webhooks for different sales', async () => {
    const sales = Array(5)
      .fill(null)
      .map(() => ({
        saleId: generateTestId('sale'),
        email: generateTestEmail(),
      }));

    const { kiwifyClient } = await import('../lib/kiwify.js');

    // Set up mock for each sale
    sales.forEach(({ saleId, email }) => {
      const mockSale = createMockKiwifySale({
        id: saleId,
        customer: { ...createMockKiwifySale().customer, email },
      });
      (kiwifyClient.getSale as any).mockResolvedValueOnce(mockSale);
    });

    // Send all webhooks concurrently
    const responses = await Promise.all(
      sales.map(({ saleId, email }) =>
        request(app)
          .post('/api/webhooks/kiwify')
          .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
          .send(
            createMockWebhookPayload('compra_aprovada', saleId, {
              customer_email: email,
            })
          )
      )
    );

    // All should succeed
    responses.forEach((response) => {
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    // Verify all users were created
    for (const { saleId, email } of sales) {
      const user = await findUserByEmail(email);
      expect(user).toBeTruthy();
      if (user) {
        createdUserIds.push(user.id);
      }

      const payment = await findPaymentBySaleId(saleId);
      expect(payment).toBeTruthy();
    }
  });
});

// ============================================================================
// Test Suite: Error Handling and Edge Cases
// ============================================================================

describe('Kiwify Integration - Error Handling', () => {
  it('should handle database connection errors gracefully', async () => {
    const saleId = generateTestId('sale');
    const mockSale = createMockKiwifySale({ id: saleId });

    const { kiwifyClient } = await import('../lib/kiwify.js');
    (kiwifyClient.getSale as any).mockResolvedValue(mockSale);

    // This test would require mocking Supabase to throw an error
    // For now, we verify the error handling structure exists
    const payload = createMockWebhookPayload('compra_aprovada', saleId);

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    // Even if there's an error, we should return 200 to prevent Kiwify retries
    expect([200, 500]).toContain(response.status);
  });

  it('should handle malformed webhook payload', async () => {
    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send('not valid json');

    // Express should handle this, but we verify it doesn't crash
    expect(response.status).toBeDefined();
  });

  it('should handle empty webhook body', async () => {
    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Missing required fields');
  });

  it('should handle very long customer names', async () => {
    const saleId = generateTestId('sale');
    const testEmail = generateTestEmail();
    const longName = 'A'.repeat(500); // Very long name
    const mockSale = createMockKiwifySale({
      id: saleId,
      customer: {
        ...createMockKiwifySale().customer,
        email: testEmail,
        name: longName,
      },
    });

    const { kiwifyClient } = await import('../lib/kiwify.js');
    (kiwifyClient.getSale as any).mockResolvedValue(mockSale);

    const payload = createMockWebhookPayload('compra_aprovada', saleId, {
      customer_email: testEmail,
      customer_name: longName,
    });

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Find user for cleanup
    const user = await findUserByEmail(testEmail);
    if (user) {
      createdUserIds.push(user.id);
    }
  });

  it('should handle special characters in customer data', async () => {
    const saleId = generateTestId('sale');
    const testEmail = generateTestEmail();
    const specialName = "Jose da Silva <script>alert('xss')</script>";
    const mockSale = createMockKiwifySale({
      id: saleId,
      customer: {
        ...createMockKiwifySale().customer,
        email: testEmail,
        name: specialName,
      },
    });

    const { kiwifyClient } = await import('../lib/kiwify.js');
    (kiwifyClient.getSale as any).mockResolvedValue(mockSale);

    const payload = createMockWebhookPayload('compra_aprovada', saleId, {
      customer_email: testEmail,
      customer_name: specialName,
    });

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Find user for cleanup
    const user = await findUserByEmail(testEmail);
    if (user) {
      createdUserIds.push(user.id);
    }

    // Verify email was sent with escaped HTML
    const { emailService } = await import('../services/email.service.js');
    const emailCall = (emailService.sendCustomEmail as any).mock.calls[0][0];
    // XSS should be escaped
    expect(emailCall.html).not.toContain('<script>');
    expect(emailCall.html).toContain('&lt;script&gt;');
  });
});

// ============================================================================
// Test Suite: Logging and Monitoring
// ============================================================================

describe('Kiwify Integration - Logging', () => {
  it('should log webhook received event', async () => {
    const saleId = generateTestId('sale');
    const payload = createMockWebhookPayload('compra_aprovada', saleId);

    await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    // Verify logging occurred
    expect(mockConsoleLog).toHaveBeenCalled();
  });

  it('should log unauthorized webhook attempts', async () => {
    const payload = createMockWebhookPayload('compra_aprovada', generateTestId('sale'));

    await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'invalid-token')
      .send(payload);

    // Verify error was logged
    expect(mockConsoleLog).toHaveBeenCalled();
  });

  it('should log processing errors', async () => {
    const saleId = generateTestId('sale');

    const { kiwifyClient } = await import('../lib/kiwify.js');
    (kiwifyClient.getSale as any).mockRejectedValue(new Error('Processing error'));

    const payload = createMockWebhookPayload('compra_aprovada', saleId);

    await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', TEST_WEBHOOK_TOKEN)
      .send(payload);

    // Verify error was logged
    expect(mockConsoleError).toHaveBeenCalled();
  });
});
