---
phase: 2
slug: database-security-performance
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Supabase test client |
| **Config file** | `server/tests/vitest.config.ts` |
| **Quick run command** | `pnpm test -- server/tests/database` |
| **Full suite command** | `pnpm test -- server/tests/` |
| **Estimated runtime** | ~10 segundos |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- server/tests/database`
- **After every plan wave:** Run `pnpm test -- server/tests/`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 20 segundos

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | DB-01 | integration | `pnpm test -- server/tests/indexes.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | SEC-03, SEC-04 | integration | `pnpm test -- server/tests/rls-policies.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | DB-02, DB-04 | integration | `pnpm test -- server/tests/query-performance.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `server/tests/database/indexes.test.ts` — testes de verificação de índices
- [ ] `server/tests/database/rls-policies.test.ts` — testes de políticas RLS
- [ ] `server/tests/database/query-performance.test.ts` — testes de performance
- [ ] `server/tests/fixtures/` — fixtures de teste para banco de dados

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin lê tabelas de acesso | SEC-03 | Requer contexto Supabase autenticado | 1. Login como admin<br>2. Executar query via Supabase client<br>3. Verificar que user_access é retornado<br>4. Confirmar que user_manual_access é retornado |
| Usuário normal não modifica tabelas | SEC-04 | Requer tentativa de modificação (deve falhar) | 1. Login como usuário normal<br>2. Tentar UPDATE em user_access via Supabase client<br>3. Verificar que erro é retornado<br>4. Confirmar que soft delete funciona (is_active: false) |
| Queries < 100ms | DB-01 | Requer medição de performance real | 1. Executar EXPLAIN ANALYZE em queries de acesso<br>2. Medir tempo de execução<br>3. Verificar que índices estão sendo usados<br>4. Confirmar tempo < 100ms |
| Acesso expirado é excluído | DB-04 | Requer teste com data expirada | 1. Inserir registro de acesso com expires_at no passado<br>2. Executar query para acessos ativos<br>3. Verificar que registro expirado NÃO aparece<br>4. Confirmar que NOW() está sendo usado corretamente |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

---

*Validation strategy created: 2026-03-04*
