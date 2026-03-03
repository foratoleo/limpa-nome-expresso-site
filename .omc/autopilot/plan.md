# PLANO DE IMPLEMENTAÇÃO - Passwordless Auth System

**Baseado em:** `.omc/autopilot/spec.md`
**Data:** 2026-03-03
**Estimativa Total:** 4-5 horas
**Status:** Pronto para Execução

---

## VISÃO GERAL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUXO DE IMPLEMENTAÇÃO                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FASE 1 (30min)     FASE 2 (25min)      FASE 3 (2h)        FASE 4-5 (1.5h)  │
│  ┌─────────┐        ┌──────────┐        ┌──────────┐        ┌──────────────┐ │
│  │ Backend │ ─────▶ │ Context  │ ────▶  │ UI       │ ──────▶ │ Template &   │ │
│  │ Check   │        │ Auth     │        │ Components│       │ Testes       │ │
│  │ User    │        │ Client   │        │ MagicLink │       │              │ │
│  └─────────┘        └──────────┘        └──────────┘        └──────────────┘ │
│       │                  │                  │                     │          │
│       ▼                  ▼                  ▼                     ▼          │
│  CheckUserAPI      signInWithOtp()    Formulários         Dashboard         │
│  endpoint          implementation     React              Supabase +         │
│  /check-user       AuthContext.tsx    Components         E2E Tests          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## FASE 1: BACKEND - Check User Endpoint (30 min)

### Tarefa 1.1: Criar endpoint POST /api/auth/check-user

**Arquivo:** `/server/routes/auth.ts`
**Após linha 254**

```typescript
authRouter.post("/check-user", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email é obrigatório",
      });
    }

    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      return res.status(500).json({
        success: false,
        error: "Erro ao verificar usuário",
      });
    }

    const user = users?.find(u => u.email === email);

    res.json({
      success: true,
      exists: !!user,
      hasPassword: user?.app_metadata?.provider === 'email' && !user?.app_metadata?.passwordless,
      emailConfirmed: user?.email_confirmed_at !== null,
    });
  } catch (err) {
    console.error("Check user error:", err);
    res.status(500).json({
      success: false,
      error: "Erro ao verificar usuário. Tente novamente.",
    });
  }
});
```

**Critérios:**
- [ ] Endpoint responde em < 200ms
- [ ] Retorna 400 para email vazio
- [ ] Previne enumeração de usuários

---

## FASE 2: FRONTEND - Auth Context (25 min)

### Tarefa 2.1: Adicionar signInWithMagicLink

**Arquivo:** `/client/src/contexts/AuthContext.tsx`

**Modificar interface (linha 5-13):**
```typescript
interface AuthContextType {
  // ... existentes
  signInWithMagicLink: (email: string) => Promise<{ error: AuthError | null; success: boolean }>;
}
```

**Adicionar implementação após linha 90:**
```typescript
const signInWithMagicLink = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
  });

  return { error, success: !error };
};
```

**Modificar value object (linha 105):**
```typescript
const value: AuthContextType = {
  user,
  session,
  loading,
  signUp,
  signIn,
  signInWithMagicLink,  // Adicionar
  signOut,
  resetPassword,
};
```

### Tarefa 2.2: Adicionar checkUser

**Adicionar à interface:**
```typescript
checkUser: (email: string) => Promise<{ exists: boolean; hasPassword: boolean; emailConfirmed: boolean } | null>;
```

**Adicionar implementação:**
```typescript
const checkUser = async (email: string) => {
  try {
    const response = await fetch("/api/auth/check-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data;
  } catch {
    return null;
  }
};
```

**Critérios:**
- [ ] Métodos chamam APIs corretamente
- [ ] TypeScript sem erros
- [ ] Tipagem correta

---

## FASE 3: FRONTEND - Componentes UI (2h)

### Tarefa 3.1: Criar MagicLinkForm.tsx

**Arquivo NOVO:** `/client/src/components/auth/MagicLinkForm.tsx`

