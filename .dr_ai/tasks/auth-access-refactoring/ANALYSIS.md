# Análise Completa do Sistema de Autenticação e Acesso

**Data:** 2026-03-04
**Status:** Análise Inicial
**Versão Atual:** v1.1 - Correção do Sistema de Acesso

---

## Sumário Executivo

O sistema atual de autenticação e acesso está **funcional e bem estruturado**, mas possui algumas inconsistências na validação de roles e needs de refatoração para melhorar a UX de routing pós-login.

**Status do Sistema:**
- ✅ Registro de usuários funcionando com email de confirmação
- ✅ Sistema de acesso via pagamento (MercadoPago) implementado
- ✅ Sistema de acesso manual implementado
- ✅ Painel admin funcional para gerenciar acessos
- ⚠️ **Problema:** Validação de role admin inconsistente entre frontend e backend
- ⚠️ **Problema:** Routing pós-login não otimizado (usuário sem acesso vai para /checkout)

---

## Arquitetura Atual

### 1. Tabelas do Supabase

#### `user_access` (Acesso via Pagamento)
```sql
CREATE TABLE user_access (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  access_type TEXT CHECK (access_type IN ('subscription', 'one_time')),
  payment_id UUID REFERENCES payments(id),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Uso:** Armazena acessos concedidos via pagamento MercadoPago

#### `user_manual_access` (Acesso Manual)
```sql
CREATE TABLE user_manual_access (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  reason TEXT,
  is_active BOOLEAN DEFAULT true,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id),
  revoke_reason TEXT
);
```

**Uso:** Admin concede acesso manual a usuários (sem pagamento)

### 2. Contextos React

#### `AuthContext` (client/src/contexts/AuthContext.tsx)
**Responsabilidade:** Gerenciar sessão Supabase

**Estado:**
```typescript
{
  user: User | null,
  session: Session | null,
  loading: boolean,
  signUp: (email, password) => Promise<...>,
  signIn: (email, password) => Promise<...>,
  signOut: () => Promise<void>,
  // ...
}
```

**Características:**
- ✅ Usa Supabase Auth nativo
- ✅ Envia registro via API (/api/auth/register) para customizar email
- ✅ Gerencia estado de loading inicial

#### `PaymentContext` (client/src/contexts/PaymentContext.tsx)
**Responsabilidade:** Centralizar status de acesso usando React Query

**Estado:**
```typescript
{
  hasActiveAccess: boolean,
  hasManualAccess: boolean,
  accessType: 'subscription' | 'one_time' | 'manual' | null,
  expiresAt: string | null,
  loading: boolean,
  initialized: boolean,
  refetch: () => Promise<void>
}
```

**Características:**
- ✅ Delega para useAccessStatus hook (React Query)
- ✅ Cache de 5 minutos para evitar re-renders
- ✅ Invalidação automática ao fazer logout

### 3. API Routes

#### `/api/auth/register`
**POST** - Registra novo usuário

**Fluxo:**
1. Valida email e password
2. Cria usuário no Supabase (email_confirm: false)
3. Gera link de confirmação
4. Envia email via EmailIt API
5. Retorna sucesso

**Status:** ✅ Funcionando perfeitamente

#### `/api/payments/status`
**GET** - Verifica status de acesso do usuário

**Response:**
```typescript
{
  hasActiveAccess: boolean,      // access || manualAccess
  accessType: string,            // access?.type || 'manual'
  expiresAt: string | null,      // access?.expires || manualAccess?.expires
  hasManualAccess: boolean,      // !!manualAccess
  manualAccessExpiresAt: string | null
}
```

**Status:** ✅ Funcionando

#### `/api/admin/access/list`
**GET** - Lista todos os acessos manuais (admin only)

**Query Params:**
- `search` (opcional): Filtra por email ou nome

**Response:**
```typescript
{
  accesses: AdminUser[]  // com user_email, granter_email, status
}
```

**Status:** ✅ Funcionando

#### `/api/admin/access/grant`
**POST** - Concede acesso manual (admin only)

**Body:**
```typescript
{
  email: string,
  reason?: string,
  expires_at?: string
}
```

**Status:** ✅ Funcionando

#### `/api/admin/access/:userId`
**DELETE** - Revoga acesso manual (admin only)

**Body (opcional):**
```typescript
{
  reason: string
}
```

**Status:** ✅ Funcionando

### 4. Middleware de Autenticação

#### `verifyAdmin` (server/middleware/admin-auth.ts)
**Responsabilidade:** Verifica se usuário tem role admin

**Lógica:**
1. Extrai token Bearer do Authorization header
2. Valida token com Supabase (service role)
3. Verifica `user.user_metadata.role === 'admin'`
4. Anexa user ao request para uso nos handlers

**Status:** ✅ Funcionando

---

## Problemas Identificados

### 1. Validação de Role Admin Inconsistente ⚠️

**Problema:**
- Frontend: `user.user_metadata?.role === 'admin'`
- Backend RLS: `auth.jwt()->>'role' = 'admin'`
- Middleware: `user.user_metadata?.role === 'admin'`

**Risco:**
- user_metadata pode ser modificado pelo cliente
- RLS policies podem falhar se metadata não for sincronizado

**Recomendação:**
Criar tabela `admin_roles` para validar admin no servidor:

```sql
CREATE TABLE admin_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);
```

**Benefícios:**
- ✅ Validação no servidor (impossível falsificar client-side)
- ✅ Audit trail de quem concedeu role admin
- ✅ Pode revogar acesso admin sem deletar usuário

### 2. Routing Pós-Login Subótimo ⚠️

**Problema Atual:**
- Usuário faz login → fica na Landing (/)
- Se tentar acessar /guia → ProtectedRoute redireciona para /checkout
- Experiência fragmentada

**Melhoria Sugerida:**
```typescript
// Após login bem-sucedido
if (hasActiveAccess) {
  setLocation('/guia');  // Usuário com acesso vai para o guia
} else {
  setLocation('/checkout');  // Usuário sem acesso vai para checkout
}
```

**Implementação:**
Adicionar lógica de redirecionamento no `AuthContext.tsx` após signIn:

```typescript
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!error && data.user) {
    // Aguarda PaymentContext inicializar
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Busca status de acesso
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const response = await fetch('/api/payments/status', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const { hasActiveAccess } = await response.json();

      // Redireciona baseado em acesso
      if (hasActiveAccess) {
        setLocation('/guia');
      } else {
        setLocation('/checkout');
      }
    }
  }

  return { error, data };
};
```

### 3. Loop Infinito no ProtectedRoute (RESOLVIDO) ✅

**Problema Anterior:**
- PaymentContext causava re-renders infinitos
- ProtectedRoute verificava acesso constantemente

**Solução Aplicada:**
- React Query com cache de 5 minutos
- `initialized` flag para evitar verificações prematuras
- `refetchOnWindowFocus: false`

**Status:** ✅ Resolvido

### 4. Usuários Pagantes Sem Acesso (RESOLVIDO) ✅

**Problema Anterior:**
- Webhook do MercadoPago não criava registro em user_access
- Usuários pagavam mas não conseguiam acessar

**Solução Aplicada:**
- Webhook validado e funcionando
- Tabela user_access sendo populada corretamente

**Status:** ✅ Resolvido

---

## Análise Detalhada dos Fluxos

### Fluxo 1: Registro de Novo Usuário

```
1. Usuário preenche formulário de registro
   ↓
