# 🚀 Como Configurar o MercadoPago - Guia Passo a Passo

## 📋 Resumo dos Problemas Corrigidos

✅ **Removido**: PricingSection antiga do Stripe que causava erro 404
✅ **Pronto**: Sistema de checkout MercadoPago implementado

---

## 🔧 Passo 1: Configurar o Supabase (5 minutos)

### 1.1. Acessar o SQL Editor

Abra no seu navegador:
```
https://supabase.com/dashboard/project/dtbrzojuopcyfgmaybzt/sql
```

### 1.2. Executar Migration 1 - Adicionar colunas MercadoPago

Copie e cole no SQL Editor:

```sql
-- Migration 1: Adicionar colunas do MercadoPago
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'stripe',
  ADD COLUMN IF NOT EXISTS mercadopago_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS mercadopago_preference_id TEXT,
  ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMP WITH TIME ZONE;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(payment_provider);
```

Clique em **Run** (ou Ctrl+Enter)

### 1.3. Executar Migration 2 - Criar tabela user_access

```sql
-- Migration 2: Criar tabela de controle de acesso
CREATE TABLE IF NOT EXISTS user_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL CHECK (access_type IN ('subscription', 'one_time')),
  payment_id TEXT REFERENCES payments(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, access_type)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_user_access_user_active ON user_access(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_access_expires ON user_access(expires_at);
```

Clique em **Run**

---

## ✅ Passo 2: Testar o Sistema

### 2.1. Os servidores já estão rodando:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### 2.2. Teste o checkout:
1. Acesse: http://localhost:3000
2. Faça login
3. Será redirecionado para /checkout
4. Verá página com R$149,90
5. Clique em "PAGAR AGORA"
6. Abrirá checkout MercadoPago

---

## 🎉 Fluxo Completo

Registro/Login → Verifica Pagamento → Se não pagou → /checkout → Clica "PAGAR AGORA" → MercadoPago → Webhook → Acesso liberado (12 meses)

---

## 📞 Precisa de Ajuda?

Execute as migrations do Supabase e tudo funcionará!
