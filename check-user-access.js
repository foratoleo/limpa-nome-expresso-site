// Script para verificar acesso do usuário forato@gmail.com
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUserAccess() {
  const email = 'forato@gmail.com';

  console.log('=== VERIFICANDO ACESSO DO USUÁRIO ===\n');
  console.log(`Email: ${email}\n`);

  // 1. Buscar usuário na auth.users
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

  if (usersError) {
    console.error('Erro ao buscar usuários:', usersError);
    return;
  }

  const user = users.users.find(u => u.email === email);

  if (!user) {
    console.log('❌ USUÁRIO NÃO ENCONTRADO no Supabase Auth');
    return;
  }

  console.log('✅ USUÁRIO ENCONTRADO:');
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: ${user.user_metadata?.role || 'undefined'}`);
  console.log(`   Email confirmado: ${user.email_confirmed_at ? 'Sim' : 'Não'}\n`);

  // 2. Verificar user_access
  const { data: userAccess, error: accessError } = await supabase
    .from('user_access')
    .select('*')
    .eq('user_id', user.id);

  console.log('📋 TABELA user_access:');
  if (accessError) {
    console.log('   ❌ Erro:', accessError.message);
  } else if (userAccess && userAccess.length > 0) {
    console.log(`   ✅ Encontrado(s) ${userAccess.length} registro(s):`);
    userAccess.forEach((access, i) => {
      console.log(`   ${i + 1}. ID: ${access.id}`);
      console.log(`      Tipo: ${access.access_type}`);
      console.log(`      Ativo: ${access.is_active}`);
      console.log(`      Expira: ${access.expires_at}`);
      const isExpired = new Date(access.expires_at) < new Date();
      console.log(`      Status: ${isExpired ? '❌ EXPIRADO' : '✅ VÁLIDO'}`);
    });
  } else {
    console.log('   ❌ NENHUM REGISTRO ENCONTRADO');
  }
  console.log();

  // 3. Verificar user_manual_access
  const { data: manualAccess, error: manualError } = await supabase
    .from('user_manual_access')
    .select('*')
    .eq('user_id', user.id);

  console.log('📋 TABELA user_manual_access:');
  if (manualError) {
    console.log('   ❌ Erro:', manualError.message);
  } else if (manualAccess && manualAccess.length > 0) {
    console.log(`   ✅ Encontrado(s) ${manualAccess.length} registro(s):`);
    manualAccess.forEach((access, i) => {
      console.log(`   ${i + 1}. ID: ${access.id}`);
      console.log(`      Ativo: ${access.is_active}`);
      console.log(`      Expira: ${access.expires_at || 'Nunca'}`);
      const hasExpiry = access.expires_at;
      const isExpired = hasExpiry && new Date(access.expires_at) < new Date();
      console.log(`      Status: ${isExpired ? '❌ EXPIRADO' : '✅ VÁLIDO'}`);
    });
  } else {
    console.log('   ❌ NENHUM REGISTRO ENCONTRADO');
  }
  console.log();

  // 4. Conclusão
  const hasValidAccess = (userAccess?.some(a => a.is_active && new Date(a.expires_at) >= new Date())) ||
                         (manualAccess?.some(a => a.is_active && (!a.expires_at || new Date(a.expires_at) >= new Date())));

  console.log('=== CONCLUSÃO ===');
  if (hasValidAccess) {
    console.log('✅ USUÁRIO TEM ACESSO VÁLIDO - Não deveria ser redirecionado para checkout\n');
  } else {
    console.log('❌ USUÁRIO SEM ACESSO VÁLIDO - Será redirecionado para checkout');
    console.log('\n🔧 SOLUÇÕES POSSÍVEIS:');
    console.log('   1. Adicionar registro em user_manual_access para acesso manual');
    console.log('   2. Adicionar registro em user_access para acesso pago');
    console.log('   3. Usar o painel admin em /admin/access para conceder acesso\n');
  }
}

checkUserAccess().catch(console.error);
