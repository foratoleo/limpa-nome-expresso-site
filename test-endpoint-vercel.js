// Teste granular do endpoint /api/payments/status na Vercel
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function granularAnalysis() {
  const email = 'forato@gmail.com';

  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔍 ANÁLISE GRANULAR - DIAGNÓSTICO PASSO A PASSO');
  console.log('═══════════════════════════════════════════════════════════\n');

  // PASSO 1: Verificar usuário
  console.log('📋 PASSO 1: Verificar usuário no auth');
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find(u => u.email === email);

  if (!user) {
    console.log('   ❌ USUÁRIO NÃO ENCONTRADO');
    return;
  }

  console.log('   ✅ Usuário encontrado');
  console.log('   ID:', user.id);
  console.log('   Email:', user.email);
  console.log('   Role:', user.user_metadata?.role || 'undefined');
  console.log('   Email confirmado:', user.email_confirmed_at ? 'Sim' : 'Não');
  console.log('');

  // PASSO 2: Verificar user_access
  console.log('📋 PASSO 2: Verificar tabela user_access');
  const { data: userAccess, error: accessError } = await supabase
    .from('user_access')
    .select('*')
    .eq('user_id', user.id);

  console.log('   Query executada:');
  console.log('   .eq("user_id", user.id)');
  console.log('   .eq("is_active", true)');
  console.log('   .gte("expires_at", new Date().toISOString())');
  console.log('');

  if (accessError) {
    console.log('   ❌ ERRO na query:', accessError.message);
    console.log('   Código:', accessError.code);
    console.log('   Detalhes:', accessError.hint);
  } else {
    console.log('   ✅ Query executou sem erros');
    console.log('   Registros encontrados:', userAccess?.length || 0);

    if (userAccess && userAccess.length > 0) {
      userAccess.forEach((access, i) => {
        console.log(`   ${i + 1}. ID: ${access.id}`);
        console.log(`      Tipo: ${access.access_type}`);
        console.log(`      Ativo: ${access.is_active}`);
        console.log(`      Expira: ${access.expires_at}`);

        const isExpired = new Date(access.expires_at) < new Date();
        const willPassGte = access.is_active === true && !isExpired;

        console.log(`      Passa nas condições? ${willPassGte ? '✅ SIM' : '❌ NÃO'}`);
        console.log(`         - is_active === true: ${access.is_active === true ? '✅' : '❌'}`);
        console.log(`         - expires_at >= agora: ${!isExpired ? '✅' : '❌'}`);
      });
    }
  }
  console.log('');

  // PASSO 3: Verificar user_manual_access
  console.log('📋 PASSO 3: Verificar tabela user_manual_access');
  const { data: manualAccess, error: manualError } = await supabase
    .from('user_manual_access')
    .select('*')
    .eq('user_id', user.id);

  console.log('   Query executada:');
  console.log('   .eq("user_id", user.id)');
  console.log('   .eq("is_active", true)');
  console.log('   .or("expires_at.is.null,expires_at.gte." + new Date().toISOString())');
  console.log('');

  if (manualError) {
    console.log('   ❌ ERRO na query:', manualError.message);
    console.log('   Código:', manualError.code);
    console.log('   Detalhes:', manualError.hint);
  } else {
    console.log('   ✅ Query executou sem erros');
    console.log('   Registros encontrados:', manualAccess?.length || 0);

    if (manualAccess && manualAccess.length > 0) {
      manualAccess.forEach((access, i) => {
        console.log(`   ${i + 1}. ID: ${access.id}`);
        console.log(`      Ativo: ${access.is_active}`);
        console.log(`      Expira: ${access.expires_at || 'Nunca'}`);

        const hasExpiry = access.expires_at;
        const isExpired = hasExpiry && new Date(access.expires_at) < new Date();
        const willPassOr = access.is_active === true && (!hasExpiry || !isExpired);

        console.log(`      Passa nas condições? ${willPassOr ? '✅ SIM' : '❌ NÃO'}`);
        console.log(`         - is_active === true: ${access.is_active === true ? '✅' : '❌'}`);
        console.log(`         - expires_at é null: ${!hasExpiry ? '✅' : '❌'}`);
        if (hasExpiry) {
          console.log(`         - expires_at >= agora: ${!isExpired ? '✅' : '❌'}`);
        }
      });
    }
  }
  console.log('');

  // PASSO 4: Simular lógica do endpoint
  console.log('📋 PASSO 4: Simular lógica do endpoint /api/payments/status');
  console.log('   Lógica:');
  console.log('   const hasActiveAccess = !!access || !!manualAccess;');
  console.log('');

  const hasActiveAccess = !!userAccess || !!manualAccess;
  console.log('   Resultado:');
  console.log('   !!access:', !!userAccess, userAccess ? '✅' : '❌');
  console.log('   !!manualAccess:', !!manualAccess, manualAccess ? '✅' : '❌');
  console.log('   hasActiveAccess:', hasActiveAccess, hasActiveAccess ? '✅' : '❌');
  console.log('');

  // PASSO 5: Verificar se há registros que NÃO passam nos filtros
  console.log('📋 PASSO 5: Verificar TODOS os registros (sem filtros)');
  const { data: allAccess, error: allAccessError } = await supabase
    .from('user_manual_access')
    .select('*')
    .eq('user_id', user.id);

  if (allAccessError) {
    console.log('   ❌ ERRO:', allAccessError.message);
  } else {
    console.log('   ✅ Todos os registros em user_manual_access:');
    if (allAccess && allAccess.length > 0) {
      allAccess.forEach((access, i) => {
        console.log(`   ${i + 1}. ID: ${access.id}`);
        console.log(`      is_active: ${access.is_active}`);
        console.log(`      expires_at: ${access.expires_at}`);

        // Testar condição manualmente
        const condition1 = access.is_active === true;
        const hasExpiry = access.expires_at;
        const isExpired = hasExpiry && new Date(access.expires_at) < new Date();
        const condition2 = !hasExpiry || !isExpired;
        const passesAllConditions = condition1 && condition2;

        console.log(`      Passa em .eq("is_active", true)?: ${condition1 ? '✅' : '❌'}`);
        console.log(`      Passa no .or(...)?: ${condition2 ? '✅' : '❌'}`);
        console.log(`      RESULTADO FINAL: ${passesAllConditions ? '✅ PASSA' : '❌ FALHA'}`);
      });
    } else {
      console.log('   ❌ NENHUM registro encontrado');
    }
  }
  console.log('');

  // PASSO 6: Teste do endpoint real na Vercel (se possível)
  console.log('📋 PASSO 6: Verificar resposta esperada do endpoint');
  console.log('   Esperado:');
  console.log('   {');
  console.log('     "hasActiveAccess": true,');
  console.log('     "hasManualAccess": true,');
  console.log('     "accessType": "manual",');
  console.log('     "expiresAt": null');
  console.log('   }');
  console.log('');

  // PASSO 7: Conclusão
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 CONCLUSÃO');
  console.log('═══════════════════════════════════════════════════════════');

  if (hasActiveAccess) {
    console.log('✅ O endpoint DEVERIA retornar hasActiveAccess: true');
    console.log('');
    console.log('Se o usuário ainda é redirecionado, o problema pode ser:');
    console.log('   1. Cache do React Query (5 min)');
    console.log('   2. Endpoint na Vercel está falhando (verificar logs)');
    console.log('   3. Variável SUPABASE_SERVICE_ROLE_KEY não carregou');
    console.log('   4. Condição de initialized no ProtectedRoute');
  } else {
    console.log('❌ O endpoint iria retornar hasActiveAccess: false');
    console.log('');
    console.log('Problema encontrado nos dados!');
    console.log('   - user_access: ' + (userAccess?.length > 0 ? `${userAccess.length} registro(s)` : 'vazio'));
    console.log('   - user_manual_access: ' + (manualAccess?.length > 0 ? `${manualAccess.length} registro(s)` : 'vazio'));
  }

  console.log('');
  console.log('🔍 Próximos passos para diagnosticar na Vercel:');
  console.log('   1. Verificar logs: vercel inspect <url> --logs');
  console.log('   2. Testar endpoint diretamente com curl');
  console.log('   3. Limpar cache do navegador (React Query)');
  console.log('═══════════════════════════════════════════════════════════');
}

granularAnalysis().catch(console.error);
