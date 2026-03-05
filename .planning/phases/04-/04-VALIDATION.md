---
phase: 4
slug: admin-panel-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + React Testing Library + Playwright |
| **Config file** | `client/vitest.config.ts` |
| **Quick run command** | `pnpm test -- admin-filter` |
| **Full suite command** | `pnpm test` |
| **E2E command** | `playwright test admin-panel-search.spec.ts` |
| **Estimated runtime** | ~25 segundos

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- admin-filter`
- **After every plan wave:** Run `pnpm test` + `playwright test admin-panel-search.spec.ts`
- **Before `/gsd:verify-work`:** Full suite must be green (Vitest + Playwright)
- **Max feedback latency:** 30 segundos

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | ADMIN-05 | unit | `pnpm test -- useDebounce.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | UX-01, UX-04 | integration | `pnpm test -- useAdminMutations.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | ADMIN-06 | unit | `pnpm test -- UserFilters.test.tsx` | ❌ W0 | ⬜ pending |
| 04-01-04 | 01 | 1 | ADMIN-05, ADMIN-06 | integration | `pnpm test -- UserSearchInput.test.tsx` | ❌ W0 | ⬜ pending |
| 04-01-05 | 01 | 1 | ADMIN-05, ADMIN-06, UX-01 | e2e | `playwright test -g "search and filter workflow"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `client/src/hooks/__tests__/useDebounce.test.ts` — testes unitários para hook de debounce (timing, delay)
- [ ] `client/src/hooks/__tests__/useAdminMutations.test.ts` — testes de integração para mutations React Query (optimistic updates, rollback)
- [ ] `client/src/components/admin/__tests__/UserFilters.test.tsx` — testes de componente para lógica de filtros
- [ ] `client/src/components/admin/__tests__/UserSearchInput.test.tsx` — testes de componente para input de busca
- [ ] `e2e/admin-panel-search.spec.ts` — testes E2E para fluxos completos de busca e filtros
- [ ] `client/src/lib/query-client.ts` — setup do React Query (boilerplate, sem teste necessário)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Debounce reduz chamadas de API | ADMIN-05 | Requer observação de Network tab para medir redução de chamadas | 1. Abrir DevTools Network tab<br>2. Digitar texto no campo de busca<br>3. Observar que API NÃO é chamada a cada caractere<br>4. Verificar que API é chamada 300ms após parar de digitar<br>5. Confirmar redução de ~80% nas chamadas |
| Filtros funcionam corretamente | ADMIN-06 | Requer verificação visual de resultados filtrados | 1. Carregar painel admin com lista de usuários<br>2. Selecionar filtro "Status: Ativo"<br>3. Verificar que apenas usuários ativos aparecem<br>4. Adicionar filtro "Tipo: Manual"<br>5. Verificar que apenas usuários com ambos critérios aparecem |
| Atualização em tempo real | UX-01 | Requer observação de mudanças na UI sem refresh | 1. Abrir painel admin em duas abas/janelas<br>2. Na aba 1, conceder acesso para um usuário<br>3. Na aba 2, verificar que status do usuário muda instantaneamente<br>4. Verificar que não houve refresh de página<br>5. Confirmar que badge de status atualizou automaticamente |
| Feedback otimista com rollback | UX-04 | Requer teste de erro de rede e verificação de rollback | 1. Abrir DevTools Network tab<br>2. Ativar "Offline" ou throttling para simular erro<br>3. Tentar conceder acesso<br>4. Verificar que UI mostra sucesso imediatamente (feedback otimista)<br>5. Após erro, verificar que UI volta ao estado anterior (rollback)<br>6. Verificar toast de erro aparecendo |
| Busca por nome e email | ADMIN-05 | Requer teste com diferentes termos de busca | 1. Digitar email de usuário existente na busca<br>2. Verificar que usuário aparece nos resultados<br>3. Limpar busca e digitar primeiro nome<br>4. Verificar que usuário aparece nos resultados<br>5. Digitar termo inexistente<br>6. Verificar que "Nenhum usuário encontrado" aparece |

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
