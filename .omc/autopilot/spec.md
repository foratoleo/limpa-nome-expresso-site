# ESPECIFICAÇÃO COMPLETA - Sistema de Autenticação Passwordless (Magic Link)

**Data:** 2026-03-03
**Status:** Expansão Completa
**Próxima Fase:** Planning

---

# 1. RESUMO EXECUTIVO

Implementar sistema de autenticação **passwordless** usando **Magic Links** do Supabase, integrado com **EmailIt** para envio de emails customizados.

## Decisões do Usuário

| Decisão | Escolha |
|---------|---------|
| **Fluxo de Login** | Magic Link sempre (passwordless completo) |
| **Migração** | Híbrido - usuários antigos com senha continuam funcionando |
| **Sistema Email** | EmailIt (já configurado) |
| **Expiração Link** | 1 hora (padrão Supabase) |

---

# 2. REQUISITOS FUNCIONAIS

## 2.1 Fluxo Principal - Cadastro/Login Passwordless

```
1. Usuário acessa site
2. Clica em "Entrar" ou "Criar Conta"
3. Digita APENAS o email (sem senha)
4. Clica em "Enviar link de acesso"
5. Sistema envia email com magic link
6. Usuário clica no link no email
7. Sistema autentica automaticamente
8. Redireciona para /client-area
```

## 2.2 Fluxo Híbrido - Usuários Existentes

```
1. Usuário digita email
2. Sistema verifica se tem senha cadastrada
3. Se tem senha: oferece ambas opções
   - Entrar com Magic Link
   - Entrar com Senha
4. Se não tem senha: oferece apenas Magic Link
```

## 2.3 Integrações Necessárias

- **Supabase Auth**: Geração de magic links via `signInWithOtp()`
- **EmailIt API**: Envio de emails customizados com template HTML
- **Frontend React**: Componentes de UI para magic link

## 2.4 Templates de Email

- **Magic Link HTML**: Template customizado com branding do site
- Baseado em: `/client/public/email-templates/confirm-signup.html`

---

# 3. REQUISITOS NÃO-FUNCIONAIS

## 3.1 Segurança

| Ameaça | Mitigação |
|--------|-----------|
| Interceptação de Magic Link | PKCE flow já configurado |
| Reuso de Magic Link | Supabase invalida após uso (one-time token) |
| Força bruta de email | Rate limiting (5 tentativas / 15 min) |
| Enumeração de usuários | Resposta genérica ("Se o email existir...") |
| Phishing | Validação de `emailRedirectTo` contra whitelist |

## 3.2 Performance

- Tempo de envio de email: < 3 segundos
- Resposta de API: < 500ms
- Expiração do link: 1 hora (3600 segundos)

## 3.3 UX

- Feedback visual imediato após solicitar link
- Instruções claras no email
- Link único uso (previne reuso)
- Fallback para senha em usuários existentes

---

# 4. REQUISITOS IMPLÍCITOS

## 4.1 Detecção de Tipo de Usuário

- Endpoint para verificar se usuário tem senha
- Usuário existente com senha → oferecer ambas opções
- Usuário novo → apenas magic link
- Usuário não encontrado → mensagem genérica

## 4.2 Template de Email Customizado

- Manter branding do site
- Instruções claras
- Botão destacado para clicar
- Link alternativo (caso botão não funcione)
- Informações de segurança (não compartilhar link)

## 4.3 Tratamento de Erros

- Email inválido → validação no frontend
- Falha no envio → mensagem de erro + opção de tentar novamente
- Link expirado → opção de solicitar novo link
- Usuário não encontrado → mensagem genérica (não revelar existência)

---

# 5. OUT OF SCOPE

**O que NÃO está incluído:**

- ❌ Remoção completa de senhas do sistema (usuários antigos mantêm senhas)
- ❌ Migração forçada de usuários existentes para passwordless
- ❌ Autenticação social (Google, Facebook, etc.)
- ❌ 2FA/MFA
- ❌ Sessões simultâneas (limite de dispositivos)
- ❌ Biometria

---

# 6. ESPECIFICAÇÃO TÉCNICA

## 6.1 Tech Stack

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| **Auth Provider** | Supabase Auth | v2.98.0 |
| **Email Service** | EmailIt API | (já configurado) |
| **Client Auth** | Supabase JS Client | v2.98.0 |
| **Server Runtime** | Express.js + Vercel | v4.21.2 |
| **Frontend** | React + Vite + Wouter | (existente) |

**Dependências:**
```json
{
  "@supabase/supabase-js": "^2.98.0",  // Suporta signInWithOtp()
  "express": "^4.21.2"
}
```

**Nenhuma nova dependência necessária!** ✨

## 6.2 Arquitetura do Fluxo

```
[Usuario] → [LoginForm] → [AuthContext] → [Supabase: signInWithOtp()]
                                                 |
                                                 v
                                      [Supabase Auth Trigger]
                                                 |
                                                 v
                                    [Server: /api/auth/magic-link]
                                                 |
                                                 v
                                       [EmailIt: sendMagicLink()]
                                                 |
                                                 v
                                    [Email: Magic Link na caixa]
                                                 |
                                                 v
[Usuario clica no link] → [Supabase Auth Handler] → [Session criada] → [Redirect: /client-area]
```

