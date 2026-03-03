-- ============================================================================
-- CONFIGURAR forato@gmail.com COMO ADMIN E ACESSO MANUAL
-- Execute este SQL no painel do Supabase
-- ============================================================================

-- Passo 1: Verificar se o usuário existe
SELECT id, email, created_at, raw_user_meta_data->>'role' as current_role
FROM auth.users
WHERE email = 'forato@gmail.com';

-- Passo 2: Configurar como admin (via UPDATE direto)
-- Isso adiciona role='admin' nos metadados do usuário
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'forato@gmail.com';

-- Passo 3: Confirmar que foi configurado como admin
SELECT email, raw_user_meta_data->>'role' as role, raw_user_meta_data
FROM auth.users
WHERE email = 'forato@gmail.com';

-- Passo 4: Conceder acesso manual ao conteúdo
-- Primeiro, precisamos encontrar o user_id do forato@gmail.com
-- O access será concedido por ele mesmo (auto-concedido)

DO $$
DECLARE
  v_user_id UUID;
  v_granted_by UUID;
BEGIN
  -- Buscar o user_id
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'forato@gmail.com';

  -- Se o usuário existe, conceder acesso manual
  IF v_user_id IS NOT NULL THEN
    -- Inserir ou atualizar acesso manual
    INSERT INTO user_manual_access (user_id, granted_by, reason, is_active, granted_at)
    VALUES (
      v_user_id,
      v_user_id, -- Auto-concedido
      'Acesso de administrador ao sistema',
      true,
      now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      is_active = true,
      expires_at = NULL,
      reason = 'Acesso de administrador ao sistema',
      granted_at = now();

    RAISE NOTICE 'Acesso manual concedido com sucesso para forato@gmail.com';
  ELSE
    RAISE EXCEPTION 'Usuário forato@gmail.com não encontrado no sistema. Certifique-se de que o usuário já se cadastrou pelo menos uma vez.';
  END IF;
END $$;

-- Passo 5: Verificar se o acesso foi concedido
SELECT
  uma.id,
  u.email,
  uma.granted_at,
  uma.expires_at,
  uma.reason,
  uma.is_active,
  u.raw_user_meta_data->>'role' as user_role
FROM user_manual_access uma
JOIN auth.users u ON u.id = uma.user_id
WHERE u.email = 'forato@gmail.com';

-- ============================================================================
 RESULTADO ESPERADO:
-- - Usuario com role='admin' nos metadados
-- - Registro em user_manual_access com is_active=true
-- - Acesso total ao sistema concedido
-- ============================================================================

-- ============================================================================
 IMPORTANTE:
-- Após executar este SQL, o usuário forato@gmail.com deve:
-- 1. Fazer logout do sistema
-- 2. Fazer login novamente
-- 3. Terá acesso completo a /admin/access e todo o conteúdo
-- ============================================================================
