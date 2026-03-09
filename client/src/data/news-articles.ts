export type ArticleCategory =
  | "jurisprudencia"
  | "direitos"
  | "estatisticas"
  | "prescricao"
  | "fraude"
  | "score"
  | "jec";

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  excerpt: string;
  publishedDate: string;
  estimatedReadTime: number;
  tags: string[];
  category: ArticleCategory;
  contentFile: string;
}

export const CATEGORY_COLORS: Record<
  ArticleCategory,
  { primary: string; secondary: string }
> = {
  jurisprudencia: { primary: "#1e40af", secondary: "#3b82f6" },
  direitos: { primary: "#065f46", secondary: "#10b981" },
  estatisticas: { primary: "#92400e", secondary: "#f59e0b" },
  prescricao: { primary: "#6d28d9", secondary: "#a78bfa" },
  fraude: { primary: "#991b1b", secondary: "#ef4444" },
  score: { primary: "#0e7490", secondary: "#22d3ee" },
  jec: { primary: "#166534", secondary: "#4ade80" },
};

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "1",
    slug: "negativacao-indevida-indenizacao",
    title: "Negativação Indevida: Quando Você Tem Direito a Indenização",
    metaDescription:
      "Descubra quando a negativação indevida gera direito a indenização por danos morais. Veja decisões do STJ e como consumidores obtiveram reparação.",
    keywords: [
      "negativação indevida",
      "indenização negativação indevida",
      "danos morais negativação",
      "STJ negativação indevida",
      "nome negativado indevidamente",
    ],
    excerpt:
      "A negativação indevida é uma das causas mais frequentes de ações no Juizado Especial Cível. Tribunais brasileiros consolidaram o entendimento de que o simples lançamento indevido do nome do consumidor em cadastros de inadimplentes já configura dano moral indenizável, independentemente de prova de prejuízo específico.",
    publishedDate: "2026-03-07",
    estimatedReadTime: 5,
    tags: ["negativação", "danos morais", "STJ", "indenização"],
    category: "jurisprudencia",
    contentFile: "/docs/noticias/negativacao-indevida-indenizacao.md",
  },
  {
    id: "2",
    slug: "divida-prescrita-cobranca-ilegal",
    title: "Dívida Prescrita: A Cobrança é Ilegal e Você Pode Agir",
    metaDescription:
      "Dívida caduca em 5 anos para a maioria dos casos. Saiba quando sua dívida prescreveu, o que o Código Civil diz e como se defender de cobranças ilegais.",
    keywords: [
      "dívida caduca 5 anos",
      "dívida prescrita",
      "prazo prescricional dívida",
      "cobrança dívida prescrita",
      "prescrição dívida banco",
    ],
    excerpt:
      "Muitos consumidores desconhecem que dívidas têm prazo de validade legal. Após a prescrição, a cobrança deixa de ser juridicamente exigível e a manutenção do nome em cadastros de inadimplência torna-se ilegal, abrindo caminho para ação judicial de reparação.",
    publishedDate: "2026-03-07",
    estimatedReadTime: 5,
    tags: ["prescrição", "dívida caduca", "Código Civil", "cobrança ilegal"],
    category: "prescricao",
    contentFile: "/docs/noticias/divida-prescrita-cobranca-ilegal.md",
  },
  {
    id: "3",
    slug: "73-milhoes-negativados-brasil",
    title: "73 Milhões de Negativados: O Perfil do Endividamento Brasileiro",
    metaDescription:
      "O Brasil tem mais de 73 milhões de pessoas com nome sujo. Conheça as estatísticas do endividamento, os setores que mais negativam e o que os dados revelam.",
    keywords: [
      "quantos brasileiros negativados",
      "73 milhões negativados",
      "estatísticas inadimplência Brasil",
      "negativados no cadastro de crédito",
      "nome sujo Brasil",
    ],
    excerpt:
      "Mais de 73 milhões de brasileiros enfrentam restrições em seus nomes nos serviços de proteção ao crédito. As estatísticas revelam um padrão preocupante: financeiras, bancos e operadoras de telefonia lideram os registros, muitos dos quais podem ser contestados por irregularidades formais.",
    publishedDate: "2026-03-07",
    estimatedReadTime: 4,
    tags: ["estatísticas", "inadimplência", "cadastro de crédito", "endividamento"],
    category: "estatisticas",
    contentFile: "/docs/noticias/73-milhoes-negativados-brasil.md",
  },
  {
    id: "4",
    slug: "telefonia-negativacao-indevida",
    title: "Telefonia e Negativação Indevida: Setor Lidera Condenações no JEC",
    metaDescription:
      "Operadoras de telefonia são as maiores responsáveis por negativações indevidas no Brasil. Veja decisões judiciais e por que consumidores vencem essas ações.",
    keywords: [
      "telefonia negativação indevida",
      "operadora negativação indevida",
      "Claro negativação indevida",
      "Vivo negativação indevida",
      "TIM negativação indevida",
    ],
    excerpt:
      "O setor de telefonia acumula o maior número de condenações por negativação indevida nos Juizados Especiais Cíveis do Brasil. Tribunais de Justiça de todo o país reconhecem de forma reiterada que cobranças por serviços não contratados ou cancelados, seguidas de negativação, configuram prática abusiva indenizável.",
    publishedDate: "2026-03-07",
    estimatedReadTime: 5,
    tags: ["telefonia", "operadora", "JEC", "prática abusiva"],
    category: "jurisprudencia",
    contentFile: "/docs/noticias/telefonia-negativacao-indevida.md",
  },
  {
    id: "5",
    slug: "notificacao-previa-obrigatoria",
    title: "Notificação Prévia: Direito Que Muitos Credores Violam ao Negativar",
    metaDescription:
      "O credor é obrigado a notificar o consumidor antes de negativar seu nome. Saiba o que diz o CDC, como identificar a violação e o que fazer quando isso ocorre.",
    keywords: [
      "notificação prévia negativação",
      "credor obrigado notificar",
      "CDC negativação",
      "direito consumidor negativação",
      "negativação sem notificação",
    ],
    excerpt:
      "O Código de Defesa do Consumidor exige que o credor comunique previamente o consumidor antes de incluí-lo em cadastros de inadimplentes. A ausência dessa notificação é, por si só, motivo suficiente para contestar a negativação e buscar reparação judicial pelos danos sofridos.",
    publishedDate: "2026-03-07",
    estimatedReadTime: 5,
    tags: ["notificação prévia", "CDC", "direitos do consumidor", "ilegalidade"],
    category: "direitos",
    contentFile: "/docs/noticias/notificacao-previa-obrigatoria.md",
  },
  {
    id: "6",
    slug: "paguei-divida-nome-sujo",
    title: "Paguei a Dívida Mas Meu Nome Continua Sujo: O Que Fazer",
    metaDescription:
      "Pagou a dívida mas o nome ainda aparece negativado? Isso é ilegal. Entenda o prazo legal para exclusão e como exigir seus direitos na Justiça.",
    keywords: [
      "paguei a dívida nome sujo",
      "nome continua negativado após pagamento",
      "prazo exclusão negativação",
      "credor não retirou negativação",
      "baixa negativação após pagamento",
    ],
    excerpt:
      "Após o pagamento de uma dívida, o credor tem prazo legalmente estabelecido para providenciar a exclusão do nome do consumidor dos cadastros de inadimplentes. O descumprimento desse prazo transforma a situação em nova violação de direitos, passível de reparação independente da dívida original.",
    publishedDate: "2026-03-07",
    estimatedReadTime: 4,
    tags: ["pagamento", "exclusão", "prazo legal", "credor"],
    category: "direitos",
    contentFile: "/docs/noticias/paguei-divida-nome-sujo.md",
  },
  {
    id: "7",
    slug: "fraude-cpf-negativacao",
    title: "Fraude com CPF e Negativação: Como Se Defender Judicialmente",
    metaDescription:
      "Teve o CPF usado em fraude e o nome negativado? Saiba como a Justiça trata esses casos, quem responde pela indenização e como consumidores obtiveram reparação.",
    keywords: [
      "fraude CPF negativação",
      "nome negativado por fraude",
      "CPF clonado negativação",
      "indenização fraude nome sujo",
      "negativação por terceiro fraude",
    ],
    excerpt:
      "A negativação decorrente de fraude de identidade coloca o consumidor na condição de vítima dupla: primeiro da fraude, depois das restrições de crédito. A jurisprudência brasileira é clara ao responsabilizar a empresa que efetuou a negativação, mesmo quando a origem foi um ato fraudulento de terceiro.",
    publishedDate: "2026-03-07",
    estimatedReadTime: 5,
    tags: ["fraude", "CPF", "responsabilidade", "vítima"],
    category: "fraude",
    contentFile: "/docs/noticias/fraude-cpf-negativacao.md",
  },
  {
    id: "8",
    slug: "score-credito-negativacao-indevida",
    title: "Score de Crédito e Negativação Indevida: Como a Injustiça Afeta Seu Crédito",
    metaDescription:
      "Uma negativação indevida derruba seu score de crédito e fecha portas de crédito. Entenda como funciona a pontuação e por que a exclusão judicial é urgente.",
    keywords: [
      "score de crédito negativação indevida",
      "como negativação afeta score",
      "score baixo por negativação",
      "score de crédito indevido",
      "melhorar score remover negativação",
    ],
    excerpt:
      "O score de crédito é diretamente afetado por registros de inadimplência, incluindo aqueles originados por negativações indevidas. Compreender a relação entre negativação e pontuação de crédito ajuda o consumidor a dimensionar o impacto real da irregularidade e a buscar a reparação integral devida.",
    publishedDate: "2026-03-07",
    estimatedReadTime: 4,
    tags: ["score", "cadastro de crédito", "crédito", "pontuação"],
    category: "score",
    contentFile: "/docs/noticias/score-credito-negativacao-indevida.md",
  },
  {
    id: "9",
    slug: "juizado-especial-civel-sem-advogado",
    title: "Juizado Especial Cível: Como o Consumidor Pode Agir Sem Advogado",
    metaDescription:
      "O JEC permite ações até 20 salários mínimos sem advogado e sem custas. Saiba como funciona esse direito constitucional e por que ele existe para proteger o consumidor.",
    keywords: [
      "juizado especial cível sem advogado",
      "JEC consumidor",
      "ação sem advogado",
      "juizado especial gratuito",
      "pequenas causas consumidor",
    ],
    excerpt:
      "O Juizado Especial Cível é um direito constitucional que permite ao consumidor buscar reparação judicial sem contratar advogado e sem pagar custas processuais. Criado para democratizar o acesso à Justiça, o JEC tem sido o principal instrumento de reparação por negativações indevidas em todo o Brasil.",
    publishedDate: "2026-03-07",
    estimatedReadTime: 5,
    tags: ["JEC", "sem advogado", "gratuito", "acesso à justiça"],
    category: "jec",
    contentFile: "/docs/noticias/juizado-especial-civel-sem-advogado.md",
  },
  {
    id: "10",
    slug: "banco-negativacao-indevida",
    title: "Banco Condenado por Negativação Indevida: Casos Reais e Valores",
    metaDescription:
      "Bancos lideram condenações por negativação indevida. Veja casos reais de consumidores indenizados pelo STJ e tribunais estaduais e quais valores foram arbitrados.",
    keywords: [
      "banco condenado negativação indevida",
      "banco negativação indevida indenização",
      "STJ banco negativação",
      "indenização banco nome sujo",
      "negativação banco ilegal",
    ],
    excerpt:
      "Instituições financeiras figuram entre as maiores rés em ações de negativação indevida no Brasil. O Superior Tribunal de Justiça e os tribunais estaduais têm fixado indenizações expressivas, reconhecendo que a falha no processo de verificação de dados antes da negativação configura responsabilidade objetiva do banco.",
    publishedDate: "2026-03-07",
    estimatedReadTime: 5,
    tags: ["banco", "STJ", "responsabilidade objetiva", "indenização"],
    category: "jurisprudencia",
    contentFile: "/docs/noticias/banco-negativacao-indevida.md",
  },
];

export function getArticleBySlug(slug: string): NewsArticle | undefined {
  return NEWS_ARTICLES.find((article) => article.slug === slug);
}

export function getRelatedArticles(
  currentSlug: string,
  count: number
): NewsArticle[] {
  return NEWS_ARTICLES.filter((article) => article.slug !== currentSlug).slice(
    0,
    count
  );
}
