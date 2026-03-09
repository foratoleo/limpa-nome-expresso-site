import { useState } from "react";
import { toast } from "sonner";
import { Container } from "@/components/ui/container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { UserProfile } from "@/components/UserProfile";
import { AuthModal } from "@/components/auth/AuthModal";
import { SpecialAdvisoryNavCta } from "@/components/SpecialAdvisoryNavCta";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SearchIcon, BookWithBookmarkIcon, LinkExternalIcon, VideoIcon } from "@/utils/icons";
import { WarningBanner } from "@/components/WarningBanner";

// Extended FAQ items for support page
const faqItems = [
  {
    id: "item-1",
    question: "Preciso de advogado para limpar meu nome?",
    answer:
      "Não. Para causas de até 20 salários mínimos no Juizado Especial Cível (JEC), você pode comparecer pessoalmente sem advogado, conforme o Art. 9º da Lei 9.099/95.",
  },
  {
    id: "item-2",
    question: "Quanto tempo demora para limpar o nome?",
    answer:
      "A liminar pode ser concedida em 5-15 dias úteis após o protocolo. O prazo para exclusão do nome após a decisão é de 5 dias úteis. O processo completo pode levar alguns meses até a sentença final.",
  },
  {
    id: "item-3",
    question: "A limpeza do nome é garantida?",
    answer:
      "Se você não recebeu notificação prévia da negativação (conforme exige o Art. 43, §2º do CDC), a lei está ao seu lado. A taxa de sucesso em casos de ausência de notificação é muito alta.",
  },
  {
    id: "item-4",
    question: "Quais documentos preciso reunir?",
    answer:
      "RG, CPF, comprovante de residência, relatório de restrições do CPF, prints da caixa de entrada de e-mail, prints da pasta spam, prints do histórico de SMS, e prova do dano atual (negativa de crédito, etc.).",
  },
  {
    id: "item-5",
    question: "Funciona para qualquer dívida?",
    answer:
      "O processo funciona para negativações feitas sem notificação prévia. Se a dívida for legítima e você foi notificado corretamente, a limpeza do nome pode não ser possível, sendo necessário negociar a dívida.",
  },
  {
    id: "item-6",
    question: "O que é o Balcão Virtual?",
    answer:
      "O Balcão Virtual é um canal de videoconferência do tribunal que permite falar com escreventes para acelerar processos. Funciona de segunda a sexta, das 9h às 17h, no portal oficial do tribunal.",
  },
  {
    id: "item-7",
    question: "Como acesso o sistema sistema judicial?",
    answer:
      "Acesse o portal de peticionamento eletrônico da sua comarca. Você precisará de um certificado digital (e-CPF) para peticionar online. Se não tiver, pode protocolar presencialmente no fórum da sua comarca.",
  },
  {
    id: "item-8",
    question: "O sistema funciona para outros estados?",
    answer:
      "Este guia é específico para o estado de São Paulo (tribunal - sistema sistema judicial). Cada estado possui seu próprio sistema de peticionamento. A base legal (CDC, Súmula 359 STJ) é válida em todo o Brasil.",
  },
  {
    id: "item-9",
    question: "O que fazer se a liminar for negada?",
    answer:
      "Continue o processo até a sentença final. Você terá oportunidade de apresentar mais argumentos e provas na audiência de conciliação. Muitos casos são resolvidos favoravelmente na sentença.",
  },
  {
    id: "item-10",
    question: "Posso pedir danos morais?",
    answer:
      "Sim, você pode incluir pedido de indenização por danos morais na petição. O valor sugerido é entre R$ 3.000 e R$ 5.000, mas será arbitrado pelo juiz. Atenção: se houver outras negativações legítimas, os danos morais podem não ser concedidos (Súmula 385 STJ).",
  },
];

