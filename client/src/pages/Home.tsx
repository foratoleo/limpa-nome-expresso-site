import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Download, ChevronDown, AlertTriangle, Scale, FileText, Video, Shield, ArrowRight } from "lucide-react";

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
  download?: { label: string; file: string };
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
    items: [
      { id: "rg_cpf", label: "RG e CPF (frente e verso)", detail: "Digitalizado em boa resolução" },
      { id: "comprovante_residencia", label: "Comprovante de Residência recente", detail: "Últimos 3 meses, em seu nome" },
      { id: "relatorio_serasa", label: "Relatório completo do Serasa/SPC/Boa Vista", detail: "Mostrando a negativação que você contesta" },
      { id: "print_email_entrada", label: "Print da caixa de entrada do e-mail", detail: "Busque por 'Serasa', 'SPC', 'notificação' e o nome da empresa credora" },
      { id: "print_email_spam", label: "Print da pasta de spam do e-mail", detail: "Mesma busca — comprova ausência de notificação" },
      { id: "print_sms", label: "Print do histórico de SMS", detail: "Mostrando que não recebeu aviso por mensagem" },
      { id: "prova_dano", label: "Prova do Dano Atual (datada de 2026)", detail: "Ex: e-mail de banco negando crédito, proposta de emprego condicionada a nome limpo" },
    ],
  },
  {
    number: 2,
    title: "Preparação da Petição",
    subtitle: "O Documento Chave",
    icon: <Scale size={22} />,
    color: "#4A90D9",
    tip: "Mantenha o pedido de exclusão 'até o trânsito em julgado da presente ação' — isso garante mais de 12 meses de nome limpo.",
    download: { label: "Baixar Modelo de Petição", file: "peticao_inicial_jec.md" },
    items: [
      { id: "preencher_dados", label: "Preencher todos os campos [entre colchetes] com seus dados", detail: "Nome, CPF, endereço, dados da empresa credora e da dívida" },
      { id: "descrever_fatos", label: "Descrever os fatos na seção 'DOS FATOS'", detail: "Enfatize a falta de notificação e o prejuízo sofrido" },
      { id: "verificar_tutela", label: "Verificar o pedido de Tutela de Urgência", detail: "Confirme que consta 'até o trânsito em julgado da presente ação'" },
      { id: "listar_anexos", label: "Listar todos os documentos na seção 'DOCUMENTOS ANEXOS'", detail: "Todos os itens do Passo 1 devem estar listados" },
      { id: "salvar_pdf", label: "Salvar a petição preenchida em formato PDF", detail: "Pronto para upload no sistema do tribunal" },
    ],
  },
  {
    number: 3,
    title: "Protocolo no JEC",
    subtitle: "O Ponto de Partida",
    icon: <ArrowRight size={22} />,
    color: "#5BAD6F",
    tip: "Anote o número do processo gerado — você vai precisar dele imediatamente no Passo 4.",
    items: [
      { id: "acessar_tj", label: "Acessar o site do Tribunal de Justiça do seu estado", detail: "Ex: tjsp.jus.br, tjam.jus.br, tjrj.jus.br" },
      { id: "localizar_jec", label: "Localizar a seção de Juizados Especiais e o sistema eletrônico", detail: "Geralmente PJe ou e-SAJ" },
      { id: "cadastro_sistema", label: "Realizar cadastro no sistema (se for o primeiro acesso)", detail: "Muitos JECs dispensam certificado digital para o cidadão comum" },
      { id: "iniciar_processo", label: "Iniciar novo processo e preencher os dados", detail: "Autor (você), Réus (empresa credora + Serasa/SPC)" },
      { id: "anexar_documentos", label: "Anexar a Petição em PDF e todos os documentos", detail: "Um por um, conforme listado no Passo 1" },
      { id: "marcar_urgencia", label: "Marcar como 'Pedido de Tutela de Urgência' ou 'Pedido Liminar'", detail: "Campo obrigatório para prioridade na análise" },
      { id: "anotar_numero", label: "Finalizar e anotar o número do processo gerado", detail: "⚠️ Essencial para o próximo passo" },
    ],
  },
  {
    number: 4,
    title: "Tática do Balcão Virtual",
    subtitle: "Aceleração Máxima",
    icon: <Video size={22} />,
    color: "#D4A017",
    tip: "Seja educado, firme e objetivo. O objetivo é fazer seu processo 'furar a fila' e chegar à mesa do juiz em até 48 horas.",
    items: [
      { id: "acessar_balcao", label: "Acessar o Balcão Virtual do mesmo Tribunal de Justiça", detail: "Disponível das 9h às 17h, de segunda a sexta" },
      { id: "selecionar_vara", label: "Selecionar a vara/unidade do JEC onde o processo foi distribuído", detail: "Use o número do processo para identificar a vara correta" },
      { id: "aguardar_fila", label: "Aguardar na fila virtual para ser atendido", detail: "Tenha o número do processo e seus documentos à mão" },
      { id: "usar_roteiro", label: "Usar o roteiro de urgência ao ser atendido", detail: "\"Meu nome é [X], processo nº [Y], pedido de tutela de urgência, dano irreparável em curso...\"" },
      { id: "solicitar_conclusao", label: "Solicitar que o processo seja encaminhado para análise imediata da liminar", detail: "Mencione o prejuízo concreto e documentado" },
    ],
  },
  {
    number: 5,
    title: "Acompanhamento",
    subtitle: "Monitoramento e Próximos Passos",
    icon: <Shield size={22} />,
    color: "#5BAD6F",
    tip: "Liminar concedida: o Serasa/SPC tem 5 dias úteis para cumprir. Verifique seu nome após esse prazo.",
    items: [
      { id: "monitorar_diario", label: "Monitorar o processo diariamente no sistema eletrônico", detail: "Verifique a decisão do juiz sobre a liminar" },
      { id: "liminar_concedida", label: "Se liminar concedida: aguardar 5 dias úteis para a exclusão", detail: "O cartório intimará o Serasa/SPC, que terá esse prazo para cumprir" },
      { id: "verificar_nome", label: "Verificar o nome no Serasa/SPC após o prazo", detail: "Acesse serasa.com.br ou spc.org.br para confirmar a exclusão" },
      { id: "liminar_negada", label: "Se liminar negada: continuar o processo até a sentença final", detail: "Você terá chance de apresentar mais argumentos e provas" },
      { id: "multa_descumprimento", label: "Se houver descumprimento: acionar a multa diária (astreintes)", detail: "Peticione informando o descumprimento e solicitando a aplicação da multa de R$ 500/dia" },
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

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalItems = STEPS.reduce((acc, s) => acc + s.items.length, 0);
  const totalChecked = Object.values(checked).filter(Boolean).length;
  const progress = Math.round((totalChecked / totalItems) * 100);

  const resetAll = () => {
    setChecked({});
    localStorage.removeItem("limpa-nome-checklist");
  };

  return { checked, toggle, progress, totalChecked, totalItems, resetAll };
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#162847]">
      <div
        className="h-full bg-[#D4A017] transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function StepCard({ step, checked, onToggle }: { step: Step; checked: Record<string, boolean>; onToggle: (id: string) => void }) {
  const [open, setOpen] = useState(true);
  const stepChecked = step.items.filter((i) => checked[i.id]).length;
  const stepDone = stepChecked === step.items.length;

  return (
    <div className={`relative rounded-2xl border transition-all duration-300 ${stepDone ? "border-[#2E7D52]/60 bg-[#162847]/80" : "border-[#243B5E] bg-[#162847]/60"}`}>
      {/* Step number accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: step.color }} />

      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-6 pt-5 pb-4 text-left"
      >
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-[#0F1E3C] font-extrabold text-xl"
          style={{ backgroundColor: step.color, fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {step.number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[#D4A017] text-sm font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {step.subtitle}
            </span>
            {stepDone && (
              <span className="text-xs bg-[#2E7D52]/30 text-[#5BAD6F] px-2 py-0.5 rounded-full font-medium">
                Concluído
              </span>
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
          <div className="text-[#8BA8C8]">
            {step.icon}
          </div>
          <ChevronDown
            size={18}
            className={`text-[#8BA8C8] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Progress mini-bar */}
      <div className="mx-6 h-0.5 bg-[#243B5E] rounded-full mb-1">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(stepChecked / step.items.length) * 100}%`, backgroundColor: step.color }}
        />
      </div>

      {/* Body */}
      {open && (
        <div className="px-6 pt-3 pb-5">
          {/* Tip */}
          {step.tip && (
            <div className="mb-4 flex gap-3 bg-[#0F1E3C]/60 border border-[#D4A017]/20 rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="text-[#D4A017] flex-shrink-0 mt-0.5" />
              <p className="text-[#D4A017]/90 text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                {step.tip}
              </p>
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
                      {isChecked ? (
                        <CheckCircle2 size={18} className="text-[#5BAD6F]" />
                      ) : (
                        <Circle size={18} className="text-[#4A6080]" />
                      )}
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

          {/* Download button */}
          {step.download && (
            <a
              href="/peticao_inicial_jec.md"
              download={step.download.file}
              className="mt-4 flex items-center gap-2 w-fit px-4 py-2.5 rounded-xl border border-[#D4A017]/40 text-[#D4A017] hover:bg-[#D4A017]/10 transition-colors duration-200 text-sm font-medium"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Download size={15} />
              {step.download.label}
            </a>
          )}
        </div>
      )}
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
            <div className="flex items-center gap-2 mb-5">
              <span
                className="text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border border-[#D4A017]/50 text-[#D4A017]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Guia Jurídico 2026
              </span>
              <span
                className="text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border border-[#5BAD6F]/50 text-[#5BAD6F]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Sem Advogado Necessário
              </span>
            </div>
            <h1
              className="text-4xl md:text-6xl font-black text-white leading-tight mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Limpa Nome{" "}
              <span style={{ color: "#D4A017" }}>Expresso</span>
            </h1>
            <p className="text-[#A8C0D8] text-lg md:text-xl leading-relaxed mb-8 max-w-2xl" style={{ fontFamily: "'Inter', sans-serif" }}>
              Guia prático e atualizado para limpar seu nome dos cadastros de inadimplentes via Juizado Especial Cível e Balcão Virtual, com base no Art. 43, § 2º do CDC e Súmula 359 do STJ.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6">
              {[
                { value: "5 Passos", label: "Processo completo" },
                { value: "5–15 dias", label: "Prazo médio da liminar" },
                { value: "12 meses+", label: "Blindagem do nome" },
                { value: "R$ 0", label: "Sem advogado no JEC" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    className="text-2xl font-extrabold text-[#D4A017]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#7A9AB8] uppercase tracking-wider mt-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {stat.label}
                  </div>
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
              <span className="text-sm font-semibold text-[#E8E4D8]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Seu Progresso
              </span>
              <span className="text-sm font-bold text-[#D4A017]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {totalChecked}/{totalItems} itens — {progress}%
              </span>
            </div>
            <div className="h-2 bg-[#0F1E3C] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D4A017] to-[#F0C040] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <button
            onClick={resetAll}
            className="flex-shrink-0 text-xs text-[#5A7A9A] hover:text-[#8BA8C8] transition-colors px-2 py-1 rounded-lg hover:bg-[#0F1E3C]/50"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Reiniciar
          </button>
        </div>
      </div>

      {/* Steps */}
      <main className="container py-8 space-y-4 max-w-3xl mx-auto">
        {STEPS.map((step) => (
          <StepCard key={step.number} step={step} checked={checked} onToggle={toggle} />
        ))}

        {/* Alert: Balcão vs JEC */}
        <div className="rounded-2xl border border-[#4A90D9]/30 bg-[#162847]/60 p-6">
          <div className="flex gap-3 mb-3">
            <Video size={20} className="text-[#4A90D9] flex-shrink-0 mt-0.5" />
            <h4 className="font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              JEC vs. Balcão Virtual: Qual a diferença?
            </h4>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="bg-[#0F1E3C]/60 rounded-xl p-4 border border-[#243B5E]">
              <div className="font-semibold text-[#5BAD6F] mb-1">Juizado Especial Cível</div>
              <p className="text-[#8BA8C8] leading-relaxed">Onde você <strong className="text-[#E8E4D8]">protocola a ação</strong>. É o tribunal. Sem ele, não há processo. Acesse pelo site do TJ do seu estado.</p>
            </div>
            <div className="bg-[#0F1E3C]/60 rounded-xl p-4 border border-[#243B5E]">
              <div className="font-semibold text-[#4A90D9] mb-1">Balcão Virtual</div>
              <p className="text-[#8BA8C8] leading-relaxed">Onde você <strong className="text-[#E8E4D8]">acelera o processo</strong>. É um canal de videoconferência dentro do mesmo TJ. Use <em>depois</em> de protocolar.</p>
            </div>
          </div>
        </div>

        {/* Warning: Golpes */}
        <div className="rounded-2xl border border-[#C0392B]/30 bg-[#C0392B]/8 p-5 flex gap-3">
          <AlertTriangle size={20} className="text-[#E05252] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#E05252] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Atenção: Golpes Frequentes
            </p>
            <p className="text-[#A87070] text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              Desconfie de empresas que prometem "limpar o nome sem pagar a dívida" por valores altos. A via judicial pelo JEC é gratuita para o cidadão e não exige advogado para causas de pequeno valor. Você tem o poder de fazer isso sozinho.
            </p>
          </div>
        </div>

        {/* Legal basis */}
        <div className="rounded-2xl border border-[#D4A017]/20 bg-[#162847]/40 p-6">
          <h4 className="font-bold text-[#D4A017] mb-3 text-sm uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Base Legal
          </h4>
          <div className="space-y-2 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
            <p className="text-[#A8C0D8] leading-relaxed">
              <strong className="text-[#E8E4D8]">Art. 43, § 2º do CDC:</strong> A abertura de cadastro de inadimplentes deverá ser comunicada por escrito ao consumidor, quando não solicitada por ele.
            </p>
            <p className="text-[#A8C0D8] leading-relaxed">
              <strong className="text-[#E8E4D8]">Súmula 359 do STJ:</strong> Cabe ao órgão mantenedor do Cadastro de Proteção ao Crédito a notificação do devedor antes de proceder à inscrição.
            </p>
            <p className="text-[#A8C0D8] leading-relaxed">
              <strong className="text-[#E8E4D8]">Resolução CNJ nº 372/21:</strong> Institui o Balcão Virtual para atendimento imediato por videoconferência nas unidades judiciais.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#162847] mt-8 py-8">
        <div className="container text-center">
          <p className="text-[#4A6080] text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
            Este guia é informativo e não constitui assessoria jurídica. As informações são baseadas na legislação e jurisprudência vigente em 2026. Para casos complexos, consulte um advogado.
          </p>
        </div>
      </footer>
    </div>
  );
}
