import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: "item-1",
    question: "Preciso de advogado?",
    answer:
      "Não. Para causas até 20 salários mínimos no JEC, você pode ir pessoalmente.",
  },
  {
    id: "item-2",
    question: "Quanto tempo demora?",
    answer:
      "A liminar pode ser concedida em 5-15 dias úteis. O processo completo pode levar alguns meses.",
  },
  {
    id: "item-3",
    question: "É garantido?",
    answer:
      "Se você não recebeu notificação, a lei está ao seu lado. A taxa de sucesso é muito alta.",
  },
  {
    id: "item-4",
    question: "Quais documentos preciso?",
    answer:
      "RG, CPF, comprovante de residência, relatório de crédito atualizado e prints de e-mail/SMS.",
  },
  {
    id: "item-5",
    question: "Funciona para qualquer dívida?",
    answer:
      "Funciona para negativações sem notificação prévia. Dívidas legítimas exigem negociação.",
  },
  {
    id: "item-6",
    question: "O que é o Balcão Virtual?",
    answer:
      "Canal de videoconferência do tribunal para acelerar processos e falar com escreventes.",
  },
];

export function FAQSection() {
  return (
    <section className="py-16">
      <Container>
        <h2 className="text-3xl font-bold text-center mb-10 text-slate-100">
          Perguntas Frequentes
        </h2>

        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue="item-1"
        >
          {faqItems.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="px-6 mb-4 rounded-2xl"
              style={{
                backgroundColor: "rgba(22, 40, 71, 0.95)",
                border: "1px solid rgba(211, 158, 23, 0.2)",
              }}
            >
              <AccordionTrigger
                className="text-lg font-medium hover:no-underline"
                style={{
                  color: "#f1f5f9",
                }}
              >
                <span className="flex items-center gap-3">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#d39e17" }}
                  />
                  {item.question}
                </span>
              </AccordionTrigger>
              <AccordionContent
                className="text-base leading-relaxed"
                style={{
                  color: "#94a3b8",
                }}
              >
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
