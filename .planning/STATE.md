# Project State

**Project:** Limpa Nome Expresso - Refatoração Autenticação e Pagamentos
**Milestone:** v1.1 - Correção do Sistema de Acesso

## Current Position

**Phase:** Not started (defining requirements)
**Plan:** —
**Status:** Gathering requirements
**Last activity:** 2026-03-04 — Milestone v1.1 started

## Milestone Context

**Previous State (v1.0):**
- Sistema de autenticação Supabase implementado
- Integração MercadoPago implementada
- Contextos AuthContext e PaymentContext criados
- Tabelas user_access e user_manual_access criadas

**Current Problems:**
- Loop infinito no login (ProtectedRoute problemático)
- Usuários pagantes sem acesso
- Permissões Supabase incorretas
- Falta painel admin para gestão
- Routing pós-login inadequado

**Target State (v1.1):**
- Sistema de acesso funcionando sem loops
- Validação centralizada e confiável
- Painel admin operacional
- Routing correto baseado em status de pagamento
- Webhook MercadoPago validado

## Accumulated Context

**Codebase Structure:**
- `client/src/contexts/AuthContext.tsx` - Gerencia sessão Supabase
- `client/src/contexts/PaymentContext.tsx` - Verifica status de acesso
- `client/src/components/auth/ProtectedRoute.tsx` - Protege rotas baseado em acesso
- `server/routes/auth.ts` - Registro e login
- `server/routes/payments.ts` - Status de pagamento e webhooks
- `server/routes/admin-access.ts` - Gestão de acesso manual (precisa ser criado)

**Supabase Schema:**
- `auth.users` - Tabela padrão Supabase Auth
- `user_access` - Acesso via pagamento (access_type, expires_at, is_active)
- `user_manual_access` - Acesso manual concedido por admin

**Known Issues:**
- PaymentContext tem dependência circular que causa re-renders infinitos
- ProtectedRoute pode não estar lendo PaymentContext corretamente
- RLS policies podem estar bloqueando queries legítimas
- Falta validação de admin role para gerenciar acessos

**Test User:**
- forato@gmail.com - Tem acesso manual configurado, útil para testes

## Technical Debt

- PaymentContext com useEffect dependencies problemáticas
- Ausência de tratamento de erro adequado em validações de acesso
- Falta de logging para debug de problemas de permissão
- Não há monitoramento de webhook MercadoPago

## Next Steps

1. Definir requisitos detalhados para correção
2. Criar roadmap com fases de implementação
3. Priorizar correção de bugs críticos (loop de login)
4. Implementar painel admin
5. Validar webhook MercadoPago

---
*State initialized: 2026-03-04*
