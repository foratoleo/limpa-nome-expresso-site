# Supabase Operations Runbook (CLI + MCP)

Este guia evita retrabalho quando for necessário aplicar migrations, validar tabelas e corrigir ambiente de produção.

## 1) Pré-requisitos

Tenha estes dados em mãos:

- `SUPABASE_ACCESS_TOKEN` (formato `sbp_...`) para Supabase CLI
- `PROJECT_REF` (ex.: `dtbrzojuopcyfgmaybzt`)
- `DB_PASSWORD` (senha do Postgres do projeto)
- URL do projeto: `https://<PROJECT_REF>.supabase.co`

## 2) Autenticar e linkar projeto na CLI

```bash
export SUPABASE_ACCESS_TOKEN="sbp_xxx"
npx -y supabase@latest projects list --output json
npx -y supabase@latest link --project-ref <PROJECT_REF> -p '<DB_PASSWORD>' --workdir .
```

Arquivos de controle criados/atualizados localmente:

- `supabase/.temp/project-ref`
- `supabase/.temp/pooler-url`

## 3) Aplicar migrations

### Opção A (padrão): `db push`

Use quando seus arquivos seguirem padrão timestamp do Supabase (`YYYYMMDDHHMMSS_name.sql`).

```bash
npx -y supabase@latest db push --workdir .
```

### Opção B (cirúrgica): rodar 1 arquivo SQL específico

Use quando o repositório tiver migrations sem timestamp (ex.: `002_*.sql`) e você não quiser empurrar tudo.

```bash
node --input-type=module - <<'NODE'
import fs from 'fs';
import pg from 'pg';
const { Client } = pg;

const sql = fs.readFileSync('supabase/migrations/002_checklist_documents.sql', 'utf8');

const client = new Client({
  host: 'aws-1-us-east-2.pooler.supabase.com',
  port: 5432,
  user: 'postgres.<PROJECT_REF>',
  password: '<DB_PASSWORD>',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

await client.connect();
await client.query('begin');
await client.query(sql);
await client.query('commit');
await client.end();
console.log('Migration aplicada com sucesso');
NODE
```

## 4) Validar se a migration entrou

### Validação SQL

```sql
select to_regclass('public.checklist_documents');
select policyname
from pg_policies
where schemaname='public' and tablename='checklist_documents'
order by policyname;
```

### Validação REST (via service role)

```bash
set -a; source .env.local; set +a
node - <<'NODE'
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const q = new URLSearchParams({ select: 'id', limit: '1' });
const res = await fetch(`${url}/rest/v1/checklist_documents?${q}`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` }
});
console.log('status', res.status);
console.log('body', await res.text());
NODE
```

Esperado: `status 200`.

## 5) MCP do Supabase (quando usar)

O MCP do Supabase exige OAuth válido. Sem token, responde `401 Unauthorized`.

Checklist rápido:

- Confirmar `.mcp.json` com `project_ref` correto
- Garantir sessão OAuth ativa para MCP no ambiente da ferramenta
- Se MCP falhar, usar CLI + DB password (fluxo acima)

## 6) Pós-migration em produção

1. Confirmar variáveis no provedor de deploy (ex.: Netlify):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Fazer deploy de produção.
3. Testar página afetada e logs de função.

## 7) Troubleshooting rápido

- `Access token not provided` (CLI): faltou `SUPABASE_ACCESS_TOKEN`.
- `Invalid access token format`: token não é `sbp_...`.
- `PGRST205 table not found`: migration ainda não foi aplicada no banco alvo.
- `EHOSTUNREACH` no host `db.<ref>.supabase.co`: tente via pooler `aws-1-<region>.pooler.supabase.com`.
- `/api/payments/status 404` em Netlify: revisar redirect/função em `netlify/functions/api.ts` e redeploy.

## 8) Segurança

- Nunca commitar token `sbp_...`, `service_role` ou senha do Postgres.
- Usar placeholders em documentação e scripts versionados.
- Rotacionar credenciais se houver exposição em terminal/log.