## 6.3 Estrutura de Arquivos

### Arquivos Novos a Criar

| Arquivo | Propósito |
|---------|-----------|
| `/client/src/components/auth/MagicLinkForm.tsx` | Formulário de login com apenas email |
| `/client/src/components/auth/HybridLoginForm.tsx` | Formulário híbrido (detecta usuário com/sem senha) |
| `/server/routes/magic-link.ts` | Rota webhook para envio de email customizado |
| `/client/public/email-templates/magic-link.html` | Template HTML para magic link |
| `/server/services/magic-link.service.ts` | Serviço de lógica de magic link |

### Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `/client/src/contexts/AuthContext.tsx` | Adicionar `signInWithMagicLink(email: string)` |
| `/client/src/components/auth/AuthModal.tsx` | Adicionar tab/opção de magic link |
| `/server/index.ts` | Montar rota `/api/auth/magic-link` |
| `/server/routes/auth.ts` | Adicionar `POST /api/auth/check-user` |

## 6.4 APIs e Interfaces

### Supabase Client-Side

```typescript
// Em /client/src/contexts/AuthContext.tsx
const signInWithMagicLink = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/client-area`,
    }
  });
  return { error, data };
};
```

### Endpoint: Verificar Usuário

```typescript
// POST /api/auth/check-user

interface CheckUserRequest {
  email: string;
}

interface CheckUserResponse {
  exists: boolean;
  hasPassword: boolean;
  emailConfirmed: boolean;
}
```

### EmailIt Integration

```typescript
interface MagicLinkEmailData {
  to: string;
  magicLinkUrl: string;
  expiryMinutes?: number;  // Default: 60
}

// Método a adicionar em EmailService
async sendMagicLink(data: MagicLinkEmailData): Promise<EmailResponse>
```

## 6.5 Componentes UI

### MagicLinkForm.tsx

```typescript
interface MagicLinkFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}
```

**Funcionalidades:**
- Input de email apenas
- Botão "Enviar link de acesso"
- Loading state
- Success state (instruções)
- Link "Voltar" para login tradicional

### HybridLoginForm.tsx

**Funcionalidades:**
1. Usuário digita email
2. Chama `/api/auth/check-user`
3. Renderiza opções baseadas em `hasPassword`

## 6.6 Configurações de Ambiente

| Variável | Obrigatória | Valor |
|----------|-------------|-------|
| `VITE_SUPABASE_URL` | Sim | (já existe) |
| `VITE_SUPABASE_ANON_KEY` | Sim | (já existe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | (já existe) |
| `EMAILIT_API_KEY` | Sim | (já existe em `.env.local.bak`) |
| `EMAILIT_DEFAULT_FROM` | Sim | (já existe) |
| `MAGIC_LINK_EXPIRY_SECONDS` | Não | `3600` (default) |

## 6.7 Plano de Implementação

### Fase 1: Infraestrutura Backend (2 horas)
- Criar `/server/routes/magic-link.ts`
- Criar `/server/services/magic-link.service.ts`
- Modificar `/server/index.ts`

### Fase 2: Template de Email (1 hora)
- Criar `/client/public/email-templates/magic-link.html`
- Adaptar método `sendMagicLink` em `/server/services/email.service.ts`

### Fase 3: Componentes UI (3 horas)
- Criar `MagicLinkForm.tsx`
- Criar `HybridLoginForm.tsx`
- Modificar `AuthContext.tsx`
- Modificar `AuthModal.tsx`

### Fase 4: Testes (2 horas)
- Teste unitário de `checkUserHasPassword`
- Teste E2E de fluxo de magic link
- Teste de usuários híbridos

### Fase 5: Deploy e Monitoração (1 hora)
- Deploy em staging
- Testes de integração com EmailIt
- Configuração de Supabase Dashboard

**Total Estimado:** 9 horas

---

# 7. REFERÊNCIAS

## Arquivos do Projeto a Reutilizar

| Arquivo | Referência |
|---------|------------|
| `/server/lib/emailit.ts:139-283` | `EmailItClient.send()` |
| `/server/services/email.service.ts:335-363` | `sendCustomEmail()` |
| `/client/public/email-templates/confirm-signup.html` | Template HTML |
| `/client/src/contexts/AuthContext.tsx:83-90` | `signIn()` |
| `/server/routes/auth.ts:32-172` | `POST /register` |
| `/client/src/lib/supabase.ts:11-18` | Config pkce |

## Documentação Supabase

- [Magic Links](https://supabase.com/docs/guides/auth/auth-magic-link)
- [signInWithOtp()](https://supabase.com/docs/reference/javascript/auth-signinwithotp)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)

---

# 8. CRITICAL SUCCESS FACTORS

1. ✅ **Nenhuma dependência nova** - Supabase JS v2 já suporta magic links
2. ✅ **EmailIt já integrado** - Apenas adicionar método `sendMagicLink()`
3. ✅ **PKCE já configurado** - Segurança garantida
4. ✅ **Zero downtime** - Sistema híbrido permite migração gradual
5. ✅ **Template HTML existe** - Apenas adaptar para magic link

---

**Fase 0: EXPANSÃO COMPLETA** ✅
