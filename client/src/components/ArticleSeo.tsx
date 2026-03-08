import { Helmet } from "react-helmet-async";

interface ArticleSeoProps {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  type: "website" | "article";
  publishedDate?: string;
}

export function ArticleSeo({
  title,
  description,
  keywords,
  canonicalUrl,
  type,
  publishedDate,
}: ArticleSeoProps) {
  const fullTitle = `${title} | Limpa Nome Expresso`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Limpa Nome Expresso" />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Article-specific */}
      {type === "article" && publishedDate && (
        <meta property="article:published_time" content={publishedDate} />
      )}
    </Helmet>
  );
}
