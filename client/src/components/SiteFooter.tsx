import { Container } from "@/components/ui/container";

interface SiteFooterProps {
  maxWidth?: "lg" | "xl" | "2xl";
}

export function SiteFooter({ maxWidth = "xl" }: SiteFooterProps) {
  return (
    <footer
      className="mt-auto border-t py-8"
      style={{
        backgroundColor: "rgba(18, 17, 13, 0.8)",
        borderColor: "rgba(211, 158, 23, 0.1)",
      }}
    >
      <Container as="div" maxWidth={maxWidth}>
        <div className="flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left">
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path d="M9 0L17.5 5V14L9 19L0.5 14V5L9 0Z" fill="#d39e17" />
              <path d="M9 4L13 6.5V11.5L9 14L5 11.5V6.5L9 4Z" fill="#12110d" />
            </svg>
            <span className="text-sm" style={{ color: "#64748b" }}>
              2026 CPF Blindado. Sistema de Apoio Jurídico Automático.
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            <a href="#termos" className="text-sm transition-colors hover:text-[#d39e17]" style={{ color: "#64748b" }}>
              Termos de Uso
            </a>
            <a href="#privacidade" className="text-sm transition-colors hover:text-[#d39e17]" style={{ color: "#64748b" }}>
              Privacidade
            </a>
            <a href="#oab" className="text-sm transition-colors hover:text-[#d39e17]" style={{ color: "#64748b" }}>
              OAB Compliance
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
