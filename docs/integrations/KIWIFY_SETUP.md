# Guia de Configuracao Kiwify - CPF Blindado

## Credenciais da Conta

| Campo | Valor |
|-------|-------|
| **Client ID** | `21f3b7c4-2734-44d5-9923-7de0848558bb` |
| **Client Secret** | `4232bee972fe8026f3e3a9eab201dfeb2317e2b602158822a55136ff5b8e85bb` |
| **Account ID** | `QVfvaU7dhwBCh5X` |

---

## Passo 1: Acessar o Dashboard Kiwify

1. Acesse [https://kiwify.com.br](https://kiwify.com.br)
2. Faca login com sua conta
3. Va para **Meus Produtos**

---

## Passo 2: Criar o Produto

### 2.1 Criar Novo Produto

1. Clique em **Criar Produto**
2. Selecione o tipo **Produto Digital**

### 2.2 Configurar Produto Principal

| Campo | Valor |
|-------|-------|
| **Nome do Produto** | CPF Blindado - Acesso Premium 12 Meses |
| **Preco** | R$ 149,90 |
| **Tipo de Cobranca** | Unica (One-time) |
| **Descricao Curta** | Acesso premium a plataforma CPF Blindado por 12 meses |

### 2.3 Configurar Slug do Produto

O slug do produto deve ser: **`cpf-blindado-premium`**

Este slug sera usado na URL de checkout: `https://pay.kiwify.com.br/cpf-blindado-premium`

### 2.4 Configurar URLs de Redirecionamento

| Campo | Valor |
|-------|-------|
| **URL de Sucesso** | `https://cpfblindado.com/checkout/sucesso?source=kiwify` |
| **URL de Falha** | `https://cpfblindado.com/checkout/falha?source=kiwify` |

> **Nota:** Substitua `cpfblindado.com` pelo dominio de producao

---

## Passo 3: Configurar API e Webhooks

### 3.1 Obter Credenciais API

1. Va em **Configuracoes** > **API**
2. Clique em **Criar API Key** (se ja existir, use as credenciais acima)

As credenciais ja devem estar configuradas:
- Client ID: `21f3b7c4-2734-44d5-9923-7de0848558bb`
- Client Secret: `4232bee972fe8026f3e3a9eab201dfeb2317e2b602158822a55136ff5b8e85bb`

### 3.2 Configurar Webhook

1. Va em **Configuracoes** > **Webhooks**
2. Clique em **Adicionar Webhook**

| Campo | Valor |
|-------|-------|
| **URL do Webhook** | `https://api.cpfblindado.com/api/webhooks/kiwify` |
| **Token de Verificacao** | Gerar token seguro (ver secao abaixo) |

### 3.3 Eventos de Webhook a Selecionar

Marque os seguintes eventos:

- [x] **compra_aprovada** - Pagamento aprovado
- [x] **compra_recusada** - Pagamento recusado
- [x] **compra_reembolsada** - Reembolso solicitado
- [x] **chargeback** - Chargeback recebido
- [x] **subscription_canceled** - Assinatura cancelada (opcional)
- [x] **subscription_renewed** - Assinatura renovada (opcional)

### 3.4 Gerar Token de Webhook

Execute o comando abaixo para gerar um token seguro:

```bash
openssl rand -hex 32
```

Guarde este token em seguranca - ele sera usado para validar os webhooks.

---

## Passo 4: Configurar Variaveis de Ambiente

Adicione as seguintes variaveis no seu ambiente de producao:

```env
# Kiwify API Credentials
KIWIFY_CLIENT_ID=21f3b7c4-2734-44d5-9923-7de0848558bb
KIWIFY_CLIENT_SECRET=4232bee972fe8026f3e3a9eab201dfeb2317e2b602158822a55136ff5b8e85bb
KIWIFY_ACCOUNT_ID=QVfvaU7dhwBCh5X

# Webhook Token (gerar com openssl rand -hex 32)
KIWIFY_WEBHOOK_TOKEN=SEU_TOKEN_WEBHOOK_AQUI

# Product Configuration
KIWIFY_PRODUCT_SLUG=cpf-blindado-premium
```

### 4.1 Netlify

Va em **Site Settings** > **Environment Variables** e adicione as variaveis.

### 4.2 Supabase

Va em **Project Settings** > **Edge Functions** > **Environment Variables** e adicione as variaveis.

---

## Passo 5: Testar a Integracao

### 5.1 Testar Conexao API

```bash
# Obter token OAuth
curl -X POST https://public-api.kiwify.com/v1/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "21f3b7c4-2734-44d5-9923-7de0848558bb",
    "client_secret": "4232bee972fe8026f3e3a9eab201dfeb2317e2b602158822a55136ff5b8e85bb"
  }'
```

Resposta esperada:
```json
{
  "access_token": "...",
  "token_type": "Bearer",
  "expires_in": 345600
}
```

### 5.2 Testar Webhook

```bash
# Testar endpoint do webhook
curl -X POST https://api.cpfblindado.com/api/webhooks/kiwify \
  -H "Content-Type: application/json" \
  -H "x-kiwify-token: SEU_TOKEN_WEBHOOK" \
  -d '{
    "event": "compra_aprovada",
    "sale_id": "test_123456",
    "customer": {
      "email": "teste@exemplo.com",
      "name": "Cliente Teste"
    }
  }'
```

### 5.3 Testar Checkout

Acesse a URL de checkout:
```
https://pay.kiwify.com.br/cpf-blindado-premium?email=cliente@exemplo.com
```

---

## Passo 6: Checklist de Producao

Antes de ir para producao, verifique:

- [ ] Produto criado no Kiwify com slug `cpf-blindado-premium`
- [ ] Preco configurado: R$ 149,90
- [ ] URLs de redirecionamento configuradas
- [ ] Webhook configurado com URL correta
- [ ] Todos os eventos de webhook selecionados
- [ ] Variaveis de ambiente configuradas
- [ ] Token de webhook gerado e configurado
- [ ] Teste de conexao API realizado com sucesso
- [ ] Teste de webhook realizado com sucesso
- [ ] Teste de checkout realizado com sucesso

---

## URLs de Referencia

| Ambiente | URL |
|----------|-----|
| **Checkout** | `https://pay.kiwify.com.br/cpf-blindado-premium` |
| **Webhook** | `https://api.cpfblindado.com/api/webhooks/kiwify` |
| **Sucesso** | `https://cpfblindado.com/checkout/sucesso?source=kiwify` |
| **Falha** | `https://cpfblindado.com/checkout/falha?source=kiwify` |
| **API Base** | `https://public-api.kiwify.com` |

---

## Suporte

- [Documentacao Kiwify](https://docs.kiwify.com.br/)
- [API Reference](https://docs.kiwify.com.br/api-reference)
- [Suporte Kiwify](https://kiwify.com.br/suporte)
