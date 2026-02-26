import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  DownloadIcon,
  ChevronDownIcon,
  WarningIcon,
  ScalesIcon,
  FileIcon,
  VideoIcon,
  ShieldIcon,
  ArrowRightIcon,
  LinkExternalIcon,
  SearchIcon,
} from "@/utils/icons";

import { StepCard, Step, CheckItem } from "@/components/StepCard";
import { DownloadsSection } from "@/components/DownloadsSection";
import { GlobalProgressBar, StickyProgressBar } from "@/components/ProgressBar";
import { WarningBanner } from "@/components/WarningBanner";
import { Container } from "@/components/ui/container";

const STEPS: Step[] = [
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
      { id: "relatorio_serasa", label: "Relatório completo do Serasa/SPC/Boa Vista", detail: "Gratuito em serasa.com.br — mostra a negativação que você contesta" },
      { id: "print_email_entrada", label: "Print da caixa de entrada do e-mail", detail: "Busque por 'Serasa', 'SPC', 'notificação' e o nome da empresa credora" },
      { id: "print_email_spam", label: "Print da pasta spam/lixo eletrônico", detail: "Mesma busca — mostra a barra de pesquisa com os termos e nenhum resultado" },
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
    tip: "Mantenha o pedido de exclusão 'até o trânsito em julgado da presente ação' — isso garante mais de 12 meses de nome limpo.",
    downloads: [
      { label: "Petição Inicial Pre-Preenchida (SP)", file: "/docs/peticao_inicial_jec_sp.md", description: "Modelo completo para o JEC de São Paulo — preencha os campos [...]" }
    ],
    items: [
      { id: "baixar_modelo", label: "Baixar e abrir o modelo de petição (link abaixo)", detail: "Arquivo .md — abra com qualquer editor de texto ou Word" },
      { id: "preencher_dados", label: "Preencher todos os campos [PREENCHER: ...] com seus dados", detail: "Nome, CPF, endereço, dados da empresa credora e da dívida" },
      { id: "descrever_fatos", label: "Descrever os fatos na seção 'DOS FATOS'", detail: "Enfatize a falta de notificação e o prejuízo sofrido com detalhes" },
      { id: "verificar_tutela", label: "Confirmar pedido de exclusão 'até o trânsito em julgado'", detail: "Esta formulação é o que garante a blindagem por 12 meses+" },
      { id: "verificar_multa", label: "Confirmar a multa diária de R$ 500,00 (astreintes)", detail: "Força o Serasa/SPC a cumprir em 5 dias úteis" },
      { id: "listar_anexos", label: "Listar todos os documentos na seção 'DOCUMENTOS ANEXOS'", detail: "Todos os itens do Passo 1 devem estar listados e numerados" },
      { id: "salvar_pdf", label: "Salvar a petição preenchida em formato PDF", detail: "Max. 30 MB por arquivo, 300 KB por página — exigência do e-SAJ" },
    ],
  },
  {
    number: 3,
    title: "Protocolo no e-SAJ",
    subtitle: "Sistema Oficial do TJSP para o JEC",
    icon: <ArrowRightIcon size="medium" label="" />,
    color: "#22c55e",
    tip: "Anote o número do processo gerado — você vai precisar dele imediatamente no Passo 4 para o Balcão Virtual.",
    links: [
      { label: "Acessar o Peticionamento JEC — e-SAJ TJSP", url: "https://www.tjsp.jus.br/peticionamentojec", external: true },
      { label: "Verificar sua Comarca por CEP (Capital SP)", url: "https://www.tjsp.jus.br/PeticionamentoJEC", external: true },
    ],
    items: [
      { id: "acessar_esaj", label: "Acessar tjsp.jus.br/peticionamentojec", detail: "Sistema e-SAJ — peticionamento eletrônico do JEC para cidadão sem advogado" },
      { id: "verificar_comarca", label: "Verificar em qual foro/comarca você deve peticionar", detail: "Na Capital: pelo seu CEP. No interior: pelo nome da cidade" },
      { id: "cadastro_sistema", label: "Realizar cadastro no sistema (se for o primeiro acesso)", detail: "Necessário certificado digital (e-CPF) para peticionamento online" },
      { id: "iniciar_processo", label: "Iniciar novo processo e preencher os campos obrigatórios", detail: "Competência: JEC | Classe: 436 | Assunto: Serasa ou SCPC" },
      { id: "cadastrar_partes", label: "Cadastrar as partes: você (Autor) + empresa credora + Serasa/SPC (Réus)", detail: "Serasa S.A. — CNPJ: 00.204.698/0001-46" },
      { id: "marcar_urgencia", label: "Marcar a opção 'Pedido Liminar / Tutela Antecipada'", detail: "Campo obrigatório para prioridade na análise — só marque se houver dano irreparável" },
      { id: "anexar_documentos", label: "Anexar a Petição em PDF e todos os documentos separados", detail: "Cada documento em arquivo PDF separado e identificado" },
      { id: "anotar_numero", label: "Finalizar e anotar o número do processo gerado", detail: "Essencial para o Balcão Virtual no próximo passo" },
    ],
  },
  {
    number: 4,
    title: "Tática do Balcão Virtual",
    subtitle: "Aceleração Máxima — TJSP",
    icon: <VideoIcon size="medium" label="" />,
    color: "#d39e17",
    tip: "Seja educado, firme e objetivo. O objetivo é fazer seu processo 'furar a fila' e chegar à mesa do juiz em até 48 horas.",
    links: [
      { label: "Acessar o Balcão Virtual TJSP", url: "https://www.tjsp.jus.br/balcaovirtual", external: true },
    ],
    downloads: [
      { label: "Roteiro de Fala Pre-Preenchido", file: "/docs/roteiro_balcao_virtual.md", description: "Script completo para o atendimento por videoconferência" }
    ],
    items: [
      { id: "baixar_roteiro", label: "Baixar e preencher o roteiro de fala (link abaixo)", detail: "Preencha com seus dados antes de iniciar a chamada" },
      { id: "acessar_balcao", label: "Acessar tjsp.jus.br/balcaovirtual (Seg–Sex, 9h–17h)", detail: "Selecionar: 1a Instância — Juizados Especiais" },
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
      { id: "multa_descumprimento", label: "Se houver descumprimento: acionar a multa diária (astreintes)", detail: "Peticione no e-SAJ informando o descumprimento e solicitando a aplicação da multa de R$ 500/dia" },
    ],
  },
];

function useChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("limpa-nome-checklist");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("limpa-nome-checklist", JSON.stringify(checked));
  }, [checked]);

  const toggle = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const totalItems = STEPS.reduce((acc, s) => acc + s.items.length, 0);
  const totalChecked = Object.values(checked).filter(Boolean).length;
  const progress = Math.round((totalChecked / totalItems) * 100);
  const resetAll = () => { setChecked({}); localStorage.removeItem("limpa-nome-checklist"); };

  return { checked, toggle, progress, totalChecked, totalItems, resetAll };
}

export default function Home() {
  const { checked, toggle, progress, totalChecked, totalItems, resetAll } = useChecklist();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#12110d", fontFamily: "'Public Sans', sans-serif" }}>
      <GlobalProgressBar progress={progress} />

      {/* Header - Figma Design */}
      <header
        className="sticky top-0 z-50 backdrop-blur-[6px] border-b"
        style={{
          backgroundColor: "rgba(18, 17, 13, 0.5)",
          borderColor: "rgba(211, 158, 23, 0.2)"
        }}
      >
        <Container as="div" maxWidth="xl" className="flex items-center justify-between py-4">
          {/* Logo & Nav */}
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg width="27" height="29" viewBox="0 0 27 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.5 0L26.5 8V21L13.5 29L0.5 21V8L13.5 0Z" fill="#d39e17"/>
                  <path d="M13.5 6L20 10V19L13.5 23L7 19V10L13.5 6Z" fill="#12110d"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold" style={{ color: "#f1f5f9", letterSpacing: "-0.3px" }}>
                Limpa Nome <span style={{ color: "#d39e17" }}>Expresso</span>
              </h2>
            </a>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#processos" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Meus Processos</a>
              <a href="#documentos" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Documentos</a>
              <a href="#modelos" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Modelos</a>
              <a href="#suporte" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Suporte</a>
            </nav>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", maxWidth: 256 }}>
              <div className="pl-4 flex items-center justify-center">
                <SearchIcon size="small" label="" />
              </div>
              <input
                type="text"
                placeholder="Buscar no guia..."
                className="bg-transparent border-none outline-none py-2.5 px-3 text-sm w-full"
                style={{ color: "#f1f5f9" }}
              />
            </div>
            <button
              className="px-5 py-2 rounded-full text-sm font-bold transition-all hover:shadow-lg"
              style={{
                backgroundColor: "#d39e17",
                color: "#12110d",
                boxShadow: "0 0 20px rgba(211, 158, 23, 0.3)"
              }}
            >
              Área do Cliente
            </button>
            <div
              className="w-10 h-10 rounded-full border-2 overflow-hidden hidden sm:block"
              style={{ borderColor: "rgba(211, 158, 23, 0.3)" }}
            >
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "rgba(211, 158, 23, 0.2)" }}>
                <span className="text-sm font-bold" style={{ color: "#d39e17" }}>U</span>
              </div>
            </div>
          </div>
        </Container>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: `url(https://private-us-east-1.manuscdn.com/sessionFile/tfQrixalo6L6d6Ru8eZN3k/sandbox/7RHK51NOj77WuuyMjjLXy1-img-1_1771862793000_na1fn_aGVyb19saW1wYV9ub21l.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdGZRcml4YWxvNkw2ZDZSdThlWk4zay9zYW5kYm94LzdSSEs1MU5Pajc3V3V1eU1qakxYeTEtaW1nLTFfMTc3MTg2Mjc5MzAwMF9uYTFmbl9hR1Z5YjE5c2FXMXdZVjl1YjIxbC5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=A8AW0Vtqr6xAMFi5D~izqAWWD9bJY0c7iW2--fIswQ1P6wgVZOy0N5crgQsMGD0SjOvOVBKTUxO9QqnCGCK8J9Qyd1oLd2GUvgDL1uK-SuiYJZzws6lds8jE-9xULdRV~~0UxF-SZpxosav4N4BwK8keSOVy1cYJU9niFI9jufp35BfQwchqAEGCJ3O2q5omPuRclKoMKKzWkxjjgozyjy7Bez0feuc1TYTlUWqIShEKvH7cZ3H5Y7pBzjz1oG6wRL8ilW~cxyrqmg0~RI-BQSh9DYbT5AW3FaSd~79F5ziN4PKpuxzhuT3RrNQYPrCJzmZVc2tQYUZegyOvB4TTcQ__)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(18,17,13,0.85) 0%, rgba(18,17,13,0.95) 100%)" }} />
        <Container as="div" maxWidth="xl" className="relative py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span
                className="text-xs font-bold tracking-[1.2px] uppercase px-4 py-2 rounded-full"
                style={{
                  border: "1px solid rgba(211, 158, 23, 0.5)",
                  color: "#d39e17"
                }}
              >
                Guia Jurídico 2026
              </span>
              <span
                className="text-xs font-bold tracking-[1.2px] uppercase px-4 py-2 rounded-full"
                style={{
                  border: "1px solid rgba(34, 197, 94, 0.5)",
                  color: "#22c55e"
                }}
              >
                Sem Advogado Necessário
              </span>
              <span
                className="text-xs font-bold tracking-[1.2px] uppercase px-4 py-2 rounded-full"
                style={{
                  border: "1px solid rgba(96, 165, 250, 0.5)",
                  color: "#60a5fa"
                }}
              >
                TJSP — e-SAJ
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6" style={{ color: "#f1f5f9" }}>
              Limpa Nome <span style={{ color: "#d39e17" }}>Expresso</span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed mb-8 max-w-2xl" style={{ color: "#94a3b8" }}>
              Guia prático e atualizado para limpar seu nome dos cadastros de inadimplentes via Juizado Especial Cível de São Paulo (e-SAJ TJSP) e Balcão Virtual, com base no Art. 43, §2º do CDC e Súmula 359 do STJ.
            </p>
            <div className="flex flex-wrap gap-8">
              {[
                { value: "5 Passos", label: "Processo completo" },
                { value: "5–15 dias", label: "Prazo médio da liminar" },
                { value: "12 meses+", label: "Blindagem do nome" },
                { value: "e-SAJ", label: "Sistema TJSP (SP)" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-extrabold" style={{ color: "#d39e17" }}>{stat.value}</div>
                  <div className="text-xs uppercase tracking-wider mt-1" style={{ color: "#64748b" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Progress summary */}
      <Container as="div" maxWidth="xl" className="sticky top-[73px] z-40 -mt-4">
        <div
          className="backdrop-blur-sm border rounded-2xl px-5 py-3 flex items-center gap-4 shadow-xl"
          style={{
            backgroundColor: "rgba(22, 40, 71, 0.95)",
            borderColor: "rgba(211, 158, 23, 0.2)"
          }}
        >
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold" style={{ color: "#e8e4d8" }}>Seu Progresso</span>
              <span className="text-sm font-bold" style={{ color: "#d39e17" }}>{totalChecked}/{totalItems} itens — {progress}%</span>
            </div>
            <StickyProgressBar progress={progress} />
          </div>
          <button
            onClick={resetAll}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: "#64748b" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(211, 158, 23, 0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            Reiniciar
          </button>
        </div>
      </Container>

      {/* Main Content */}
      <Container as="main" maxWidth="lg" className="py-8 space-y-4 flex-1">

        {/* Downloads section at top */}
        <DownloadsSection />

        {/* Step cards */}
        {STEPS.map((step) => (
          <StepCard key={step.number} step={step} checked={checked} onToggle={toggle} />
        ))}

        {/* JEC vs Balcão Virtual explanation */}
        <div
          className="rounded-3xl border p-6 backdrop-blur-[4px]"
          style={{
            backgroundColor: "rgba(22, 40, 71, 0.95)",
            borderColor: "rgba(96, 165, 250, 0.3)"
          }}
        >
          <div className="flex gap-3 mb-4">
            <span style={{ color: "#60a5fa" }} className="flex-shrink-0 mt-0.5"><VideoIcon size="medium" label="" /></span>
            <h4 className="font-bold text-lg" style={{ color: "#f1f5f9" }}>JEC (e-SAJ) vs. Balcão Virtual: Qual a diferença?</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
            <div
              className="rounded-2xl p-4 border"
              style={{
                backgroundColor: "rgba(18, 17, 13, 0.6)",
                borderColor: "rgba(34, 197, 94, 0.2)"
              }}
            >
              <div className="font-semibold mb-1" style={{ color: "#22c55e" }}>Juizado Especial Cível — e-SAJ</div>
              <p style={{ color: "#94a3b8" }} className="leading-relaxed">
                Onde você <strong style={{ color: "#e8e4d8" }}>protocola a ação</strong>. É o tribunal. Sem ele, não há processo. Acesse em <strong style={{ color: "#60a5fa" }}>tjsp.jus.br/peticionamentojec</strong>
              </p>
            </div>
            <div
              className="rounded-2xl p-4 border"
              style={{
                backgroundColor: "rgba(18, 17, 13, 0.6)",
                borderColor: "rgba(96, 165, 250, 0.2)"
              }}
            >
              <div className="font-semibold mb-1" style={{ color: "#60a5fa" }}>Balcão Virtual TJSP</div>
              <p style={{ color: "#94a3b8" }} className="leading-relaxed">
                Onde você <strong style={{ color: "#e8e4d8" }}>acelera o processo</strong>. Canal de videoconferência do mesmo TJ. Use <em>depois</em> de protocolar para pedir urgência ao escrevente.
              </p>
            </div>
          </div>
          <div
            className="rounded-2xl p-4 border"
            style={{
              backgroundColor: "rgba(18, 17, 13, 0.4)",
              borderColor: "rgba(211, 158, 23, 0.1)"
            }}
          >
            <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>
              <strong style={{ color: "#94a3b8" }}>Nota sobre o e-Proc:</strong> O TJSP iniciou a migração do e-SAJ para o e-Proc em outubro de 2025. O peticionamento do JEC para o cidadão sem advogado ainda utiliza o sistema <strong style={{ color: "#e8e4d8" }}>e-SAJ</strong> (tjsp.jus.br/peticionamentojec). O e-Proc é voltado principalmente para advogados e servidores. Verifique sempre o link oficial antes de protocolar.
            </p>
          </div>
        </div>

        {/* Warning */}
        <WarningBanner title="Atenção: Golpes Frequentes">
          Desconfie de empresas que cobram valores altos para "limpar o nome sem pagar a dívida". A via judicial pelo JEC é gratuita para o cidadão e não exige advogado para causas de até 20 salários mínimos. Você tem o poder de fazer isso sozinho com este guia.
        </WarningBanner>

        {/* Legal basis */}
        <div
          className="rounded-3xl border p-6 backdrop-blur-[4px]"
          style={{
            backgroundColor: "rgba(22, 40, 71, 0.95)",
            borderColor: "rgba(211, 158, 23, 0.2)"
          }}
        >
          <h4 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: "#d39e17" }}>Base Legal</h4>
          <div className="space-y-3 text-sm">
            <p className="leading-relaxed" style={{ color: "#94a3b8" }}>
              <strong style={{ color: "#e8e4d8" }}>Art. 43, §2º do CDC:</strong> A abertura de cadastro de inadimplentes deverá ser comunicada por escrito ao consumidor, quando não solicitada por ele.
            </p>
            <p className="leading-relaxed" style={{ color: "#94a3b8" }}>
              <strong style={{ color: "#e8e4d8" }}>Súmula 359 do STJ:</strong> Cabe ao órgão mantenedor do Cadastro de Proteção ao Crédito a notificação do devedor antes de proceder à inscrição.
            </p>
            <p className="leading-relaxed" style={{ color: "#94a3b8" }}>
              <strong style={{ color: "#e8e4d8" }}>Art. 9 da Lei 9.099/95:</strong> Nas causas de até 20 salários mínimos, as partes comparecerão pessoalmente, podendo ser assistidas por advogado.
            </p>
            <p className="leading-relaxed" style={{ color: "#94a3b8" }}>
              <strong style={{ color: "#e8e4d8" }}>Resolução CNJ nº 372/21:</strong> Institui o Balcão Virtual para atendimento imediato por videoconferência nas unidades judiciais.
            </p>
          </div>
        </div>
      </Container>

      {/* Footer - Figma Design */}
      <footer
        className="border-t mt-8"
        style={{
          backgroundColor: "rgba(18, 17, 13, 0.8)",
          borderColor: "rgba(211, 158, 23, 0.1)"
        }}
      >
        <Container as="div" maxWidth="xl" className="py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 0L17.5 5V14L9 19L0.5 14V5L9 0Z" fill="#d39e17"/>
                <path d="M9 4L13 6.5V11.5L9 14L5 11.5V6.5L9 4Z" fill="#12110d"/>
              </svg>
              <span className="text-sm" style={{ color: "#64748b" }}>
                © 2024 Limpa Nome Expresso. Sistema de Apoio Jurídico Automático.
              </span>
            </div>
            <div className="flex items-center gap-8">
              <a href="#termos" className="text-sm hover:text-[#d39e17] transition-colors" style={{ color: "#64748b" }}>Termos de Uso</a>
              <a href="#privacidade" className="text-sm hover:text-[#d39e17] transition-colors" style={{ color: "#64748b" }}>Privacidade</a>
              <a href="#oab" className="text-sm hover:text-[#d39e17] transition-colors" style={{ color: "#64748b" }}>OAB Compliance</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
