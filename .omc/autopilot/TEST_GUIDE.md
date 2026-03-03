# GUIA DE TESTES E2E - Magic Link Authentication

**Data:** 2026-03-03
**Status:** Pronto para Testes Manuais

---

## CONFIGURAÇÃO NECESSÁRIA

### 1. Supabase Dashboard - Template de Email

⚠️ **CRÍTICO:** Antes de testar, configure o template no Supabase:

1. Acessar https://supabase.com/dashboard
2. Selecionar projeto `limpa-nome-expresso-site`
3. Navigation → Authentication → Email Templates
4. Selecionar template **"Magic Link"**
5. **Opção A:** Usar template padrão (rápido)
6. **Opção B:** Customizar com HTML do projeto

**Se customizar:**
- Copiar HTML de `/client/public/email-templates/confirm-signup.html`
- Alterar variáveis para `{{ .ConfirmationURL }}`
- Alterar texto para "Acesse sua conta"

### 2. Verificar Redirect URL

No Supabase Dashboard:
- Authentication → URL Configuration
- Site URL: `http://localhost:5173` (dev) ou URL de produção
- Redirect URLs: Adicionar `http://localhost:5173/auth/callback`

---

## FLUXO DE TESTE - MAGIC LINK

### Teste 1: Solicitar Magic Link

**Passos:**
1. Iniciar servidor: `npm run dev`
2. Acessar `http://localhost:5173`
3. Clicar em "Entrar" no header
4. Modal deve abrir com 3 tabs:
   - ✓ Com Senha
   - ✓ Magic Link
   - ✓ Criar Conta
5. Clicar na tab **"Magic Link"**
6. Formulário deve mostrar:
   - Campo "Email"
   - Botão "Enviar link de acesso"
   - Link "Voltar para login com senha"
7. Digitar um email válido
8. Clicar em "Enviar link de acesso"
9. **Resultado esperado:**
   - Tela de sucesso com checkmark verde
   - Mensagem: "Link enviado!"
   - Email digitado aparece na mensagem
   - Dica sobre expiração de 1 hora
   - Botão "Enviar outro link"

**Critérios:**
- [ ] Tabs aparecem corretamente
- [ ] Form de Magic Link renderiza
- [ ] Loading state aparece durante envio
- [ ] Tela de sucesso aparece
- [ ] Mensagens estão em português
- [ ] Botão "Voltar" funciona

---

### Teste 2: Receber Email

**Passos:**
1. Abrir caixa de entrada do email testado
2. **Resultado esperado:**
   - Email de "Supabase" ou domínio customizado
   - Assunto: "Magic Link" ou "Acesse sua conta"
   - Corpo: Botão/link para acessar conta
   - Link funciona e contém tokens

**Critérios:**
- [ ] Email recebido em < 30 segundos
- [ ] Email não está em spam
- [ ] Link no email é válido
- [ ] Template visualmente correto

---

### Teste 3: Clicar no Magic Link

**Passos:**
1. Clicar no botão/link do email
2. **Resultado esperado:**
   - Redireciona para `/auth/callback`
   - Tela de "Processando login..." aparece
   - Spinner girando
   - Após ~1-2 segundos: "Login realizado!"
   - Checkmark verde
   - Redireciona automaticamente para `/client-area` ou `/dashboard`

**Critérios:**
- [ ] Redirecionamento funciona
- [ ] Tela de loading aparece
- [ ] Sessão é criada
- [ ] Redireciona para área do cliente
- [ ] Usuário está autenticado

---

### Teste 4: Usuário Autenticado

**Passos:**
1. Verificar header do site
2. **Resultado esperado:**
   - Botão "Entrar" mudou para nome do usuário ou avatar
   - Pode acessar área do cliente
   - Dados do usuário disponíveis

**Critérios:**
- [ ] Usuário aparece no header
- [ ] Sessão persiste ao recarregar página
- [ ] Área do cliente acessível

---

## FLUXO DE TESTE - SISTEMA HÍBRIDO

### Teste 5: Login com Senha Ainda Funciona

**Passos:**
1. Fazer logout
2. Abrir modal "Entrar"
3. Selecionar tab **"Com Senha"**
4. Digitar email + senha de usuário existente
5. **Resultado esperado:**
   - Login funciona normalmente
   - Redireciona para área do cliente
   - Nenhuma mensagem de erro

**Critérios:**
- [ ] Login tradicional funciona
- [ ] Sem regressões
- [ ] Performance normal

---

### Teste 6: Cadastro Ainda Funciona

**Passos:**
1. Fazer logout
2. Abrir modal "Entrar"
3. Selecionar tab **"Criar Conta"**
4. Preencher formulário de cadastro
5. **Resultado esperado:**
   - Cadastro funciona
   - Email de confirmação enviado
   - Fluxo inalterado

**Critérios:**
- [ ] Cadastro funciona
- [ ] Email de confirmação enviado
- [ ] Sem conflitos com Magic Link

---

