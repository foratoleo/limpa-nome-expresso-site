# Autopilot Spec: Mobile Responsiveness Audit

## Goal
Revisar os fluxos públicos e autenticados do CPF Blindado para uso em dispositivos móveis, corrigindo problemas de navegação, compressão visual e usabilidade, sem alterar a identidade visual da aplicação.

## Scope
- Fluxos públicos: `/`, `/noticias`, `/noticias/:slug`, `/checkout`
- Fluxos autenticados: `/bem-vindo`, `/guia`, `/documentos`, `/modelos`, `/suporte`, `/downloads`, `/processo`, `/assessoria-especializada`, `/dashboard`, `/faturamento`
- Modal de autenticação

## Observed Issues
- Headers repetidos escondem a navegação principal no mobile, deixando o usuário sem caminho claro entre páginas.
- Cabeçalhos autenticados concentram CTA, perfil e ações em pouco espaço horizontal.
- `/guia` usa uma trilha com `min-w` alto e scroll horizontal pouco orientado.
- `/dashboard` usa tabs horizontais comprimidas, com rótulos cortados.
- `/modelos` usa chips filtráveis com overflow intencional, mas a hierarquia do topo ainda compete com ações globais.
- A maior parte das páginas não estoura horizontalmente no documento, mas a fluidez de navegação está abaixo do esperado no mobile.

## Requirements
- Entregar um menu móvel consistente nas páginas públicas e autenticadas.
- Manter navegação desktop atual.
- Preservar UserProfile, CTA de assessoria e busca quando existirem, sem esmagar o layout no mobile.
- Melhorar legibilidade e toque das navegações secundárias no mobile.
- Não introduzir regressões nas rotas protegidas nem no fluxo de login.

## Success Criteria
- Usuário mobile consegue navegar entre áreas principais sem depender de links escondidos no conteúdo.
- Nenhuma das rotas auditadas apresenta overflow horizontal de documento.
- Header e ações permanecem utilizáveis em larguras de ~390px.
- `/guia` e `/dashboard` deixam de cortar/espremir navegação crítica.
