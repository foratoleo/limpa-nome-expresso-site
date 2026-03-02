import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  convertInchesToTwip,
  Packer,
} from "docx";
import { saveAs } from "file-saver";

// Document template definitions
export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  step: number;
  stepTitle: string;
  filename: string;
  icon: string;
  color: string;
}

// All available templates organized by step
export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: "checklist-documentos",
    title: "Checklist Completo de Documentos",
    description: "Lista detalhada de todos os documentos necessários para o processo",
    step: 1,
    stepTitle: "Reunião de Documentos",
    filename: "checklist_documentos.docx",
    icon: "TaskIcon",
    color: "#d39e17",
  },
  {
    id: "peticao-inicial",
    title: "Petição Inicial Pre-Preenchida",
    description: "Modelo completo para o JEC de São Paulo - sistema e-SAJ TJSP",
    step: 2,
    stepTitle: "Preparação da Petição",
    filename: "peticao_inicial_jec_sp.docx",
    icon: "ScalesIcon",
    color: "#60a5fa",
  },
  {
    id: "roteiro-balcao",
    title: "Roteiro do Balcão Virtual",
    description: "Script de fala pre-preenchido para o atendimento por videoconferência",
    step: 4,
    stepTitle: "Tática do Balcão Virtual",
    filename: "roteiro_balcao_virtual.docx",
    icon: "VideoIcon",
    color: "#d39e17",
  },
  {
    id: "guia-completo",
    title: "Guia Completo Passo a Passo",
    description: "Todos os 5 passos detalhados em um único documento",
    step: 0,
    stepTitle: "Guia Completo",
    filename: "guia_completo_limpa_nome.docx",
    icon: "BookIcon",
    color: "#22c55e",
  },
];

// Helper to create styled paragraphs
function createTitle(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 48,
        color: "12110D",
      }),
    ],
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  });
}

function createHeading1(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 32,
        color: "162847",
      }),
    ],
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
  });
}

function createHeading2(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 26,
        color: "1E3A5F",
      }),
    ],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
  });
}

function createHeading3(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22,
        color: "2D4A6F",
      }),
    ],
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
  });
}

function createParagraph(text: string, options: { bold?: boolean; italic?: boolean; indent?: boolean } = {}): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: options.bold,
        italics: options.italic,
        size: 22,
      }),
    ],
    spacing: { after: 120 },
    indent: options.indent ? { left: convertInchesToTwip(0.5) } : undefined,
  });
}

function createCheckboxItem(text: string, checked: boolean = false): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: checked ? "[X] " : "[ ] ",
        bold: true,
        size: 22,
      }),
      new TextRun({
        text,
        size: 22,
      }),
    ],
    spacing: { after: 80 },
  });
}

function createBlockQuote(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        italics: true,
        size: 22,
        color: "64748B",
      }),
    ],
    indent: { left: convertInchesToTwip(0.5), right: convertInchesToTwip(0.5) },
    spacing: { before: 150, after: 150 },
  });
}

function createHorizontalLine(): Paragraph {
  return new Paragraph({
    children: [],
    border: {
      bottom: {
        color: "D39E17",
        space: 1,
        size: 6,
        style: BorderStyle.SINGLE,
      },
    },
    spacing: { before: 200, after: 200 },
  });
}

