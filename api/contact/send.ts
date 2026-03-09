import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Email configuration
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "suporte@cpfblindado.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  try {
    const { name, email, subject, message } = req.body as ContactFormData;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: "Todos os campos são obrigatórios",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Email inválido",
      });
    }

    // Map subject to Portuguese label
    const subjectMap: Record<string, string> = {
      duvida: "Dúvida sobre o processo",
      problema: "Problema técnico",
      sugestao: "Sugestão",
      outro: "Outro",
    };

    const subjectLabel = subjectMap[subject] || subject;

    // Log the email (in production, use Resend, SendGrid, etc.)
    const emailContent = {
      to: CONTACT_EMAIL,
      from: email,
      subject: `[CPF Blindado] ${subjectLabel} - ${name}`,
      body: `
Nome: ${name}
Email: ${email}
Assunto: ${subjectLabel}

Mensagem:
${message}
      `.trim(),
    };

    console.log("📧 Contact form submission:");
    console.log(JSON.stringify(emailContent, null, 2));

    // TODO: Configure email service (Resend, SendGrid, etc.)
    // Example with Resend:
    // const { Resend } = await import('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'contato@cpfblindado.com',
    //   to: CONTACT_EMAIL,
    //   subject: emailContent.subject,
    //   text: emailContent.body,
    //   reply_to: email,
    // });

    return res.status(200).json({
      success: true,
      message: "Mensagem enviada com sucesso",
    });
  } catch (error) {
    console.error("Error sending contact email:", error);
    return res.status(500).json({
      success: false,
      error: "Erro ao enviar mensagem. Tente novamente.",
    });
  }
}
