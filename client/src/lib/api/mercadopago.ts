/**
 * MercadoPago API Helpers
 *
 * Client-side API functions for interacting with MercadoPago backend endpoints.
 */

export interface PreferenceItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
}

export interface CreatePreferenceResponse {
  checkoutUrl: string;
  preferenceId: string;
  initPoint: string;
}

/**
 * Create a MercadoPago checkout preference
 * Calls the backend endpoint which creates the preference with MercadoPago API
 */
export async function createMercadoPagoPreference(
  items: PreferenceItem[],
  userId?: string
): Promise<CreatePreferenceResponse> {
  const response = await fetch('/api/create-preference', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items,
      userId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to create payment preference');
  }

  return response.json();
}

/**
 * Create preference for a single item (convenience function)
 */
export async function createSingleItemPreference(
  item: PreferenceItem,
  userId?: string
): Promise<CreatePreferenceResponse> {
  return createMercadoPagoPreference([item], userId);
}
