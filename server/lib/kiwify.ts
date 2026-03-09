import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  KIWIFY_API_CONFIG,
  KIWIFY_WEBHOOK_EVENTS,
  KiwifyWebhookEventType,
} from './kiwify-config';

/**
 * TypeScript interfaces for Kiwify API data structures
 */

// OAuth Token Response
export interface KiwifyOAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // seconds until expiration
  created_at: number; // Unix timestamp
}

// Customer information from Kiwify
export interface KiwifyCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  mobile?: string;
  document?: string; // CPF
  document_type?: string;
}

// Product information from Kiwify sale
export interface KiwifyProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Sale object from Kiwify API
export interface KiwifySale {
  id: string;
  order_id: string;
  status: 'paid' | 'waiting_payment' | 'refused' | 'refunded' | 'chargedback' | 'canceled';
  customer: KiwifyCustomer;
  products: KiwifyProduct[];
  total: number;
  currency: string;
  payment_method?: string;
  payment_installments?: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  paid_at?: string; // ISO date string
  refunded_at?: string; // ISO date string
}

// Pagination metadata for list responses
export interface KiwifyPaginationMeta {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_count: number;
}

// Response for listing sales
export interface KiwifySalesListResponse {
  data: KiwifySale[];
  meta: KiwifyPaginationMeta;
}

// Webhook event payload
export interface KiwifyWebhookPayload {
  event: KiwifyWebhookEventType;
  sale_id: string;
  order_id: string;
  customer_email: string;
  customer_name?: string;
  product_id?: string;
  product_name?: string;
  amount?: number;
  currency?: string;
  timestamp: string;
  webhook_token?: string;
}

// Filter options for listing sales
export interface KiwifySalesFilter {
  start_date?: string; // ISO date string
  end_date?: string; // ISO date string
  customer_email?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

// Custom error class for Kiwify API errors
export class KiwifyApiError extends Error {
  public statusCode: number;
  public errorCode?: string;
  public details?: unknown;

