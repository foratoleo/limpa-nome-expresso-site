import { useState, useMemo } from 'react';
import { STEPS } from '@/data/steps';
import { getAllGuides } from '@/data/guides-metadata';
import type { Step, CheckItemData } from '@/data/steps';

export interface SearchResult {
  id: string;
  type: 'step' | 'guide' | 'item';
  title: string;
  subtitle?: string;
  description: string;
  phase?: number;
  category?: string;
  tags?: string[];
  content?: string;
}

export function useSearchGuide() {
  const [query, setQuery] = useState('');

  const searchResults: SearchResult[] = useMemo(() => {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const normalizedQuery = query.toLowerCase().trim();

    // Search in STEPS (process steps)
    STEPS.forEach((step, phaseIndex) => {
      // Search step title and subtitle
      if (step.title.toLowerCase().includes(normalizedQuery) ||
          step.subtitle.toLowerCase().includes(normalizedQuery)) {
        results.push({
          id: `step-${step.number}`,
          type: 'step',
          title: step.title,
          subtitle: step.subtitle,
          description: `Fase ${step.number}: ${step.subtitle}`,
          phase: step.number,
          content: step.tip
        });
      }

      // Search in step items
      step.items.forEach((item) => {
        if (item.label.toLowerCase().includes(normalizedQuery) ||
            item.detail.toLowerCase().includes(normalizedQuery)) {
          results.push({
            id: `item-${step.number}-${item.id}`,
            type: 'item',
            title: item.label,
            description: item.detail,
            phase: step.number
          });
        }
      });

      // Search in step downloads
      step.downloads?.forEach((download) => {
        if (download.label.toLowerCase().includes(normalizedQuery) ||
            download.description.toLowerCase().includes(normalizedQuery)) {
          results.push({
            id: `download-${step.number}-${download.file}`,
            type: 'item',
            title: download.label,
            description: download.description,
            phase: step.number
          });
        }
      });

      // Search in step links
      step.links?.forEach((link) => {
        if (link.label.toLowerCase().includes(normalizedQuery)) {
          results.push({
            id: `link-${step.number}-${link.url}`,
            type: 'item',
            title: link.label,
            description: `Link externo: ${link.url}`,
            phase: step.number
          });
        }
      });
    });

    // Search in guides metadata
    const guides = getAllGuides();
    guides.forEach((guide) => {
      if (guide.title.toLowerCase().includes(normalizedQuery) ||
          guide.description.toLowerCase().includes(normalizedQuery) ||
          guide.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))) {
        results.push({
          id: `guide-${guide.id}`,
          type: 'guide',
          title: guide.title,
          description: guide.description,
          category: guide.category,
          tags: guide.tags,
          content: `Tempo estimado de leitura: ${guide.estimatedReadTime}min`
        });
      }
    });

    // Remove duplicates and sort by relevance
    const uniqueResults = results.filter((result, index, self) =>
      index === self.findIndex(r => r.id === result.id)
    );

    return uniqueResults.sort((a, b) => {
      // Prioritize exact matches in titles
      const aExactMatch = a.title.toLowerCase().includes(normalizedQuery);
      const bExactMatch = b.title.toLowerCase().includes(normalizedQuery);

      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      // Then by phase (for step-related items)
      if (a.phase && b.phase) {
        return a.phase - b.phase;
      }

      // Then alphabetically
      return a.title.localeCompare(b.title);
    });
  }, [query]);

  const clearSearch = () => {
    setQuery('');
  };

  return {
    query,
    setQuery,
    results: searchResults,
    hasResults: searchResults.length > 0,
    clearSearch
  };
}