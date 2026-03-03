/**
 * Email Service
 *
 * High-level email service for common email operations
 * Uses EmailIt API for email delivery
 *
 * @module server/services/email.service
 */

import {
  EmailItClient,
  EmailResponse,
  EmailItApiError as EmailItApiErrorClass,
  createEmailItClient,
} from '../lib/emailit.js';

// Re-export EmailItApiError for use in routes
export { EmailItApiErrorClass as EmailItApiError };

/**
 * Email service configuration
 */
export interface EmailServiceConfig {
  apiKey: string;
  defaultFrom: string;
  baseUrl?: string;
}

/**
 * Contact form email data
 */
export interface ContactFormEmail {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Welcome email data
 */
export interface WelcomeEmailData {
  email: string;
  name: string;
  activationUrl?: string;
}

/**
 * Password reset email data
 */
export interface PasswordResetEmailData {
  email: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

/**
 * Email Service
 *
 * Provides high-level methods for common email operations
 */
export class EmailService {
  private client: EmailItClient;
  private defaultFrom: string;

  constructor(config: EmailServiceConfig) {
    if (!config.apiKey) {
      throw new Error('EmailService requires apiKey in configuration');
    }
    if (!config.defaultFrom) {
      throw new Error('EmailService requires defaultFrom in configuration');
    }
    this.client = createEmailItClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
    });
    this.defaultFrom = config.defaultFrom;
  }

  /**
   * Send a contact form email
   *
   * @param data Contact form data
   * @param toEmail Recipient email address
   */
  async sendContactForm(
    data: ContactFormEmail,
    toEmail: string
  ): Promise<EmailResponse> {
    const subjectMap: Record<string, string> = {
      duvida: 'Duvida sobre o processo',
      problema: 'Problema tecnico',
      sugestao: 'Sugestao',
      outro: 'Outro',
    };

    const subjectLabel = subjectMap[data.subject] || data.subject;

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nova Mensagem de Contato</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin-bottom: 20px; font-size: 24px;">
            Nova Mensagem de Contato
          </h1>
          <p style="margin-bottom: 15px;">
            <strong>Limpa Nome Expresso</strong> - Formulario de Contato
          </p>
        </div>

        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; width: 30%;">
                <strong>Nome:</strong>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                ${this.escapeHtml(data.name)}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <strong>Email:</strong>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <a href="mailto:${this.escapeHtml(data.email)}" style="color: #2563eb;">
                  ${this.escapeHtml(data.email)}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <strong>Assunto:</strong>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                ${this.escapeHtml(subjectLabel)}
              </td>
            </tr>
          </table>

          <div style="margin-top: 20px;">
            <strong style="display: block; margin-bottom: 10px;">Mensagem:</strong>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; white-space: pre-wrap;">
              ${this.escapeHtml(data.message)}
            </div>
          </div>
        </div>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p>Esta mensagem foi enviada atraves do formulario de contato do site Limpa Nome Expresso.</p>
        </div>
      </body>
      </html>
    `.trim();

    const text = `
Nova Mensagem de Contato - Limpa Nome Expresso

Nome: ${data.name}
Email: ${data.email}
Assunto: ${subjectLabel}

Mensagem:
${data.message}

---
Esta mensagem foi enviada atraves do formulario de contato do site Limpa Nome Expresso.
    `.trim();

    try {
      return await this.client.send({
        from: this.defaultFrom,
        to: toEmail,
        reply_to: { email: data.email, name: data.name },
        subject: `[Limpa Nome Expresso] ${subjectLabel} - ${data.name}`,
        html,
        text,
        tags: ['contact-form', data.subject],
        metadata: {
          form_type: 'contact',
          subject_type: data.subject,
        },
      });
    } catch (err: unknown) {
      if (err instanceof EmailItApiErrorClass) {
        console.error('EmailIt API Error:', {
          message: err.message,
          statusCode: err.statusCode,
          details: err.details,
        });
      }
      throw err;
    }
  }

  /**
   * Send a welcome email to a new user
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResponse> {
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo ao Limpa Nome Expresso</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #2563eb; color: white; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">Bem-vindo ao Limpa Nome Expresso!</h1>
        </div>

        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
          <p style="font-size: 18px;">Ola, <strong>${this.escapeHtml(data.name)}</strong>!</p>

          <p>Obrigado por se cadastrar no Limpa Nome Expresso. Estamos aqui para ajudar voce a resolver seus problemas com restricoes financeiras.</p>

          <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Proximos passos:</strong></p>
            <ul style="margin: 10px 0 0 20px; padding: 0;">
              <li>Complete seu cadastro</li>
              <li>Envie sua documentacao</li>
              <li>Acompanhe o progresso do seu processo</li>
            </ul>
          </div>

          ${
            data.activationUrl
              ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.escapeHtml(data.activationUrl)}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Ativar Minha Conta
            </a>
          </div>
          `
              : ''
          }