2. AuthContext.signUp() chama /api/auth/register
   ↓
3. Server cria usuário no Supabase (email_confirm: false)
   ↓
4. Server gera link de confirmação
   ↓
5. Server carrega template HTML de email
   ↓
6. Server envia email via EmailIt API
   ↓
7. Usuário recebe email com link de confirmação
   ↓
8. Usuário clica no link → Supabase confirma email
   ↓
9. Usuário pode fazer login
   ↓
10. ProtectedRoute detecta que não tem acesso
   ↓
11. Redireciona para /checkout
   ↓
12. Usuário faz pagamento via MercadoPago
   ↓
13. Webhook cria registro em user_access
   ↓
14. Usuário agora tem acesso às funcionalidades
```

**Status:** ✅ Funcionando perfeitamente

### Fluxo 2: Login de Usuário com Acesso

```
1. Usuário preenche email/senha
   ↓
2. AuthContext.signIn() chama Supabase
   ↓
3. Supabase retorna session + user
   ↓
4. AuthContext atualiza estado (user, session)
   ↓
5. PaymentContext detecta mudança de user
   ↓
6. useAccessStatus busca /api/payments/status
   ↓
7. API verifica user_access E user_manual_access
   ↓
8. hasActiveAccess = true (encontrou acesso)
   ↓
9. ProtectedRoute permite acesso
   ↓
10. Usuário acessa /guia, /documentos, etc.
```

**Status:** ✅ Funcionando

### Fluxo 3: Admin Concede Acesso Manual

```
1. Admin faz login (user_metadata.role = 'admin')
   ↓
2. Admin acessa /admin/access
   ↓
3. Admin preenche email do usuário
   ↓
4. Frontend chama /api/admin/access/grant
   ↓
5. verifyAdmin middleware valida:
   - Token JWT válido
   - user_metadata.role === 'admin'
   ↓
6. Handler busca usuário por email
   ↓
7. Handler cria registro em user_manual_access
   ↓
8. Handler loga ação em audit log
   ↓
9. Frontend refetch lista de usuários
   ↓
