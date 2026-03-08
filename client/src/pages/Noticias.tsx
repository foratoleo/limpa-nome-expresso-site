import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { ArticleSeo } from "@/components/ArticleSeo";
import { NewsCard } from "@/components/NewsCard";
import { SpecialAdvisoryNavCta } from "@/components/SpecialAdvisoryNavCta";
import { NEWS_ARTICLES } from "@/data/news-articles";

const LISTING_KEYWORDS = [
  "negativação indevida",
  "indenização negativação indevida",
  "dívida caduca 5 anos",
  "dívida prescrita",
  "nome sujo Brasil",
  "telefonia negativação indevida",
  "notificação prévia negativação",
  "juizado especial cível sem advogado",
  "fraude CPF negativação",
  "score Serasa negativação indevida",
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function Noticias() {
  const [location] = useLocation();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#12110d", fontFamily: "'Public Sans', sans-serif" }}
    >
      <ArticleSeo
        title="Noticias e Direitos do Consumidor"
        description="Decisoes judiciais, estatisticas e tudo que o consumidor negativado precisa saber para defender seus direitos."
        keywords={LISTING_KEYWORDS}
        canonicalUrl="https://limpa-nome-expresso-site.netlify.app/noticias"
        type="website"
      />

      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-[6px] border-b"
        style={{
          backgroundColor: "rgba(18, 17, 13, 0.5)",
          borderColor: "rgba(211, 158, 23, 0.2)",
        }}
      >
        <Container as="div" maxWidth="xl" className="flex items-center justify-between py-4">
          {/* Logo & Nav */}
          <div className="flex items-center gap-4 md:gap-8">
            <a href="/guia" className="flex items-center gap-2 md:gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center shrink-0">
                <svg width="27" height="29" viewBox="0 0 27 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M13.5 0L26.5 8V21L13.5 29L0.5 21V8L13.5 0Z" fill="#d39e17"/>
                  <path d="M13.5 6L20 10V19L13.5 23L7 19V10L13.5 6Z" fill="#12110d"/>
                </svg>
              </div>
              <h2
                className="text-lg md:text-xl font-bold whitespace-nowrap hidden sm:block"
                style={{ color: "#f1f5f9", letterSpacing: "-0.3px" }}
              >
                Limpa Nome <span style={{ color: "#d39e17" }}>Expresso</span>
              </h2>
            </a>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/guia" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Meus Processos</a>
              <a href="/documentos" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Documentos</a>
              <a href="/modelos" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Modelos</a>
              <a href="/suporte" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Suporte</a>
              <a
                href="/noticias"
                className="text-sm font-medium transition-colors"
                style={{ color: location.startsWith("/noticias") ? "#d39e17" : "#cbd5e1" }}
              >
                Noticias
              </a>
              <SpecialAdvisoryNavCta />
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <SpecialAdvisoryNavCta shortLabel />
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <Container as="main" maxWidth="xl" className="py-8 flex-1">
        {/* Page Header */}
        <div className="mb-8">
          <h1
            className="font-bold mb-2"
            style={{ color: "#f1f5f9", fontSize: "2rem" }}
          >
            Noticias e Direitos do Consumidor
          </h1>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            Decisoes judiciais, estatisticas e orientacoes para consumidores negativados defenderem seus direitos.
          </p>
        </div>

        {/* Staggered NewsCard Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {NEWS_ARTICLES.map((article) => (
            <motion.div key={article.id} variants={cardVariants}>
              <NewsCard article={article} />
            </motion.div>
          ))}
        </motion.div>
      </Container>

      {/* Footer */}
      <footer
        className="border-t py-8 mt-auto"
        style={{
          backgroundColor: "rgba(18, 17, 13, 0.8)",
          borderColor: "rgba(211, 158, 23, 0.1)",
        }}
      >
        <Container as="div" maxWidth="xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <path d="M9 0L17.5 5V14L9 19L0.5 14V5L9 0Z" fill="#d39e17"/>
                <path d="M9 4L13 6.5V11.5L9 14L5 11.5V6.5L9 4Z" fill="#12110d"/>
              </svg>
              <span className="text-sm" style={{ color: "#64748b" }}>
                2026 Limpa Nome Expresso. Sistema de Apoio Juridico Automatico.
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
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
