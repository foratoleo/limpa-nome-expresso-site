# External Integrations

**Analysis Date:** 2026-02-25

## APIs & External Services

**Mapping & Geolocation:**
- Google Maps Platform - Interactive maps component
  - SDK/Client: Google Maps JavaScript API (via custom proxy)
  - Libraries: marker, places, geocoding, geometry
  - Implementation: `/client/src/components/Map.tsx`
  - Proxy: Butterfly Effect Forge (`https://forge.butterflyeffect.dev/v1/maps/proxy`)
  - Auth: `VITE_FRONTEND_FORGE_API_KEY` environment variable
  - Type definitions: `@types/google.maps@^3.58.1`

**Authentication (configured but not actively used in current codebase):**
- OAuth Portal - External authentication service
  - Environment variables: `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID`
  - Redirect URI pattern: `{origin}/api/oauth/callback`
  - Implementation: `/client/src/const.ts` (getLoginUrl function)

## Data Storage

**Databases:**
- None - Static site with no database integration

**Client-Side Storage:**
- localStorage - Checklist progress persistence
  - Key: `limpa-nome-checklist`
  - Implementation: `/client/src/pages/Home.tsx` (useChecklist hook)
  - Data: JSON object mapping item IDs to boolean completion state

**File Storage:**
- Local filesystem - Static markdown documents
  - Location: `/client/public/docs/`
  - Files:
    - `checklist_documentos.md` - Complete document checklist
    - `peticao_inicial_jec_sp.md` - JEC SP initial petition template
    - `roteiro_balcao_virtual.md` - Virtual counter speaking script
  - Served via Express static middleware or Vite dev server

**Caching:**
- None - No caching layer implemented

## Authentication & Identity

**Auth Provider:**
- Custom OAuth integration (configured but not actively used)
  - Implementation: External OAuth Portal service
  - Cookie name: `app_session_id` (defined in `/shared/const.ts`)
  - Cookie duration: ONE_YEAR_MS (365 days)
  - Note: Authentication infrastructure exists but current site is public/read-only

## Monitoring & Observability

**Error Tracking:**
- Console-based error logging
- Custom debug collector plugin for development (`vitePluginManusDebugCollector` in `vite.config.ts`)

**Logs:**
- Manus Debug Collector - Development-only browser log collection
  - Logs written to: `/.manus-logs/`
  - Files: `browserConsole.log`, `networkRequests.log`, `sessionReplay.log`
  - Max size: 1MB per file (auto-trims to 60%)
  - Endpoint: `POST /__manus__/logs` (dev only)
  - Injected script: `/__manus__/debug-collector.js` (dev only)

## CI/CD & Deployment

**Hosting:**
- Not detected - Configuration not present in codebase
- Build output: `/dist/public` (static files)

**CI Pipeline:**
- None detected - No GitHub Actions, GitLab CI, or similar configuration files

## Environment Configuration

**Required env vars:**
- `VITE_FRONTEND_FORGE_API_KEY` - Google Maps API proxy authentication
- `VITE_FRONTEND_FORGE_API_URL` - Forge API base URL (optional, defaults to https://forge.butterflyeffect.dev)
- `VITE_OAUTH_PORTAL_URL` - OAuth portal URL (not actively used)
- `VITE_APP_ID` - OAuth application ID (not actively used)
- `PORT` - Server port (optional, defaults to 3000)
- `NODE_ENV` - Environment mode (development/production)

**Secrets location:**
- Environment variables via import.meta.env (Vite convention)
- No .env files committed to repository (per .gitignore)
- No secrets management integration detected

## Webhooks & Callbacks

**Incoming:**
- `/api/oauth/callback` - OAuth callback route (configured but route handler not implemented in current server code)

**Outgoing:**
- None - Site is static/read-only with no external API calls

## External Links (User-Facing)

The site links to external government services:
- TJSP Peticionamento JEC: https://www.tjsp.jus.br/peticionamentojec
- TJSP Balcão Virtual: https://www.tjsp.jus.br/balcaovirtual
- e-SAJ Process Search: https://esaj.tjsp.jus.br/cpopg/open.do
- Serasa (credit check): https://www.serasa.com.br

These are informational links only - no API integration with these services.

---

*Integration audit: 2026-02-25*
