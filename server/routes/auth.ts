import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { emailService } from "../services/email.service.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const authRouter = Router();

// Initialize Supabase admin client with service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Register a new user with custom email confirmation
 * POST /api/auth/register
 */
authRouter.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email e senha são obrigatórios",
      });
    }

    // Create user without sending confirmation email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Don't send default Supabase email
      user_metadata: {
        created_at: new Date().toISOString(),
      },
    });

    if (userError) {
      console.error("Error creating user:", userError);

      if (userError.message.includes("already been registered")) {
        return res.status(400).json({
          success: false,
          error: "Este email já está cadastrado",
        });
      }

      return res.status(500).json({
        success: false,
        error: "Erro ao criar conta. Tente novamente.",
      });
    }

    if (!userData.user) {
      return res.status(500).json({
        success: false,
        error: "Erro ao criar usuário",
      });
    }

    // Generate confirmation link manually
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
    });

    if (linkError || !linkData.properties?.action_link) {
      console.error("Error generating confirmation link:", linkError);
      return res.status(500).json({
        success: false,
        error: "Erro ao gerar link de confirmação",
      });
    }

    // Load custom email template
    const templatePath = path.join(
      process.cwd(),
      "client",
      "public",
      "email-templates",
      "confirm-signup.html"
    );

    let emailHtml: string;

    try {
      emailHtml = fs.readFileSync(templatePath, "utf-8");
    } catch (err) {
      console.error("Error reading email template:", err);
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
    if (process.env.EMAILIT_API_KEY) {
      try {
        await emailService.sendCustomEmail({
          to: email,
          subject: "Confirme seu e-mail - Limpa Nome Expresso",
          html: emailHtml,
          text: `Confirme seu e-mail clicando no link: ${linkData.properties.action_link}`,
        });

        console.log("Custom confirmation email sent:", {
          email,
          emailId: userData.user.id,
          timestamp: new Date().toISOString(),
        });
      } catch (emailError) {
        console.error("Error sending custom email:", emailError);
        // Don't fail registration if email fails
      }
    } else {
      console.warn("EMAILIT_API_KEY not configured, skipping custom email");
    }

    res.json({
      success: true,
      message: "Conta criada com sucesso! Verifique seu email para confirmar.",
      user: {
        id: userData.user.id,
        email: userData.user.email,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: false,
      error: "Erro ao criar conta. Tente novamente.",
    });
  }
});

/**
 * Resend confirmation email
 * POST /api/auth/resend-confirmation
 */
authRouter.post("/resend-confirmation", async (req, res) => {
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
