import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/ui/container';
import { ArrowLeftIcon, DownloadIcon, ExternalLinkIcon, BookOpenIcon } from '@/utils/icons';
import { getGuideById, getGuideBySlug } from '@/data/guides-metadata';
import { STEPS } from '@/data/steps';
import { useLocation } from 'wouter';
import type { GuideCategory } from '@/types/guides';

interface GuidePageProps {
  guideId?: string;
  slug?: string;
}

export function GuidePage({ guideId, slug }: GuidePageProps) {
  const [guide, setGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const fetchGuide = async () => {
      setLoading(true);
      try {
        let guideData;

        if (guideId) {
          guideData = getGuideById(guideId);
        } else if (slug) {
          guideData = getGuideBySlug(slug);
        } else {
          // Default to first guide if no ID or slug provided
          const allGuides = require('@/data/guides-metadata').getAllGuides();
          guideData = allGuides[0];
        }

        if (guideData) {
          setGuide(guideData);
        } else {
          setLocation('/404');
        }
      } catch (error) {
        console.error('Error loading guide:', error);
        setLocation('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, [guideId, slug, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#12110d" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d39e17] mx-auto mb-4"></div>
          <p style={{ color: "#94a3b8" }}>Carregando guia...</p>
        </div>
      </div>
    );
  }

  if (!guide) {
    return null; // Will redirect to 404
  }

  const relatedSteps = STEPS.filter(step =>
    guide.tags?.some(tag =>
      step.title.toLowerCase().includes(tag.toLowerCase()) ||
      step.subtitle.toLowerCase().includes(tag.toLowerCase())
    )
  );

  const getCategoryInfo = (categoryId: string): GuideCategory | undefined => {
    const categories = require('@/data/guides-metadata').GUIDES_CATEGORIES;
    return categories.find(cat => cat.id === categoryId);
  };

  const categoryInfo = getCategoryInfo(guide.category);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#12110d", fontFamily: "'Public Sans', sans-serif" }}>
      <Helmet>
        <title>{guide.title} - Limpa Nome Expresso</title>
        <meta name="description" content={guide.description} />
      </Helmet>

      {/* Header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-[6px] border"
        style={{
          backgroundColor: "rgba(18, 17, 13, 0.8)",
          borderColor: "rgba(211, 158, 23, 0.2)"
        }}
      >
        <Container as="div" maxWidth="xl" className="flex items-center justify-between py-4">
          <button
            onClick={() => setLocation('/guia')}
            className="flex items-center gap-2 text-sm font-medium hover:text-[#d39e17] transition-colors"
            style={{ color: "#cbd5e1" }}
          >
            <ArrowLeftIcon size="small" label="" />
            Voltar ao Guia
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium" style={{ color: "#d39e17" }}>
              {categoryInfo?.label || 'Guia'}
            </span>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <Container as="div" maxWidth="xl" className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Guide Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guide Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <BookOpenIcon size="large" label="" />
                <h1 className="text-3xl md:text-4xl font-bold" style={{ color: "#f1f5f9" }}>
                  {guide.title}
                </h1>
              </div>

              <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ color: "#94a3b8" }}>
                {guide.description}
              </p>

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span style={{ color: "#64748b" }}>Tempo de leitura:</span>
                  <span className="font-medium" style={{ color: "#d39e17" }}>
                    {guide.estimatedReadTime} min
                  </span>
                </div>

                {guide.lastUpdated && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: "#64748b" }}>Última atualização:</span>
                    <span className="font-medium" style={{ color: "#94a3b8" }}>
                      {new Date(guide.lastUpdated).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {guide.tags && guide.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {guide.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: "rgba(211, 158, 23, 0.1)",
                      color: "#d39e17"
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content Placeholder */}
            <div className="mt-8 p-6 rounded-2xl border" style={{
              backgroundColor: "rgba(22, 40, 71, 0.6)",
              borderColor: "rgba(211, 158, 23, 0.2)"
            }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: "#f1f5f9" }}>
                Conteúdo do Guia
              </h2>
              <div className="prose prose-invert max-w-none" style={{ color: "#e8e4d8" }}>
                <p style={{ color: "#94a3b8" }}>
                  O conteúdo completo deste guia será carregado aqui. Esta é uma implementação demostrando
                  a estrutura da página e a integração com os metadados dos guias.
                </p>
                <p style={{ color: "#94a3b8" }}>
                  O arquivo fonte do guia está localizado em: <code style={{ color: "#d39e17" }}>{guide.contentFile}</code>
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Downloads Section */}
            <div className="p-6 rounded-2xl border" style={{
              backgroundColor: "rgba(22, 40, 71, 0.6)",
              borderColor: "rgba(211, 158, 23, 0.2)"
            }}>
              <h3 className="font-bold text-lg mb-4" style={{ color: "#f1f5f9" }}>
                Downloads Relacionados
              </h3>

              <div className="space-y-3">
                {guide.contentFile && (
                  <a
                    href={guide.contentFile}
                    download
                    className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-white/10"
                    style={{ backgroundColor: "rgba(96, 165, 250, 0.1)" }}
                  >
                    <DownloadIcon size="small" label="" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#60a5fa" }}>
                        Baixar Guia Completo
                      </p>
                      <p className="text-xs truncate" style={{ color: "#64748b" }}>
                        Arquivo markdown completo
                      </p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* Related Steps */}
            {relatedSteps.length > 0 && (
              <div className="p-6 rounded-2xl border" style={{
                backgroundColor: "rgba(22, 40, 71, 0.6)",
                borderColor: "rgba(211, 158, 23, 0.2)"
              }}>
                <h3 className="font-bold text-lg mb-4" style={{ color: "#f1f5f9" }}>
                  Passos Relacionados
                </h3>

                <div className="space-y-3">
                  {relatedSteps.slice(0, 3).map((step) => (
                    <a
                      key={step.number}
                      href={`/guia#fase-${step.number}`}
                      className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-white/10"
                      style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: "rgba(211, 158, 23, 0.2)" }}>
                        <span className="text-xs font-bold" style={{ color: "#d39e17" }}>
                          {step.number}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "#22c55e" }}>
                          {step.title}
                        </p>
                        <p className="text-xs truncate" style={{ color: "#64748b" }}>
                          {step.subtitle}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* External Links */}
            <div className="p-6 rounded-2xl border" style={{
              backgroundColor: "rgba(22, 40, 71, 0.6)",
              borderColor: "rgba(211, 158, 23, 0.2)"
            }}>
              <h3 className="font-bold text-lg mb-4" style={{ color: "#f1f5f9" }}>
                Links Externos
              </h3>

              <div className="space-y-3">
                {categoryInfo?.description && (
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: "#d39e17" }}>
                      {categoryInfo.label}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
                      {categoryInfo.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default GuidePage;