/**
 * EmailIt API Connection Test
 *
 * This script tests the EmailIt API connection and sends a test email
 *
 * Usage: npx tsx server/test-emailit.ts <email-to-test>
 */

import dotenv from "dotenv";
import { resolve } from "path";

// Load .env.local from project root FIRST, before any other imports
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

// Import AFTER dotenv is configured
import { createEmailService } from "./services/email.service.js";

const TEST_EMAIL = process.argv[2] || "test@f2w2.store";

async function testEmailItConnection() {
  console.log("🔧 Testing EmailIt API Connection...\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`API Key: ${process.env.EMAILIT_API_KEY ? "✅ Configured" : "❌ Missing"}`);
  console.log(`From Email: ${process.env.EMAILIT_DEFAULT_FROM || "Not configured"}`);
  console.log(`Test Recipient: ${TEST_EMAIL}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (!process.env.EMAILIT_API_KEY) {
    console.error("❌ EMAILIT_API_KEY is not configured in .env.local");
    process.exit(1);
  }

  if (!process.env.EMAILIT_DEFAULT_FROM) {
    console.error("❌ EMAILIT_DEFAULT_FROM is not configured in .env.local");
    process.exit(1);
  }

  console.log("📧 Sending test email...\n");

  // Create a new email service instance with loaded environment variables
  const emailService = createEmailService({
    apiKey: process.env.EMAILIT_API_KEY!,
    defaultFrom: process.env.EMAILIT_DEFAULT_FROM!,
  });

  try {
    const response = await emailService.sendCustomEmail({
      to: TEST_EMAIL,
      subject: "✅ EmailIt Test - CPF Blindado",
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .success { background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
            .info { background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; }
            h1 { color: #d39e17; }
          </style>
        </head>
        <body>
          <h1>✅ Teste de Conexão EmailIt - Sucesso!</h1>

          <div class="success">
            <strong>Excelente!</strong> A conexão com a API do EmailIt está funcionando perfeitamente.
          </div>

          <div class="info">
            <p><strong>Detalhes do teste:</strong></p>
            <ul>
              <li>API: EmailIt</li>
              <li>De: ${process.env.EMAILIT_DEFAULT_FROM}</li>
              <li>Para: ${TEST_EMAIL}</li>
              <li>Data: ${new Date().toLocaleString("pt-BR")}</li>
            </ul>
          </div>

          <p>Se você recebeu este email, significa que:</p>
          <ol>
            <li>✅ As credenciais da API estão corretas</li>
            <li>✅ O domínio <code>f2w2.store</code> está configurado</li>
            <li>✅ O servidor de email está funcionando</li>
          </ol>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Este é um email de teste automático do sistema <strong>CPF Blindado</strong>.
          </p>
        </body>
        </html>
      `.trim(),
      text: `
        ✅ Teste de Conexão EmailIt - Sucesso!

        Excelente! A conexão com a API do EmailIt está funcionando perfeitamente.

        Detalhes do teste:
        - API: EmailIt
        - De: ${process.env.EMAILIT_DEFAULT_FROM}
        - Para: ${TEST_EMAIL}
        - Data: ${new Date().toLocaleString("pt-BR")}

        Se você recebeu este email, significa que:
        1. ✅ As credenciais da API estão corretas
        2. ✅ O domínio f2w2.store está configurado
        3. ✅ O servidor de email está funcionando
      `.trim(),
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ SUCCESS! Email sent successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`\n📧 Email Details:`);
    console.log(`   ID: ${response.id}`);
    console.log(`   Status: ${response.status}`);
    console.log(`   To: ${response.to}`);
    console.log(`   From: ${response.from || "N/A"}`);
    console.log(`\n💡 Check your inbox at ${TEST_EMAIL} to see the test email!`);

    process.exit(0);
  } catch (error: any) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ ERROR! Failed to send email");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error(`\nError Details:`);
    console.error(`   Message: ${error.message}`);
    if (error.statusCode) {
      console.error(`   Status Code: ${error.statusCode}`);
    }
    if (error.details) {
      console.error(`   Details:`, error.details);
    }

    console.error("\n🔧 Troubleshooting:");
    console.error("   1. Check if EMAILIT_API_KEY is correct");
    console.error("   2. Verify the domain f2w2.store is configured in EmailIt");
    console.error("   3. Check DNS records (SPF, DKIM) are properly set");

    process.exit(1);
  }
}

testEmailItConnection();
