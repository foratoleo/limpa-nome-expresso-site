#!/usr/bin/env node

/**
 * Execute Supabase migrations via SQL Editor API
 *
 * This script reads migration files and outputs formatted SQL blocks
 * that can be copy-pasted into Supabase SQL Editor
 */

const fs = require('fs');
const path = require('path');

const migrations = [
  { name: '007_create_user_access_table', file: 'supabase/migrations/007_create_user_access_table.sql' },
  { name: '008_add_user_access_indexes', file: 'supabase/migrations/008_add_user_access_indexes.sql' },
  { name: '009_verify_rls_policies', file: 'supabase/migrations/009_verify_rls_policies.sql' }
];

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  SUPABASE MIGRATIONS - SQL OUTPUT                          ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

migrations.forEach(({ name, file }) => {
  const fullPath = path.join(process.cwd(), file);

  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(`MIGRATION: ${name}`);
  console.log(`═══════════════════════════════════════════════════════════════\n`);

  const sql = fs.readFileSync(fullPath, 'utf8');

  // Output the SQL in a format ready to copy
  console.log(sql);
  console.log('\n───────────────────────────────────────────────────────────────\n');
});

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║  INSTRUCTIONS                                                  ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('1. Open Supabase SQL Editor:');
console.log('   https://supabase.com/dashboard/project/dtbrzojuopcyfgmaybzt/sql/new\n');
console.log('2. Copy and paste each migration block above (separately)');
console.log('3. Click "Run" to execute each migration');
console.log('4. Verify success in the results panel\n');
console.log('5. After migrations are applied, run tests:');
console.log('   pnpm test -- server/tests/database\n');
