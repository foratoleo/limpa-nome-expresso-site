// Teste do endpoint /api/payments/status
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testEndpoint() {
  const email = 'forato@gmail.com';

  console.log('=== TESTANDO AUTENTICAÇÃO E TOKEN ===\n');

  // 1. Buscar usuário
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find(u => u.email === email);

  if (!user) {
    console.log('❌ Usuário não encontrado');
    return;
  }

  console.log('✅ Usuário:', user.email);
  console.log('   ID:', user.id);
  console.log();

  // 2. Criar uma sessão para simular login
  const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
    userId: user.id
  });

  if (sessionError) {
    console.log('❌ Erro ao criar sessão:', sessionError.message);
    return;
  }

  const accessToken = sessionData.session.access_token;
  console.log('✅ Sessão criada');
  console.log('   Token:', accessToken.substring(0, 20) + '...');
  console.log();

  // 3. Testar o endpoint localmente
  console.log('=== TESTANDO LÓGICA DO ENDPOINT ===\n');

  // Lógica exata do endpoint
  const { data: access, error } = await supabase
    .from('user_access')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .gte('expires_at', new Date().toISOString())
    .maybeSingle();

  console.log('📋 user_access query:', {
    found: !!access,
    error: error?.message,
    data: access
  });

  const { data: manualAccess, error: manualError } = await supabase
    .from('user_manual_access')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
    .maybeSingle();

  console.log('📋 user_manual_access query:', {
    found: !!manualAccess,
    error: manualError?.message,
    data: manualAccess
  });

  const hasActiveAccess = !!access || !!manualAccess;

  console.log('\n=== RESULTADO ===');
  console.log('hasActiveAccess:', hasActiveAccess);
  console.log('hasManualAccess:', !!manualAccess);
  console.log('accessType:', access?.access_type || 'manual');
  console.log('expiresAt:', access?.expires_at || manualAccess?.expires_at || null);
}

testEndpoint().catch(console.error);