### Teste 7: Recuperação de Senha Ainda Funciona

**Passos:**
1. Fazer logout
2. Abrir modal "Entrar"
3. Clicar "Esqueceu a senha?"
4. **Resultado esperado:**
   - Fluxo de recuperação inalterado
   - Email de reset enviado

**Critérios:**
- [ ] Recuperação de senha funciona
- [ ] Sem conflitos com Magic Link

---

## TESTES DE EDGE CASES

### Teste 8: Link Expirado

**Passos:**
1. Solicitar Magic Link
2. Aguardar > 1 hora
3. Tentar clicar no link
4. **Resultado esperado:**
   - Tela de erro em `/auth/callback`
   - Mensagem: "O link pode ter expirado"
   - Botão "Voltar ao início"

**Critérios:**
- [ ] Erro tratado gracefulmente
- [ ] Mensagem clara
- [ ] Pode tentar novamente

---

### Teste 9: Email Inválido

**Passos:**
1. Abrir Magic Link form
2. Digitar email inválido: "teste"
3. Clicar "Enviar link de acesso"
4. **Resultado esperado:**
   - Validação HTML5 bloqueia
   - Ou mensagem "Email inválido"

**Critérios:**
- [ ] Validação funciona
- [ ] Mensagem clara
- [ ] Não faz requisição inválida

---

### Teste 10: Reenviar Link

**Passos:**
1. Solicitar Magic Link
2. Na tela de sucesso, clicar "Enviar outro link"
3. **Resultado esperado:**
   - Volta para formulário
- Email limpo
- Pode digitar novo email

**Critérios:**
- [ ] Botão funciona
- [ ] Estado resetado corretamente
- [ ] Pode reenviar

---

### Teste 11: Já Autenticado

**Passos:**
1. Estar logado com Magic Link
2. Tentar solicitar outro link
3. **Resultado esperado:**
   - Pode solicitar novo link
   - Sessão atual não é afetada

**Critérios:**
- [ ] Não causa conflito de sessão
- [ ] Funciona corretamente

---

## TESTE DE PERFORMANCE

### Teste 12: Tempo de Resposta

**Medições:**
1. Clique em "Enviar link" → Tela de sucesso: < 3 segundos
2. Recebimento do email: < 30 segundos
3. Clique no email → Redirecionamento: < 2 segundos
4. Processamento do callback: < 2 segundos

**Critérios:**
- [ ] Tempos aceitáveis
- [ ] Sem lentidão

---

## VERIFICAÇÃO DE SEGURANÇA

### Teste 13: Enumeração de Usuários

**Passos:**
1. Fazer requisição para `/api/auth/check-user` com email existente
2. Fazer requisição com email inexistente
3. **Resultado esperado:**
   - Respostas estruturalmente idênticas
   - Não revela se usuário existe

**Critérios:**
- [ ] Resposta genérica mantida
- [ ] Prevenção de enumeração funciona

---

## CHECKLIST FINAL

**Funcionalidades Core:**
- [ ] Magic Link solicitado com sucesso
- [ ] Email recebido
- [ ] Link funciona e autentica
- [ ] Redirecionamento correto
- [ ] Sessão persiste

**Sistema Híbrido:**
- [ ] Login com senha funciona
- [ ] Cadastro funciona
- [ ] Recuperação de senha funciona

**UX:**
- [ ] Tabs visíveis e funcionais
- [ ] Loading states adequados
- [ ] Mensagens em português
- [ ] Estilo consistente

**Segurança:**
- [ ] Prevenção de enumeração
- [ ] Links expiram corretamente
- [ ] Erros tratados gracefulmente

**Performance:**
- [ ] Tempos de resposta aceitáveis
- [ ] Sem regressões de performance

---

## PROBLEMAS CONHECIDOS

### Se Magic Link NÃO Chegar no Email

**Soluções:**
1. Verificar pasta de spam/lixeira
2. Verificar se Supabase Dashboard tem template configurado
3. Verificar se EMAILIT_API_KEY está configurado (se usando email customizado)
4. Verificar logs do Supabase: Dashboard → Auth → Users

### Se Redirecionamento Não Funciona

**Soluções:**
1. Verificar se `/auth/callback` está nas Redirect URLs do Supabase
2. Verificar se rota está configurada no App.tsx
3. Checar console do browser por erros

### Se Login com Senha Quebrou

**Soluções:**
1. Verificar se AuthModal ainda tem tab "Com Senha"
2. Verificar se `signIn()` ainda está no AuthContext
3. Checar se LoginForm não foi modificado acidentalmente

---

## LOGS ÚTEIS

**Console do Browser:**
```javascript
// Verificar sessão do Supabase
supabase.auth.getSession()

// Verificar usuário atual
supabase.auth.getUser()

// Listener de mudanças de auth
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session)
})
```

**Server Logs:**
```bash
# Ver endpoint check-user
tail -f server/logs/*.log | grep "check-user"
```

---

**Fim do Guia de Testes**
