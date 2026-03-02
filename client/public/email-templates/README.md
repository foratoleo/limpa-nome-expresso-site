# Email Templates - Limpa Nome Expresso

Custom email templates for Supabase authentication, designed to match the project's visual identity.

## Templates

### confirm-signup.html
Email de confirmacao de cadastro enviado quando um novo usuario se registra.

## Design System

Os templates utilizam os seguintes tokens do design system:

| Elemento | Cor |
|----------|-----|
| Background | `#12110d` |
| Card/Surface | `#162847` |
| Accent (Gold) | `#d39e17` |
| Success (Green) | `#22c55e` |
| Text Primary | `#f1f5f9` |
| Text Secondary | `#94a3b8` |
| Text Muted | `#64748b` |
| Links | `#60a5fa` |

**Fonte:** Public Sans (Google Fonts)

## Configuracao no Supabase

### Passo 1: Acesse o Dashboard
1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Va para **Authentication** > **Email Templates**

### Passo 2: Configure o Template
1. Selecione a aba **Confirm signup**
2. Ative **Custom email template**
3. Copie o conteudo do arquivo `confirm-signup.html`
4. Cole no editor de templates do Supabase
5. Clique em **Save**

### Passo 3: Teste
1. Va para **Authentication** > **Users**
2. Crie um usuario de teste ou use um existente
3. Clique em **Send magic link** ou reenvie o email de confirmacao
4. Verifique se o email foi recebido corretamente

## Variaveis do Supabase

Os templates suportam as seguintes variaveis:

| Variavel | Descricao |
|----------|-----------|
| `{{ .ConfirmationURL }}` | Link de confirmacao completo |
| `{{ .Token }}` | Token de confirmacao |
| `{{ .TokenHash }}` | Hash do token |
| `{{ .Email }}` | E-mail do usuario |

## Compatibilidade

Os templates sao compatíveis com:
- Gmail (Web, iOS, Android)
- Apple Mail (macOS, iOS)
- Outlook (Web, Desktop 2016+)
- Yahoo Mail
- ProtonMail

## Boas Praticas

1. **Teste sempre** antes de colocar em producao
2. **Verifique** se os links funcionam corretamente
3. **Valide** o HTML em ferramentas como [Litmus](https://litmus.com) ou [Email on Acid](https://www.emailonacid.com)
4. **Mantenha** o design consistente com o site

## Manutencao

Ao atualizar o design system do projeto, atualize tambem as cores nestes templates para manter a consistencia visual.
