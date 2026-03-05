import { z } from "zod";

/**
 * Registration form validation schema using Zod
 * Validates email format, password strength, and password confirmation match
 *
 * Email validation:
 * - Must be a valid email format
 * - Uses Zod's built-in email() validator which follows RFC 5321/5322
 * - Allows international domains, + signs, dots in local part
 *
 * Password validation:
 * - Minimum 6 characters (Supabase requirement)
 * - Can include any characters
 * - No maximum length enforced (Supabase handles this)
 *
 * Password confirmation:
 * - Must match password field exactly
 */
export const registrationSchema = z
  .object({
    email: z
      .string({
        required_error: "Email é obrigatório",
        invalid_type_error: "Email deve ser uma string",
      })
      .min(1, "Email é obrigatório")
      .email("Insira um endereço de email válido")
      .max(254, "Email muito longo")
      .trim(),

    password: z
      .string({
        required_error: "Senha é obrigatória",
        invalid_type_error: "Senha deve ser uma string",
      })
      .min(1, "Senha é obrigatória")
      .min(6, "A senha deve ter pelo menos 6 caracteres")
      .max(128, "Senha muito longa"),

    confirmPassword: z
      .string({
        required_error: "Confirme sua senha",
        invalid_type_error: "Confirmação de senha deve ser uma string",
      })
      .min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"], // Error will be attached to confirmPassword field
  });

/**
 * Type inference from the schema
 * Use this for form state typing
 */
export type RegistrationFormData = z.infer<typeof registrationSchema>;

/**
 * Validates registration form data against the schema
 * Returns either the validated data or validation errors
 */
export function validateRegistrationForm(
  data: unknown
): { success: true; data: RegistrationFormData } | { success: false; errors: z.ZodError } {
  const result = registrationSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

/**
 * Extracts error messages from Zod validation error
 * Returns an object keyed by field name
 */
export function extractFieldErrors(
  zodError: z.ZodError
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  zodError.errors.forEach((error) => {
    const field = error.path.join(".");
    fieldErrors[field] = error.message;
  });

  return fieldErrors;
}

/**
 * Validates a single field against the schema
 * Useful for real-time validation as user types
 */
export function validateRegistrationField(
  field: "email" | "password" | "confirmPassword",
  value: string,
  formData?: Partial<RegistrationFormData>
): { valid: boolean; message?: string } {
  try {
    // Create a partial schema for the specific field
    const fieldSchema = registrationSchema.shape[field];

    // Validate the field value
    const result = fieldSchema.safeParse(value);

    if (!result.success) {
      const error = result.error.errors[0];
      return { valid: false, message: error.message };
    }

    // Special handling for confirmPassword (needs to check against password)
    if (field === "confirmPassword" && formData?.password) {
      if (value !== formData.password) {
        return { valid: false, message: "As senhas não coincidem" };
      }
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, message: "Erro de validação" };
  }
}
