import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { ArticleSeo } from "@/components/ArticleSeo";
import { NewsCard } from "@/components/NewsCard";
import { SpecialAdvisoryNavCta } from "@/components/SpecialAdvisoryNavCta";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
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
  "score de crédito negativação indevida",
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
        canonicalUrl="https://cpfblindado.com/noticias"
        type="website"
      />

      <SiteHeader
        logoHref="/"
        navItems={[
          { href: "/guia", label: "Meus Processos" },
          { href: "/documentos", label: "Documentos" },
          { href: "/modelos", label: "Modelos" },
          { href: "/suporte", label: "Suporte" },
          { href: "/noticias", label: "Noticias", active: location.startsWith("/noticias") },
        ]}
        desktopNavTrailing={<SpecialAdvisoryNavCta />}
        mobileTopActions={<SpecialAdvisoryNavCta shortLabel />}
        mobileDrawerContent={
          <div className="space-y-3">
            <SpecialAdvisoryNavCta />
            <a
              href="/"
              className="inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold"
              style={{ backgroundColor: "#d39e17", color: "#12110d" }}
            >
              Começar agora
            </a>
          </div>
        }
      />

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

      <SiteFooter />
    </div>
  );
}
