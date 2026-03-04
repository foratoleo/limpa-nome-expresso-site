# Project State

**Project:** Limpa Nome Expresso - Refatoração Autenticação e Pagamentos
**Milestone:** v1.1 - Correção do Sistema de Acesso

## Current Position

**Phase:** Phase 1 - Authentication Foundation
**Plan:** TBD
**Status:** Planning phase execution
**Last activity:** 2026-03-04 — Roadmap created

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

## Roadmap Structure

**Phases:** 4
**Granularity:** Standard
**Coverage:** 25/25 requirements mapped (100%)

| Phase | Focus | Requirements |
|-------|-------|--------------|
| 1 | Authentication Foundation | 11 requirements |
| 2 | Database Security & Performance | 6 requirements |
| 3 | Admin Panel Core | 8 requirements |
| 4 | Admin Panel Polish | 4 requirements |

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

## Technical Decisions

| Decision | Rationale | Status |
|----------|-----------|--------|
| Validação centralizada em `/api/payments/status` | Single source of truth, evita problemas de cache | Approved |
| React Query para caching de acesso | Elimina re-renders infinitos do Context | Approved |
| Soft delete (is_active: false) | Mantém audit trail completo | Approved |
| Separar validação de admin no servidor | Nunca confiar em user_metadata para autorização | Approved |
| TanStack Table para painel admin | Leve (12KB vs 85KB AG Grid), type-safe | Approved |

## Next Steps

1. Execute Phase 1 plan (/gsd:plan-phase 1)
2. Fix ProtectedRoute redirect loop
3. Implement centralized access validation endpoint
4. Add React Query for access caching
5. Test MercadoPago webhook idempotency

## Performance Metrics

*No metrics collected yet - baseline to be established during Phase 1*

## Session Continuity

**Last Session:** 2026-03-04 - Roadmap creation
**Current Session:** 2026-03-04 - Ready for Phase 1 planning

**Open Questions:**
- None currently

**Blockers:**
- None currently

---
*State initialized: 2026-03-04*
*Last updated: 2026-03-04*
