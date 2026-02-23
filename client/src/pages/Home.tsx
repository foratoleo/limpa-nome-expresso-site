import { useState, useEffect } from "react";
import {
  CheckCircle2, Circle, Download, ChevronDown, AlertTriangle,
  Scale, FileText, Video, Shield, ArrowRight, ExternalLink, BookOpen, ClipboardList
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CheckItem {
  id: string;
  label: string;
  detail?: string;
}

interface Step {
  number: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  items: CheckItem[];
  tip?: string;
  links?: { label: string; url: string; external?: boolean }[];
  downloads?: { label: string; file: string; description: string }[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const STEPS: Step[] = [
  {
    number: 1,
    title: "Reunião de Documentos",
    subtitle: "O Arsenal da Prova",
    icon: <FileText size={22} />,
    color: "#D4A017",
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
    icon: <Scale size={22} />,
    color: "#4A90D9",
    tip: "Mantenha o pedido de exclusão 'até o trânsito em julgado da presente ação' — isso garante mais de 12 meses de nome limpo.",
    downloads: [
      { label: "Petição Inicial Pré-Preenchida (SP)", file: "/docs/peticao_inicial_jec_sp.md", description: "Modelo completo para o JEC de São Paulo — preencha os campos [...]" }
    ],
    items: [
      { id: "baixar_modelo", label: "Baixar e abrir o modelo de petição (link abaixo)", detail: "Arquivo .md — abra com qualquer editor de texto ou Word" },
      { id: "preencher_dados", label: "Preencher todos os campos [PREENCHER: ...] com seus dados", detail: "Nome, CPF, endereço, dados da empresa credora e da dívida" },
      { id: "descrever_fatos", label: "Descrever os fatos na seção 'DOS FATOS'", detail: "Enfatize a falta de notificação e o prejuízo sofrido com detalhes" },
      { id: "verificar_tutela", label: "Confirmar pedido de exclusão 'até o trânsito em julgado'", detail: "Esta formulação é o que garante a blindagem por 12 meses+" },
      { id: "verificar_multa", label: "Confirmar a multa diária de R$ 500,00 (astreintes)", detail: "Força o Serasa/SPC a cumprir em 5 dias úteis" },
      { id: "listar_anexos", label: "Listar todos os documentos na seção 'DOCUMENTOS ANEXOS'", detail: "Todos os itens do Passo 1 devem estar listados e numerados" },
      { id: "salvar_pdf", label: "Salvar a petição preenchida em formato PDF", detail: "Máx. 30 MB por arquivo, 300 KB por página — exigência do e-SAJ" },
    ],
  },
  {
    number: 3,
    title: "Protocolo no e-SAJ",
    subtitle: "Sistema Oficial do TJSP para o JEC",
    icon: <ArrowRight size={22} />,
    color: "#5BAD6F",
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
      { id: "anotar_numero", label: "Finalizar e anotar o número do processo gerado", detail: "⚠️ Essencial para o Balcão Virtual no próximo passo" },
    ],
  },
  {
    number: 4,
    title: "Tática do Balcão Virtual",
    subtitle: "Aceleração Máxima — TJSP",
    icon: <Video size={22} />,
    color: "#D4A017",
    tip: "Seja educado, firme e objetivo. O objetivo é fazer seu processo 'furar a fila' e chegar à mesa do juiz em até 48 horas.",
    links: [
      { label: "Acessar o Balcão Virtual TJSP", url: "https://www.tjsp.jus.br/balcaovirtual", external: true },
    ],
    downloads: [
      { label: "Roteiro de Fala Pré-Preenchido", file: "/docs/roteiro_balcao_virtual.md", description: "Script completo para o atendimento por videoconferência" }
    ],
    items: [
      { id: "baixar_roteiro", label: "Baixar e preencher o roteiro de fala (link abaixo)", detail: "Preencha com seus dados antes de iniciar a chamada" },
      { id: "acessar_balcao", label: "Acessar tjsp.jus.br/balcaovirtual (Seg–Sex, 9h–17h)", detail: "Selecionar: 1ª Instância — Juizados Especiais" },
      { id: "selecionar_vara", label: "Selecionar o foro onde o processo foi distribuído", detail: "Use o número do processo para identificar a vara correta" },
      { id: "aguardar_fila", label: "Aguardar na fila virtual com câmera e microfone prontos", detail: "Tenha o número do processo e seus documentos à mão" },
      { id: "usar_roteiro", label: "Usar o roteiro de fala ao ser atendido", detail: "Informe o número do processo, o dano irreparável e peça encaminhamento urgente ao juiz" },
      { id: "anotar_atendimento", label: "Anotar o nome do servidor e o protocolo do atendimento", detail: "Importante para referência em caso de necessidade de novo contato" },
    ],
  },
  {
    number: 5,
    title: "Acompanhamento",
    subtitle: "Monitoramento e Próximos Passos",
    icon: <Shield size={22} />,
    color: "#5BAD6F",
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

// ─── Checklist Hook ────────────────────────────────────────────────────────────
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

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#162847]">
      <div className="h-full bg-[#D4A017] transition-all duration-500" style={{ width: `${progress}%` }} />
    </div>
  );
}

// ─── Download Button ──────────────────────────────────────────────────────────
function DownloadBtn({ label, file, description }: { label: string; file: string; description: string }) {
  return (
    <a
      href={file}
      download
      className="flex items-start gap-3 w-full px-4 py-3 rounded-xl border border-[#D4A017]/40 hover:bg-[#D4A017]/10 transition-colors duration-200 group"
    >
      <Download size={16} className="text-[#D4A017] flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
      <div>
        <div className="text-[#D4A017] text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</div>
        <div className="text-[#7A9AB8] text-xs mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{description}</div>
      </div>
    </a>
  );
}

// ─── Link Button ──────────────────────────────────────────────────────────────
function LinkBtn({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#4A90D9]/40 text-[#4A90D9] hover:bg-[#4A90D9]/10 transition-colors duration-200 text-sm font-medium"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <ExternalLink size={14} />
      {label}
    </a>
  );
}

// ─── Step Card ────────────────────────────────────────────────────────────────
function StepCard({ step, checked, onToggle }: { step: Step; checked: Record<string, boolean>; onToggle: (id: string) => void }) {
  const [open, setOpen] = useState(true);
  const stepChecked = step.items.filter((i) => checked[i.id]).length;
  const stepDone = stepChecked === step.items.length;

  return (
    <div className={`relative rounded-2xl border transition-all duration-300 ${stepDone ? "border-[#2E7D52]/60 bg-[#162847]/80" : "border-[#243B5E] bg-[#162847]/60"}`}>
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: step.color }} />

      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 px-6 pt-5 pb-4 text-left">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-[#0F1E3C] font-extrabold text-xl"
          style={{ backgroundColor: step.color, fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {step.number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: step.color, fontFamily: "'Space Grotesk', sans-serif" }}>
              {step.subtitle}
            </span>
            {stepDone && (
              <span className="text-xs bg-[#2E7D52]/30 text-[#5BAD6F] px-2 py-0.5 rounded-full font-medium">Concluído</span>
            )}
          </div>
          <h3 className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            {step.title}
          </h3>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm text-[#8BA8C8] font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {stepChecked}/{step.items.length}
          </span>
          <div className="text-[#8BA8C8]">{step.icon}</div>
          <ChevronDown size={18} className={`text-[#8BA8C8] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      <div className="mx-6 h-0.5 bg-[#243B5E] rounded-full mb-1">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(stepChecked / step.items.length) * 100}%`, backgroundColor: step.color }}
        />
      </div>

      {open && (
        <div className="px-6 pt-3 pb-5 space-y-3">
          {step.tip && (
            <div className="flex gap-3 bg-[#0F1E3C]/60 border border-[#D4A017]/20 rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="text-[#D4A017] flex-shrink-0 mt-0.5" />
              <p className="text-[#D4A017]/90 text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>{step.tip}</p>
            </div>
          )}

          {/* Downloads */}
          {step.downloads && step.downloads.length > 0 && (
            <div className="space-y-2">
              {step.downloads.map((d) => (
                <DownloadBtn key={d.file} label={d.label} file={d.file} description={d.description} />
              ))}
            </div>
          )}

          {/* Links */}
          {step.links && step.links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {step.links.map((l) => (
                <LinkBtn key={l.url} label={l.label} url={l.url} />
              ))}
            </div>
          )}

          {/* Checklist */}
          <ul className="space-y-2">
            {step.items.map((item) => {
              const isChecked = !!checked[item.id];
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onToggle(item.id)}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                      isChecked
                        ? "bg-[#2E7D52]/15 border border-[#2E7D52]/30"
                        : "bg-[#0F1E3C]/40 border border-transparent hover:border-[#243B5E] hover:bg-[#0F1E3C]/60"
                    }`}
                  >
                    <span className="flex-shrink-0 mt-0.5">
                      {isChecked ? <CheckCircle2 size={18} className="text-[#5BAD6F]" /> : <Circle size={18} className="text-[#4A6080]" />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span
                        className={`block text-sm font-medium leading-snug ${isChecked ? "text-[#8BA8C8] line-through" : "text-[#E8E4D8]"}`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {item.label}
                      </span>
                      {item.detail && (
                        <span className="block text-xs text-[#5A7A9A] mt-0.5 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {item.detail}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Downloads Section ────────────────────────────────────────────────────────
function DownloadsSection() {
  const docs = [
    {
      icon: <ClipboardList size={20} className="text-[#D4A017]" />,
      title: "Checklist Completo de Documentos",
      description: "Lista detalhada de todos os documentos necessários para o Passo 1",
      file: "/docs/checklist_documentos.md",
      badge: "Passo 1",
      badgeColor: "#D4A017",
    },
    {
      icon: <Scale size={20} className="text-[#4A90D9]" />,
      title: "Petição Inicial Pré-Preenchida",
      description: "Modelo completo para o JEC de São Paulo — sistema e-SAJ TJSP",
      file: "/docs/peticao_inicial_jec_sp.md",
      badge: "Passo 2",
      badgeColor: "#4A90D9",
    },
    {
      icon: <Video size={20} className="text-[#D4A017]" />,
      title: "Roteiro do Balcão Virtual",
      description: "Script de fala pré-preenchido para o atendimento por videoconferência",
      file: "/docs/roteiro_balcao_virtual.md",
      badge: "Passo 4",
      badgeColor: "#D4A017",
    },
  ];

  return (
    <div className="rounded-2xl border border-[#243B5E] bg-[#162847]/40 p-6">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen size={20} className="text-[#D4A017]" />
        <h4 className="font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          Todos os Documentos para Download
        </h4>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {docs.map((doc) => (
          <a
            key={doc.file}
            href={doc.file}
            download
            className="flex flex-col gap-2 p-4 rounded-xl bg-[#0F1E3C]/60 border border-[#243B5E] hover:border-[#D4A017]/40 hover:bg-[#0F1E3C]/80 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              {doc.icon}
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${doc.badgeColor}20`, color: doc.badgeColor, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {doc.badge}
              </span>
            </div>
            <div className="font-semibold text-[#E8E4D8] text-sm leading-snug group-hover:text-white transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {doc.title}
            </div>
            <div className="text-xs text-[#5A7A9A] leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              {doc.description}
            </div>
            <div className="flex items-center gap-1 text-xs text-[#D4A017] mt-auto pt-1 font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Download size={12} />
              Baixar documento
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Home() {
  const { checked, toggle, progress, totalChecked, totalItems, resetAll } = useChecklist();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0F1E3C", fontFamily: "'Inter', sans-serif" }}>
      <ProgressBar progress={progress} />

      {/* Hero */}
      <header
        className="relative overflow-hidden"
        style={{
          backgroundImage: `url(https://private-us-east-1.manuscdn.com/sessionFile/tfQrixalo6L6d6Ru8eZN3k/sandbox/7RHK51NOj77WuuyMjjLXy1-img-1_1771862793000_na1fn_aGVyb19saW1wYV9ub21l.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdGZRcml4YWxvNkw2ZDZSdThlWk4zay9zYW5kYm94LzdSSEs1MU5Pajc3V3V1eU1qakxYeTEtaW1nLTFfMTc3MTg2Mjc5MzAwMF9uYTFmbl9hR1Z5YjE5c2FXMXdZVjl1YjIxbC5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=A8AW0Vtqr6xAMFi5D~izqAWWD9bJY0c7iW2--fIswQ1P6wgVZOy0N5crgQsMGD0SjOvOVBKTUxO9QqnCGCK8J9Qyd1oLd2GUvgDL1uK-SuiYJZzws6lds8jE-9xULdRV~~0UxF-SZpxosav4N4BwK8keSOVy1cYJU9niFI9jufp35BfQwchqAEGCJ3O2q5omPuRclKoMKKzWkxjjgozyjy7Bez0feuc1TYTlUWqIShEKvH7cZ3H5Y7pBzjz1oG6wRL8ilW~cxyrqmg0~RI-BQSh9DYbT5AW3FaSd~79F5ziN4PKpuxzhuT3RrNQYPrCJzmZVc2tQYUZegyOvB4TTcQ__)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(15,30,60,0.75) 0%, rgba(15,30,60,0.92) 100%)" }} />
        <div className="relative container py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border border-[#D4A017]/50 text-[#D4A017]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Guia Jurídico 2026
              </span>
              <span className="text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border border-[#5BAD6F]/50 text-[#5BAD6F]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Sem Advogado Necessário
              </span>
              <span className="text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border border-[#4A90D9]/50 text-[#4A90D9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                TJSP — e-SAJ
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Limpa Nome{" "}<span style={{ color: "#D4A017" }}>Expresso</span>
            </h1>
            <p className="text-[#A8C0D8] text-lg md:text-xl leading-relaxed mb-8 max-w-2xl" style={{ fontFamily: "'Inter', sans-serif" }}>
              Guia prático e atualizado para limpar seu nome dos cadastros de inadimplentes via Juizado Especial Cível de São Paulo (e-SAJ TJSP) e Balcão Virtual, com base no Art. 43, § 2º do CDC e Súmula 359 do STJ.
            </p>
            <div className="flex flex-wrap gap-6">
              {[
                { value: "5 Passos", label: "Processo completo" },
                { value: "5–15 dias", label: "Prazo médio da liminar" },
                { value: "12 meses+", label: "Blindagem do nome" },
                { value: "e-SAJ", label: "Sistema TJSP (SP)" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-extrabold text-[#D4A017]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</div>
                  <div className="text-xs text-[#7A9AB8] uppercase tracking-wider mt-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Progress summary */}
      <div className="sticky top-1 z-40 container">
        <div className="bg-[#162847]/95 backdrop-blur-sm border border-[#243B5E] rounded-2xl px-5 py-3 flex items-center gap-4 shadow-xl">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-[#E8E4D8]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Seu Progresso</span>
              <span className="text-sm font-bold text-[#D4A017]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{totalChecked}/{totalItems} itens — {progress}%</span>
            </div>
            <div className="h-2 bg-[#0F1E3C] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#D4A017] to-[#F0C040] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button onClick={resetAll} className="flex-shrink-0 text-xs text-[#5A7A9A] hover:text-[#8BA8C8] transition-colors px-2 py-1 rounded-lg hover:bg-[#0F1E3C]/50" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Reiniciar
          </button>
        </div>
      </div>

      {/* Steps */}
      <main className="container py-8 space-y-4 max-w-3xl mx-auto">

        {/* Downloads section at top */}
        <DownloadsSection />

        {/* Step cards */}
        {STEPS.map((step) => (
          <StepCard key={step.number} step={step} checked={checked} onToggle={toggle} />
        ))}

        {/* JEC vs Balcão Virtual explanation */}
        <div className="rounded-2xl border border-[#4A90D9]/30 bg-[#162847]/60 p-6">
          <div className="flex gap-3 mb-3">
            <Video size={20} className="text-[#4A90D9] flex-shrink-0 mt-0.5" />
            <h4 className="font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>JEC (e-SAJ) vs. Balcão Virtual: Qual a diferença?</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="bg-[#0F1E3C]/60 rounded-xl p-4 border border-[#243B5E]">
              <div className="font-semibold text-[#5BAD6F] mb-1">Juizado Especial Cível — e-SAJ</div>
              <p className="text-[#8BA8C8] leading-relaxed">Onde você <strong className="text-[#E8E4D8]">protocola a ação</strong>. É o tribunal. Sem ele, não há processo. Acesse em <strong className="text-[#4A90D9]">tjsp.jus.br/peticionamentojec</strong></p>
            </div>
            <div className="bg-[#0F1E3C]/60 rounded-xl p-4 border border-[#243B5E]">
              <div className="font-semibold text-[#4A90D9] mb-1">Balcão Virtual TJSP</div>
              <p className="text-[#8BA8C8] leading-relaxed">Onde você <strong className="text-[#E8E4D8]">acelera o processo</strong>. Canal de videoconferência do mesmo TJ. Use <em>depois</em> de protocolar para pedir urgência ao escrevente.</p>
            </div>
          </div>
          <div className="bg-[#0F1E3C]/40 rounded-xl p-4 border border-[#243B5E]">
            <p className="text-xs text-[#7A9AB8] leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              <strong className="text-[#A8C0D8]">Nota sobre o e-Proc:</strong> O TJSP iniciou a migração do e-SAJ para o e-Proc em outubro de 2025. O peticionamento do JEC para o cidadão sem advogado ainda utiliza o sistema <strong className="text-[#E8E4D8]">e-SAJ</strong> (tjsp.jus.br/peticionamentojec). O e-Proc é voltado principalmente para advogados e servidores. Verifique sempre o link oficial antes de protocolar.
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-2xl border border-[#C0392B]/30 bg-[#C0392B]/8 p-5 flex gap-3">
          <AlertTriangle size={20} className="text-[#E05252] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#E05252] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Atenção: Golpes Frequentes</p>
            <p className="text-[#A87070] text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              Desconfie de empresas que cobram valores altos para "limpar o nome sem pagar a dívida". A via judicial pelo JEC é gratuita para o cidadão e não exige advogado para causas de até 20 salários mínimos. Você tem o poder de fazer isso sozinho com este guia.
            </p>
          </div>
        </div>

        {/* Legal basis */}
        <div className="rounded-2xl border border-[#D4A017]/20 bg-[#162847]/40 p-6">
          <h4 className="font-bold text-[#D4A017] mb-3 text-sm uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Base Legal</h4>
          <div className="space-y-2 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
            <p className="text-[#A8C0D8] leading-relaxed"><strong className="text-[#E8E4D8]">Art. 43, § 2º do CDC:</strong> A abertura de cadastro de inadimplentes deverá ser comunicada por escrito ao consumidor, quando não solicitada por ele.</p>
            <p className="text-[#A8C0D8] leading-relaxed"><strong className="text-[#E8E4D8]">Súmula 359 do STJ:</strong> Cabe ao órgão mantenedor do Cadastro de Proteção ao Crédito a notificação do devedor antes de proceder à inscrição.</p>
            <p className="text-[#A8C0D8] leading-relaxed"><strong className="text-[#E8E4D8]">Art. 9º da Lei 9.099/95:</strong> Nas causas de até 20 salários mínimos, as partes comparecerão pessoalmente, podendo ser assistidas por advogado.</p>
            <p className="text-[#A8C0D8] leading-relaxed"><strong className="text-[#E8E4D8]">Resolução CNJ nº 372/21:</strong> Institui o Balcão Virtual para atendimento imediato por videoconferência nas unidades judiciais.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#162847] mt-8 py-8">
        <div className="container text-center">
          <p className="text-[#4A6080] text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
            Este guia é informativo e não constitui assessoria jurídica. As informações são baseadas na legislação e jurisprudência vigente em 2026. Para casos complexos, consulte um advogado. Sistema de protocolo: e-SAJ TJSP (tjsp.jus.br/peticionamentojec).
          </p>
        </div>
      </footer>
    </div>
  );
}
