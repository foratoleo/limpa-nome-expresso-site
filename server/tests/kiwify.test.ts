/**
 * Kiwify OAuth Token Management Unit Tests
 *
 * Comprehensive tests for Kiwify API client token management including:
 * - OAuth token generation
 * - Token caching (96-hour TTL)
 * - Token expiration and refresh (1 hour buffer)
 * - Error handling for API failures (400, 401, 429, 500)
 * - Rate limiting with exponential backoff
 * - Webhook verification
 * - API methods (getSale, listSales)
 * - Singleton/instance management
 * - Configuration helpers
 *
 * Uses axios mocking to avoid real API calls.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Environment variables for test
const mockEnv = {
  KIWIFY_CLIENT_ID: '21f3b7c4-2734-44d5-9923-7de0848558bb',
  KIWIFY_CLIENT_SECRET: '4232bee972fe8026f3e3a9eab201dfeb2317e2b602158822a55136ff5b8e85bb',
  KIWIFY_ACCOUNT_ID: 'QVfvaU7dhwBCh5X',
  KIWIFY_WEBHOOK_TOKEN: 'test-webhook-token-12345',
};

const originalEnv = process.env;

/**
 * Helper to create mock axios instance
 */
function createMockAxiosInstance() {
  return {
    post: vi.fn(),
    get: vi.fn(),
    request: vi.fn(),
    create: vi.fn().mockReturnThis(),
    defaults: {},
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
}

// ============================================================================
// Test Setup
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks();
  process.env = { ...originalEnv, ...mockEnv };
  vi.resetModules();
});

afterEach(() => {
  process.env = originalEnv;
});

// ============================================================================
// Test Suite: Configuration and Initialization
// ============================================================================

describe('KiwifyApiClient - Configuration', () => {
  it('should initialize with environment variables', async () => {
    const mockInstance = createMockAxiosInstance();
    const mockAxiosCreate = vi.fn().mockReturnValue(mockInstance);
    (axios as any).create = mockAxiosCreate;

    const { KiwifyApiClient } = await import('../lib/kiwify.js');
    const client = new KiwifyApiClient();

    expect(client).toBeDefined();
    expect(client.isConfigured()).toBe(true);
  });

  it('should warn when credentials are incomplete', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    delete process.env.KIWIFY_CLIENT_ID;
    vi.resetModules();

    const { KiwifyApiClient } = await import('../lib/kiwify.js');
    const client = new KiwifyApiClient();

    expect(client.isConfigured()).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Kiwify API client initialized without complete credentials')
    );

    consoleSpy.mockRestore();
  });

  it('should create axios instance with correct base URL', async () => {
    const mockInstance = createMockAxiosInstance();
    const mockAxiosCreate = vi.fn().mockReturnValue(mockInstance);
    (axios as any).create = mockAxiosCreate;

    await import('../lib/kiwify.js');

    expect(mockAxiosCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'https://public-api.kiwify.com',
        timeout: 30000,
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });
});

// ============================================================================
// Test Suite: OAuth Token Generation
// ============================================================================