// Generate Checklist Document Content (shared array)
function getChecklistContent(): Paragraph[] {
  return [
    createTitle("CHECKLIST COMPLETO — LIMPA NOME EXPRESSO"),
    createParagraph("Documentos e Ações para Limpeza de Nome no JEC de São Paulo (2026)", { bold: true }),
    createHorizontalLine(),

    // PASSO 1
    createHeading1("PASSO 1 — REUNIÃO DE DOCUMENTOS"),

    createHeading2("Documentos Pessoais"),
    createCheckboxItem("RG (frente e verso) — digitalizado em PDF"),
    createCheckboxItem("CPF — digitalizado em PDF"),
    createCheckboxItem("Comprovante de residência dos últimos 3 meses em seu nome"),

    createHeading2("Prova da Negativação"),
    createCheckboxItem("Relatório completo do Serasa (acesse: serasa.com.br — gratuito)"),
    createCheckboxItem("Relatório do SPC Brasil (acesse: spcbrasil.org.br — gratuito)"),
    createCheckboxItem("Relatório do Boa Vista SCPC (acesse: consumidorpositivo.com.br — gratuito)"),
    createCheckboxItem("O documento deve mostrar: nome da empresa credora, valor da dívida e data de inclusão"),

    createHeading2("Prova Negativa Digital (CRUCIAL em 2026)"),
    createCheckboxItem('Print da caixa de entrada do e-mail — com busca por "Serasa", "SPC", "notificação"'),
    createCheckboxItem("Print da pasta spam/lixo eletrônico do e-mail — mesma busca"),
    createCheckboxItem("Print do histórico de SMS do celular — mostrando ausência de mensagens"),
    createCheckboxItem("Dica: os prints devem mostrar a barra de busca com os termos pesquisados"),

    createHeading2("Prova do Dano Atual (O Gatilho da Urgência)"),
    createCheckboxItem("Documento datado de 2026 comprovando o prejuízo causado pela negativação"),
    createParagraph("Exemplos: E-mail de banco negando crédito, proposta de emprego condicionada a nome limpo, negativa de crediário", { indent: true }),

    // PASSO 2
    createHeading1("PASSO 2 — PETIÇÃO INICIAL"),
    createCheckboxItem("Baixar o modelo: peticao_inicial_jec_sp.docx"),
    createCheckboxItem("Preencher todos os campos marcados com [PREENCHER: ...]"),
    createCheckboxItem('Revisar a seção "DOS FATOS" — descrever o prejuízo com detalhes'),
    createCheckboxItem('Confirmar que o pedido de exclusão está "até o trânsito em julgado"'),
    createCheckboxItem("Confirmar que a multa diária de R$ 500,00 está incluída"),
    createCheckboxItem('Listar todos os documentos na seção "DOCUMENTOS ANEXOS"'),
    createCheckboxItem("Salvar em PDF (máx. 30 MB por arquivo, 300 KB por página)"),

    // PASSO 3
    createHeading1("PASSO 3 — PROTOCOLO NO e-SAJ (TJSP)"),
    createParagraph("Link: https://www.tjsp.jus.br/peticionamentojec", { bold: true }),
    createCheckboxItem("Acessar o sistema e-SAJ com certificado digital"),
    createCheckboxItem("Iniciar novo processo"),
    createCheckboxItem("Preencher os campos obrigatórios:"),
    createParagraph("Competência: Juizado Especial Cível", { indent: true }),
    createParagraph("Classe: 436 — Procedimento do Juizado Especial Cível", { indent: true }),
    createParagraph("Assunto Principal: Serasa ou SCPC", { indent: true }),
    createCheckboxItem("Cadastrar as partes: Autor (seus dados), Réu 1 (empresa credora), Réu 2 (Serasa S.A.)"),
    createCheckboxItem('Marcar a opção "Pedido Liminar / Tutela Antecipada"'),
    createCheckboxItem("Anexar a petição em PDF e cada documento em PDF separado"),
    createCheckboxItem("Finalizar e anotar o número do processo gerado"),

    // PASSO 4
    createHeading1("PASSO 4 — BALCÃO VIRTUAL"),
    createParagraph("Link: https://www.tjsp.jus.br/balcaovirtual | Horário: Seg–Sex, 9h–17h", { bold: true }),
    createCheckboxItem("Baixar o roteiro: roteiro_balcao_virtual.docx"),
    createCheckboxItem("Preencher o roteiro com seus dados antes de ligar"),
    createCheckboxItem("Acessar o Balcão Virtual imediatamente após o protocolo"),
    createCheckboxItem("Selecionar: 1ª Instância — Juizados Especiais"),
    createCheckboxItem("Selecionar o foro onde o processo foi distribuído"),
    createCheckboxItem("Aguardar na fila e usar o roteiro de fala ao ser atendido"),
    createCheckboxItem("Anotar o nome do servidor e o protocolo do atendimento"),

    // PASSO 5
    createHeading1("PASSO 5 — ACOMPANHAMENTO"),
    createParagraph("Consulta processual: https://esaj.tjsp.jus.br/cpopg/open.do", { bold: true }),
    createCheckboxItem("Monitorar o processo diariamente"),
    createCheckboxItem("Se liminar concedida: aguardar 5 dias úteis para a exclusão"),
    createCheckboxItem("Verificar o nome no Serasa/SPC após o prazo"),
    createCheckboxItem("Se não cumprido: peticionar informando o descumprimento"),

    createHorizontalLine(),

    // REFERÊNCIAS LEGAIS
    createHeading1("REFERÊNCIAS LEGAIS"),
    createParagraph("Art. 43, § 2º do CDC (Lei 8.078/90): Obrigatoriedade de notificação prévia", { indent: true }),
    createParagraph("Súmula 359 do STJ: Responsabilidade do órgão mantenedor pela notificação", { indent: true }),
    createParagraph("Súmula 385 do STJ: Danos morais não cabem se há outras negativações legítimas", { indent: true }),
    createParagraph("Art. 300 do CPC: Requisitos para concessão de tutela de urgência", { indent: true }),
    createParagraph("Art. 9º da Lei 9.099/95: Dispensa de advogado no JEC para causas até 20 salários mínimos", { indent: true }),
    createParagraph("Resolução CNJ nº 372/21: Institui o Balcão Virtual nos tribunais", { indent: true }),

    createHorizontalLine(),
    createParagraph("Checklist elaborado para o Juizado Especial Cível de São Paulo (TJSP), sistema e-SAJ. Fevereiro de 2026.", { italic: true }),
  ];
}

