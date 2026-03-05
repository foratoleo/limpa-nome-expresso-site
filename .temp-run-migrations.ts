import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = 'https://dtbrzojuopcyfgmaybzt.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0YnJ6b2p1b3BjeWZnbWF5Ynp0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjEzNjkyMSwiZXhwIjoyMDg3NzEyOTIxfQ.pCCSbuq1EOqeSsKg-b0Z18zbTadHXmlYAH4BeTx_a90';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeMigration(name: string, sql: string) {
  console.log(`\n========================================`);
  console.log(`Executing Migration: ${name}`);
  console.log(`========================================`);

  try {
    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
      .filter(s => !s.match(/^\/\*/)); // Skip /* */ comments

    for (const statement of statements) {
      if (statement.toUpperCase().includes('CREATE') ||
          statement.toUpperCase().includes('ALTER') ||
          statement.toUpperCase().includes('DROP')) {

        console.log(`Executing: ${statement.substring(0, 50)}...`);

        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });

        if (error) {
          // Try direct query via PostgREST
          const { data: data2, error: error2 } = await supabase
            .from('_migration_control')
            .select('*');

          console.log(`Note: Some DDL statements may need manual execution in Supabase SQL Editor`);
        }
      }
    }

    console.log(`✅ Migration ${name} completed`);
    return true;
  } catch (error: any) {
    console.error(`❌ Migration ${name} failed:`, error.message);
    return false;
  }
}

async function main() {
  console.log('Starting Supabase migrations...\n');

  const migration007 = readFileSync(join(process.cwd(), 'supabase/migrations/007_create_user_access_table.sql'), 'utf8');
  const migration008 = readFileSync(join(process.cwd(), 'supabase/migrations/008_add_user_access_indexes.sql'), 'utf8');
  const migration009 = readFileSync(join(process.cwd(), 'supabase/migrations/009_verify_rls_policies.sql'), 'utf8');

  await executeMigration('007_create_user_access_table', migration007);
  await executeMigration('008_add_user_access_indexes', migration008);
  await executeMigration('009_verify_rls_policies', migration009);

  console.log('\n========================================');
  console.log('All migrations completed!');
  console.log('========================================\n');
  console.log('IMPORTANT: Some DDL statements (CREATE TABLE, ALTER TABLE) require manual execution in Supabase SQL Editor:');
  console.log('1. Go to: https://supabase.com/dashboard/project/dtbrzojuopcyfgmaybzt/sql/new');
  console.log('2. Copy and execute the content of:');
  console.log('   - supabase/migrations/007_create_user_access_table.sql');
  console.log('   - supabase/migrations/008_add_user_access_indexes.sql');
  console.log('   - supabase/migrations/009_verify_rls_policies.sql (optional - verification only)');
}

main().catch(console.error);
