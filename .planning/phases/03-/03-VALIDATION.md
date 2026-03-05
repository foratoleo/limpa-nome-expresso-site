---
phase: 3
slug: admin-panel-core
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + React Testing Library + Playwright |
| **Config file** | `client/vitest.config.ts` |
| **Quick run command** | `pnpm test -- admin` |
| **Full suite command** | `pnpm test` |
| **E2E command** | `playwright test` |
| **Estimated runtime** | ~20 segundos |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- admin`
- **After every plan wave:** Run `pnpm test` + `playwright test admin-panel.spec.ts`
- **Before `/gsd:verify-work`:** Full suite must be green (Vitest + Playwright)
- **Max feedback latency:** 30 segundos

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | ADMIN-01 | unit | `pnpm test -- UserStatusBadge.test.tsx` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | ADMIN-04 | unit | `pnpm test -- RevokeConfirmDialog.test.tsx` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | SEC-01, SEC-02, SEC-05 | integration | `pnpm test -- admin-access.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 1 | ADMIN-02, ADMIN-03, ADMIN-07 | integration | `pnpm test -- admin-users.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-05 | 01 | 1 | ADMIN-01, ADMIN-04 | e2e | `playwright test -g "admin panel workflow"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `client/src/components/admin/__tests__/UserStatusBadge.test.tsx` — testes unitários para badge de status
- [ ] `client/src/components/admin/__tests__/RevokeConfirmDialog.test.tsx` — testes de componente para diálogo de confirmação
- [ ] `server/routes/__tests__/admin-access.test.ts` — testes de integração para API de acesso admin
- [ ] `server/routes/__tests__/admin-users.test.ts` — testes de integração para API de listagem de usuários
- [ ] `e2e/admin-panel.spec.ts` — testes E2E para fluxos completos do painel admin (grant, revoke, confirm)
- [ ] `client/src/test-utils.tsx` — utilitários de teste compartilhados (se não existir)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cores corretas dos badges | ADMIN-01 | Requer verificação visual de cores (verde, amarelo, vermelho, azul) | 1. Acessar painel admin<br>2. Verificar usuários com status "Ativo" (badge verde)<br>3. Verificar usuários com status "Pendente" (badge amarelo)<br>4. Verificar usuários com status "Expirado" (badge vermelho)<br>5. Verificar usuários com status "Manual" (badge azul) |
| Diálogo de confirmação aparece | ADMIN-04 | Requer interação humana para confirmar UX do diálogo | 1. Listar usuários no painel admin<br>2. Clicar em botão "Revogar acesso"<br>3. Verificar que diálogo de confirmação aparece<br>4. Verificar mensagem de warning clara<br>5. Clicar "Cancelar" e confirmar que ação NÃO foi executada |
| Concessão de acesso com motivo | ADMIN-02, ADMIN-07 | Requer input de texto opcional e verificação de audit trail | 1. Clicar "Conceder acesso" para um usuário<br>2. Preencher email e motivo (ex: "Suporte VIP")<br>3. Submeter formulário<br>4. Verificar no banco de dados que `reason` foi salvo<br>5. Verificar que `granted_by` contém ID do admin |
| Expiração configurável funciona | ADMIN-03 | Requer teste com data futura e verificação de expiração | 1. Conceder acesso com data de expiração para amanhã<br>2. Verificar que `expires_at` foi salvo corretamente<br>3. Simular passagem de tempo (UPDATE expires_at para passado)<br>4. Recarregar painel e verificar que status mudou para "Expirado" |
| Validação de admin no servidor | SEC-01, SEC-02 | Requer tentativa de acesso não autorizado | 1. Remover role "admin" de `user_metadata` no Supabase<br>2. Tentar chamar `/api/admin/users` sem token admin<br>3. Verificar que retorna 403 Forbidden<br>4. Tentar chamar com token de usuário normal<br>5. Verificar que retorna 403 Forbidden |
| Audit trail preservado após revogação | ADMIN-07, DB-03 | Requer verificação de soft delete e histórico | 1. Revogar acesso de um usuário<br>2. Verificar no banco que `is_active: false`<br>3. Verificar que `revoked_at` e `revoked_by` foram preenchidos<br>4. Consultar histórico e confirmar que registro ainda existe<br>5. Verificar que não é possível ver registro na lista de ativos |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

---

*Validation strategy created: 2026-03-04*
