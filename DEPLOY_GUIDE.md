# 🚀 Deploy Guide - Limpa Nome Expresso Site

## Status da Configuração

✅ **Build do projeto**: Concluído com sucesso
✅ **Arquivos de configuração Netlify**: Criados
✅ **Handler para Functions**: Implementado
⚠️ **Netlify CLI**: Não instalado localmente

---

## 📋 Opções de Deploy

### Opção 1: Deploy via Git Connect (Mais Fácil)

Esta é a **recomendada** para a maioria dos casos.

#### Pré-requisitos
- Repositório Git (GitHub, GitLab, Bitbucket)
- Conta no Netlify (grátis)

#### Passos

1. **Prepare seu repositório**
   ```bash
   # Certifique-se de que todos os arquivos estão commitados
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push
   ```

2. **Conecte no Netlify**
   - Acesse: https://app.netlify.com/start
   - Escolha "Import from Git"
   - Selecione seu provedor Git
   - Escolha o repositório `limpa-nome-expresso-site`

3. **Configure as build settings**
   ```
   Build command: pnpm build
   Publish directory: dist/public
   ```

4. **Configure as variáveis de ambiente**

   No dashboard do Netlify, vá em **Site Settings > Environment Variables** e adicione:

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

5. **Deploy**
   - Clique em "Deploy Site"
   - Aguarde o build (aprox. 2-3 minutos)
   - Seu site estará disponível em `https://seu-site.netlify.app`

---

### Opção 2: Deploy via Netlify CLI

#### Instalação

```bash
npm install -g netlify-cli
```

#### Login

```bash
netlify login
```

#### Deploy

```bash
# Deploy de preview (para testes)
netlify deploy

# Deploy de produção
netlify deploy --prod
```

---

### Opção 3: Deploy Manual (Drag & Drop)

1. **Build do projeto**
   ```bash
   pnpm build
   ```

2. **Prepare os arquivos**
   - Acesse a pasta `dist/public`
   - Compacte todos os arquivos em `.zip`

3. **Upload no Netlify**
   - Acesse: https://app.netlify.com/drop
   - Arraste a pasta `dist/public` ou o arquivo `.zip`
   - Aguarde o upload

**⚠️ Limitação**: Esta opção NÃO inclui o backend (functions), apenas o frontend estático.

---

## 🔧 Configuração do Backend (Netlify Functions)

O projeto já vem com o handler para Netlify Functions em `netlify/functions/api.ts`.

### Como Funciona

1. **Express API** → Convertida para **Netlify Function**
2. **Rotas** → `/api/*` → Redirecionadas para a function
3. **Middleware** → Suporta CORS, JSON parsing, etc.

### Testando Localmente

```bash
# Instalar dependências do function
npm install --save-dev @netlify/functions

# Testar functions localmente
npx netlify dev

# Ou usar o Netlify CLI
netlify dev
```

---

## 📊 Comparação de Plataformas

| Recurso | Netlify | Vercel | Railway | Render |
|---------|---------|--------|---------|--------|
| **Preço** | Grátis | Grátis | $5/mês | Grátis |
| **Functions** | 125k req/mês | 100k req/mês | N/A | N/A |
| **CDN** | ✅ Global | ✅ Global | ❌ | ❌ |
| **Suporte Express** | ✅ Functions | ✅ API Routes | ✅ Server | ✅ Server |
| **Cold Starts** | Sim | Sim | Não | Não |
| **WebSocket** | ❌ | ❌ | ✅ | ✅ |
| **Dificuldade** | ⭐⭐ | ⭐ | ⭐ | ⭐ |

---

## 🎯 Recomendações

### Para Desenvolvimento/Testes
Use **Netlify** (Grátis e rápido)
- Git Connect integration
- Deploy automático
- Preview URLs

### Para Produção (Baixo/Médio Tráfego)
Use **Netlify** ou **Vercel**
- Escala automaticamente
- Pay-per-use
- CDN global

### Para Produção (Alto Tráfego)
Use **Railway** ou **Render**
- Servidor dedicado
- Suporte a WebSocket
- Sem cold starts

---

## 🔐 Variáveis de Ambiente

Configure estas variáveis no Netlify (Site Settings > Environment Variables):

### Supabase (Obrigatório)
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=chave-anonima
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=chave-service-role
```

### Stripe (Opcional)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### EmailIt (Opcional)
```
EMAILIT_API_KEY=sua-chave
EMAILIT_DEFAULT_FROM=noreply@seudominio.com
```

---

## 📝 Checklist de Deploy

- [ ] Build do projeto funcionando localmente
- [ ] Repositório Git configurado
- [ ] Conta criada no Netlify
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy de teste realizado
- [ ] URLs de preview verificadas
- [ ] Deploy de produção realizado
- [ ] Monitoramento configurado

---

## 🐛 Troubleshooting

### Erro: "Build falhou"
**Solução**: Verifique se o comando `pnpm build` funciona localmente
```bash
pnpm build
```

### Erro: "API retorna 404"
**Solução**:
1. Verifique se `netlify/functions/api.ts` existe
2. Confirme que as rotas estão corretas no arquivo

### Erro: "Environment variables not set"
**Solução**: Configure todas as variáveis no dashboard do Netlify

### Functions não funcionando
**Solução**: Verifique os logs no Netlify Dashboard
```
Netlify Dashboard > Functions > [function-name] > Logs
```

---

## 📚 Documentação Adicional

- **Netlify Functions**: https://docs.netlify.com/functions/create/
- **Netlify CLI**: https://docs.netlify.com/cli/get-started/
- **Git Integration**: https://docs.netlify.com/site-deploys/create-deploys/#deploy-with-git
- **Environment Variables**: https://docs.netlify.com/site-deploys/environment-variables/

---

## 🆘 Suporte

Se precisar de ajuda:
1. Verifique os logs de deploy no Netlify Dashboard
2. Consulte a documentação oficial
3. Abra uma issue no repositório do projeto

---

**Última atualização**: 2025-01-21

**Status**: ✅ Configuração pronta para deploy