export default function Support() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Mensagem enviada com sucesso! Responderemos em até 48 horas.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(data.error || "Erro ao enviar mensagem. Tente novamente.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#12110d", fontFamily: "'Public Sans', sans-serif" }}
    >
      <SiteHeader
        logoHref="/guia"
        navItems={[
          { href: "/guia", label: "Meus Processos" },
          { href: "/documentos", label: "Documentos" },
          { href: "/modelos", label: "Modelos" },
          { href: "/suporte", label: "Suporte", active: true },
          { href: "/noticias", label: "Noticias" },
        ]}
        desktopNavTrailing={<SpecialAdvisoryNavCta />}
        desktopRightContent={<UserProfile onOpenAuth={() => setIsAuthModalOpen(true)} />}
        mobileTopActions={
          <>
            <SpecialAdvisoryNavCta shortLabel />
            <UserProfile onOpenAuth={() => setIsAuthModalOpen(true)} />
          </>
        }
        mobileDrawerContent={<SpecialAdvisoryNavCta />}
      />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 py-8">
        <Container as="div" maxWidth="lg">
          {/* Page Title */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span style={{ color: "#d39e17" }}><SearchIcon size="medium" label="" /></span>
              <h1 className="text-3xl font-bold" style={{ color: "#f1f5f9" }}>
                Central de Suporte
              </h1>
            </div>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#94a3b8" }}>
              Encontre respostas para suas dúvidas ou entre em contato conosco.
            </p>
          </div>

          {/* Info Sections */}
          <div className="space-y-6 mb-10">
            {/* JEC vs Balcao Virtual explanation */}
            <div
              className="rounded-3xl border p-6 backdrop-blur-[4px]"
              style={{
                backgroundColor: "rgba(22, 40, 71, 0.95)",
                borderColor: "rgba(96, 165, 250, 0.3)"
              }}
            >
              <div className="flex gap-3 mb-4">
                <span style={{ color: "#60a5fa" }} className="flex-shrink-0 mt-0.5"><VideoIcon size="medium" label="" /></span>
                <h4 className="font-bold text-lg" style={{ color: "#f1f5f9" }}>JEC (sistema judicial) vs. Balcão Virtual: Qual a diferença?</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                <div
                  className="rounded-2xl p-4 border"
                  style={{
                    backgroundColor: "rgba(18, 17, 13, 0.6)",
                    borderColor: "rgba(34, 197, 94, 0.2)"
                  }}
                >
                  <div className="font-semibold mb-1" style={{ color: "#22c55e" }}>Juizado Especial Cível - sistema judicial</div>
                  <p style={{ color: "#94a3b8" }} className="leading-relaxed">
                    Onde você <strong style={{ color: "#e8e4d8" }}>protocola a ação</strong>. É o tribunal. Sem ele, não há processo. Acesse em <strong style={{ color: "#60a5fa" }}>portal de peticionamento do tribunal</strong>
                  </p>
                </div>
                <div
                  className="rounded-2xl p-4 border"
                  style={{
                    backgroundColor: "rgba(18, 17, 13, 0.6)",
                    borderColor: "rgba(96, 165, 250, 0.2)"
                  }}
                >
                  <div className="font-semibold mb-1" style={{ color: "#60a5fa" }}>Balcão Virtual</div>
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
                  <strong style={{ color: "#94a3b8" }}>Nota sobre o e-Proc:</strong> O tribunal iniciou a migração do sistema judicial para o e-Proc em outubro de 2025. O peticionamento do JEC para o cidadão sem advogado ainda utiliza o sistema <strong style={{ color: "#e8e4d8" }}>sistema judicial</strong> (portal de peticionamento do tribunal). O e-Proc é voltado principalmente para advogados e servidores. Verifique sempre o link oficial antes de protocolar.
                </p>
              </div>
            </div>

            {/* Warning */}
            <div
              className="rounded-2xl border p-5"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderColor: "rgba(239, 68, 68, 0.3)"
              }}
            >
              <div className="flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: "#ef4444" }}>Atenção: Golpes Frequentes</h4>
                  <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                    Desconfie de empresas que cobram valores altos para "limpar o nome sem pagar a dívida". A via judicial pelo JEC é gratuita para o cidadão e não exige advogado para causas de até 20 salários mínimos. Você tem o poder de fazer isso sozinho com este guia.
                  </p>
                </div>
              </div>
            </div>

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
                  <strong style={{ color: "#e8e4d8" }}>Art. 43, parágrafo 2º do CDC:</strong> A abertura de cadastro de inadimplentes deverá ser comunicada por escrito ao consumidor, quando não solicitada por ele.
                </p>
                <p className="leading-relaxed" style={{ color: "#94a3b8" }}>
                  <strong style={{ color: "#e8e4d8" }}>Súmula 359 do STJ:</strong> Cabe ao órgão mantenedor do Cadastro de Proteção ao Crédito a notificação do devedor antes de proceder à inscrição.
                </p>
                <p className="leading-relaxed" style={{ color: "#94a3b8" }}>
                  <strong style={{ color: "#e8e4d8" }}>Art. 9º da Lei 9.099/95:</strong> Nas causas de até 20 salários mínimos, as partes comparecerão pessoalmente, podendo ser assistidas por advogado.
                </p>
                <p className="leading-relaxed" style={{ color: "#94a3b8" }}>
                  <strong style={{ color: "#e8e4d8" }}>Resolução CNJ nº 372/21:</strong> Institui o Balcão Virtual para atendimento imediato por videoconferência nas unidades judiciais.
                </p>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* FAQ Section */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span style={{ color: "#60a5fa" }}><BookWithBookmarkIcon size="medium" label="" /></span>
                <h2 className="text-xl font-semibold" style={{ color: "#f1f5f9" }}>
                  Perguntas Frequentes
                </h2>
              </div>

              <Accordion type="single" collapsible className="w-full space-y-3">
                {faqItems.map((item) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="px-5 rounded-2xl"
                    style={{
                      backgroundColor: "rgba(22, 40, 71, 0.95)",
                      border: "1px solid rgba(211, 158, 23, 0.2)",
                    }}
                  >
                    <AccordionTrigger
                      className="text-base font-medium hover:no-underline py-4"
                      style={{ color: "#f1f5f9" }}
                    >
                      <span className="flex items-center gap-3 text-left">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: "#d39e17" }}
                        />
                        {item.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent
                      className="text-sm leading-relaxed pb-4"
                      style={{ color: "#94a3b8" }}
                    >
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Contact Form */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span style={{ color: "#22c55e" }}><LinkExternalIcon size="medium" label="" /></span>
                <h2 className="text-xl font-semibold" style={{ color: "#f1f5f9" }}>
                  Fale Conosco
                </h2>
              </div>

              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border p-6 space-y-5"
                style={{
                  backgroundColor: "rgba(22, 40, 71, 0.95)",
                  borderColor: "rgba(211, 158, 23, 0.2)",
                }}
              >
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#e8e4d8" }}
                  >
                    Nome
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-colors"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(211, 158, 23, 0.2)",
                      color: "#f1f5f9",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "rgba(211, 158, 23, 0.5)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "rgba(211, 158, 23, 0.2)"}
                    placeholder="Seu nome completo"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#e8e4d8" }}
                  >
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-colors"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(211, 158, 23, 0.2)",
                      color: "#f1f5f9",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "rgba(211, 158, 23, 0.5)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "rgba(211, 158, 23, 0.2)"}
                    placeholder="seu@email.com"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#e8e4d8" }}
                  >
                    Assunto
                  </label>
                  <select
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-colors"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(211, 158, 23, 0.2)",
                      color: "#f1f5f9",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "rgba(211, 158, 23, 0.5)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "rgba(211, 158, 23, 0.2)"}
                  >
                    <option value="" style={{ backgroundColor: "#162847" }}>Selecione um assunto</option>
                    <option value="duvida" style={{ backgroundColor: "#162847" }}>Dúvida sobre o processo</option>
                    <option value="problema" style={{ backgroundColor: "#162847" }}>Problema técnico</option>
                    <option value="sugestao" style={{ backgroundColor: "#162847" }}>Sugestão</option>
                    <option value="outro" style={{ backgroundColor: "#162847" }}>Outro</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#e8e4d8" }}
                  >
                    Mensagem
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-colors resize-none"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(211, 158, 23, 0.2)",
                      color: "#f1f5f9",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "rgba(211, 158, 23, 0.5)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "rgba(211, 158, 23, 0.2)"}
                    placeholder="Descreva sua dúvida ou problema..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "#d39e17",
                    color: "#12110d",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div
                        className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: "#12110d", borderTopColor: "transparent" }}
                      />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <LinkExternalIcon size="small" label="" />
                      Enviar Mensagem
                    </>
                  )}
                </button>

                {/* Info */}
                <p className="text-xs text-center" style={{ color: "#64748b" }}>
                  Responderemos em até 48 horas úteis.
                </p>
              </form>

              {/* Direct Contact Info */}
              <div
                className="mt-6 rounded-2xl border p-5"
                style={{
                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                  borderColor: "rgba(34, 197, 94, 0.3)",
                }}
              >
                <h4 className="font-semibold mb-2" style={{ color: "#22c55e" }}>
                  Contato Direto
                </h4>
                <p className="text-sm" style={{ color: "#94a3b8" }}>
                  E-mail:{" "}
                  <a
                    href="mailto:suporte@cpfblindado.com"
                    className="font-medium hover:underline"
                    style={{ color: "#22c55e" }}
                  >
                    suporte@cpfblindado.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </Container>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