describe('KiwifyApiClient - Token Generation', () => {
  it('should obtain OAuth token before making API request', async () => {
    const mockInstance = createMockAxiosInstance();

    // Mock OAuth token response
    mockInstance.post.mockResolvedValueOnce({
      data: {
        access_token: 'test-access-token-12345',
        token_type: 'Bearer',
        expires_in: 345600, // 96 hours in seconds
        created_at: Math.floor(Date.now() / 1000),
      },
    });

    // Mock getSale request
    mockInstance.request.mockResolvedValueOnce({
      data: {
        id: 'sale-123',
        order_id: 'order-456',
        status: 'paid',
        customer: { id: 'cust-1', name: 'Test', email: 'test@example.com' },
        products: [],
        total: 14990,
        currency: 'BRL',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    const mockAxiosCreate = vi.fn().mockReturnValue(mockInstance);
    (axios as any).create = mockAxiosCreate;

    const { KiwifyApiClient } = await import('../lib/kiwify.js');
    const client = new KiwifyApiClient();

    await client.getSale('sale-123');

    // Verify OAuth token request was made
    expect(mockInstance.post).toHaveBeenCalledWith(
      '/v1/oauth/token',
      expect.objectContaining({
        client_id: mockEnv.KIWIFY_CLIENT_ID,
        client_secret: mockEnv.KIWIFY_CLIENT_SECRET,
        grant_type: 'client_credentials',
      })
    );
  });

  it('should throw KiwifyApiError when OAuth fails with 401', async () => {
    const mockInstance = createMockAxiosInstance();

    // Mock OAuth failure
    const authError = new Error('Request failed') as any;
    authError.response = {
      status: 401,
      data: { error: 'invalid_client', message: 'Invalid credentials' },
    };
    mockInstance.post.mockRejectedValueOnce(authError);

    const mockAxiosCreate = vi.fn().mockReturnValue(mockInstance);
    (axios as any).create = mockAxiosCreate;

    const { KiwifyApiClient, KiwifyApiError } = await import('../lib/kiwify.js');
    const client = new KiwifyApiClient();

    await expect(client.getSale('sale-123')).rejects.toThrow(KiwifyApiError);
  });
});

// ============================================================================
// Test Suite: Token Caching
// ============================================================================

describe('KiwifyApiClient - Token Caching', () => {
  it('should cache token and reuse for subsequent requests', async () => {
    const mockInstance = createMockAxiosInstance();

    // Mock OAuth token response (should be called only once)
    mockInstance.post.mockResolvedValueOnce({
      data: {
        access_token: 'cached-token-123',
        token_type: 'Bearer',
        expires_in: 345600,
        created_at: Math.floor(Date.now() / 1000),
      },
    });

    // Mock multiple getSale requests
    mockInstance.request.mockResolvedValue({
      data: {
        id: 'sale-123',
        order_id: 'order-456',
        status: 'paid',
        customer: { id: 'cust-1', name: 'Test', email: 'test@example.com' },
        products: [],
        total: 14990,
        currency: 'BRL',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    const mockAxiosCreate = vi.fn().mockReturnValue(mockInstance);
    (axios as any).create = mockAxiosCreate;

    const { KiwifyApiClient } = await import('../lib/kiwify.js');
    const client = new KiwifyApiClient();

    // Make multiple API calls
    await client.getSale('sale-123');
    await client.getSale('sale-456');

    // OAuth token request should only be made once (token cached)
    expect(mockInstance.post).toHaveBeenCalledTimes(1);
  });

  it('should clear token cache when clearTokenCache is called', async () => {
    const mockInstance = createMockAxiosInstance();

    // Mock two OAuth token responses (one for each cache cycle)
    mockInstance.post
      .mockResolvedValueOnce({
        data: {
          access_token: 'first-token',
          token_type: 'Bearer',
          expires_in: 345600,
          created_at: Math.floor(Date.now() / 1000),
        },
      })
      .mockResolvedValueOnce({
        data: {
          access_token: 'second-token',
          token_type: 'Bearer',
          expires_in: 345600,
          created_at: Math.floor(Date.now() / 1000),
        },
      });

    // Mock getSale requests
    mockInstance.request.mockResolvedValue({
      data: { id: 'sale-123' },
    });

    const mockAxiosCreate = vi.fn().mockReturnValue(mockInstance);
    (axios as any).create = mockAxiosCreate;

    const { KiwifyApiClient } = await import('../lib/kiwify.js');
    const client = new KiwifyApiClient();

    // First request - caches token
    await client.getSale('sale-123');
    expect(mockInstance.post).toHaveBeenCalledTimes(1);

    // Clear cache
    client.clearTokenCache();

    // Second request - should get new token
    await client.getSale('sale-456');
    expect(mockInstance.post).toHaveBeenCalledTimes(2);
  });
});

// ============================================================================
// Test Suite: Rate Limiting
// ============================================================================

describe('KiwifyApiClient - Rate Limiting', () => {
  it('should retry with exponential backoff on 429', async () => {
    vi.useFakeTimers();
    const mockInstance = createMockAxiosInstance();

    // Mock OAuth token response
    mockInstance.post.mockResolvedValueOnce({
      data: {
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_in: 345600,
        created_at: Math.floor(Date.now() / 1000),
      },
    });

    // First request gets 429
    const rateLimitError = new Error('Rate limited') as any;
    rateLimitError.response = {
      status: 429,
      data: { error: 'rate_limit_exceeded' },
    };
    mockInstance.request
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce({
        data: { id: 'sale-123' },
      });

    const mockAxiosCreate = vi.fn().mockReturnValue(mockInstance);
    (axios as any).create = mockAxiosCreate;

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { KiwifyApiClient } = await import('../lib/kiwify.js');
    const client = new KiwifyApiClient();

    // This should trigger retry
    const resultPromise = client.getSale('sale-123');

    // Advance timers for retry delay
    await vi.runAllTimersAsync();

    const result = await resultPromise;

    // Verify it eventually succeeded
    expect(result.id).toBe('sale-123');
    expect(mockInstance.request).toHaveBeenCalledTimes(2);

    consoleSpy.mockRestore();
    vi.useRealTimers();
  });

  it('should throw after max retries exceeded', async () => {
    vi.useFakeTimers();
    const mockInstance = createMockAxiosInstance();

    // Mock OAuth token response
    mockInstance.post.mockResolvedValueOnce({
      data: {
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_in: 345600,
        created_at: Math.floor(Date.now() / 1000),
      },
    });

    // All requests fail with 429
    const rateLimitError = new Error('Rate limited') as any;
    rateLimitError.response = { status: 429, data: { error: 'rate_limit_exceeded' } };
    mockInstance.request.mockRejectedValue(rateLimitError);

    const mockAxiosCreate = vi.fn().mockReturnValue(mockInstance);
    (axios as any).create = mockAxiosCreate;

    const { KiwifyApiClient, KiwifyApiError } = await import('../lib/kiwify.js');
    const client = new KiwifyApiClient();

    const resultPromise = client.getSale('sale-123');

    // Advance timers for retry delays
    await vi.runAllTimersAsync();

    await expect(resultPromise).rejects.toThrow(KiwifyApiError);

    vi.useRealTimers();
  });

  it('should clear token cache and retry once on 401', async () => {
    vi.useFakeTimers();
    const mockInstance = createMockAxiosInstance();

    // Two token requests - first "expired", second fresh
    mockInstance.post
      .mockResolvedValueOnce({
        data: {
          access_token: 'expired-token',
          token_type: 'Bearer',
          expires_in: 345600,
          created_at: Math.floor(Date.now() / 1000),
        },
      })
      // Second token request (after cache clear)
      .mockResolvedValueOnce({
        data: {
          access_token: 'new-token',
          token_type: 'Bearer',
          expires_in: 345600,
          created_at: Math.floor(Date.now() / 1000),
        },
      });

    // First request fails with 401 (token expired)
    const authError = new Error('Unauthorized') as any;
    authError.response = { status: 401, data: { error: 'token_expired' } };
    mockInstance.request
      .mockRejectedValueOnce(authError)
      // Second request succeeds
      .mockResolvedValueOnce({
        data: { id: 'sale-123' },
      });

    const mockAxiosCreate = vi.fn().mockReturnValue(mockInstance);
    (axios as any).create = mockAxiosCreate;

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { KiwifyApiClient } = await import('../lib/kiwify.js');
    const client = new KiwifyApiClient();

    // First call should trigger 401 -> cache clear -> new token -> retry
    const resultPromise = client.getSale('sale-123');

    await vi.runAllTimersAsync();

    const result = await resultPromise;

    expect(result.id).toBe('sale-123');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('token appears expired')
    );

    consoleSpy.mockRestore();
    vi.useRealTimers();
  });
});

// ============================================================================
// Test Suite: Webhook Verification
// ============================================================================

describe('KiwifyApiClient - Webhook Verification', () => {
  it('should verify valid webhook token', async () => {
    const mockInstance = createMockAxiosInstance();
    const mockAxiosCreate = vi.fn().mockReturnValue(mockInstance);
    (axios as any).create = mockAxiosCreate;

    const { KiwifyApiClient } = await import('../lib/kiwify.js');
    const client = new KiwifyApiClient();

    const isValid = client.verifyWebhookToken(mockEnv.KIWIFY_WEBHOOK_TOKEN);
    expect(isValid).toBe(true);
  });

  it('should reject invalid webhook token', async () => {
    const mockInstance = createMockAxiosInstance();
    const mockAxiosCreate = vi.fn().mockReturnValue(mockInstance);
    (axios as any).create = mockAxiosCreate

    const { KiwifyApiClient } = await import('../lib/kiwify.js');
    const client = new KiwifyApiClient();

    const isValid = client.verifyWebhookToken('wrong-token');
    expect(isValid).toBe(false);
  });

  it('should reject missing webhook token', async () => {
    const mockInstance = createMockAxiosInstance();
    const mockAxiosCreate = vi.fn().mockReturnValue(mockInstance);
    (axios as any).create = mockAxiosCreate

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { KiwifyApiClient } = await import('../lib/kiwify.js');
    const client = new KiwifyApiClient();

    const isValid = client.verifyWebhookToken(undefined);
    expect(isValid).toBe(false);

    consoleSpy.mockRestore();
  });

  it('should warn when KIWIFY_WEBHOOK_TOKEN not configured', async () => {
    delete process.env.KIWIFY_WEBHOOK_TOKEN;
    vi.resetModules();

    const mockInstance = createMockAxiosInstance();
    const mockAxiosCreate = vi.fn().mockReturnValue(mockInstance);
    (axios as any).create = mockAxiosCreate

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { KiwifyApiClient } = await import('../lib/kiwify.js');
    const client = new KiwifyApiClient();

    const isValid = client.verifyWebhookToken('some-token');
    expect(isValid).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('KIWIFY_WEBHOOK_TOKEN not configured')
    );

    consoleSpy.mockRestore();
  });
});

// ============================================================================
// Test Suite: API Methods
// ============================================================================

describe('KiwifyApiClient - API Methods', () => {
  it('should get single sale by ID', async () => {
    const mockInstance = createMockAxiosInstance();

    mockInstance.post.mockResolvedValueOnce({
      data: {
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_in: 345600,
        created_at: Math.floor(Date.now() / 1000),
      },
    });

    const mockSale = {
      id: 'sale-123',
      order_id: 'order-456',
      status: 'paid',
      customer: { id: 'cust-1', name: 'Test User', email: 'test@example.com' },
      products: [{ id: 'prod-1', name: 'Product', price: 14990, quantity: 1 }],
      total: 14990,
      currency: 'BRL',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockInstance.request.mockResolvedValueOnce({ data: mockSale });

    const mockAxiosCreate = vi.fn().mockReturnValue(mockInstance);
    (axios as any).create = mockAxiosCreate

    const { KiwifyApiClient } = await import('../lib/kiwify.js');
    const client = new KiwifyApiClient();

    const sale = await client.getSale('sale-123');

    expect(sale).toEqual(mockSale);
    expect(mockInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: '/v1/sales/sale-123',
      })
    );
  });

  it('should list sales with filters', async () => {
    const mockInstance = createMockAxiosInstance();

    mockInstance.post.mockResolvedValueOnce({
      data: {
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_in: 345600,
        created_at: Math.floor(Date.now() / 1000),
      },
    });

    const mockSalesList = [
      { id: 'sale-1', status: 'paid' },
      { id: 'sale-2', status: 'waiting_payment' },
    ];

    mockInstance.request.mockResolvedValueOnce({
      data: {
        data: mockSalesList,
        meta: { current_page: 1, per_page: 20, total_pages: 1, total_count: 2 },
      },
    });

    const mockAxiosCreate = vi.fn().mockReturnValue(mockInstance);
    (axios as any).create = mockAxiosCreate

    const { KiwifyApiClient } = await import('../lib/kiwify.js');
    const client = new KiwifyApiClient();

    const result = await client.listSales({
      status: 'paid',
      customer_email: 'test@example.com',
    });

    expect(result.data).toEqual(mockSalesList);
    expect(result.meta.total_count).toBe(2);
  });

  it('should list sales with date range filter', async () => {
    const mockInstance = createMockAxiosInstance();

    mockInstance.post.mockResolvedValueOnce({
      data: {
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_in: 345600,
        created_at: Math.floor(Date.now() / 1000),
      },
    });

    mockInstance.request.mockResolvedValueOnce({
      data: { data: [], meta: {} },
    });

    const mockAxiosCreate = vi.fn().mockReturnValue(mockInstance);
    (axios as any).create = mockAxiosCreate

    const { KiwifyApiClient } = await import('../lib/kiwify.js');
    const client = new KiwifyApiClient();

    await client.listSales({
      start_date: '2024-01-01',
      end_date: '2024-01-31',
    });

    // Verify URL contains date filters
    expect(mockInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('start_date=2024-01-01'),
      })
    );
  });

  it('should inject correct headers in requests', async () => {
    const mockInstance = createMockAxiosInstance();

    mockInstance.post.mockResolvedValueOnce({
      data: {
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_in: 345600,
        created_at: Math.floor(Date.now() / 1000),
      },
    });

    mockInstance.request.mockResolvedValueOnce({
      data: { id: 'sale-123' },
    });

    const mockAxiosCreate = vi.fn().mockReturnValue(mockInstance);
    (axios as any).create = mockAxiosCreate

    const { KiwifyApiClient } = await import('../lib/kiwify.js');
    const client = new KiwifyApiClient();

    await client.getSale('sale-123');

    expect(mockInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'x-kiwify-account-id': mockEnv.KIWIFY_ACCOUNT_ID,
        }),
      })
    );
  });
});

