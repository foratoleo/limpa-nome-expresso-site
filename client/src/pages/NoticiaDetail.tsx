import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import type { Components } from "react-markdown";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { ArticleSeo } from "@/components/ArticleSeo";
import { ArticleHeader } from "@/components/ArticleHeader";
import { ArticleCta } from "@/components/ArticleCta";
import { NewsCard } from "@/components/NewsCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getArticleBySlug, getRelatedArticles } from "@/data/news-articles";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const months = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  return `${day} de ${months[parseInt(month, 10) - 1]} de ${year}`;
}

const markdownComponents: Components = {
  h2: ({ children }) => (
    <h2
      style={{
        color: "#f1f5f9",
        fontSize: "1.5rem",
        fontWeight: 700,
        marginTop: "2rem",
        marginBottom: "0.75rem",
        lineHeight: 1.3,
      }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      style={{
        color: "#e8e4d8",
        fontSize: "1.25rem",
        fontWeight: 600,
        marginTop: "1.5rem",
        marginBottom: "0.5rem",
        lineHeight: 1.3,
      }}
    >
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p
      style={{
        color: "#94a3b8",
        lineHeight: 1.75,
        marginBottom: "1rem",
      }}
    >
      {children}
    </p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      style={{ color: "#d39e17", textDecoration: "underline" }}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote
      style={{
        borderLeft: "3px solid #d39e17",
        paddingLeft: "1rem",
        color: "#cbd5e1",
        fontStyle: "italic",
        margin: "1.5rem 0",
      }}
    >
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul
      style={{
        color: "#94a3b8",
        paddingLeft: "1.5rem",
        marginBottom: "1rem",
        listStyleType: "disc",
      }}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      style={{
        color: "#94a3b8",
        paddingLeft: "1.5rem",
        marginBottom: "1rem",
        listStyleType: "decimal",
      }}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: "0.25rem", lineHeight: 1.7 }}>{children}</li>
  ),
  strong: ({ children }) => (
    <strong style={{ color: "#e8e4d8", fontWeight: 700 }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ color: "#cbd5e1", fontStyle: "italic" }}>{children}</em>
  ),
  hr: () => (
    <hr style={{ borderColor: "rgba(211, 158, 23, 0.2)", margin: "2rem 0" }} />
  ),
};

function ArticleSkeleton() {
  return (
    <div className="animate-pulse space-y-4 py-8">
      <div className="h-4 rounded" style={{ backgroundColor: "rgba(255,255,255,0.08)", width: "80%" }} />
      <div className="h-4 rounded" style={{ backgroundColor: "rgba(255,255,255,0.08)", width: "95%" }} />
      <div className="h-4 rounded" style={{ backgroundColor: "rgba(255,255,255,0.08)", width: "70%" }} />
      <div className="h-4 rounded" style={{ backgroundColor: "rgba(255,255,255,0.08)", width: "88%" }} />
      <div className="h-4 rounded" style={{ backgroundColor: "rgba(255,255,255,0.08)", width: "60%" }} />
    </div>
  );
}

export default function NoticiaDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const article = getArticleBySlug(slug);

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<boolean>(false);

  useEffect(() => {
    if (!article) return;

    setLoading(true);
    setFetchError(false);

    fetch(article.contentFile)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        setFetchError(true);
        setLoading(false);
      });
  }, [article]);

  const relatedArticles = article ? getRelatedArticles(slug, 3) : [];

  // 404 — article not found
  if (!article) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{ backgroundColor: "#12110d" }}
      >
        <p className="text-xl font-semibold" style={{ color: "#f1f5f9" }}>
          Artigo não encontrado.
        </p>
        <Link href="/noticias">
          <span
            className="px-6 py-2 rounded-lg font-medium text-sm cursor-pointer"
            style={{ backgroundColor: "#d39e17", color: "#12110d" }}
          >
            Voltar para Notícias
          </span>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#12110d", fontFamily: "'Public Sans', sans-serif" }}
    >
      <ArticleSeo
        title={article.title}
        description={article.metaDescription}
        keywords={article.keywords}
        canonicalUrl={`https://cpfblindado.com/noticias/${slug}`}
        type="article"
        publishedDate={article.publishedDate}
      />

      <SiteHeader
        logoHref="/"
        navItems={[
          { href: "/guia", label: "Meus Processos" },
          { href: "/documentos", label: "Documentos" },
          { href: "/modelos", label: "Modelos" },
          { href: "/suporte", label: "Suporte" },
          { href: "/noticias", label: "Noticias", active: true },
        ]}
        desktopRightContent={
          <a
            href="/"
            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: "#d39e17", color: "#12110d" }}
          >
            Começar Agora
          </a>
        }
        mobileTopActions={
          <a
            href="/"
            className="inline-flex items-center rounded-xl px-3 py-2 text-xs font-semibold"
            style={{ backgroundColor: "#d39e17", color: "#12110d" }}
          >
            Começar
          </a>
        }
        mobileDrawerContent={
          <a
            href="/"
            className="inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold"
            style={{ backgroundColor: "#d39e17", color: "#12110d" }}
          >
            Iniciar fluxo completo
          </a>
        }
      />

      {/* Breadcrumb */}
      <Container as="div" maxWidth="xl" className="pt-5 pb-2">
        <nav aria-label="breadcrumb">
          <ol className="flex items-center gap-2 text-sm flex-wrap">
            <li>
              <Link href="/noticias">
                <span
                  className="hover:text-[#d39e17] transition-colors cursor-pointer"
                  style={{ color: "#94a3b8" }}
                >
                  Notícias
                </span>
              </Link>
            </li>
            <li aria-hidden="true" style={{ color: "#d39e17" }}>
              ›
            </li>
            <li
              className="truncate max-w-xs sm:max-w-md lg:max-w-xl"
              style={{ color: "#64748b" }}
              aria-current="page"
            >
              {article.title}
            </li>
          </ol>
        </nav>
      </Container>

      {/* Article header */}
      <ArticleHeader category={article.category} title={article.title} />

      {/* Article body */}
      <Container as="section" maxWidth="lg" className="py-8 flex-1">
        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: "rgba(211, 158, 23, 0.15)" }}>
          <time
            dateTime={article.publishedDate}
            className="text-sm"
            style={{ color: "#64748b" }}
          >
            {formatDate(article.publishedDate)}
          </time>
          <span aria-hidden="true" style={{ color: "#64748b" }}>
            ·
          </span>
          <span className="text-sm" style={{ color: "#64748b" }}>
            {article.estimatedReadTime} min de leitura
          </span>
          <div className="flex flex-wrap gap-1 ml-1">
            {article.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs px-2 py-0.5"
                style={{
                  color: "#94a3b8",
                  borderColor: "rgba(148, 163, 184, 0.25)",
                  backgroundColor: "transparent",
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Markdown content */}
        {loading && <ArticleSkeleton />}

        {!loading && fetchError && (
          <p style={{ color: "#94a3b8" }}>
            Não foi possível carregar o conteúdo do artigo. Tente novamente mais tarde.
          </p>
        )}

        {!loading && !fetchError && (
          <div>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              components={markdownComponents}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10">
          <ArticleCta />
        </div>
      </Container>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <Container as="section" maxWidth="xl" className="pb-12">
          <h2 className="text-xl font-bold mb-6" style={{ color: "#f1f5f9" }}>
            Artigos Relacionados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((related) => (
              <NewsCard key={related.id} article={related} />
            ))}
          </div>
        </Container>
      )}

      <SiteFooter />
    </motion.div>
  );
}
