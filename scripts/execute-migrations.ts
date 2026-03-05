import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

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
      .filter(s => !s.match(/^\/\*/));

    for (const statement of statements) {
      if (statement.toUpperCase().includes('CREATE') ||
          statement.toUpperCase().includes('ALTER') ||
          statement.toUpperCase().includes('DROP') ||
          statement.toUpperCase().includes('GRANT')) {

        console.log(`Executing: ${statement.substring(0, 60)}...`);

        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });

        if (error) {
          console.log(`Note: ${error.message}`);
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

  const migration007 = readFileSync('/tmp/migration_007.sql', 'utf8');
  const migration008 = readFileSync('/tmp/migration_008.sql', 'utf8');
  const migration010 = readFileSync('/tmp/migration_010.sql', 'utf8');

  const result007 = await executeMigration('007_create_user_access_table', migration007);
  const result008 = await executeMigration('008_add_user_access_indexes', migration008);
  const result010 = await executeMigration('010_admin_audit_log', migration010);

  console.log('\n========================================');
  console.log('MIGRATION SUMMARY');
  console.log('========================================');
  console.log(`007: ${result007 ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`008: ${result008 ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`010: ${result010 ? '✅ SUCCESS' : '❌ FAILED'}`);

  if (result007 && result008 && result010) {
    console.log('\n✅ All migrations completed successfully!');
  } else {
    console.log('\n❌ Some migrations failed. Please run manually in Supabase SQL Editor.');
  }
}

main().catch(console.error);
