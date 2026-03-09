# Autopilot Implementation Plan: Mobile Responsiveness

## Workstreams

### 1. Shared Navigation
- Criar um componente de header responsivo reutilizável.
- Suportar:
  - logo
  - links desktop
  - drawer/sheet mobile com links principais
  - slot para ações no desktop
  - composição estável para CTA de assessoria e perfil no mobile

### 2. Page Adoption
- Aplicar o header compartilhado às páginas públicas e autenticadas que hoje duplicam markup.
- Manter estados locais de busca/auth/profile já existentes.

### 3. Route-Specific Fixes
- `/guia`: melhorar experiência da trilha horizontal no mobile.
- `/dashboard`: trocar tabs comprimidas por navegação móvel com melhor leitura e toque.
- Ajustar containers e espaçamentos onde o topo ficar apertado após o novo header.

### 4. Verification
- `pnpm check`
- Auditoria com Playwright inline em viewport mobile nas rotas principais.
- Revisão paralela de arquitetura/qualidade antes de encerrar.
