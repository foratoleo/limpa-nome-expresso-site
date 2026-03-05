import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Loading .env.local from:', resolve(__dirname, "..", ".env.local"));
dotenv.config({ path: resolve(__dirname, "..", ".env.local") });

const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const viteKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
console.log('SUPABASE_SERVICE_ROLE_KEY length:', key?.length);
console.log('VITE_SUPABASE_SERVICE_ROLE_KEY length:', viteKey?.length);
console.log('Are they equal?', key === viteKey);
console.log('Key contains Bearer?', key?.includes('Bearer'));
console.log('Raw key length:', key?.length);
console.log('Contains newline:', key?.includes('\n'));
console.log('Key ends with:', key?.substring(key?.length - 20));

// Check if it's duplicated
const parts = key?.split('\n');
if (parts && parts.length > 1) {
  console.log('Key has', parts.length, 'parts when split by newline');
  parts.forEach((part, i) => {
    console.log(`Part ${i} length:`, part?.length);
    console.log(`Part ${i} starts with:`, part?.substring(0, 30));
  });
}