Ver código completo no arquivo `.omc/autopilot/spec.md` seção "Tarefa 3.1"

**Componente inclui:**
- Input de email apenas
- Botão "Enviar link de acesso"
- Loading state
- Tela de sucesso com instruções
- Tratamento de erros
- Link "Voltar para login com senha"

**Critérios:**
- [ ] Form valida email
- [ ] Mostra loading durante envio
- [ ] Mostra tela de sucesso após envio
- [ ] Tratamento de erros adequado

### Tarefa 3.2: Modificar AuthModal.tsx

**Arquivo:** `/client/src/components/auth/AuthModal.tsx`

**Modificar type Tab (linha 13):**
```typescript
type Tab = "login" | "register" | "forgot" | "magic";
```

**Importar MagicLinkForm (linha 1-5):**
```typescript
import { MagicLinkForm } from "./MagicLinkForm";
```

**Adicionar botões de tabs (após linha 103):**
```typescript
{tab !== "forgot" && tab !== "magic" && (
  <div className="flex gap-2 mb-6 rounded-xl overflow-hidden" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
    <button onClick={() => setTab("login")} className="flex-1 py-2.5 text-sm font-medium transition-colors rounded-lg"
      style={{ backgroundColor: tab === "login" ? "#d39e17" : "transparent", color: tab === "login" ? "#12110d" : "#94a3b8" }}>
      Com Senha
    </button>
    <button onClick={() => setTab("magic")} className="flex-1 py-2.5 text-sm font-medium transition-colors rounded-lg"
      style={{ backgroundColor: tab === "magic" ? "#d39e17" : "transparent", color: tab === "magic" ? "#12110d" : "#94a3b8" }}>
      Magic Link
    </button>
    <button onClick={() => setTab("register")} className="flex-1 py-2.5 text-sm font-medium transition-colors rounded-lg"
      style={{ backgroundColor: tab === "register" ? "#d39e17" : "transparent", color: tab === "register" ? "#12110d" : "#94a3b8" }}>
      Criar Conta
    </button>
  </div>
)}
```

**Adicionar renderização do MagicLinkForm (após linha 121):**
```typescript
{tab === "magic" && (
  <MagicLinkForm
    onSuccess={onClose}
    onBackToLogin={() => setTab("login")}
  />
)}
```

**Critérios:**
- [ ] Nova tab "Magic Link" visível
- [ ] Navegação entre tabs funciona
- [ ] Form renderiza corretamente

### Tarefa 3.3: Criar AuthCallbackPage

**Arquivo NOVO:** Criar página de callback para processar Magic Link

Ver código completo em `.omc/autopilot/spec.md` seção "Tarefa 3.3"

**Funcionalidades:**
- Processa tokens da URL (`access_token`, `refresh_token`)
- Trata erros e links expirados
- Redireciona para /client-area após sucesso
- Estados: loading, success, error

**Adicionar rota no sistema de rotas:**
```typescript
import { AuthCallbackPage } from "./pages/auth/callback";
<Route path="/auth/callback" component={AuthCallbackPage} />
```

**Critérios:**
- [ ] Página processa tokens da URL
- [ ] Redireciona para /client-area
- [ ] Trata erros e links expirados

---

## FASE 4: SUPABASE DASHBOARD - Template Email (20 min)

### Tarefa 4.1: Configurar Magic Link Template

**Passos Manuais:**

1. Acessar `https://supabase.com/dashboard`
2. Selecionar projeto
3. Navegar para `Authentication` > `Email Templates`
4. Selecionar template `Magic Link`
5. Copiar e adaptar HTML de `/client/public/email-templates/confirm-signup.html`

**Variáveis disponíveis:**
- `{{ .ConfirmationURL }}` - Link de confirmação
- `{{ .Email }}` - Email do usuário
- `{{ .SiteURL }}` - URL do site

