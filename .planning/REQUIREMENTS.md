# Requirements: Limpa Nome Expresso - Refatoração Autenticação e Pagamentos

**Defined:** 2026-03-04
**Core Value:** Usuários pagantes ou com acesso manual conseguem acessar todas as funcionalidades sem loops de login ou erros de permissão

## v1.1 Requirements

Requisitos para correção do sistema de autenticação e implementação de painel admin.

### Autenticação & Validação

- [ ] **AUTH-01**: Sistema implementa endpoint `/api/payments/status` como única fonte de verdade para validação de acesso
- [ ] **AUTH-02**: ProtectedRoute verifica acesso apenas após `isInitialized === true`, evitando loops de redirecionamento
- [ ] **AUTH-03**: PaymentContext usa React Query para cache de status de acesso, eliminando re-renders infinitos
- [ ] **AUTH-04**: Sistema implementa três estados de loading: `loading` → `initialized` → `decisionMade`
- [ ] **AUTH-05**: Race conditions entre AuthContext e PaymentContext são resolvidas com sequenciamento adequado

### Painel Admin

- [ ] **ADMIN-01**: Painel admin exibe lista de usuários com status badges coloridos (verde=ativo, amarelo=pendente, vermelho=expirado, azul=manual)
- [ ] **ADMIN-02**: Admin pode conceder acesso manual a qualquer usuário com campo de motivo opcional
- [ ] **ADMIN-03**: Admin pode configurar expiração opcional para acesso manual (data ou sem expiração)
- [ ] **ADMIN-04**: Sistema revoga acesso (manual ou pago) com diálogo de confirmação antes de ação destrutiva
- [ ] **ADMIN-05**: Painel implementa busca de usuários por nome ou email
- [ ] **ADMIN-06**: Painel implementa filtros por tipo de acesso (pago/manual/grátis) e status (ativo/pendente/expirado)
- [ ] **ADMIN-07**: Sistema registra histórico completo de concessões/revogações com timestamp, admin responsável e motivo

### Segurança & Permissões

- [ ] **SEC-01**: Sistema valida role de admin no servidor (service role) antes de permitir operações de gestão
- [ ] **SEC-02**: Sistema nunca confia em `user_metadata` para autorização (armazena em tabela separada)
- [ ] **SEC-03**: RLS policies do Supabase permitem que admins leiam user_access e user_manual_access
- [ ] **SEC-04**: RLS policies bloqueiam usuários normais de modificarem user_access diretamente
- [ ] **SEC-05**: Operações de concessão/revogação auditam ação com admin user ID e timestamp

### Banco de Dados

- [ ] **DB-01**: Tabelas user_access e user_manual_access têm índices em user_id para performance (99.94% de melhoria)
- [ ] **DB-02**: RLS policies usam wrapper SELECT em vez de auth.uid() direto para otimização
- [ ] **DB-03**: Sistema implementa soft delete (is_active: false) ao invés de DELETE para manter audit trail
- [ ] **DB-04**: Queries verificam expires_at >= NOW() para acessos ativos

### Integrações

- [ ] **INT-01**: Webhook do MercadoPago atualiza tabela user_access corretamente após pagamento confirmado
- [ ] **INT-02**: Sistema garante que webhook é idempotente (repetições não criam acessos duplicados)
- [ ] **INT-03**: Dashboard redireciona usuários pagantes para guia após login bem-sucedido
- [ ] **INT-04**: Dashboard redireciona usuários não pagantes para checkout após login bem-sucedido

### UX & Performance

- [ ] **UX-01**: Painel admin atualiza status em tempo real sem refresh de página (React Query auto-refetch)
- [ ] **UX-02**: Sistema mostra mensagens de erro claras quando acesso é negado (não genéricas)
- [ ] **UX-03**: Loading states são exibidos durante validação de acesso (não redirecionamento prematuro)
- [ ] **UX-04**: Operações admin têm feedback otimista com rollback em caso de erro

## v2 Requirements

Funcionalidades deferidas para próximos milestones.

### Painel Admin - Avançado

- **ADMIN-V2-01**: Operações em lote (bulk) para concessão/revogação de múltiplos usuários
- **ADMIN-V2-02**: Dashboard administrativo com métricas e gráficos de acessos
- **ADMIN-V2-03**: Paginação para grandes datasets de usuários
- **ADMIN-V2-04**: Exportação de lista de usuários para CSV

### Notificações

- **NOTIF-V2-01**: Sistema envia email quando acesso manual é concedido
- **NOTIF-V2-02**: Sistema envia email quando acesso é revogado

## Out of Scope

Funcionalidades explicitamente excluídas deste milestone.

| Feature | Reason |
|---------|--------|
| Validação de acesso client-side | Risco de segurança, problemas de cache, bypass RLS |
| Edição direta no banco de dados | Bypassa audit trail, sem validação, quebra RLS |
| Contas admin ilimitadas | Risco de segurança, sem accountability |
| Edição inline na tabela | Complexo, race conditions, edições acidentais |
| Mudança de provedor de pagamento | Manter MercadoPago |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| SEC-01 | Phase 3 | Pending |
| SEC-02 | Phase 3 | Pending |
| SEC-03 | Phase 2 | Pending |
| SEC-04 | Phase 2 | Pending |
| SEC-05 | Phase 3 | Pending |
| DB-01 | Phase 2 | Pending |
| DB-02 | Phase 2 | Pending |
| DB-03 | Phase 3 | Pending |
| DB-04 | Phase 2 | Pending |
| INT-01 | Phase 1 | Pending |
| INT-02 | Phase 1 | Pending |
| INT-03 | Phase 1 | Pending |
| INT-04 | Phase 1 | Pending |
| ADMIN-01 | Phase 3 | Pending |
| ADMIN-02 | Phase 3 | Pending |
| ADMIN-03 | Phase 3 | Pending |
| ADMIN-04 | Phase 3 | Pending |
| ADMIN-05 | Phase 3 | Pending |
| ADMIN-06 | Phase 3 | Pending |
| ADMIN-07 | Phase 3 | Pending |
| UX-01 | Phase 3 | Pending |
| UX-02 | Phase 1 | Pending |
| UX-03 | Phase 1 | Pending |
| UX-04 | Phase 3 | Pending |

**Coverage:**
- v1.1 requirements: 25 total
- Mapped to phases: 0
- Unmapped: 25 ⚠️

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-04 after initial definition*