// Generate Checklist Document
function generateChecklistDocument(): Document {
  return new Document({
    sections: [
      {
        properties: {},
        children: getChecklistContent(),
      },
    ],
  });
}

// Generate Petition Document
function generatePetitionDocument(): Document {
  return new Document({
    sections: [
      {
        properties: {},
        children: [
          createTitle("MODELO DE PETIÇÃO INICIAL"),
          createHeading2("Juizado Especial Cível (São Paulo)"),
          createParagraph("Ação Declaratória c/c Obrigação de Fazer e Tutela de Urgência", { bold: true }),
          createParagraph("Sistema de Protocolo: e-SAJ TJSP — https://esaj.tjsp.jus.br"),
          createHorizontalLine(),

          createBlockQuote("INSTRUÇÕES DE PREENCHIMENTO: Substitua todos os campos marcados com [PREENCHER: ...] pelos seus dados reais. Salve o documento preenchido em PDF antes de anexar ao sistema e-SAJ."),

          createHorizontalLine(),

          createParagraph("EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE [PREENCHER: nome da sua cidade/bairro em SP]", { bold: true }),

          createHorizontalLine(),

          createParagraph("[PREENCHER: SEU NOME COMPLETO EM MAIÚSCULAS], brasileiro(a), [PREENCHER: estado civil], [PREENCHER: profissão], portador(a) do RG nº [PREENCHER: número do RG] — SSP/SP, inscrito(a) no CPF sob o nº [PREENCHER: 000.000.000-00], residente e domiciliado(a) na [PREENCHER: endereço completo com CEP], telefone: [PREENCHER: (11) 9xxxx-xxxx], e-mail: [PREENCHER: seu@email.com], vem, respeitosamente, à presença de Vossa Excelência, propor a presente"),

          createHeading1("AÇÃO DECLARATÓRIA DE IRREGULARIDADE DE NEGATIVAÇÃO C/C OBRIGAÇÃO DE FAZER COM PEDIDO DE TUTELA DE URGÊNCIA (LIMINAR)"),

          createParagraph("Em face de:", { bold: true }),

          createParagraph("[PREENCHER: NOME COMPLETO DA EMPRESA QUE NEGATIVOU], pessoa jurídica de direito privado, inscrita no CNPJ sob o nº [PREENCHER: 00.000.000/0001-00], com sede em [PREENCHER: endereço da empresa], doravante denominada REQUERIDA 1; e"),

          createParagraph("SERASA S.A. (ou SPC BRASIL / BOA VISTA SCPC), pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 00.204.698/0001-46, com sede na Alameda dos Quinimuras, nº 187, Planalto Paulista, São Paulo/SP, CEP 04068-900, doravante denominada REQUERIDA 2."),

          createParagraph("pelos fatos e fundamentos jurídicos a seguir expostos:"),

          createHorizontalLine(),

          createHeading1("I — DOS FATOS"),

          createParagraph("O(A) Requerente foi surpreendido(a) com a inclusão indevida de seu nome nos cadastros de inadimplentes mantidos pela Requerida 2 (Serasa/SPC/Boa Vista), referente a um suposto débito com a Requerida 1 no valor de R$ [PREENCHER: valor do débito], com data de vencimento em [PREENCHER: data de vencimento]."),

          createParagraph("Ocorre que o(a) Requerente NÃO RECEBEU QUALQUER NOTIFICAÇÃO PRÉVIA E ESCRITA acerca da referida inscrição, conforme determina expressamente o Artigo 43, § 2º do Código de Defesa do Consumidor e a Súmula 359 do Superior Tribunal de Justiça."),

          createParagraph("A ausência de notificação prévia causou e continua causando graves prejuízos ao(à) Requerente, que teve seu crédito negado em [PREENCHER: data da negativa], conforme documento comprobatório anexo."),

          createHorizontalLine(),

          createHeading1("II — DO DIREITO"),

          createParagraph("A conduta das Requeridas viola frontalmente o disposto no Artigo 43, § 2º da Lei nº 8.078/1990 (Código de Defesa do Consumidor), que impõe:"),

          createBlockQuote('"A abertura de cadastro, ficha, registro e dados pessoais e de consumo deverá ser comunicada por escrito ao consumidor, quando não solicitada por ele."'),

          createParagraph("A Súmula 359 do STJ é categórica:"),

          createBlockQuote('"Cabe ao órgão mantenedor do Cadastro de Proteção ao Crédito a notificação do devedor antes de proceder à inscrição."'),

          createHorizontalLine(),

          createHeading1("III — DA TUTELA DE URGÊNCIA (PEDIDO LIMINAR)"),

          createParagraph("Presentes os requisitos do Artigo 300 do Código de Processo Civil:"),

          createParagraph("1. Fumus Boni Iuris (Fumaça do Bom Direito): Evidenciado pela ausência de notificação prévia comprovada pelos documentos digitais anexos.", { bold: true }),

          createParagraph("2. Periculum in Mora (Perigo da Demora): Demonstrado pelo dano concreto, atual e irreparável que a manutenção indevida da negativação está causando.", { bold: true }),

          createParagraph("Diante da urgência, requer-se a concessão inaudita altera parte da Tutela de Urgência, determinando:"),

          createParagraph("a) A imediata exclusão do nome do(a) Requerente dos cadastros de inadimplentes", { indent: true }),
          createParagraph("b) Que a exclusão seja mantida até o trânsito em julgado da presente ação", { indent: true }),
          createParagraph("c) A fixação de multa diária (astreintes) de R$ 500,00 por dia de descumprimento", { indent: true }),

          createHorizontalLine(),

          createHeading1("IV — DOS PEDIDOS"),

          createParagraph("Diante do exposto, requer a Vossa Excelência:"),

          createParagraph("a) A concessão inaudita altera parte da Tutela de Urgência", { indent: true }),
          createParagraph("b) A citação das Requeridas para contestação", { indent: true }),
          createParagraph("c) A total procedência da ação para declarar a irregularidade da negativação", { indent: true }),
          createParagraph("d) Condenação ao pagamento de danos morais no valor de R$ [PREENCHER: entre R$ 3.000 e R$ 5.000]", { indent: true }),

          createParagraph("Dá-se à causa o valor de R$ [PREENCHER: soma do débito + danos morais]."),

          createParagraph("Nestes termos, pede deferimento."),

          createParagraph("São Paulo, [PREENCHER: dia] de [PREENCHER: mês] de 2026."),

          createHorizontalLine(),

          createParagraph("[PREENCHER: SEU NOME COMPLETO]", { bold: true }),
          createParagraph("CPF: [PREENCHER: 000.000.000-00]"),
          createParagraph("(Autor(a) — sem representação por advogado, nos termos do Art. 9º da Lei nº 9.099/95)", { italic: true }),

          createHorizontalLine(),

          createHeading2("DOCUMENTOS ANEXOS (em PDF separados, máx. 30 MB cada)"),

          createParagraph("1. RG (frente e verso) — Obrigatório"),
          createParagraph("2. CPF — Obrigatório"),
          createParagraph("3. Comprovante de Residência — Obrigatório"),
          createParagraph("4. Relatório de negativação do Serasa/SPC/Boa Vista — Obrigatório"),
          createParagraph("5. Print da caixa de entrada do e-mail (prova negativa) — Obrigatório"),
          createParagraph("6. Print da pasta de spam do e-mail (prova negativa) — Obrigatório"),
          createParagraph("7. Print do histórico de SMS (prova negativa) — Obrigatório"),
          createParagraph("8. Prova do dano atual (datado de 2026) — Obrigatório"),
          createParagraph("9. Qualquer documento relacionado à dívida — Se disponível"),

          createHorizontalLine(),
          createParagraph("Modelo elaborado com base no Art. 43, § 2º do CDC, Súmulas 359 e 385 do STJ. Válido para protocolo no sistema e-SAJ do TJSP. Fevereiro de 2026.", { italic: true }),
        ],
      },
    ],
  });
}