10. Usuário aparece com status "manual"
```

**Status:** ✅ Funcionando

---

## Permissões do Supabase (RLS)

### Policies user_access

**Permitido:**
- ✅ Service role (todas as operações)
- ✅ Usuários podem ler próprio acesso

**Bloqueado:**
- ❌ Usuários NÃO podem UPDATE próprio acesso
- ❌ Usuários NÃO podem DELETE próprio acesso

**Status:** ✅ Correto

### Policies user_manual_access

**Permitido:**
- ✅ Service role (todas as operações)
- ✅ Usuários podem ler próprio acesso manual
- ⚠️ **Admins podem INSERT** (usa `auth.jwt()->>'role' = 'admin'`)
- ⚠️ **Admins podem UPDATE** (usa `auth.jwt()->>'role' = 'admin'`)
- ⚠️ **Admins podem DELETE** (usa `auth.jwt()->>'role' = 'admin'`)

**Problema:** RLS usa `auth.jwt()->>'role'` que vem do user_metadata

**Risco:** Se user_metadata for modificado client-side antes do token ser gerado, RLS pode falhar

**Status:** ⚠️ Funciona mas não é ideal

---

## Recomendações de Refatoração

### Prioridade ALTA

#### 1. Criar Tabela de Admin Roles

**Por Que:**
- Validação no servidor (não confia em client-side metadata)
- Audit trail de concessões de admin
- Pode revogar admin sem deletar usuário

**Implementação:**

Migration `010_create_admin_roles.sql`:
```sql
CREATE TABLE admin_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revoke_reason TEXT
);

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Service role pode tudo
CREATE POLICY "Service role full access"
  ON admin_roles FOR ALL
  USING (auth.role() = 'service_role');

-- Admins podem ler outros admins
CREATE POLICY "Admins can read admins"
  ON admin_roles FOR SELECT
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Apenas service role pode conceder admin
CREATE POLICY "Only service role can grant admin"
  ON admin_roles FOR INSERT
  USING (auth.role() = 'service_role');
```

**Atualizar middleware `verifyAdmin`:**
```typescript
export async function verifyAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    // VERIFICA NA TABELA admin_roles EM VEZ DE user_metadata
    const { data: adminRole } = await supabaseAdmin
      .from("admin_roles")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!adminRole) {
      res.status(403).json({ error: "Forbidden: Admin access required" });
      return;
    }

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
```

**Atualizar RLS policies de user_manual_access:**
```sql
-- Mudar de auth.jwt()->>'role' para tabela admin_roles
CREATE POLICY "Admins can insert manual access"
  ON user_manual_access FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );
```

#### 2. Melhorar Routing Pós-Login

**Por Que:**
- Melhor UX: usuário sabe para onde vai após login
- Reduz confusão (usuário não fica "perdido" na Landing)

**Implementação:** (Ver seção 2 acima)

### Prioridade MÉDIA

#### 3. Adicionar Loading States Inteligentes

**Problema:** Usuário vê flash de conteúdo enquanto ProtectedRoute carrega

**Solução:** Adicionar skeleton screens

```typescript
// ProtectedRoute.tsx
if (loading || (requirePayment && !initialized)) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <AccessLoadingSkeleton />
    </div>
  );
}
```

#### 4. Adicionar Refresh Token no PaymentContext

**Problema:** Status de acesso pode mudar (webhook MercadoPago) mas usuário não vê até dar F5

**Solução:** WebSocket ou polling inteligente

```typescript
// Opção 1: Polling a cada 30 segundos após pagamento
useEffect(() => {
  if (!hasAccess && lastPaymentAttempt) {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }
}, [hasAccess, lastPaymentAttempt, refetch]);
```

### Prioridade BAIXA

#### 5. Adicionar Audit Trail Completo

**Por Que:** Rastreabilidade de todas as ações de admin

**Implementação:**
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor_user_id UUID REFERENCES auth.users(id),
  target_user_id UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Status dos Usuários Teste

### forato@gmail.com
- ✅ Role admin configurada em user_metadata
- ✅ Acesso manual configurado em user_manual_access
- ✅ Pode acessar /admin/access
- ✅ Pode conceder/revogar acessos

**Próximos Passos:**
- Migrar role de admin para tabela admin_roles
- Testar concessão de acessos após migração

---

## Plano de Execução

### Fase 1: Refatoração de Admin Validation (CRÍTICA)
1. Criar migration `010_create_admin_roles.sql`
2. Migrar forato@gmail.com para nova tabela
3. Atualizar middleware `verifyAdmin`
4. Atualizar RLS policies
5. Testar todas as operações de admin

### Fase 2: Melhorar UX de Routing
1. Adicionar redirecionamento pós-login inteligente
2. Adicionar loading states
3. Testar fluxo completo (registro → login → acesso)

### Fase 3: Melhorias Opcionais
1. Implementar polling para status de pagamento
2. Adicionar audit trail completo
3. Adicionar notificações em tempo real

---

## Conclusão

O sistema atual está **funcional e bem estruturado**, mas possui uma inconsistência crítica na validação de roles de admin que deve ser corrigida para garantir segurança.

**Principais Pontos:**
1. ✅ Sistema de acesso (pagamento + manual) funcionando
2. ✅ Painel admin funcional
3. ⚠️ Validação de admin deve migrar para tabela dedicada
4. ⚠️ Routing pós-login pode ser melhorado

**Risco Atual:** BAIXO
- Sistema funciona, mas depende de user_metadata para validação de admin

**Risco Pós-Refatoração:** MUITO BAIXO
- Validação no servidor elimina risco de falsificação

---

**Próximos Passos:**
1. Executar Fase 1 (Admin Validation) - CRÍTICO
2. Executar Fase 2 (Routing UX) - RECOMENDADO
3. Executar Fase 3 (Melhorias Opcionais) - DESEJÁVEL
