# Limpa Nome Expresso - Refatoração Autenticação e Pagamentos

## What This Is

Plataforma jurídica para limpeza de nome online com sistema de assinatura e acesso manual. Usuários cadastrados podem pagar para acessar guias jurídicos, templates e funcionalidades premium, ou receber acesso manual concedido por administradores. O sistema atual tem problemas críticos de permissões, loops de login e validação de acesso que impedem usuários de acessarem conteúdo pago.

## Core Value

**Usuários pagantes ou com acesso manual conseguem acessar todas as funcionalidades sem loops de login ou erros de permissão.**

## Requirements

### Validated

- ✓ Autenticação Supabase implementada (AuthContext) — existing
- ✓ Integração MercadoPago implementada — existing
- ✓ Contextos de auth e payment criados — existing
- ✓ Tabelas user_access e user_manual_access — existing

### Active

- [ ] **Corrigir loop de login** - ProtectedRoute redireciona incorretamente usuários logados
- [ ] **Corrigir validação de acesso** - PaymentContext/ProtectedRoute precisam verificar acesso corretamente
- [ ] **Corrigir permissões Supabase** - RLS policies bloqueiam ou permitem acesso incorretamente
- [ ] **Garantir webhook MercadoPago** - Confirmar que pagamento atualiza user_access corretamente
- [ ] **Implementar painel admin** - Interface para administradores gerenciarem acessos manuais
- [ ] **Corrigir routing pós-login** - Usuário pago → Dashboard, não pago → Checkout
- [ ] **Implementar validação centralizada** - Usar apenas /api/payments/status para verificar acesso
- [ ] **Adicionar histórico de acessos** - Log de quando acessos foram concedidos/revogados

### Out of Scope

- Refatoração de UI/UX do site — focar apenas em auth/pagamento
- Mudança de provedor de pagamento — manter MercadoPago
- Alteração no schema do Supabase — usar tabelas existentes

## Context

**Sistema Atual:**
- React SPA com Vite, TypeScript
- Supabase para autenticação e banco de dados
- MercadoPago para processamento de pagamentos
- AuthContext para gerenciar sessão
- PaymentContext para verificar acesso
- Tabelas: `user_access` (pagamentos), `user_manual_access` (acesso concedido por admin)

**Problemas Constatados:**
- Loop infinito no login após autenticação bem-sucedida
- ProtectedRoute não reconhece acesso válido mesmo com user_access preenchido
- Possível problema com RLS policies do Supabase
- Webhook MercadoPago pode não estar atualizando user_access corretamente
- Não existe interface para admin gerenciar acessos manuais
- Routing após login não considera status de pagamento

**Usuário forato@gmail.com:**
- Já possui acesso manual configurado no banco
- Pode ser usado para testes de validação de acesso

## Constraints

- **Tecnologia**: Manter stack atual (React, Supabase, MercadoPago, Express)
- **Schema Supabase**: Usar tabelas existentes (user_access, user_manual_access)
- **Compatibilidade**: Não quebrar funcionalidades existentes que funcionam
- **Segurança**: Manter RLS policies do Supabase, apenas corrigir

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Validação centralizada em API | Single source of truth, evita problemas de cache/sincronização | — Pending |
| Separar acesso manual de pagamento | Acesso manual tem fluxo diferente (não passa por webhook) | — Pending |
| Painel admin para gestão manual | Atualmente só é possível via SQL direto no Supabase | — Pending |
| Manter dois contexts (Auth + Payment) | Separação de concerns: auth é sessão, payment é acesso | — Pending |

---
*Last updated: 2026-03-04 after milestone initialization*
