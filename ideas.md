# Ideas: Limpa Nome Expresso — Design Explorations

<response>
<idea>
**Design Movement:** Construtivismo Jurídico — inspirado em documentos oficiais e selos de autenticidade, com a seriedade de um escritório de advocacia moderno.

**Core Principles:**
1. Autoridade visual: tipografia pesada e espaçamento generoso transmitem confiança e credibilidade.
2. Progressão clara: o layout guia o olho de cima para baixo, passo a passo, sem ambiguidade.
3. Contraste funcional: fundo escuro (azul-marinho profundo) com texto claro e acentos em dourado/âmbar para destacar ações críticas.
4. Densidade intencional: seções compactas mas respiradas, sem desperdício de espaço.

**Color Philosophy:** Azul-marinho (#0F1E3C) como base — evoca confiança, lei e estabilidade. Dourado/âmbar (#D4A017) como acento — remete a selos oficiais e urgência positiva. Branco (#F5F5F0) para texto e superfícies.

**Layout Paradigm:** Coluna única larga com linha do tempo vertical à esquerda para os passos. Cada passo é um bloco horizontal com número grande, título e checklist à direita. Hero com fundo escuro e título grande centralizado.

**Signature Elements:**
1. Numeração de passos em tipografia display bold (64px+), cor dourada.
2. Linha vertical conectando os passos, com círculos de progresso.
3. Selos/badges de "Válido em 2026" e "Sem Advogado Necessário".

**Interaction Philosophy:** Checklist com estado persistido no localStorage. Cada item marcado dispara uma animação de check verde. Barra de progresso global no topo.

**Animation:** Entrada dos blocos de passo com fade-in + slide-up suave (200ms delay entre cada). Checkbox com spring animation ao marcar.

**Typography System:** Títulos em `Playfair Display` Bold (display, autoridade). Corpo em `Inter` Regular (legibilidade). Números dos passos em `Space Grotesk` ExtraBold.
</idea>
<probability>0.08</probability>
</response>

<response>
<idea>
**Design Movement:** Minimalismo Funcional Brasileiro — inspirado em materiais governamentais modernizados, como o GOV.BR redesenhado, mas com calor humano.

**Core Principles:**
1. Clareza acima de tudo: cada elemento tem uma função, nada é decorativo sem propósito.
2. Hierarquia tipográfica forte: tamanhos de fonte com grande variação para guiar a leitura.
3. Verde-esmeralda como cor primária — evoca esperança, resolução e o verde da bandeira.
4. Acessibilidade total: alto contraste, fontes legíveis, botões grandes.

**Color Philosophy:** Verde-esmeralda (#1B6B3A) como primário. Branco (#FFFFFF) como fundo. Cinza-claro (#F0F4F0) para seções alternadas. Vermelho-coral (#E05252) apenas para alertas e avisos de golpe.

**Layout Paradigm:** Grid de duas colunas no desktop (navegação lateral fixa + conteúdo principal). Mobile: coluna única. Cada passo é um card com borda esquerda colorida.

**Signature Elements:**
1. Barra lateral de navegação com os 5 passos, indicando o progresso.
2. Cards de alerta com ícone de escudo para avisos sobre golpes.
3. Botões de download com ícone de documento e tamanho do arquivo.

**Interaction Philosophy:** Navegação suave entre seções com scroll-spy. Sidebar atualiza o passo ativo conforme o usuário rola a página.

**Animation:** Scroll-triggered animations para os cards. Sidebar com indicador de progresso animado.

**Typography System:** `DM Sans` para tudo — versátil, moderna, acessível. Pesos 400, 600 e 800.
</idea>
<probability>0.07</probability>
</response>

<response>
<idea>
**Design Movement:** Editorial Urgente — inspirado em manchetes de jornal e infográficos de revista de investigação jornalística.

**Core Principles:**
1. Urgência visual: tipografia grande e bold, como manchetes de jornal.
2. Assimetria deliberada: colunas de larguras diferentes criam tensão visual e interesse.
3. Fundo creme/off-white com texto quase-preto — evoca papel impresso de qualidade.
4. Dados e números em destaque: percentuais de êxito, prazos e valores em tipografia display.

**Color Philosophy:** Creme (#FAF7F0) como fundo. Quase-preto (#1A1A1A) para texto. Vermelho-tijolo (#C0392B) como acento único — urgência, ação, alerta.

**Layout Paradigm:** Layout de revista com colunas assimétricas. Hero com título em 3 linhas, tamanho gigante, alinhado à esquerda. Checklist em formato de tabela editorial.

**Signature Elements:**
1. Linhas horizontais finas separando seções, como em jornais.
2. Pull-quotes em vermelho-tijolo com aspas tipográficas grandes.
3. Números de passo em círculos preenchidos com vermelho-tijolo.

**Interaction Philosophy:** Experiência de leitura linear, como um artigo. Checklist ao final de cada seção, não em sidebar.

**Animation:** Mínima — apenas fade-in suave. O design comunica urgência pela tipografia, não pela animação.

**Typography System:** `Playfair Display` para títulos (editorial, autoridade). `Source Serif 4` para corpo (legibilidade jornalística). `Space Grotesk` para dados e números.
</idea>
<probability>0.06</probability>
</response>

## Escolha: Construtivismo Jurídico (Resposta 1)

Design escolhido: **Construtivismo Jurídico** — azul-marinho profundo, acentos dourados, tipografia Playfair Display + Space Grotesk + Inter. Layout com linha do tempo vertical, checklist interativo com persistência em localStorage e barra de progresso global.
