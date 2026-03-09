import * as React from "react";

import { useIsMobile } from "@/hooks/useMobile";

const COLORS = {
  background: "#12110d",
  navy: "#162847",
  gold: "#d39e17",
  green: "#22c55e",
  blue: "#60a5fa",
  textPrimary: "#f1f5f9",
  textSecondary: "#94a3b8",
} as const;

const ROTATING_HEADLINE_PHRASES = [
  "sem pagar advogado",
  "sem pagar suas dívidas",
  "amparado na lei",
] as const;

export function HeroSection() {
  const [phraseIndex, setPhraseIndex] = React.useState(0);
  const [typedPhrase, setTypedPhrase] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    const currentPhrase = ROTATING_HEADLINE_PHRASES[phraseIndex];

    if (!isDeleting && typedPhrase === currentPhrase) {
      const pauseTimer = window.setTimeout(() => {
        setIsDeleting(true);
      }, 1400);

      return () => window.clearTimeout(pauseTimer);
    }

    if (isDeleting && typedPhrase.length === 0) {
      setIsDeleting(false);
      setPhraseIndex(
        (previousIndex) =>
          (previousIndex + 1) % ROTATING_HEADLINE_PHRASES.length,
      );
      return;
    }

    const nextLength = typedPhrase.length + (isDeleting ? -1 : 1);
    const typingTimer = window.setTimeout(
      () => {
        setTypedPhrase(currentPhrase.slice(0, nextLength));
      },
      isDeleting ? 45 : 85,
    );

    return () => window.clearTimeout(typingTimer);
  }, [isDeleting, phraseIndex, typedPhrase]);

  const maxPhraseLength = React.useMemo(
    () =>
      ROTATING_HEADLINE_PHRASES.reduce(
        (maxLength, phrase) => Math.max(maxLength, phrase.length),
        0,
      ),
    [],
  );

  return (
    <>
      {/* Hero Content - altura compacta perto do header */}
      <section className="px-4 py-8 md:px-10 md:py-8 lg:pt-10 bg-[#12110d]">
        <div className="max-w-[1200px] mx-auto">
          {/* Badges */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "12px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                padding: "4px 10px",
                fontSize: "10px",
                fontWeight: 500,
                color: COLORS.gold,
                border: `1px solid ${COLORS.gold}`,
                borderRadius: "20px",
              }}
            >
              Guia Jurídico 2026
            </span>
            <span
              style={{
                padding: "4px 10px",
                fontSize: "10px",
                fontWeight: 500,
                color: COLORS.green,
                border: `1px solid ${COLORS.green}`,
                borderRadius: "20px",
              }}
            >
              Sem Advogado
            </span>
            <span
              style={{
                padding: "4px 10px",
                fontSize: "10px",
                fontWeight: 500,
                color: COLORS.blue,
                border: `1px solid ${COLORS.blue}`,
                borderRadius: "20px",
              }}
            >
              tribunal - sistema judicial
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#f1f5f9] leading-tight mb-5 mt-2">
            Limpe seu nome em até{" "}
            <span style={{ color: COLORS.gold }}>15 dias</span>{" "}
            <span
              style={{
                display: isMobile ? "block" : "inline-block",
                minWidth: isMobile ? undefined : `${maxPhraseLength}ch`,
                color: COLORS.textPrimary,
                marginTop: isMobile ? "0.15em" : undefined,
                overflowWrap: "anywhere",
              }}
            >
              {typedPhrase}
              <span style={{ color: COLORS.gold }} className="animate-pulse">
                |
              </span>
            </span>
          </h1>

          {/* Content Row - Texto legal + Video */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            {/* Right - Texto legal + Video */}
            <div style={{ flex: "1" }}>
              <p
                style={{
                  fontSize: "14px",
                  color: COLORS.textSecondary,
                  lineHeight: 1.6,
                  margin: "0 0 16px 0",
                }}
              >
                Recupere seu nome com estratégia certa: mostramos como
                contestar negativação indevida usando base legal e roteiro
                pronto. Tudo de forma simples, 100% online e sem atalhos
                arriscados.
              </p>
              <div
                style={{
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: COLORS.navy,
                }}
              >
                <video
                  src="/ln01.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 10px",
                    backgroundColor: "rgba(18, 17, 13, 0.9)",
                    borderRadius: "4px",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                      fill={COLORS.green}
                    />
                    <path
                      d="M9 12l2 2 4-4"
                      stroke={COLORS.background}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: COLORS.textPrimary,
                    }}
                  >
                    5 Passos para Blindagem
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner - estatisticas */}
      <section
        className="p-6 md:p-10 text-center"
        style={{
          background: `linear-gradient(180deg, ${COLORS.background} 0%, ${COLORS.navy}30 50%, ${COLORS.background} 100%)`,
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: COLORS.textPrimary,
              marginBottom: "8px",
            }}
          >
            Proteja seu nome com a lei ao seu lado
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: COLORS.textSecondary,
              lineHeight: 1.6,
              marginBottom: "24px",
            }}
          >
            Milhares de brasileiros já limparam seus nomes usando seus direitos.
            Faça você também, sem burocracia.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-12 mt-8">
            <div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: COLORS.gold,
                }}
              >
                100%
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: COLORS.textSecondary,
                  marginTop: "2px",
                }}
              >
                Online
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: COLORS.green,
                }}
              >
                0
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: COLORS.textSecondary,
                  marginTop: "2px",
                }}
              >
                Advogados
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: COLORS.blue,
                }}
              >
                12+
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: COLORS.textSecondary,
                  marginTop: "2px",
                }}
              >
                Meses Blindado
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
