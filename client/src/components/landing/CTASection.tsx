import { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/utils/icons";

interface CTASectionProps {
  onOpenAuth?: () => void;
}

/**
 * CTASection Component
 *
 * Full-width call-to-action section with gradient background.
 * Encourages users to access the guide.
 */
export function CTASection({ onOpenAuth }: CTASectionProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const words = ["limpar", "blindar"];

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="w-full border-t"
      style={{
        background: "linear-gradient(135deg, #162847 0%, #12110d 100%)",
        borderTopColor: "rgba(211, 158, 23, 0.2)",
      }}
    >
      <Container className="py-16 md:py-24">
        <div className="flex flex-col items-center text-center">
          {/* Headline */}
          <h2
            className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl"
            style={{ color: "#f1f5f9" }}
          >
            Pronto para <span
              key={wordIndex}
              className="inline-block transition-all duration-500"
              style={{ color: "#d39e17" }}
            >
              {words[wordIndex]}
            </span> seu nome?
          </h2>

          {/* Subheadline */}
          <p
            className="mb-8 max-w-2xl text-lg md:text-xl"
            style={{ color: "#94a3b8" }}
          >
            Crie sua conta e tenha acesso ao guia completo, documentos pré-preenchidos e acompanhamento do seu processo.
          </p>

          {/* CTA Button */}
          <button
            onClick={onOpenAuth}
            className="group inline-flex items-center gap-2 rounded-full px-8 py-4 font-bold transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: "#d39e17",
              color: "#12110d",
              boxShadow: "0 0 20px rgba(211, 158, 23, 0.4)",
            }}
          >
            Crie sua conta
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRightIcon label="" size="medium" />
            </span>
          </button>

          {/* Secondary Text */}
          <p className="mt-4 text-sm" style={{ color: "#64748b" }}>
            Leva menos de 2 minutos.
          </p>
        </div>
      </Container>
    </section>
  );
}
