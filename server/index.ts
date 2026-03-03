import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { stripeRouter } from "./routes/stripe.js";
import { handleWebhook } from "./middleware/stripe-webhook.js";
import { contactRouter } from "./routes/contact.js";
import { authRouter } from "./routes/auth.js";
import { mercadopagoRouter } from "./routes/mercadopago.js";
import { paymentsRouter } from "./routes/payments.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  // Configure CORS with validation
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3002', // Vite dev server (alt port)
    'http://100.77.0.80:3000',
    'http://100.77.0.80:3002', // Vite dev server network
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3002', // Vite dev server local
  ];

  // Validate and add VITE_APP_URL if present
  if (process.env.VITE_APP_URL) {
    try {
      const url = new URL(process.env.VITE_APP_URL);
      // Only allow http/https protocols
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        allowedOrigins.push(process.env.VITE_APP_URL);
      } else {
        console.warn(`Invalid VITE_APP_URL protocol: ${url.protocol}. Must be http or https.`);
      }
    } catch (error) {
      console.warn(`Invalid VITE_APP_URL format: ${process.env.VITE_APP_URL}`);
    }
  }

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Stripe webhook handler (must be before express.json())
  app.post("/api/stripe/webhook", handleWebhook);

  // Parse JSON bodies for other routes
  app.use(express.json());

  // Mount Stripe API routes
  app.use("/api/stripe", stripeRouter);

  // Mount MercadoPago API routes
  app.use("/api/mercadopago", mercadopagoRouter);

  // Mount Contact API routes
  app.use("/api/contact", contactRouter);

  // Mount Auth API routes
  app.use("/api/auth", authRouter);

  // Mount Payments API routes
  app.use("/api/payments", paymentsRouter);

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Serve static files
  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes (except API)
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3001; // Use 3001 to avoid conflict with Vite on 3000

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
