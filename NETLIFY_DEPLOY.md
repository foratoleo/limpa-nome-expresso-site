# Deploy no Netlify - Instruções de Configuração

## Problemas Encontrados e Soluções

### 1. Endpoint de Debug (/__manus__/logs)
**Problema:** 404 Not Found
**Solução:** Este endpoint é apenas para desenvolvimento. Em produção, essas chamadas devem ser desabilitadas.

### 2. API Functions retornando 502
**Problema:** Variáveis de ambiente não configuradas
**Solução:** Configure no painel do Netlify

## Configuração das Variáveis de Ambiente no Netlify

1. Acesse: https://app.netlify.com/sites/limpa-nome-expresso-site/settings/deploys
2. Clique em "Environment variables"
3. Adicione as seguintes variáveis:

### Supabase (OBRIGATÓRIO)
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

### Mailit (se aplicável)
```
VITE_MAILIT_API_KEY=sua_chave_api_mailit
VITE_MAILIT_FROM_EMAIL=seu_email@example.com
```

### Outras Configurações
```
VITE_API_BASE_URL=https://limpa-nome-expresso-site.netlify.app
```

## Deploy Atualizado

Após configurar as variáveis, faça um novo deploy:

```bash
netlify deploy --prod --dir=dist/public --message="Deploy com env vars configuradas"
```

## Teste o Deploy

- **URL Principal:** https://limpa-nome-expresso-site.netlify.app
- **API Health Check:** https://limpa-nome-expresso-site.netlify.app/.netlify/functions/api
- **Logs do Deploy:** https://app.netlify.com/sites/limpa-nome-expresso-site/deploys

## Troubleshooting

### 502 Bad Gateway na API
- Verifique se as variáveis de ambiente foram configuradas
- Confira os logs da function em: Site Settings > Functions > Logs

### Erro de Import Module
- Execute `pnpm build` localmente para verificar erros
- Verifique se o arquivo `server/index.ts` existe e está correto

### Debug Logs em Produção
- Remova ou comente chamadas para `/__manus__/logs` no código cliente
- Use environment variables para desabilitar debug em produção

## Links Úteis

- **Netlify Functions Docs:** https://docs.netlify.com/functions/create/
- **Environment Variables:** https://docs.netlify.com/site-settings/deploys/
- **Site no Netlify:** https://app.netlify.com/sites/limpa-nome-expresso-site
