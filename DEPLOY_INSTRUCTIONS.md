# Instruções de Deploy - Limpa Nome Expresso Site

## Status Atual
✅ Deploy realizado: https://limpa-nome-expresso-site.netlify.app

## Problemas Encontrados e Soluções

### 1. Endpoint de Debug (/__manus__/logs) - 404
**Causa:** Este endpoint é apenas para desenvolvimento local.
**Solução:** Removido do código de produção.

### 2. API Functions retornando 502
**Causa:** Servidor Express incompatível com Netlify Functions.
**Solução:** Criada API simplificada em `netlify/functions/api.ts`

### 3. Variáveis de Ambiente não configuradas
**Solução:** Configure no painel do Netlify (instruções abaixo)

---

## Configuração das Variáveis de Ambiente no Netlify

### Passo 1: Acesse o Painel do Netlify
```
https://app.netlify.com/sites/limpa-nome-expresso-site/settings/deploys
```

### Passo 2: Adicione as Variáveis de Ambiente

#### Variáveis Obrigatórias (Supabase)
```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

**Como obter essas credenciais:**
1. Acesse https://supabase.com
2. Crie um novo projeto ou use existente
3. Vá em Settings > API
4. Copie a URL e a chave `anon/public`

#### Variáveis Opcionais (Mailit - se usar email)
```bash
VITE_MAILIT_API_KEY=sua_chave_api_mailit
VITE_MAILIT_FROM_EMAIL=seu_email@example.com
```

#### Outras Configurações
```bash
VITE_API_BASE_URL=https://limpa-nome-expresso-site.netlify.app
```

### Passo 3: Fazer Novo Deploy
```bash
netlify deploy --prod --dir=dist/public --message="Deploy com env vars configuradas"
```

Ou via painel do Netlify:
1. Vá em "Deploys"
2. Clique em "Deploy site"

---

## Teste o Deploy

### URLs de Produção
- **Site Principal:** https://limpa-nome-expresso-site.netlify.app
- **API Health Check:** https://limpa-nome-expresso-site.netlify.app/api/health
- **Logs do Deploy:** https://app.netlify.com/sites/limpa-nome-expresso-site/deploys

### Teste Manual
```bash
# Testar API Health
curl https://limpa-nome-expresso-site.netlify.app/api/health

# Testar Registro (simulado)
curl -X POST https://limpa-nome-expresso-site.netlify.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Testar Contact (simulado)
curl -X POST https://limpa-nome-expresso-site.netlify.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
```

---

## Troubleshooting

### 502 Bad Gateway na API
**Causa:** Variáveis de ambiente não configuradas
**Solução:** Configure as variáveis conforme instrução acima

### Erro de Import Module
**Causa:** Servidor Express incompatível
**Solução:** Já corrigido com API simplificada

### Debug Logs em Produção
**Causa:** Chamadas para endpoint de debug
**Solução:** Removido do código de produção

---

## Próximos Passos

1. **Configure o Supabase** (obrigatório para auth funcional)
2. **Teste a API** usando os comandos acima
3. **Configure domínio customizado** (opcional)
4. **Monitore os logs** no painel do Netlify

---

## Links Úteis

- **Netlify Functions Docs:** https://docs.netlify.com/functions/create/
- **Environment Variables:** https://docs.netlify.com/site-settings/deploys/
- **Supabase Docs:** https://supabase.com/docs
- **Site no Netlify:** https://app.netlify.com/sites/limpa-nome-expresso-site