// Generate Balcao Virtual Script Document
function generateBalcaoDocument(): Document {
  return new Document({
    sections: [
      {
        properties: {},
        children: [
          createTitle("ROTEIRO DE ATENDIMENTO — BALCÃO VIRTUAL TJSP"),
          createHeading2("Para Despacho Urgente de Liminar — Limpeza de Nome"),
          createParagraph("Acesso: tjsp.jus.br/balcaovirtual | Horário: Seg–Sex, 9h–17h"),
          createHorizontalLine(),

          createBlockQuote("COMO USAR ESTE ROTEIRO: Tenha este documento aberto durante o atendimento por videoconferência. Preencha os campos [...] com seus dados antes de iniciar a chamada."),

          createHorizontalLine(),

          createHeading1("ANTES DE LIGAR — CHECKLIST DE PREPARAÇÃO"),

          createCheckboxItem("Processo já protocolado no e-SAJ"),
          createCheckboxItem("Número do processo anotado: [PREENCHER: 0000000-00.2026.8.26.0000]"),
          createCheckboxItem("Vara/Unidade: [PREENCHER: ex: 1ª Vara do JEC do Foro Regional de Pinheiros]"),
          createCheckboxItem("Data do protocolo: [PREENCHER: dd/mm/2026]"),
          createCheckboxItem("Câmera e microfone funcionando"),
          createCheckboxItem("Ambiente silencioso"),
          createCheckboxItem("Documento de identidade à mão"),

          createHorizontalLine(),

          createHeading1("PASSO A PASSO DO ACESSO"),

          createParagraph("1. Acesse: https://www.tjsp.jus.br/balcaovirtual"),
          createParagraph("2. Selecione: 1ª Instância — Juizados Especiais"),
          createParagraph("3. No campo Foro, digite o nome do foro: [PREENCHER: ex: Pinheiros]"),
          createParagraph("4. Selecione a unidade correta na lista"),
          createParagraph("5. Clique em Iniciar Atendimento e aguarde na fila"),

          createHorizontalLine(),

          createHeading1("ROTEIRO DE FALA — ABERTURA"),

          createParagraph("Quando o servidor atender, diga:", { bold: true }),

          createBlockQuote('"Bom dia/boa tarde. Meu nome é [PREENCHER: SEU NOME], CPF [PREENCHER: 000.000.000-00]. Eu protocolei uma ação no dia [PREENCHER: data], número de processo [PREENCHER: número], com pedido de tutela de urgência para exclusão do meu nome do Serasa/SPC. Gostaria de solicitar que o processo fosse encaminhado para análise da liminar pelo(a) juiz(a) com a máxima brevidade possível."'),

          createHorizontalLine(),

          createHeading1("ROTEIRO DE FALA — FUNDAMENTAÇÃO DA URGÊNCIA"),

          createParagraph("Se o servidor perguntar o motivo da urgência, diga:", { bold: true }),

          createBlockQuote('"A manutenção da negativação está me causando um dano irreparável: [PREENCHER: descreva seu prejuízo]. Todos esses documentos estão anexados ao processo como prova do dano atual."'),

          createHorizontalLine(),

          createHeading1("ROTEIRO DE FALA — PEDIDO ESPECÍFICO"),

          createBlockQuote('"Solicito que o processo seja concluso ao juiz para análise do pedido liminar. Sei que a decisão é do(a) juiz(a), mas gostaria que o processo fosse encaminhado com indicação de urgência."'),

          createHorizontalLine(),

          createHeading1("ROTEIRO DE FALA — ENCERRAMENTO"),

          createBlockQuote('"Muito obrigado(a) pela atenção. Poderia me informar o nome do(a) servidor(a) e o número do protocolo deste atendimento?"'),

          createHorizontalLine(),

          createHeading1("ANOTAÇÕES DURANTE O ATENDIMENTO"),

          createParagraph("Nome do servidor que atendeu: [anotar aqui]", { indent: true }),
          createParagraph("Data e hora do atendimento: [anotar aqui]", { indent: true }),
          createParagraph("Protocolo do atendimento: [anotar aqui]", { indent: true }),
          createParagraph("Prazo informado para análise: [anotar aqui]", { indent: true }),
          createParagraph("Observações: [anotar aqui]", { indent: true }),

          createHorizontalLine(),

          createHeading1("O QUE FAZER APÓS O ATENDIMENTO"),

          createParagraph("1. Monitore o processo diariamente no e-SAJ: https://esaj.tjsp.jus.br/cpopg/open.do"),
          createParagraph("2. Prazo esperado para a decisão: 2 a 10 dias úteis após o encaminhamento"),
          createParagraph("3. Se liminar concedida: o Serasa/SPC terá 5 dias úteis para excluir seu nome"),
          createParagraph("4. Se não houver movimentação em 5 dias: acesse o Balcão Virtual novamente"),

          createHorizontalLine(),

          createHeading1("INFORMAÇÕES ÚTEIS"),

          createParagraph("Balcão Virtual TJSP: https://www.tjsp.jus.br/balcaovirtual", { indent: true }),
          createParagraph("Peticionamento JEC: https://www.tjsp.jus.br/peticionamentojec", { indent: true }),
          createParagraph("Consulta processual: https://esaj.tjsp.jus.br/cpopg/open.do", { indent: true }),

          createHorizontalLine(),
          createParagraph("Roteiro elaborado com base nas diretrizes do TJSP (Resolução CNJ nº 372/21). Fevereiro de 2026.", { italic: true }),
        ],
      },
    ],
  });
}

