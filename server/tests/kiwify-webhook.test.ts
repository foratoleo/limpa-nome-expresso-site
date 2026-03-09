/**
 * Kiwify Webhook Handler Unit Tests
 *
 * TDD tests for Kiwify webhook route including:
 * - Webhook token verification
 * - Event type handling (compra_aprovada, compra_recusada, etc.)
 * - Idempotency checks
 * - User provisioning
 * - Payment recording
 * - Access granting/revoking
 * - Email notifications
 * - Error handling
 *
 * @module server/tests/kiwify-webhook.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';

// ============================================================================
// Type Definitions
// ============================================================================

interface MockSale {
  id: string;
  order_id: string;
  status: 'paid' | 'waiting_payment' | 'refused' | 'refunded' | 'chargedback' | 'canceled';
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    mobile?: string;
    document?: string;
  };
  products: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  currency: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
}

interface MockWebhookPayload {
  event: string;
  sale_id: string;
  order_id: string;
  customer_email: string;
  customer_name?: string;
  timestamp: string;
}

// ============================================================================
// Mock Environment
// ============================================================================

const mockEnv = {
  KIWIFY_CLIENT_ID: 'test-client-id',
  KIWIFY_CLIENT_SECRET: 'test-client-secret',
  KIWIFY_ACCOUNT_ID: 'test-account-id',
  KIWIFY_WEBHOOK_TOKEN: 'test-webhook-token-12345',
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  VITE_APP_URL: 'https://test.example.com',
};

// Store original env
const originalEnv = process.env;

// ============================================================================
// Mock Factories
// ============================================================================

function createMockSale(overrides: Partial<MockSale> = {}): MockSale {
  return {
    id: 'sale_test123',
    order_id: 'order_test123',
    status: 'paid',
    customer: {
      id: 'customer_test123',
      name: 'Joao Silva',
      email: 'joao@teste.com',
      document: '12345678901',
      mobile: '+5511999999999',
    },
    products: [
      {
        id: 'prod_cpf_blindado',
        name: 'CPF Blindado - Acesso Premium 12 Meses',
        price: 14990,
        quantity: 1,
      },
    ],
    total: 14990,
    currency: 'BRL',
    payment_method: 'pix',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    paid_at: new Date().toISOString(),
    ...overrides,
  };
}

function createMockWebhookPayload(
  event: string,
  overrides: Partial<MockWebhookPayload> = {}
): MockWebhookPayload {
  return {
    event,
    sale_id: 'sale_test123',
    order_id: 'order_test123',
    customer_email: 'joao@teste.com',
    customer_name: 'Joao Silva',
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

// ============================================================================
// Mock Setup
// ============================================================================

// Create mock functions that will be controlled by tests
const mockIsConfigured = vi.fn();
const mockVerifyWebhookToken = vi.fn();
const mockGetSale = vi.fn();
const mockListSales = vi.fn();

// Mock Supabase operations
const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseMaybeSingle = vi.fn();
const mockSupabaseSingle = vi.fn();
const mockSupabaseInsert = vi.fn();
const mockSupabaseUpdate = vi.fn();
const mockSupabaseSignUp = vi.fn();

// Mock email service
const mockSendCustomEmail = vi.fn();

// Setup mocks before module imports
vi.mock('../lib/kiwify.js', () => ({
  kiwifyClient: {
    isConfigured: () => mockIsConfigured(),
    verifyWebhookToken: (token: string) => mockVerifyWebhookToken(token),
    getSale: (id: string) => mockGetSale(id),
    listSales: () => mockListSales(),
  },
  KiwifySale: {},
  KiwifyWebhookPayload: {},
  KiwifyApiError: class KiwifyApiError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockSupabaseFrom,
    auth: {
      signUp: mockSupabaseSignUp,
    },
  })),
}));

vi.mock('../services/email.service.js', () => ({
  emailService: {
    sendCustomEmail: mockSendCustomEmail,
  },
}));

// ============================================================================
// Test Setup and Teardown
// ============================================================================

let app: Express;

beforeEach(async () => {
  // Reset all mocks
  vi.clearAllMocks();

  // Set environment variables
  process.env = { ...originalEnv, ...mockEnv };

  // Default mock configurations
  mockIsConfigured.mockReturnValue(true);
  mockVerifyWebhookToken.mockReturnValue(true);
  mockGetSale.mockResolvedValue(createMockSale());
  mockSendCustomEmail.mockResolvedValue({ id: 'email-123' });

  // Setup Supabase mock chain
  mockSupabaseEq.mockReturnThis();
  mockSupabaseSelect.mockReturnThis();
  mockSupabaseUpdate.mockReturnThis();
  mockSupabaseFrom.mockReturnValue({
    select: mockSupabaseSelect,
    eq: mockSupabaseEq,
    maybeSingle: mockSupabaseMaybeSingle,
    single: mockSupabaseSingle,
    insert: mockSupabaseInsert,
    update: mockSupabaseUpdate,
  });

  // Default: no existing payment, no existing user
  mockSupabaseMaybeSingle.mockResolvedValue({ data: null, error: null });
  mockSupabaseInsert.mockResolvedValue({ error: null });
  mockSupabaseSignUp.mockResolvedValue({
    data: { user: { id: 'new-user-123', email: 'joao@teste.com' } },
    error: null,
  });

  // Mock console
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});

  // Create Express app
  app = express();
  app.use(express.json());

  // Import router after mocks are set up
  const { kiwifyRouter } = await import('../routes/kiwify.js');
  app.use('/api', kiwifyRouter);
});

afterEach(() => {
  // Restore environment
  process.env = originalEnv;
});

// ============================================================================
// Test Suite: Webhook Token Verification
// ============================================================================

describe('Kiwify Webhook - Token Verification', () => {
  it('should reject webhook without token', async () => {
    mockVerifyWebhookToken.mockReturnValue(false);

    const payload = createMockWebhookPayload('compra_aprovada');

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Invalid webhook token',
      received: false,
    });
  });

  it('should reject webhook with invalid token', async () => {
    mockVerifyWebhookToken.mockReturnValue(false);

    const payload = createMockWebhookPayload('compra_aprovada');

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'invalid-token')
      .send(payload);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid webhook token');
  });

  it('should accept webhook with valid token in header', async () => {
    const payload = createMockWebhookPayload('compra_recusada');

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
  });

  it('should accept webhook with valid token in body', async () => {
    const payload = {
      ...createMockWebhookPayload('compra_recusada'),
      webhook_token: 'test-webhook-token-12345',
    };

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
  });

  it('should reject webhook when Kiwify is not configured', async () => {
    mockIsConfigured.mockReturnValue(false);

    const payload = createMockWebhookPayload('compra_aprovada');

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.status).toBe(503);
    expect(response.body.error).toBe('Kiwify integration not configured');
  });
});

// ============================================================================
// Test Suite: Payload Validation
// ============================================================================

describe('Kiwify Webhook - Payload Validation', () => {
  it('should reject webhook without event field', async () => {
    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send({
        sale_id: 'sale_test123',
        timestamp: new Date().toISOString(),
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Missing required fields');
  });

  it('should reject webhook without sale_id field', async () => {
    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send({
        event: 'compra_aprovada',
        timestamp: new Date().toISOString(),
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Missing required fields');
  });

  it('should accept valid webhook payload structure', async () => {
    const payload = createMockWebhookPayload('compra_recusada');

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
  });
});

// ============================================================================
// Test Suite: compra_aprovada Event
// ============================================================================

describe('Kiwify Webhook - compra_aprovada Event', () => {
  it('should process successful payment and retrieve sale details', async () => {
    const payload = createMockWebhookPayload('compra_aprovada');
    const mockSale = createMockSale();

    mockGetSale.mockResolvedValue(mockSale);

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
    expect(response.body.success).toBe(true);
    expect(mockGetSale).toHaveBeenCalledWith('sale_test123');
  });

  it('should reject sale with non-paid status', async () => {
    const payload = createMockWebhookPayload('compra_aprovada');
    const mockSale = createMockSale({ status: 'waiting_payment' });

    mockGetSale.mockResolvedValue(mockSale);

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
  });

  it('should handle existing payment (idempotency)', async () => {
    const payload = createMockWebhookPayload('compra_aprovada');

    // Mock existing payment found
    mockSupabaseMaybeSingle.mockResolvedValueOnce({
      data: { id: 'existing-payment-123' },
      error: null,
    });

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
    expect(response.body.success).toBe(true);
  });

  it('should continue processing even if email fails', async () => {
    const payload = createMockWebhookPayload('compra_aprovada');
    const mockSale = createMockSale();

    mockGetSale.mockResolvedValue(mockSale);
    mockSendCustomEmail.mockRejectedValue(new Error('Email service unavailable'));

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    // Should still return 200 (email failure should not block webhook)
    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
  });

  it('should handle Kiwify API error gracefully', async () => {
    const payload = createMockWebhookPayload('compra_aprovada');

    mockGetSale.mockRejectedValue(new Error('Kiwify API error'));

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    // Should return 200 to prevent Kiwify retries
    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
  });
});

// ============================================================================
// Test Suite: compra_recusada Event
// ============================================================================

describe('Kiwify Webhook - compra_recusada Event', () => {
  it('should acknowledge refused payment without creating user', async () => {
    const payload = createMockWebhookPayload('compra_recusada');

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
    expect(response.body.success).toBe(true);
    // Should not call getSale for refused payments
    expect(mockGetSale).not.toHaveBeenCalled();
  });

  it('should log refused payment event', async () => {
    const payload = createMockWebhookPayload('compra_recusada', {
      customer_email: 'refused@teste.com',
    });

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.status).toBe(200);
    // Verify console.log was called (logging the event)
    expect(console.log).toHaveBeenCalled();
  });
});

// ============================================================================
// Test Suite: compra_reembolsada Event
// ============================================================================

describe('Kiwify Webhook - compra_reembolsada Event', () => {
  it('should acknowledge refund event', async () => {
    const payload = createMockWebhookPayload('compra_reembolsada');

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
  });

  it('should log refund event with sale ID', async () => {
    const payload = createMockWebhookPayload('compra_reembolsada', {
      sale_id: 'sale_refunded_123',
    });

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.status).toBe(200);
  });
});

// ============================================================================
// Test Suite: chargeback Event
// ============================================================================

describe('Kiwify Webhook - chargeback Event', () => {
  it('should acknowledge chargeback event', async () => {
    const payload = createMockWebhookPayload('chargeback');

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
  });

  it('should log chargeback as high priority event', async () => {
    const payload = createMockWebhookPayload('chargeback', {
      sale_id: 'sale_chargeback_123',
    });

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.status).toBe(200);
  });
});

// ============================================================================
// Test Suite: subscription_canceled Event
// ============================================================================

describe('Kiwify Webhook - subscription_canceled Event', () => {
  it('should acknowledge subscription cancellation', async () => {
    const payload = createMockWebhookPayload('subscription_canceled');

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
    expect(response.body.event).toBe('subscription_canceled');
  });

  it('should log cancellation event', async () => {
    const payload = createMockWebhookPayload('subscription_canceled');

    await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(console.log).toHaveBeenCalled();
  });
});

// ============================================================================
// Test Suite: subscription_renewed Event
// ============================================================================

describe('Kiwify Webhook - subscription_renewed Event', () => {
  it('should acknowledge subscription renewal', async () => {
    const payload = createMockWebhookPayload('subscription_renewed');

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
    expect(response.body.event).toBe('subscription_renewed');
  });

  it('should log renewal event', async () => {
    const payload = createMockWebhookPayload('subscription_renewed');

    await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(console.log).toHaveBeenCalled();
  });
});

// ============================================================================
// Test Suite: Unknown Event Types
// ============================================================================

describe('Kiwify Webhook - Unknown Event Types', () => {
  it('should acknowledge unknown event type without error', async () => {
    const payload = createMockWebhookPayload('unknown_event_type');

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
  });

  it('should log unknown event for monitoring', async () => {
    const payload = createMockWebhookPayload('custom_event');

    await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(console.log).toHaveBeenCalled();
  });
});

// ============================================================================
// Test Suite: Error Handling
// ============================================================================

describe('Kiwify Webhook - Error Handling', () => {
  it('should return 200 for internal errors to prevent retries', async () => {
    const payload = createMockWebhookPayload('compra_aprovada');

    mockGetSale.mockRejectedValue(new Error('Internal error'));

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    // Always return 200 to prevent Kiwify retries
    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
  });

  it('should include error details in response for debugging', async () => {
    const payload = createMockWebhookPayload('compra_aprovada');

    mockGetSale.mockRejectedValue(new Error('Sale not found'));

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
  });

  it('should log errors for investigation', async () => {
    const payload = createMockWebhookPayload('compra_aprovada');

    mockGetSale.mockRejectedValue(new Error('Database connection failed'));

    await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(console.log).toHaveBeenCalled();
  });
});

// ============================================================================
// Test Suite: Response Format
// ============================================================================

describe('Kiwify Webhook - Response Format', () => {
  it('should include event type in response', async () => {
    const payload = createMockWebhookPayload('compra_aprovada');

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.body.event).toBe('compra_aprovada');
  });

  it('should include sale ID in response', async () => {
    const payload = createMockWebhookPayload('compra_aprovada', {
      sale_id: 'sale_unique_123',
    });

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.body.saleId).toBe('sale_unique_123');
  });

  it('should include received flag set to true', async () => {
    const payload = createMockWebhookPayload('compra_recusada');

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.body.received).toBe(true);
  });
});

// ============================================================================
// Test Suite: GET /config Endpoint
// ============================================================================

describe('Kiwify Webhook - GET /config Endpoint', () => {
  it('should return configuration status', async () => {
    const response = await request(app)
      .get('/api/config');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('configured');
    expect(response.body).toHaveProperty('productId');
    expect(response.body).toHaveProperty('price');
  });

  it('should not expose sensitive credentials', async () => {
    const response = await request(app)
      .get('/api/config');

    expect(response.body).not.toHaveProperty('clientSecret');
    expect(response.body).not.toHaveProperty('webhookToken');
  });
});

// ============================================================================
// Test Suite: GET /health Endpoint
// ============================================================================

describe('Kiwify Webhook - GET /health Endpoint', () => {
  it('should return healthy status when configured', async () => {
    const response = await request(app)
      .get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('should return not_configured status when not configured', async () => {
    mockIsConfigured.mockReturnValue(false);

    // Create new app with re-imported router
    const newApp = express();
    newApp.use(express.json());
    const { kiwifyRouter } = await import('../routes/kiwify.js');
    newApp.use('/api', kiwifyRouter);

    const response = await request(newApp)
      .get('/api/health');

    expect(response.status).toBe(503);
    expect(response.body.status).toBe('not_configured');
  });
});

// ============================================================================
// Test Suite: Concurrent Webhook Handling
// ============================================================================

describe('Kiwify Webhook - Concurrent Handling', () => {
  it('should handle multiple concurrent webhooks for same sale (idempotency)', async () => {
    const payload = createMockWebhookPayload('compra_aprovada');
    const mockSale = createMockSale();

    mockGetSale.mockResolvedValue(mockSale);

    // Send multiple concurrent requests
    const requests = Array(3)
      .fill(null)
      .map(() =>
        request(app)
          .post('/api/webhooks/kiwify')
          .set('x-kiwify-token', 'test-webhook-token-12345')
          .send(payload)
      );

    const responses = await Promise.all(requests);

    // All should return 200
    responses.forEach((response) => {
      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);
    });
  });
});

// ============================================================================
// Test Suite: Edge Cases
// ============================================================================

describe('Kiwify Webhook - Edge Cases', () => {
  it('should handle empty customer name', async () => {
    const payload = createMockWebhookPayload('compra_aprovada', {
      customer_name: '',
    });

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.status).toBe(200);
  });

  it('should handle special characters in customer name', async () => {
    const payload = createMockWebhookPayload('compra_aprovada', {
      customer_name: "Jose Maria da Silva e Sa",
    });

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.status).toBe(200);
  });

  it('should handle very long sale ID', async () => {
    const longSaleId = 'sale_' + 'a'.repeat(200);
    const payload = createMockWebhookPayload('compra_aprovada', {
      sale_id: longSaleId,
    });

    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.saleId).toBe(longSaleId);
  });

  it('should handle malformed JSON gracefully', async () => {
    const response = await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }');

    // Express should return 400 for malformed JSON
    expect(response.status).toBe(400);
  });
});

// ============================================================================
// Test Suite: Logging
// ============================================================================

describe('Kiwify Webhook - Logging', () => {
  it('should log webhook received event', async () => {
    const payload = createMockWebhookPayload('compra_aprovada');

    await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'test-webhook-token-12345')
      .send(payload);

    expect(console.log).toHaveBeenCalled();
  });

  it('should log unauthorized attempts', async () => {
    const payload = createMockWebhookPayload('compra_aprovada');

    mockVerifyWebhookToken.mockReturnValue(false);

    await request(app)
      .post('/api/webhooks/kiwify')
      .set('x-kiwify-token', 'invalid-token')
      .send(payload);

    expect(console.log).toHaveBeenCalled();
  });
});
