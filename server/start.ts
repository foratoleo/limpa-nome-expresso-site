/**
 * Server Startup Script
 *
 * Load environment variables before importing any modules
 */

import dotenv from "dotenv";
import { resolve } from "path";

// Load .env.local from project root BEFORE any imports
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

// Verify required environment variables
const requiredVars = ['VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = requiredVars.filter(varName => !process.env[varName]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease configure these variables in .env.local');
  process.exit(1);
}

// Now import and start the server
await import("./index.js");
