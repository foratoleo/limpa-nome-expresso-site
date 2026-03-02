import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { stripeRouter } from "./routes/stripe.js";
import { handleWebhook } from "./middleware/stripe-webhook.js";
import { contactRouter } from "./routes/contact.js";

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

  // Stripe webhook handler (must be before express.json())
  app.post("/api/stripe/webhook", handleWebhook);

  // Parse JSON bodies for other routes
  app.use(express.json());

  // Mount Stripe API routes
  app.use("/api/stripe", stripeRouter);

  // Mount Contact API routes
  app.use("/api/contact", contactRouter);

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

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
