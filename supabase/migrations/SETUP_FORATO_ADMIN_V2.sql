-- ============================================================================
-- CONFIGURAR forato@gmail.com COMO ADMIN E ACESSO MANUAL
-- Versão corrigida (sem ON CONFLICT)
-- ============================================================================

-- Passo 1: Verificar se o usuário existe
SELECT id, email, created_at, raw_user_meta_data->>'role' as current_role
FROM auth.users
WHERE email = 'forato@gmail.com';

-- Passo 2: Configurar como admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'forato@gmail.com';

-- Passo 3: Conceder acesso manual (versão corrigida)
DO $$
DECLARE
  v_user_id UUID;
  v_existing_access INT;
BEGIN
  -- Buscar o user_id
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'forato@gmail.com';

  -- Verificar se o usuário existe
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário forato@gmail.com não encontrado. Certifique-se de que o usuário já se cadastrou pelo menos uma vez.';
  END IF;

  -- Verificar se já tem acesso manual
  SELECT COUNT(*) INTO v_existing_access
  FROM user_manual_access
  WHERE user_id = v_user_id;

  -- Se não tem acesso, inserir
  IF v_existing_access = 0 THEN
    INSERT INTO user_manual_access (user_id, granted_by, reason, is_active, granted_at)
    VALUES (
      v_user_id,
      v_user_id,
      'Acesso de administrador ao sistema',
      true,
      now()
    );
    RAISE NOTICE 'Novo acesso manual criado para forato@gmail.com';
  ELSE
    -- Se já tem, atualizar
    UPDATE user_manual_access
    SET
      is_active = true,
      expires_at = NULL,
      reason = 'Acesso de administrador ao sistema',
      granted_at = now()
    WHERE user_id = v_user_id;
    RAISE NOTICE 'Acesso manual atualizado para forato@gmail.com';
  END IF;
END $$;

-- Passo 4: Verificar se funcionou
SELECT
  u.email,
  u.raw_user_meta_data->>'role' as role,
  uma.is_active,
  uma.granted_at,
  uma.reason
FROM auth.users u
LEFT JOIN user_manual_access uma ON uma.user_id = u.id
WHERE u.email = 'forato@gmail.com';

-- ============================================================================
 RESULTADO ESPERADO:
-- Email: forato@gmail.com
-- Role: admin
-- is_active: true
-- reason: 'Acesso de administrador ao sistema'
-- ============================================================================
