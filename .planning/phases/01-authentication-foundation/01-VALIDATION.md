---
phase: 1
slug: authentication-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (já instalado) + React Testing Library |
| **Config file** | `client/vitest.config.ts` |
| **Quick run command** | `pnpm test -- src/contexts/auth` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 segundos |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- src/contexts/auth`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 segundos

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | AUTH-01 | integration | `pnpm test -- api/payments/status.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | AUTH-02 | integration | `pnpm test -- components/auth/ProtectedRoute.test.tsx` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | AUTH-03 | integration | `pnpm test -- hooks/useAccessStatus.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `client/src/hooks/useAccessStatus.test.ts` — testes para hook de acesso
- [ ] `client/src/components/auth/__tests__/ProtectedRoute.test.tsx` — testes para ProtectedRoute
- [ ] `client/src/api/payments.test.ts` — testes para API de status
- [ ] `client/src/contexts/auth/__tests__/AuthContext.test.tsx` — testes para AuthContext (se não existir)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Usuário loga sem loop de redirect | AUTH-02 | Envolvimento de navegador completo | 1. Login como forato@gmail.com<br>2. Verificar redirecionamento para Dashboard<br>3. Fazer logout e login como usuário sem acesso<br>4. Verificar redirecionamento para Checkout |
| Webhook MercadoPago atualiza acesso | INT-01 | Requer webhook externo | 1. Usar painel MercadoPago ou endpoint de teste<br>2. Simular pagamento aprovado<br>3. Verificar registro em user_access<br>4. Confirmar que usuário ganha acesso |
| Cache invalida corretamente | AUTH-01, AUTH-03 | Requer observação de comportamento | 1. Fazer login e observar timestamp de cache<br>2. Conceder acesso manual via Supabase<br>3. Verificar se cache invalida e atualiza UI |

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