// Generate Complete Guide Document
function generateCompleteGuideDocument(): Document {
  // Combine all content into one comprehensive guide
  const checklistContent = getChecklistContent().slice(0, -2); // Remove last footer elements

  return new Document({
    sections: [
      {
        properties: {},
        children: [
          createTitle("GUIA COMPLETO — LIMPA NOME EXPRESSO"),
          createHeading2("Sistema de Apoio Jurídico Automático"),
          createParagraph("Todos os 5 passos detalhados para limpeza de nome no JEC de São Paulo (TJSP - e-SAJ)"),
          createHorizontalLine(),

          // Include all content from checklist
          ...checklistContent,

          // Add petition section
          createHorizontalLine(),
          createHeading1("MODELO DE PETIÇÃO INICIAL"),
          createParagraph("Veja o arquivo separado: peticao_inicial_jec_sp.docx para o modelo completo preenchível.", { italic: true }),

          // Add balcao virtual section
          createHorizontalLine(),
          createHeading1("ROTEIRO DO BALCÃO VIRTUAL"),
          createParagraph("Veja o arquivo separado: roteiro_balcao_virtual.docx para o roteiro completo.", { italic: true }),

          createHorizontalLine(),
          createParagraph("Guia elaborado para o Juizado Especial Cível de São Paulo (TJSP), sistema e-SAJ. Fevereiro de 2026.", { italic: true }),
        ],
      },
    ],
  });
}

// Main function to generate and download a document
export async function generateAndDownloadDocx(templateId: string): Promise<void> {
  let doc: Document;
  let filename: string;

  switch (templateId) {
    case "checklist-documentos":
      doc = generateChecklistDocument();
      filename = "checklist_documentos.docx";
      break;
    case "peticao-inicial":
      doc = generatePetitionDocument();
      filename = "peticao_inicial_jec_sp.docx";
      break;
    case "roteiro-balcao":
      doc = generateBalcaoDocument();
      filename = "roteiro_balcao_virtual.docx";
      break;
    case "guia-completo":
      doc = generateCompleteGuideDocument();
      filename = "guia_completo_limpa_nome.docx";
      break;
    default:
      throw new Error(`Unknown template: ${templateId}`);
  }

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

// Export function to get templates grouped by step
export function getTemplatesByStep(): Record<number, DocumentTemplate[]> {
  return DOCUMENT_TEMPLATES.reduce((acc, template) => {
    const step = template.step;
    if (!acc[step]) acc[step] = [];
    acc[step].push(template);
    return acc;
  }, {} as Record<number, DocumentTemplate[]>);
}