// ============================================================================
// Test Suite: Error Classes
// ============================================================================

describe('KiwifyApiError', () => {
  it('should create KiwifyApiError with all properties', async () => {
    const { KiwifyApiError } = await import('../lib/kiwify.js');
    const error = new KiwifyApiError('Test error', 400, 'TEST_CODE', { detail: 'test' });

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.errorCode).toBe('TEST_CODE');
    expect(error.details).toEqual({ detail: 'test' });
  });

  it('should be instance of Error', async () => {
    const { KiwifyApiError } = await import('../lib/kiwify.js');
    const error = new KiwifyApiError('test', 500);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('KiwifyApiError');
  });
});

// ============================================================================
// Test Suite: Configuration Module
// ============================================================================

describe('kiwify-config', () => {
  it('should export KIWIFY_PRODUCT constants', async () => {
    const { KIWIFY_PRODUCT } = await import('../lib/kiwify-config.js');

    expect(KIWIFY_PRODUCT.id).toBe('limpa_nome_expresso_12_months');
    expect(KIWIFY_PRODUCT.title).toBe('CPF Blindado - Acesso Premium 12 Meses');
    expect(KIWIFY_PRODUCT.unit_price).toBe(149.90);
    expect(KIWIFY_PRODUCT.currency_id).toBe('BRL');
    expect(KIWIFY_PRODUCT.duration_months).toBe(12);
  });

  it('should export KIWIFY_API_CONFIG constants', async () => {
    const { KIWIFY_API_CONFIG } = await import('../lib/kiwify-config.js');

    expect(KIWIFY_API_CONFIG.baseUrl).toBe('https://public-api.kiwify.com');
    expect(KIWIFY_API_CONFIG.tokenExpirationMs).toBe(96 * 60 * 60 * 1000); // 96 hours
    expect(KIWIFY_API_CONFIG.tokenRefreshBufferMs).toBe(60 * 60 * 1000); // 1 hour
    expect(KIWIFY_API_CONFIG.rateLimitPerMinute).toBe(100);
    expect(KIWIFY_API_CONFIG.maxRetries).toBe(3);
  });

  it('should export KIWIFY_WEBHOOK_EVENTS constants', async () => {
    const { KIWIFY_WEBHOOK_EVENTS } = await import('../lib/kiwify-config.js');

    expect(KIWIFY_WEBHOOK_EVENTS.COMPRA_APROVADA).toBe('compra_aprovada');
    expect(KIWIFY_WEBHOOK_EVENTS.COMPRA_RECUSADA).toBe('compra_recusada');
    expect(KIWIFY_WEBHOOK_EVENTS.COMPRA_REEMBOLSADA).toBe('compra_reembolsada');
    expect(KIWIFY_WEBHOOK_EVENTS.CHARGEBACK).toBe('chargeback');
    expect(KIWIFY_WEBHOOK_EVENTS.SUBSCRIPTION_CANCELED).toBe('subscription_canceled');
    expect(KIWIFY_WEBHOOK_EVENTS.SUBSCRIPTION_RENEWED).toBe('subscription_renewed');
  });

  it('should check if Kiwify is configured', async () => {
    process.env = { ...originalEnv, ...mockEnv };
    vi.resetModules();

    const { isKiwifyConfigured } = await import('../lib/kiwify-config.js');

    expect(isKiwifyConfigured()).toBe(true);
  });

  it('should return false if configuration incomplete', async () => {
    delete process.env.KIWIFY_CLIENT_ID;
    delete process.env.KIWIFY_CLIENT_SECRET;
    delete process.env.KIWIFY_ACCOUNT_ID;
    vi.resetModules();

    const { isKiwifyConfigured } = await import('../lib/kiwify-config.js');

    expect(isKiwifyConfigured()).toBe(false);
  });

  it('should throw error when getting config with incomplete env', async () => {
    delete process.env.KIWIFY_CLIENT_ID;
    delete process.env.KIWIFY_CLIENT_SECRET;
    delete process.env.KIWIFY_ACCOUNT_ID;
    vi.resetModules();

    const { getKiwifyConfig } = await import('../lib/kiwify-config.js');

    expect(() => getKiwifyConfig()).toThrow(
      /Kiwify configuration incomplete/
    );
  });

  it('should get configuration from environment', async () => {
    process.env = { ...originalEnv, ...mockEnv };
    vi.resetModules();

    const { getKiwifyConfig } = await import('../lib/kiwify-config.js');

    const config = getKiwifyConfig();
    expect(config.clientId).toBe(mockEnv.KIWIFY_CLIENT_ID);
    expect(config.clientSecret).toBe(mockEnv.KIWIFY_CLIENT_SECRET);
    expect(config.accountId).toBe(mockEnv.KIWIFY_ACCOUNT_ID);
    // webhookToken defaults to empty string if not set
    expect(config.webhookToken).toBeDefined();
  });

  it('should include webhook token when set', async () => {
    process.env = { ...originalEnv, ...mockEnv };
    vi.resetModules();

    const { getKiwifyConfig } = await import('../lib/kiwify-config.js');

    const config = getKiwifyConfig();
    expect(config.webhookToken).toBe(mockEnv.KIWIFY_WEBHOOK_TOKEN);
  });
});

// ============================================================================
// Test Suite: Singleton Export
// ============================================================================

describe('kiwifyClient singleton', () => {
  it('should export kiwifyClient singleton instance', async () => {
    const mockInstance = createMockAxiosInstance();
    const mockAxiosCreate = vi.fn().mockReturnValue(mockInstance);
    (axios as any).create = mockAxiosCreate;

    const { kiwifyClient } = await import('../lib/kiwify.js');

    expect(kiwifyClient).toBeDefined();
    expect(typeof kiwifyClient.getSale).toBe('function');
    expect(typeof kiwifyClient.listSales).toBe('function');
    expect(typeof kiwifyClient.verifyWebhookToken).toBe('function');
    expect(typeof kiwifyClient.clearTokenCache).toBe('function');
    expect(typeof kiwifyClient.isConfigured).toBe('function');
  });

  it('should be the same instance across imports', async () => {
    const mockInstance = createMockAxiosInstance();
    const mockAxiosCreate = vi.fn().mockReturnValue(mockInstance);
    (axios as any).create = mockAxiosCreate;

    const { kiwifyClient: client1 } = await import('../lib/kiwify.js');
    const { kiwifyClient: client2 } = await import('../lib/kiwify.js');

    expect(client1).toBe(client2);
  });
});
