# 🔍 DIAGNÓSTICO COMPLETO - Problema na Vercel

## 📊 VARIÁVEIS DE AMBIENTE CONFIGURADAS

### ✅ No `.env.local` (Desenvolvimento):
```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_SERVICE_ROLE_KEY=...  # ❌ NÃO usada pelo server
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...       # ✅ Usada pelo server
```

### ❌ Na Vercel (Produção):
```bash
VITE_SUPABASE_URL=...               # ✅ Configurada
VITE_SUPABASE_ANON_KEY=...          # ✅ Configurada
SUPABASE_SERVICE_ROLE_KEY=...        # ❌ FALTANDO!
```

---

## 🚨 **RAIZ DO PROBLEMA IDENTIFICADA**

### **O Código em `server/routes/payments.ts`:**
```typescript
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // ← Esta variável NÃO existe na Vercel!
);
```

### **O que acontece:**
1. **Server-side** (Node.js na Vercel) tenta ler `process.env.SUPABASE_SERVICE_ROLE_KEY`
2. Variável é **`undefined`**
3. Supabase client é criado com credenciais inválidas
4. Endpoint `/api/payments/status` **falha silenciosamente**
5. React Query retorna `hasAccess: false` (valor padrão)
6. `ProtectedRoute` redireciona para `/checkout`

### **Por que funciona em localhost:**
- `.env.local` tem `SUPABASE_SERVICE_ROLE_KEY`
- Vite carrega todas as variáveis do `.env.local`

### **Por que NÃO funciona na Vercel:**
- Apenas variáveis listadas no `vercel env ls` estão disponíveis
- `SUPABASE_SERVICE_ROLE_KEY` **não está configurada**
- Prefixo `VITE_` só funciona no **client-side**, não no server

---

## 🔬 **PROVA DO PROBLEMA**

### Verificação do código:
```typescript
// server/routes/payments.ts:5-8
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,      // ✅ Existe na Vercel
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ❌ NÃO existe na Vercel
);
```

### Comportamento esperado quando a chave está faltando:
- Supabase client pode ser criado, mas **sem permissões de service_role**
- Queries falham com erro de permissão: RLS policies bloqueiam acesso
- Endpoint retorna erro ou dados vazios

---

## 📋 **PLANO DE CORREÇÃO**

### **SOLUÇÃO: Configurar variável na Vercel**

```bash
# Adicionar SUPABASE_SERVICE_ROLE_KEY na Vercel
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

Valor da chave (do .env.local):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0YnJ6b2p1b3BjeWZnbWF5Ynp0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjEzNjkyMSwiZXhwIjoyMDg3NzEyOTIxfQ.pCCSbuq1EOqeSsKg-b0Z18zbTadHXmlYAH4BeTx_a90
```

---

## 🔄 **APÓS CORREÇÃO**

1. Redeploy automático da Vercel (ou manual)
2. Endpoint `/api/payments/status` funciona corretamente
3. `hasAccess` retorna `true` para usuários com acesso manual
4. `ProtectedRoute` não redireciona mais para `/checkout`

---

## ✅ **VALIDAÇÃO APÓS CORREÇÃO**

### Testar endpoint:
```bash
curl -X GET https://limpa-nome-expresso-site.vercel.app/api/payments/status \
  -H "Authorization: Bearer <token>"
```

### Esperado:
```json
{
  "hasActiveAccess": true,
  "hasManualAccess": true,
  "accessType": "manual",
  "expiresAt": null
}
```

---

## 📝 **RESUMO**

| Problema | Causa | Solução |
|----------|-------|---------|
| Usuário redirecionado para checkout | `SUPABASE_SERVICE_ROLE_KEY` não configurada na Vercel | Adicionar variável no painel da Vercel |
| Endpoint falha silenciosamente | Credenciais inválidas → RLS bloqueia queries | Configurar service role key |
| Funciona em localhost | `.env.local` tem todas as variáveis | Adicionar mesma variável na Vercel |

---

## 🎯 **PRÓXIMO PASSO**

**APROVAÇÃO NECESSÁRIA:** Posso configurar a variável `SUPABASE_SERVICE_ROLE_KEY` na Vercel?

Isso irá:
1. ✅ Corrigir o problema imediatamente
2. ✅ Não requer mudanças no código
3. ✅ Redeploy automático após configuração
4. ✅ Usuário forato@gmail.com terá acesso normalmente
