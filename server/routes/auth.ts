import { Router, Request } from "express";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { emailService } from "../services/email.service.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  validateRegistrationRequest,
  logRegistrationSuccess,
  logRegistrationError,
} from "../middleware/validation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const authRouter = Router();

// Initialize Supabase admin client with service role key
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Clean up any newlines or extra whitespace from the service key
if (supabaseServiceKey) {
  supabaseServiceKey = supabaseServiceKey.trim().replace(/\n/g, '').replace(/\r/g, '');
}

let supabaseAdmin: SupabaseClient;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("FATAL: Missing Supabase environment variables. Auth routes will be disabled.");
  // We don't throw here to allow the server to start, but endpoints will fail.
} else {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Register a new user with custom email confirmation
 * POST /api/auth/register
 *
 * Request validation is handled by validateRegistrationRequest middleware
 * which performs client-side validation before Supabase API calls
 */
authRouter.post("/register", validateRegistrationRequest, async (req: Request & { headers: { 'x-request-id'?: string } }, res) => {
  console.log('[AUTH REGISTER] Starting registration request');

  if (!supabaseAdmin) {
    console.error('[AUTH REGISTER] Supabase admin client not initialized');
    return res.status(503).json({
      success: false,
      error: "Serviço de autenticação indisponível. O administrador foi notificado.",
      code: 'AUTH_SERVICE_UNAVAILABLE',
    });
  }

  const requestId = req.headers['x-request-id'] || `req_${Date.now()}`;
  const timestamp = new Date().toISOString();
  const { email, password } = req.body;

  console.log('[AUTH REGISTER] Request details:', {
    requestId,
    timestamp,
    email: email ? email.substring(0, 3) + '***@' + email.split('@')[1] : 'missing',
    hasPassword: !!password
  });

  try {
    // Log Supabase user creation attempt
    console.log('[AUTH REGISTER] About to call Supabase createUser');
    console.log(JSON.stringify({
      type: 'supabase_request',
      requestId,
      timestamp,
      operation: 'createUser',
      email: email.substring(0, 3) + '***@' + email.split('@')[1],
    }));

    let userData, userError;
    try {
      // Create user without sending confirmation email
      const result = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false, // Don't send default Supabase email
        user_metadata: {
          created_at: new Date().toISOString(),
        },
      });
      userData = result.data;
      userError = result.error;
      console.log('[AUTH REGISTER] Supabase createUser completed', { userError: userError?.message });
    } catch (err) {
      console.error('[AUTH REGISTER] Exception during createUser:', err);
      userError = err;
    }

    if (userError) {
      logRegistrationError({
        requestId,
        error: userError,
        stage: 'user_creation',
      });

      // Handle validation errors (invalid email format, weak password, etc.)
      if (userError.status === 400 || userError.code === 'validation_failed') {
        console.log(JSON.stringify({
          type: 'validation_error_supabase',
          requestId,
          timestamp: new Date().toISOString(),
          code: userError.code,
          status: userError.status,
          message: userError.message,
        }));
        return res.status(400).json({
          success: false,
          error: "Formato de email inválido ou senha muito curta. A senha deve ter pelo menos 6 caracteres.",
          code: 'VALIDATION_FAILED',
        });
      }

      // Handle duplicate email
      if ((userError.message && userError.message.includes("already been registered")) || userError.code === 'user_already_exists') {
        console.log(JSON.stringify({
          type: 'duplicate_email',
          requestId,
          timestamp: new Date().toISOString(),
          email: email.substring(0, 3) + '***@' + email.split('@')[1],
        }));
        return res.status(409).json({
          success: false,
          error: "Este email já está cadastrado",
          code: 'USER_EXISTS',
        });
      }

      return res.status(500).json({
        success: false,
        error: "Erro ao criar conta. Tente novamente.",
        code: 'SERVER_ERROR',
      });
    }

    if (!userData.user) {
      console.error(JSON.stringify({
        type: 'unexpected_error',
        requestId,
        timestamp: new Date().toISOString(),
        error: 'User creation succeeded but userData.user is null',
      }));
      return res.status(500).json({
        success: false,
        error: "Erro ao criar usuário",
        code: 'UNEXPECTED_ERROR',
      });
    }

    // Log successful user creation
    console.log(JSON.stringify({
      type: 'user_created',
      requestId,
      timestamp: new Date().toISOString(),
      userId: userData.user.id,
      email: email.substring(0, 3) + '***@' + email.split('@')[1],
    }));

    // Generate confirmation link manually
    console.log('[AUTH REGISTER] About to generate confirmation link');
    console.log(JSON.stringify({
      type: 'supabase_request',
      requestId,
      timestamp: new Date().toISOString(),
      operation: 'generateLink',
    }));

    let linkData, linkError;
    try {
      const linkResult = await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email,
        password,
      });
      linkData = linkResult.data;
      linkError = linkResult.error;
      console.log('[AUTH REGISTER] generateLink completed', { linkError: linkError?.message });
    } catch (err) {
      console.error('[AUTH REGISTER] Exception during generateLink:', err);
      linkError = err;
    }

    // If "signup" link fails because user already exists after createUser,
    // fallback to magic link for email confirmation/login.
    if (
      linkError &&
      ((linkError.message && linkError.message.includes("already been registered")) ||
        linkError.code === "user_already_exists")
    ) {
      console.log('[AUTH REGISTER] Signup link failed (user already exists), trying magic link');
      try {
        const magicResult = await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email,
        });
        linkData = magicResult.data;
        linkError = magicResult.error;
        console.log('[AUTH REGISTER] Magic link generated', { linkError: linkError?.message });
      } catch (err) {
        console.error('[AUTH REGISTER] Exception during magic link generation:', err);
        linkError = err;
      }
    }

    if (linkError || !linkData.properties?.action_link) {
      logRegistrationError({
        requestId,
        error: linkError || new Error('No action link in response'),
        stage: 'link_generation',
      });
      return res.status(500).json({
        success: false,
        error: "Erro ao gerar link de confirmação",
        code: 'LINK_GENERATION_FAILED',
      });
    }

    // Load custom email template
    console.log('[AUTH REGISTER] About to load email template');
    const templatePath = path.join(
      process.cwd(),
      "client",
      "public",
      "email-templates",
      "confirm-signup.html"
    );

    console.log('[AUTH REGISTER] Template path:', templatePath);

    let emailHtml: string;

    try {
      console.log('[AUTH REGISTER] Reading template file');
      emailHtml = fs.readFileSync(templatePath, "utf-8");
      console.log('[AUTH REGISTER] Template loaded successfully');
    } catch (err) {
      console.error('[AUTH REGISTER] Template load error:', err);
      console.error(JSON.stringify({
        type: 'template_error',
        requestId,
        timestamp: new Date().toISOString(),
        error: 'Email template not found, using fallback',
        templatePath,
      }));
      // Fallback to simple HTML if template file is missing
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Confirme seu e-mail</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #d39e17;">Confirme seu e-mail</h1>
          <p>Obrigado por criar sua conta no Limpa Nome Expresso!</p>
          <p>Clique no botão abaixo para confirmar seu e-mail:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{ .ConfirmationURL }}" style="background-color: #d39e17; color: #12110d; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Confirmar E-mail
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">Este link expira em 24 horas.</p>
        </body>
        </html>
      `;
    }

    // Replace placeholders in template
    emailHtml = emailHtml
      .replace(/\{\{\s*\.ConfirmationURL\s*\}\}/g, linkData.properties.action_link)
      .replace(/\{\{\s*\.Email\s*\}\}/g, email);

    // Send custom confirmation email via EmailIt
    console.log('[AUTH REGISTER] About to send email');
    let emailSent = false;
    if (process.env.EMAILIT_API_KEY) {
      console.log('[AUTH REGISTER] EMAILIT_API_KEY is configured');
      try {
        console.log('[AUTH REGISTER] Calling emailService.sendCustomEmail');
        await emailService.sendCustomEmail({
          to: email,
          subject: "Confirme seu e-mail - Limpa Nome Expresso",
          html: emailHtml,
          text: `Confirme seu e-mail clicando no link: ${linkData.properties.action_link}`,
        });
        emailSent = true;
        console.log('[AUTH REGISTER] Email sent successfully');

        console.log(JSON.stringify({
          type: 'email_sent',
          requestId,
          timestamp: new Date().toISOString(),
          email: email.substring(0, 3) + '***@' + email.split('@')[1],
        }));
      } catch (emailError) {
        console.error('[AUTH REGISTER] Email sending error:', emailError);
        logRegistrationError({
          requestId,
          error: emailError,
          stage: 'email_sending',
        });
        // Don't fail registration if email fails
      }
    } else {
      console.warn('[AUTH REGISTER] EMAILIT_API_KEY not configured, skipping email');
      console.warn(JSON.stringify({
        type: 'email_config_warning',
        requestId,
        timestamp: new Date().toISOString(),
        warning: 'EMAILIT_API_KEY not configured, skipping custom email',
      }));
    }

    // Log successful registration
    console.log('[AUTH REGISTER] Registration successful, preparing response');
    logRegistrationSuccess({
      requestId,
      userId: userData.user.id,
      email,
      emailSent,
    });

    console.log('[AUTH REGISTER] Sending success response');
    res.json({
      success: true,
      message: "Conta criada com sucesso! Verifique seu email para confirmar.",
      user: {
        id: userData.user.id,
        email: userData.user.email,
      },
    });
    console.log('[AUTH REGISTER] Request completed successfully');
  } catch (err) {
    console.error('[AUTH REGISTER] UNEXPECTED ERROR in registration endpoint:');
    console.error('[AUTH REGISTER] Error details:', {
      name: err instanceof Error ? err.name : 'Unknown',
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      fullError: err
    });
    console.error(JSON.stringify({
      type: 'unexpected_error',
      requestId,
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? {
        name: err.name,
        message: err.message,
        stack: err.stack,
      } : String(err),
    }));
    console.error('[AUTH REGISTER] Sending 500 error response');
    res.status(500).json({
      success: false,
      error: "Erro ao criar conta. Tente novamente.",
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * Resend confirmation email
 * POST /api/auth/resend-confirmation
 */
authRouter.post("/resend-confirmation", async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(503).json({
      success: false,
      error: "Serviço de autenticação indisponível. O administrador foi notificado.",
      code: 'AUTH_SERVICE_UNAVAILABLE',
    });
  }
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email é obrigatório",
      });
    }

    // Get user by email
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();

    if (userError) {
      return res.status(500).json({
        success: false,
        error: "Erro ao buscar usuário",
      });
    }

    const user = users?.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Usuário não encontrado",
      });
    }

    // Generate new confirmation link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (linkError || !linkData.properties?.action_link) {
      return res.status(500).json({
        success: false,
        error: "Erro ao gerar link de confirmação",
      });
    }

    // Load and send email template
    const templatePath = path.join(
      process.cwd(),
      "client",
      "public",
      "email-templates",
      "confirm-signup.html"
    );

    let emailHtml = fs.readFileSync(templatePath, "utf-8");
    emailHtml = emailHtml
      .replace(/\{\{\s*\.ConfirmationURL\s*\}\}/g, linkData.properties.action_link)
      .replace(/\{\{\s*\.Email\s*\}\}/g, email);

    if (process.env.EMAILIT_API_KEY) {
      await emailService.sendCustomEmail({
        to: email,
        subject: "Confirme seu e-mail - Limpa Nome Expresso",
        html: emailHtml,
      });
    }

    res.json({
      success: true,
      message: "Email de confirmação reenviado!",
    });
  } catch (err) {
    console.error("Resend confirmation error:", err);
    res.status(500).json({
      success: false,
      error: "Erro ao reenviar email. Tente novamente.",
    });
  }
});

/**
 * Check user endpoint (timing-safe to prevent enumeration)
 * POST /api/auth/check-user
 *
 * SECURITY: Always returns same response structure regardless of user existence
 * to prevent user enumeration attacks. UI should show all auth options universally.
 */
authRouter.post("/check-user", async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(503).json({
      success: false,
      error: "Serviço de autenticação indisponível. O administrador foi notificado.",
      code: 'AUTH_SERVICE_UNAVAILABLE',
    });
  }
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email é obrigatório",
      });
    }

    // SECURITY: Perform the lookup but don't expose results
    // This prevents timing attacks by ensuring consistent execution time
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      return res.status(500).json({
        success: false,
        error: "Erro ao verificar usuário",
      });
    }

    // Lookup user but don't include in response
    const user = users?.find(u => u.email === email);

    // SECURITY: Always return success with same structure
    // Don't expose user existence, password status, or confirmation status
    // The frontend will show appropriate auth options based on user input
    res.json({
      success: true,
      // No user-specific data exposed
      // Frontend should universally show magic link and password options
    });
  } catch (err) {
    console.error("Check user error:", err);
    res.status(500).json({
      success: false,
      error: "Erro ao verificar usuário. Tente novamente.",
    });
  }
});
