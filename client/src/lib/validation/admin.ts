/**
 * Admin Operation Validation Schemas
 *
 * Zod schemas for validating admin form operations.
 * Used on both client (React Hook Form) and server (route validation).
 *
 * Schemas:
 * - grantAccessSchema: For granting manual access to users
 * - revokeAccessSchema: For revoking access with optional reason
 *
 * @example
 * ```tsx
 * import { grantAccessSchema, type GrantAccessInput } from "@/lib/validation/admin";
 *
 * // React Hook Form
 * const { register, handleSubmit } = useForm<GrantAccessInput>({
 *   resolver: zodResolver(grantAccessSchema),
 * });
 * ```
 */

import { z } from "zod";

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Validation schema for granting manual access
 *
 * Fields:
 * - email: Required, must be valid email format
 * - reason: Optional string for access justification
 * - expires_at: Optional ISO 8601 datetime string or null
 */
export const grantAccessSchema = z.object({
  email: z.string().email("Email inválido"),
  reason: z.string().optional(),
  expires_at: z.string().datetime().nullable().optional(),
});

/**
 * Validation schema for revoking access
 *
 * Fields:
 * - reason: Optional string for revocation justification
 */
export const revokeAccessSchema = z.object({
  reason: z.string().optional(),
});

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Input type for grant access form
 */
export type GrantAccessInput = z.infer<typeof grantAccessSchema>;

/**
 * Input type for revoke access form
 */
export type RevokeAccessInput = z.infer<typeof revokeAccessSchema>;

// ============================================================================
// Export Default
// ============================================================================

export default {
  grantAccessSchema,
  revokeAccessSchema,
};