**HTML adaptado:**
```html
<!-- Manter estilo do confirm-signup.html -->
<h2>Acesse sua conta</h2>
<p>Clique no botão abaixo para acessar sua conta:</p>
<a href="{{ .ConfirmationURL }}" class="button">Acessar Conta</a>
<p>Este link expira em 1 hora.</p>
```

**Critérios:**
- [ ] Template configurado no Dashboard
- [ ] Preview visual correto
- [ ] Teste de envio bem-sucedido

---

## FASE 5: INTEGRAÇÃO E TESTES (45 min)

### Tarefa 5.1: Teste E2E do Fluxo Magic Link

**Cenário de Teste:**

| Passo | Ação | Resultado Esperado |
|-------|------|---------------------|
| 1 | Acessar site, clicar "Entrar" | Modal abre com 3 tabs |
| 2 | Selecionar tab "Magic Link" | Form de apenas email |
| 3 | Digitar email e enviar | "Link enviado!" aparece |
| 4 | Verificar email | Email com template customizado |
| 5 | Clicar no botão do email | Redireciona para /auth/callback |
| 6 | Callback processa | Redireciona para /client-area |
| 7 | Usuario logado | Dados disponíveis |

**Teste Edge Cases:**
- Email inválido
- Link expirado (> 1h)
- Já logado
- Link já usado

### Tarefa 5.2: Verificar Compatibilidade Híbrida

**Verificações:**
- [ ] Login com senha ainda funciona
- [ ] Cadastro ainda funciona
- [ ] Recuperação de senha ainda funciona
- [ ] Usuários antigos continuam funcionando

**Critérios:**
- [ ] Fluxo completo funciona
- [ ] Zero regressões em funcionalidades existentes

---

## CHECKPOINTS

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           CHECKPOINTS                                      │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ▼ CHECKPOINT 1: Backend Ready (Após Fase 1)                              │
│  └─ Endpoint /api/auth/check-user funcionando                             │
│                                                                            │
│  ▼ CHECKPOINT 2: Client Context Ready (Após Fase 2)                        │
│  └─ signInWithMagicLink() e checkUser() implementados                      │
│                                                                            │
│  ▼ CHECKPOINT 3: UI Components Ready (Após Fase 3)                         │
│  └─ MagicLinkForm, AuthModal modificado, AuthCallbackPage                  │
│                                                                            │
│  ▼ CHECKPOINT 4: Integration Complete (Após Fase 4)                        │
│  └─ Template configurado no Supabase                                       │
│                                                                            │
│  ▼ CHECKPOINT FINAL: E2E Pass (Após Fase 5)                                │
│  └─ Fluxo completo testado, zero regressões                                │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## RISCOS E MITIGAÇÕES

| Risco | Mitigação |
|-------|-----------|
| Email cai no spam | Configurar SPF/DKIM; instruir sobre pasta spam |
| Usuario não recebe email | Opção "reenviar"; suporte manual |
| Link expira antes do uso | 1h de validade; reenvio fácil |
| Template Supabase limitado | HTML customizado no Dashboard |

---

## TEMPO ESTIMADO

| Fase | Tempo | Paralelizável |
|------|-------|---------------|
| Fase 1 | 30min | Não |
| Fase 2 | 25min | Sim (com 1) |
| Fase 3 | 2h | Não |
| Fase 4 | 20min | Sim (com tudo) |
| Fase 5 | 45min | Não |
| Buffer | 30min | - |
| **TOTAL** | **~4h** | Mínimo 3h |

---

## CRITICAL SUCCESS FACTORS

✅ **Nenhuma dependência nova** - Supabase v2.98 já suporta `signInWithOtp()`
✅ **Email não precisa de server-side** - Supabase envia automaticamente
✅ **PKCE já configurado** - Segurança garantida
✅ **Zero downtime** - Sistema híbrido, ambos funcionam
✅ **Template existe** - Apenas adaptar confirm-signup.html

---

**PLANO COMPLETO - PRONTO PARA EXECUÇÃO** ✅
