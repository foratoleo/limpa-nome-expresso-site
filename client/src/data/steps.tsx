import { FileIcon, ScalesIcon, ArrowRightIcon, VideoIcon, ShieldIcon } from "@/utils/icons";
import type { CheckItemData } from "@/components/CheckItem";

// Re-export CheckItemData as CheckItem for backward compatibility
export type { CheckItemData as CheckItem } from "@/components/CheckItem";

export interface StepDownload {
  label: string;
  file: string;
  description: string;
  template?: 'form-fillable';
}

export interface Step {
  number: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  items: CheckItemData[];
  tip?: string;
  links?: { label: string; url: string; external?: boolean }[];
  downloads?: StepDownload[];
}

export const STEPS: Step[] = [
  {
    number: 1,
    title: "Reunião de Documentos",
    subtitle: "O Arsenal da Prova",
    icon: <FileIcon size="medium" label="" />,
    color: "#d39e17",
    tip: "A qualidade da sua prova é o que garante a rapidez da liminar. Organize tudo em uma pasta digital antes de protocolar.",
    downloads: [
      { label: "Checklist Completo de Documentos", file: "/docs/checklist_documentos.md", description: "Lista detalhada de tudo que você precisa reunir" }
    ],
    items: [
      { id: "rg_cpf", label: "RG e CPF (frente e verso)", detail: "Digitalizado em PDF, boa resolução" },
      { id: "comprovante_residencia", label: "Comprovante de Residência recente", detail: "Últimos 3 meses, em seu nome (água, luz, telefone ou Correios)" },
      { id: "relatorio_serasa", label: "Relatório completo do Serasa/SPC/Boa Vista", detail: "Gratuito em serasa.com.br - mostra a negativação que você contesta" },
      { id: "print_email_entrada", label: "Print da caixa de entrada do e-mail", detail: "Busque por 'Serasa', 'SPC', 'notificação' e o nome da empresa credora" },
      { id: "print_email_spam", label: "Print da pasta spam/lixo eletrônico", detail: "Mesma busca - mostra a barra de pesquisa com os termos e nenhum resultado" },
      { id: "print_sms", label: "Print do histórico de SMS do celular", detail: "Mostrando ausência de mensagens da empresa ou dos órgãos de proteção ao crédito" },
      { id: "prova_dano", label: "Prova do Dano Atual datada de 2026", detail: "Ex: e-mail de banco negando crédito, proposta de emprego condicionada a nome limpo, negativa de crediário" },
    ],
  },
  {
    number: 2,
    title: "Preparação da Petição",
    subtitle: "O Documento Chave",
    icon: <ScalesIcon size="medium" label="" />,
    color: "#60a5fa",
    tip: "Mantenha o pedido de exclusão 'até o trânsito em julgado da presente ação' - isso garante mais de 12 meses de nome limpo.",
    downloads: [
      { label: "Petição Inicial Pré-Preenchida (SP)", file: "/docs/peticao_inicial_jec_sp.md", description: "Modelo completo para o JEC de São Paulo - preencha os campos [...]", template: 'form-fillable' }
    ],
    items: [
      { id: "baixar_modelo", label: "Baixar e abrir o modelo de petição (link abaixo)", detail: "Arquivo .md - abra com qualquer editor de texto ou Word" },
      { id: "preencher_dados", label: "Preencher todos os campos [PREENCHER: ...] com seus dados", detail: "Nome, CPF, endereço, dados da empresa credora e da dívida" },
      { id: "descrever_fatos", label: "Descrever os fatos na seção 'DOS FATOS'", detail: "Enfatize a falta de notificação e o prejuízo sofrido com detalhes" },
      { id: "verificar_tutela", label: "Confirmar pedido de exclusão 'até o trânsito em julgado'", detail: "Esta formulação é o que garante a blindagem por 12 meses+" },
      { id: "verificar_multa", label: "Confirmar a multa diária de R$ 500,00 (astreintes)", detail: "Força o Serasa/SPC a cumprir em 5 dias úteis" },
      { id: "listar_anexos", label: "Listar todos os documentos na seção 'DOCUMENTOS ANEXOS'", detail: "Todos os itens do Passo 1 devem estar listados e numerados" },
      { id: "salvar_pdf", label: "Salvar a petição preenchida em formato PDF", detail: "Max. 30 MB por arquivo, 300 KB por página - exigência do e-SAJ" },
    ],
  },
  {
    number: 3,
    title: "Protocolo no e-SAJ",
    subtitle: "Sistema Oficial do TJSP para o JEC",
    icon: <ArrowRightIcon size="medium" label="" />,
    color: "#22c55e",
    tip: "Anote o número do processo gerado - você vai precisar dele imediatamente no Passo 4 para o Balcão Virtual.",
    links: [
      { label: "Acessar o Peticionamento JEC - e-SAJ TJSP", url: "https://www.tjsp.jus.br/peticionamentojec", external: true },
      { label: "Verificar sua Comarca por CEP (Capital SP)", url: "https://www.tjsp.jus.br/PeticionamentoJEC", external: true },
    ],
    items: [
      { id: "acessar_esaj", label: "Acessar tjsp.jus.br/peticionamentojec", detail: "Sistema e-SAJ - peticionamento eletrônico do JEC para cidadão sem advogado" },
      { id: "verificar_comarca", label: "Verificar em qual foro/comarca você deve peticionar", detail: "Na Capital: pelo seu CEP. No interior: pelo nome da cidade" },
      { id: "cadastro_sistema", label: "Realizar cadastro no sistema (se for o primeiro acesso)", detail: "Necessário certificado digital (e-CPF) para peticionamento online" },
      { id: "iniciar_processo", label: "Iniciar novo processo e preencher os campos obrigatórios", detail: "Competência: JEC | Classe: 436 | Assunto: Serasa ou SCPC" },
      { id: "cadastrar_partes", label: "Cadastrar as partes: você (Autor) + empresa credora + Serasa/SPC (Réus)", detail: "Serasa S.A. - CNPJ: 00.204.698/0001-46" },
      { id: "marcar_urgencia", label: "Marcar a opção 'Pedido Liminar / Tutela Antecipada'", detail: "Campo obrigatório para prioridade na análise - só marque se houver dano irreparável" },
      { id: "anexar_documentos", label: "Anexar a Petição em PDF e todos os documentos separados", detail: "Cada documento em arquivo PDF separado e identificado" },
      { id: "anotar_numero", label: "Finalizar e anotar o número do processo gerado", detail: "Essencial para o Balcão Virtual no próximo passo" },
    ],
  },
  {
    number: 4,
    title: "Tática do Balcão Virtual",
    subtitle: "Aceleração Máxima - TJSP",
    icon: <VideoIcon size="medium" label="" />,
    color: "#d39e17",
    tip: "Seja educado, firme e objetivo. O objetivo é fazer seu processo 'furar a fila' e chegar à mesa do juiz em até 48 horas.",
    links: [
      { label: "Acessar o Balcão Virtual TJSP", url: "https://www.tjsp.jus.br/balcaovirtual", external: true },
    ],
    downloads: [
      { label: "Roteiro de Fala Pré-Preenchido", file: "/docs/roteiro_balcao_virtual.md", description: "Script completo para o atendimento por videoconferência" }
    ],
    items: [
      { id: "baixar_roteiro", label: "Baixar e preencher o roteiro de fala (link abaixo)", detail: "Preencha com seus dados antes de iniciar a chamada" },
      { id: "acessar_balcao", label: "Acessar tjsp.jus.br/balcaovirtual (Seg-Sex, 9h-17h)", detail: "Selecionar: 1ª Instância - Juizados Especiais" },
      { id: "selecionar_vara", label: "Selecionar o fórum onde o processo foi distribuído", detail: "Use o número do processo para identificar a vara correta" },
      { id: "aguardar_fila", label: "Aguardar na fila virtual com câmera e microfone prontos", detail: "Tenha o número do processo e seus documentos à mão" },
      { id: "usar_roteiro", label: "Usar o roteiro de fala ao ser atendido", detail: "Informe o número do processo, o dano irreparável e peça encaminhamento urgente ao juiz" },
      { id: "anotar_atendimento", label: "Anotar o nome do servidor e o protocolo do atendimento", detail: "Importante para referência em caso de necessidade de novo contato" },
    ],
  },
  {
    number: 5,
    title: "Acompanhamento",
    subtitle: "Monitoramento e Próximos Passos",
    icon: <ShieldIcon size="medium" label="" />,
    color: "#22c55e",
    tip: "Liminar concedida: o Serasa/SPC tem 5 dias úteis para cumprir após a intimação. Verifique seu nome após esse prazo.",
    links: [
      { label: "Consultar Processo no e-SAJ", url: "https://esaj.tjsp.jus.br/cpopg/open.do", external: true },
      { label: "Verificar Nome no Serasa (gratuito)", url: "https://www.serasa.com.br", external: true },
    ],
    items: [
      { id: "monitorar_diario", label: "Monitorar o processo diariamente no e-SAJ", detail: "Acesse esaj.tjsp.jus.br/cpopg/open.do com o número do processo" },
      { id: "liminar_concedida", label: "Se liminar concedida: aguardar 5 dias úteis para a exclusão", detail: "O cartório intimará o Serasa/SPC, que terá esse prazo para cumprir" },
      { id: "verificar_nome", label: "Verificar o nome no Serasa/SPC após o prazo", detail: "Acesse serasa.com.br ou spcbrasil.org.br para confirmar a exclusão" },
      { id: "liminar_negada", label: "Se liminar negada: continuar o processo até a sentença final", detail: "Você terá chance de apresentar mais argumentos e provas na audiência" },
      { id: "multa_descumprimento", label: "Se houver descumprimento: acionar a multa diária (astreintes)", detail: "Petição no e-SAJ informando o descumprimento e solicitando a aplicação da multa de R$ 500/dia" },
    ],
  },
];

export const TOTAL_ITEMS = STEPS.reduce((acc, s) => acc + s.items.length, 0);
