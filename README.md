# Limpa Nome Expresso

> Guia interativo para limpeza de nome dos cadastros de inadimplentes via Juizado Especial Cível (e-SAJ TJSP) e Balcão Virtual, sem necessidade de advogado.

**Base legal:** Art. 43, § 2º do CDC · Súmula 359 do STJ · Art. 9º da Lei 9.099/95 · Resolução CNJ nº 372/21

---

## Sobre o Projeto

Site interativo construído em **React 19 + TypeScript + Tailwind CSS 4**, com checklist de 5 passos persistido em `localStorage`, documentos pré-preenchidos para download e links diretos para os sistemas oficiais do TJSP.

O projeto foi desenvolvido para orientar o cidadão paulista a exercer seu direito de limpar o nome dos cadastros de inadimplentes (Serasa, SPC, Boa Vista) quando não houve notificação prévia, conforme exige o Art. 43, § 2º do CDC.

---

## Funcionalidades

- **Checklist interativo de 5 passos** com progresso salvo no navegador
- **Barra de progresso global** no topo da página
- **3 documentos pré-preenchidos para download:**
  - Checklist completo de documentos
  - Petição inicial para o JEC de São Paulo (e-SAJ TJSP)
  - Roteiro de fala para o Balcão Virtual TJSP
- **Links diretos** para o e-SAJ, Balcão Virtual e consulta processual
- **Seção explicativa** sobre a diferença entre JEC (e-SAJ) e Balcão Virtual
- **Alertas de golpe** e base legal completa
- **Multiplos gateways de pagamento**: MercadoPago, Stripe e Kiwify

---

## Stack Técnica

| Tecnologia | Versão |
|:---|:---|
| React | 19 |
| TypeScript | 5.6 |
| Tailwind CSS | 4 |
| Vite | 7 |
| shadcn/ui | — |
| Lucide React | 0.453 |

---

## Como Rodar Localmente

```bash
# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm dev

# Build para produção
pnpm build
```

---

## Documentos Incluídos

Os documentos estão em `client/public/docs/`:

| Arquivo | Descrição |
|:---|:---|
| `checklist_documentos.md` | Lista completa de documentos para reunir |
| `peticao_inicial_jec_sp.md` | Modelo de petição para o JEC de São Paulo |
| `roteiro_balcao_virtual.md` | Script de fala para o Balcão Virtual TJSP |

---

## Base Legal

- **Art. 43, § 2º do CDC (Lei 8.078/90):** Obrigatoriedade de notificação prévia antes da negativação
- **Súmula 359 do STJ:** Responsabilidade do órgão mantenedor pela notificação
- **Súmula 385 do STJ:** Danos morais não cabem se há outras negativações legítimas
- **Art. 300 do CPC:** Requisitos para concessão de tutela de urgência
- **Art. 9º da Lei 9.099/95:** Dispensa de advogado no JEC para causas até 20 salários mínimos
- **Resolução CNJ nº 372/21:** Institui o Balcão Virtual nos tribunais

---

## Integracao de Pagamentos

O projeto suporta multiplos gateways de pagamento para oferecer flexibilidade aos usuarios:

| Gateway | Status | Uso |
|:---|:---|:---|
| MercadoPago | Producao | Checkout principal para pagamentos via PIX, cartao e boleto |
| Stripe | Producao | Alternativa internacional para pagamentos com cartao |
| Kiwify | Producao | Checkout otimizado com alta conversao para publico brasileiro |

### Configuracao do Kiwify

Para configurar a integracao com Kiwify, adicione as seguintes variaveis de ambiente:

```bash
# Kiwify Configuration
KIWIFY_CLIENT_ID=seu-client-id        # UUID do Kiwify Dashboard > Apps > API
KIWIFY_CLIENT_SECRET=seu-client-secret # Secredo do OAuth (nunca expor no cliente)
KIWIFY_ACCOUNT_ID=seu-account-id      # ID da conta para isolamento multi-tenant
KIWIFY_WEBHOOK_TOKEN=seu-webhook-token # Token para verificar webhooks
```

**Endpoints do Kiwify:**
- Webhook: `POST /api/webhooks/kiwify`
- Configuracao: `GET /api/kiwify/config`
- Health Check: `GET /api/kiwify/health`

**Eventos de webhook suportados:**
- `compra_aprovada` - Cria/atualiza usuario com acesso premium
- `compra_recusada` - Registra pagamento recusado
- `compra_reembolsada` - Revoga acesso do usuario
- `chargeback` - Revoga acesso imediatamente

Para documentacao completa da integracao, consulte o arquivo `.env.example`.

---

## Sistema de Protocolo em São Paulo

O peticionamento eletrônico do JEC para o cidadão sem advogado em São Paulo utiliza o sistema **e-SAJ** do TJSP:

- **Peticionamento JEC:** https://www.tjsp.jus.br/peticionamentojec
- **Balcão Virtual:** https://www.tjsp.jus.br/balcaovirtual
- **Consulta processual:** https://esaj.tjsp.jus.br/cpopg/open.do

> **Nota:** O TJSP iniciou a migração do e-SAJ para o e-Proc em outubro de 2025. O peticionamento do JEC para o cidadão sem advogado ainda utiliza o e-SAJ. Verifique sempre o link oficial antes de protocolar.

---

## Aviso Legal

Este projeto é informativo e não constitui assessoria jurídica. As informações são baseadas na legislação e jurisprudência vigente em 2026. Para casos complexos, consulte um advogado.

---

*Desenvolvido com Manus AI — Fevereiro de 2026*