          <p>Se voce tiver alguma duvida, nao hesite em entrar em contato conosco.</p>

          <p style="margin-top: 30px;">
            Atenciosamente,<br>
            <strong>Equipe Limpa Nome Expresso</strong>
          </p>
        </div>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center;">
          <p>Limpa Nome Expresso - Sua solucao para limpar o nome</p>
        </div>
      </body>
      </html>
    `.trim();

    return this.client.send({
      from: this.defaultFrom,
      to: data.email,
      subject: 'Bem-vindo ao Limpa Nome Expresso!',
      html,
      tags: ['welcome', 'onboarding'],
    });
  }

  /**
   * Send a password reset email
   */
  async sendPasswordResetEmail(
    data: PasswordResetEmailData
  ): Promise<EmailResponse> {
    const expiresInMinutes = data.expiresInMinutes || 60;

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redefinir Senha - Limpa Nome Expresso</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Redefinir Senha</h1>
        </div>

        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
          <p>Ola,</p>

          <p>Recebemos uma solicitacao para redefinir sua senha. Clique no botao abaixo para criar uma nova senha:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.escapeHtml(data.resetUrl)}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Redefinir Senha
            </a>
          </div>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>Atencao:</strong> Este link expira em ${expiresInMinutes} minutos.
            </p>
          </div>

          <p>Se voce nao solicitou a redefinicao de senha, pode ignorar este email.</p>

          <p style="margin-top: 30px;">
            Atenciosamente,<br>
            <strong>Equipe Limpa Nome Expresso</strong>
          </p>
        </div>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center;">
          <p>Limpa Nome Expresso - Sua solucao para limpar o nome</p>
        </div>
      </body>
      </html>
    `.trim();

    return this.client.send({
      from: this.defaultFrom,
      to: data.email,
      subject: 'Redefinir Senha - Limpa Nome Expresso',
      html,
      tags: ['password-reset', 'security'],
      metadata: {
        type: 'password_reset',
        expires_in_minutes: expiresInMinutes,
      },
    });
  }

  /**
   * Send a custom email with HTML content
   */
  async sendCustomEmail(options: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
    attachments?: Array<{
      filename: string;
      content: string;
      contentType?: string;
    }>;
  }): Promise<EmailResponse> {
    return this.client.send({
      from: this.defaultFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo,
      attachments: options.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        content_type: a.contentType,
      })),
    });
  }

  /**
   * Escape HTML special characters to prevent XSS
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  }
}

/**
 * Default email service instance
 *
 * Initialize with environment variables:
 * - EMAILIT_API_KEY: Your EmailIt API key
 * - EMAILIT_DEFAULT_FROM: Default sender email address
 */
export const emailService = new EmailService({
  apiKey: process.env.EMAILIT_API_KEY || '',
  defaultFrom: process.env.EMAILIT_DEFAULT_FROM || '',
});

/**
 * Create a new email service instance
 */
export function createEmailService(config: EmailServiceConfig): EmailService {
  return new EmailService(config);
}
