-- ============================================================================
-- CONFIGURAÇÃO DE ADMIN - Execute este SQL para se tornar admin
-- ============================================================================

-- Passo 1: Encontre o seu user_id na tabela auth.users
-- Execute esta query para listar todos os usuários:
SELECT id, email, created_at, raw_user_meta_data->>'role' as current_role
FROM auth.users
ORDER BY created_at DESC;

-- Passo 2: Anote o SEU user_id (o UUID do seu email)

-- Passo 3: Execute este SQL, substituindo SEU_USER_ID pelo UUID anotado:
-- ATENÇÃO: Substitua 'seu-email@aqui.com' pelo SEU email real

-- Opção A: Via dashboard do Supabase (mais fácil)
-- 1. Vá em: Authentication > Users
-- 2. Encontre seu usuário
-- 3. Clique nele
-- 4. Em "User Metadata", adicione:
--    {
--      "role": "admin"
--    }
-- 5. Salve

-- Opção B: Via SQL (se precisar fazer via código)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'seu-email@aqui.com';  -- ⚠️ SUBSTITUA PELO SEU EMAIL

-- Passo 4: Verificar se funcionou
SELECT email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin';

-- ============================================================================
-- Pronto! Agora você pode acessar /admin/access no sistema
-- ============================================================================
