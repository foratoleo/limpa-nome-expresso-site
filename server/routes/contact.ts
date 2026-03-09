import { Router } from "express";
import { emailService, EmailItApiError } from "../services/email.service.js";

export const contactRouter = Router();

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Email configuration
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "suporte@cpfblindado.com";

contactRouter.post("/send", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body as ContactFormData;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: "Todos os campos sao obrigatorios",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Email invalido",
      });
    }

    // Check if EmailIt is configured
    if (!process.env.EMAILIT_API_KEY) {
      // Fallback to logging if EmailIt is not configured
      const emailContent = {
        to: CONTACT_EMAIL,
        from: email,
        subject: `[CPF Blindado] ${subject} - ${name}`,
        body: `
Nome: ${name}
Email: ${email}
Assunto: ${subject}

Mensagem:
${message}
        `.trim(),
      };

      console.log("Contact form submission (EmailIt not configured):");
      console.log(JSON.stringify(emailContent, null, 2));

      return res.json({
        success: true,
        message: "Mensagem enviada com sucesso",
      });
    }

    // Send email via EmailIt
    const response = await emailService.sendContactForm(
      {
        name,
        email,
        subject,
        message,
      },
      CONTACT_EMAIL
    );

    console.log("Contact email sent via EmailIt:", {
      id: response.id,
      status: response.status,
      to: response.to,
    });

    res.json({
      success: true,
      message: "Mensagem enviada com sucesso",
      emailId: response.id,
    });
  } catch (err: unknown) {
    console.error("Error sending contact email:", err);

    // Handle EmailIt API errors
    if (err instanceof EmailItApiError) {
      if (err.isRateLimitError()) {
        return res.status(429).json({
          success: false,
          error: "Muitas solicitacoes. Tente novamente em alguns minutos.",
        });
      }

      if (err.isValidationError()) {
        return res.status(400).json({
          success: false,
          error: "Dados invalidos para envio de email",
          details: err.getValidationErrors(),
        });
      }

      if (err.isAuthError()) {
        console.error("EmailIt authentication error:", err.message);
        return res.status(500).json({
          success: false,
          error: "Erro de configuracao do servico de email",
        });
      }
    }

    res.status(500).json({
      success: false,
      error: "Erro ao enviar mensagem. Tente novamente.",
    });
  }
});
