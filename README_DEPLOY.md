# Deploy Options for Limpa Nome Expresso Site

Este projeto é uma aplicação **Vite + Express** que requer um backend para processar requisições da API. Abaixo estão as opções de deploy disponíveis:

---

## 🚀 Opção 1: Netlify Functions (Recomendado)

**Prós:**
- ✅ Escalabilidade automática
- ✅ Pay-per-use (só paga pelo que usar)
- ✅ CDN global integrado
- ✅ Deploy contínuo via Git

**Contras:**
- ⚠️ Requer adaptação do código Express para Functions
- ⚠️ Timeout de 10 segundos para funções
- ⚠️ Cold starts pode adicionar latência

### Configuração

O projeto já vem com configuração prévia para Netlify:
- `netlify.toml` - Configurações de build
- `netlify/functions/api.ts` - Handler para Express API

### Passos para Deploy

1. **Instale o Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Faça login no Netlify:**
   ```bash
   netlify login
   ```

3. **Inicialize o projeto:**
   ```bash
   netlify init
   ```

4. **Configure as variáveis de ambiente** no dashboard do Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - (e outras variáveis necessárias)

5. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

**Documentação:** https://docs.netlify.com/functions/create/

---

## 🎯 Opção 2: Vercel (Alternativa Excelente)

**Prós:**
- ✅ Suporte nativo a Express através de Next.js API Routes
- ✅ Zero config para most apps
- ✅ Deploy automático via Git
- ✅ Edge Functions para performance global

**Contras:**
- ⚠️ Plataforma diferente do Netlify

### Configuração

1. **Instale o Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

**Documentação:** https://vercel.com/docs

---

## 🚂 Opção 3: Railway/Render (Servidor Tradicional)

**Prós:**
- ✅ Zero mudanças no código
- ✅ Suporta WebSocket e conexões longas
- ✅ Ambiente completo de Node.js

**Contras:**
- 💰 Custos mais altos (plano pago necessário)
- ⚠️ Menos escalável que serverless

### Plataformas

- **Railway:** https://railway.app
- **Render:** https://render.com

### Deploy no Railway

1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Deploy automático

### Deploy no Render

1. Conecte seu repositório
2. Configure como "Web Service"
3. Build Command: `pnpm build`
4. Start Command: `pnpm start`

---

## 📊 Comparação de Custos

| Plataforma | Preço | Bandeiriça | Functions | Escalabilidade |
|-----------|-------|------------|-----------|----------------|
| Netlify | Grátis $0/mês | 100 GB | 125k req/mês | ⭐⭐⭐⭐⭐ |
| Vercel | Grátis $0/mês | 100 GB | 100k req/mês | ⭐⭐⭐⭐⭐ |
| Railway | $5/mês | Ilimitada | N/A | ⭐⭐⭐ |
| Render | Grátis $0/mês | 750h/mês | N/A | ⭐⭐⭐ |

---

## 🎓 Recomendação

Para **desenvolvimento e testes**: Use **Netlify** (mais rápido e grátis)

Para **produção com alto tráfego**: Considere **Vercel** ou **Railway**

Para **zero mudanças no código**: Use **Railway** ou **Render**

---

## 📝 Notas Importantes

### Environment Variables

Todas as plataformas requerem as mesmas variáveis de ambiente:
- Supabase URL e Keys
- Stripe API Keys (se aplicável)
- EmailIt API Key (se aplicável)

### Database

Este projeto usa **Supabase** como banco de dados. Certifique-se de:
1. Criar um projeto Supabase
2. Configurar as variáveis de ambiente
3. Executar as migrations necessárias

### Suporte

- Netlify: https://docs.netlify.com
- Vercel: https://vercel.com/docs
- Railway: https://docs.railway.app
- Render: https://render.com/docs