  constructor(message: string, statusCode: number, errorCode?: string, details?: unknown) {
    super(message);
    this.name = 'KiwifyApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

/**
 * Token cache structure
 */
interface TokenCache {
  accessToken: string;
  expiresAt: number; // Unix timestamp in milliseconds
}

/**
 * Kiwify API Client
 * Handles OAuth authentication and API requests with automatic token management
 */
class KiwifyApiClient {
  private client: AxiosInstance;
  private tokenCache: TokenCache | null = null;
  private clientId: string;
  private clientSecret: string;
  private accountId: string;

  constructor() {
    this.clientId = process.env.KIWIFY_CLIENT_ID || '';
    this.clientSecret = process.env.KIWIFY_CLIENT_SECRET || '';
    this.accountId = process.env.KIWIFY_ACCOUNT_ID || '';

    if (!this.clientId || !this.clientSecret || !this.accountId) {
      console.warn(
        'Kiwify API client initialized without complete credentials. ' +
          'Set KIWIFY_CLIENT_ID, KIWIFY_CLIENT_SECRET, and KIWIFY_ACCOUNT_ID environment variables.'
      );
    }

    this.client = axios.create({
      baseURL: KIWIFY_API_CONFIG.baseUrl,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  /**
   * Get OAuth access token with caching and auto-refresh
   * Tokens are valid for 96 hours, we refresh 1 hour before expiry
   */
  private async getAccessToken(): Promise<string> {
    const now = Date.now();

    // Check if we have a valid cached token
    if (this.tokenCache && this.tokenCache.expiresAt > now + KIWIFY_API_CONFIG.tokenRefreshBufferMs) {
      return this.tokenCache.accessToken;
    }

    // Request new token
    try {
      const response = await this.client.post<KiwifyOAuthResponse>(KIWIFY_API_CONFIG.oauthEndpoint, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
      });

      const { access_token, expires_in } = response.data;

      // Cache the token with expiration time
      this.tokenCache = {
        accessToken: access_token,
        expiresAt: now + expires_in * 1000, // Convert seconds to milliseconds
      };

      console.log('Kiwify OAuth token obtained successfully');
      return access_token;
    } catch (error) {
      console.error('Failed to obtain Kiwify OAuth token:', error);
      throw new KiwifyApiError(
        'Failed to authenticate with Kiwify API',
        401,
        'AUTH_FAILED',
        error
      );
    }
  }

  /**
   * Make an authenticated request to the Kiwify API
   * Automatically handles token injection and rate limiting retries
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: unknown,
    retryCount = 0
  ): Promise<T> {
    const token = await this.getAccessToken();

    try {
      const response = await this.client.request<T>({
        method,
        url: endpoint,
        data,
        headers: {
          Authorization: `Bearer ${token}`,
          'x-kiwify-account-id': this.accountId,
        },
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;

      // Handle rate limiting (429) with exponential backoff
      if (axiosError.response?.status === 429 && retryCount < 3) {
        const delayMs = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.warn(`Kiwify API rate limited. Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return this.request<T>(method, endpoint, data, retryCount + 1);
      }

      // Handle token expiration - clear cache and retry once
      if (axiosError.response?.status === 401 && retryCount === 0) {
        console.warn('Kiwify token appears expired. Clearing cache and retrying...');
        this.tokenCache = null;
        return this.request<T>(method, endpoint, data, 1);
      }

      // Handle other errors
      const statusCode = axiosError.response?.status || 500;
      const errorData = axiosError.response?.data;
      const errorMessage = errorData?.message || errorData?.error || axiosError.message;

      console.error(`Kiwify API error (${statusCode}):`, errorMessage);

      throw new KiwifyApiError(
        `Kiwify API request failed: ${errorMessage}`,
        statusCode,
        errorData?.error,
        errorData
      );
    }
  }

  /**
   * Get a single sale by ID
   * @param saleId - The Kiwify sale ID
   */
  public async getSale(saleId: string): Promise<KiwifySale> {
    return this.request<KiwifySale>('GET', `${KIWIFY_API_CONFIG.salesEndpoint}/${saleId}`);
  }

  /**
   * List sales with optional filters
   * @param filters - Filter options for the sales query
   */
  public async listSales(filters?: KiwifySalesFilter): Promise<KiwifySalesListResponse> {
    const params: Record<string, string | number> = {};

    if (filters?.start_date) params.start_date = filters.start_date;
    if (filters?.end_date) params.end_date = filters.end_date;
    if (filters?.customer_email) params.customer_email = filters.customer_email;
    if (filters?.status) params.status = filters.status;
    if (filters?.page) params.page = filters.page;
    if (filters?.per_page) params.per_page = filters.per_page;

    const queryString = Object.keys(params).length > 0
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';

    return this.request<KiwifySalesListResponse>('GET', `${KIWIFY_API_CONFIG.salesEndpoint}${queryString}`);
  }

  /**
   * Verify webhook authenticity using token
   * @param providedToken - Token from webhook request
   */
  public verifyWebhookToken(providedToken: string | undefined): boolean {
    const expectedToken = process.env.KIWIFY_WEBHOOK_TOKEN;

    if (!expectedToken) {
      console.warn('KIWIFY_WEBHOOK_TOKEN not configured. Webhook verification will fail.');
      return false;
    }

    if (!providedToken) {
      console.error('No webhook token provided in request');
      return false;
    }

    return providedToken === expectedToken;
  }

  /**
   * Clear the token cache (useful for testing or forced refresh)
   */
  public clearTokenCache(): void {
    this.tokenCache = null;
  }

  /**
   * Check if the client is properly configured
   */
  public isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret && this.accountId);
  }
}

// Export singleton instance
export const kiwifyClient = new KiwifyApiClient();

// Also export the class for testing purposes
export { KiwifyApiClient };

// Re-export webhook events for convenience
export { KIWIFY_WEBHOOK_EVENTS };
