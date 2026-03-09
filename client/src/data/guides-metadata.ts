import type { GuideCategory, GuideCategoryInfo } from '@/types/guides';

export const GUIDES_CATEGORIES: GuideCategoryInfo[] = [
  {
    id: 'base-legal',
    label: 'Base Legal',
    description: 'Fundamentos jurídicos, legislação e súmulas do STJ',
    icon: 'Scale',
    order: 1,
    guides: [
      {
        id: 'base-legal-cdc',
        slug: '01-base-legal',
        title: 'Código de Defesa do Consumidor - Artigo 43',
        description: 'Disposições sobre bancos de dados e cadastros de proteção ao crédito',
        category: 'base-legal',
        order: 1,
        contentFile: '/docs/guias/01-base-legal.md',
        estimatedReadTime: 15,
        lastUpdated: '2026-03-03',
        tags: ['CDC', 'Artigo 43', 'Súmulas STJ']
      }
    ]
  },
  {
    id: 'procedimentos',
    label: 'Procedimentos Práticos',
    description: 'Guias passo a passo para peticionamento eletrônico e sistemas judiciais',
    icon: 'FileText',
    order: 2,
    guides: [
      {
        id: 'procedimentos-jec-esaj',
        slug: '02-procedimentos-jec-esaj',
        title: 'Procedimentos no JEC sistema judicial',
        description: 'Guia completo para peticionamento eletrônico no tribunal via sistema judicial',
        category: 'procedimentos',
        order: 1,
        contentFile: '/docs/guias/02-procedimentos-jec-esaj.md',
        estimatedReadTime: 15,
        lastUpdated: '2026-03-03',
        tags: ['JEC', 'sistema judicial', 'tribunal', 'Peticionamento']
      },
      {
        id: 'procedimentos-balcao-virtual',
        slug: '02-procedimentos-balcao-virtual',
        title: 'Procedimentos no Balcão Virtual',
        description: 'Funcionamento do Balcão Virtual e atendimento por videoconferência',
        category: 'procedimentos',
        order: 2,
        contentFile: '/docs/guias/02-procedimentos-balcao-virtual.md',
        estimatedReadTime: 15,
        lastUpdated: '2026-03-03',
        tags: ['Balcão Virtual', 'Videoconferência', 'tribunal']
      }
    ]
  },
  {
    id: 'modelos',
    label: 'Modelos de Documentos',
    description: 'Templates práticos de petições, recursos e documentos complementares',
    icon: 'FileText',
    order: 3,
    guides: [
      {
        id: 'modelos-peticoes-iniciais',
        slug: '03-modelos-peticoes-iniciais',
        title: 'Modelos de Petições Iniciais',
        description: 'Três modelos completos para diferentes cenários de negativação indevida',
        category: 'modelos',
        order: 1,
        contentFile: '/docs/guias/03-modelos-peticoes-iniciais.md',
        estimatedReadTime: 12,
        lastUpdated: '2026-03-03',
        tags: ['Petição Inicial', 'JEC', 'Modelos']
      },
      {
        id: 'modelos-documentos-complementares',
        slug: '03-modelos-documentos-complementares',
        title: 'Documentos Complementares e Provas',
        description: 'Declarações, procurações e documentos essenciais para o processo',
        category: 'modelos',
        order: 2,
        contentFile: '/docs/guias/03-modelos-documentos-complementares.md',
        estimatedReadTime: 20,
        lastUpdated: '2026-03-03',
        tags: ['Documentos', 'Provas', 'Checklist']
      },
      {
        id: 'modelos-recursos-sentencas',
        slug: '03-modelos-recursos-sentencas',
        title: 'Modelos de Recursos e Sentenças',
        description: 'Recurso inominado, embargos de declaração e cumprimento de sentença',
        category: 'modelos',
        order: 3,
        contentFile: '/docs/guias/03-modelos-recursos-sentencas.md',
        estimatedReadTime: 10,
        lastUpdated: '2026-03-03',
        tags: ['Recursos', 'Sentenças', 'Cumprimento']
      }
    ]
  },
  {
    id: 'jurisprudencia',
    label: 'Jurisprudência',
    description: 'Decisões do STJ, tribunais superiores e casos práticos',
    icon: 'Gavel',
    order: 4,
    guides: [
      {
        id: 'jurisprudencia-stj-tribunais',
        slug: '04-jurisprudencia-stj-tribunais',
        title: 'Jurisprudência STJ e Tribunais Superiores',
        description: 'Súmulas, precedentes e decisões recentes sobre negativação indevida',
        category: 'jurisprudencia',
        order: 1,
        contentFile: '/docs/guias/04-jurisprudencia-stj-tribunais.md',
        estimatedReadTime: 15,
        lastUpdated: '2026-03-03',
        tags: ['STJ', 'Súmulas', 'Precedentes']
      },
      {
        id: 'jurisprudencia-tjsp-casos',
        slug: '04-jurisprudencia-tjsp-casos',
        title: 'Jurisprudência tribunal e Casos Práticos',
        description: 'Casos práticos, valores de indenização e estratégias de conciliação',
        category: 'jurisprudencia',
        order: 2,
        contentFile: '/docs/guias/04-jurisprudencia-tjsp-casos.md',
        estimatedReadTime: 12,
        lastUpdated: '2026-03-03',
        tags: ['tribunal', 'Casos Práticos', 'Indenização']
      }
    ]
  },
  {
    id: 'expansao-regional',
    label: 'Expansão Nacional',
    description: 'Procedimentos específicos para cada estado e região do Brasil',
    icon: 'Map',
    order: 5,
    guides: [
      {
        id: 'expansao-sudeste-mg-rj-es',
        slug: '05-expansao-sudeste-mg-rj-es',
        title: 'Expansão Sudeste (MG, RJ, ES)',
        description: 'Sistemas Projudi e PJe para Minas Gerais, Rio de Janeiro e Espírito Santo',
        category: 'expansao-regional',
        order: 1,
        contentFile: '/docs/guias/05-expansao-sudeste-mg-rj-es.md',
        estimatedReadTime: 20,
        lastUpdated: '2026-03-03',
        tags: ['Sudeste', 'MG', 'RJ', 'ES', 'Projudi', 'PJe']
      },
      {
        id: 'expansao-sul-pr-sc-rs',
        slug: '05-expansao-sul-pr-sc-rs',
        title: 'Expansão Sul (PR, SC, RS)',
        description: 'Sistemas sistema judicial, Eproc e PJe para Paraná, Santa Catarina e Rio Grande do Sul',
        category: 'expansao-regional',
        order: 2,
        contentFile: '/docs/guias/05-expansao-sul-pr-sc-rs.md',
        estimatedReadTime: 20,
        lastUpdated: '2026-03-03',
        tags: ['Sul', 'PR', 'SC', 'RS', 'sistema judicial', 'Eproc', 'PJe']
      },
      {
        id: 'expansao-co-ne-n',
        slug: '05-expansao-co-ne-n',
        title: 'Expansão Centro-Oeste, Nordeste e Norte',
        description: 'Cobertura de 15 estados com sistemas PJe e Projudi',
        category: 'expansao-regional',
        order: 3,
        contentFile: '/docs/guias/05-expansao-co-ne-n.md',
        estimatedReadTime: 20,
        lastUpdated: '2026-03-03',
        tags: ['Centro-Oeste', 'Nordeste', 'Norte', 'PJe', 'Projudi']
      }
    ]
  }
];

export const getAllGuides = () => {
  return GUIDES_CATEGORIES.flatMap(category => category.guides);
};

export const getGuideById = (id: string) => {
  return getAllGuides().find(guide => guide.id === id);
};

export const getGuideBySlug = (slug: string) => {
  return getAllGuides().find(guide => guide.slug === slug);
};

export const getGuidesByCategory = (categoryId: string) => {
  const category = GUIDES_CATEGORIES.find(cat => cat.id === categoryId);
  return category?.guides || [];
};

export const getCategoryById = (id: string) => {
  return GUIDES_CATEGORIES.find(category => category.id === id);
};
