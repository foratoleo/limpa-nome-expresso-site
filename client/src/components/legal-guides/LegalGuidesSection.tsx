import { useState, useMemo } from 'react';
import { GUIDES_CATEGORIES } from '@/data/guides-metadata';
import { GuidesHeader } from './GuidesHeader';
import { GuidesAccordion } from './GuidesAccordion';
import { GuideModal } from './GuideModal';
import { GuideMetadata } from '@/types/guides';

export function LegalGuidesSection() {
  const [selectedGuide, setSelectedGuide] = useState<GuideMetadata | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleGuideClick = (guideId: string) => {
    const guide = GUIDES_CATEGORIES
      .flatMap(cat => cat.guides)
      .find(g => g.id === guideId);

    if (guide) {
      setSelectedGuide(guide);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedGuide(null);
  };

  // Filter categories based on searchQuery
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return GUIDES_CATEGORIES;

    return GUIDES_CATEGORIES.map(category => ({
      ...category,
      guides: category.guides.filter(guide =>
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })).filter(category => category.guides.length > 0);
  }, [searchQuery]);

  const totalGuides = useMemo(() =>
    filteredCategories.reduce((sum, cat) => sum + cat.guides.length, 0),
    [filteredCategories]
  );

  return (
    <div className="space-y-6">
      <GuidesHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalGuides={totalGuides}
      />
      <GuidesAccordion
        categories={filteredCategories}
        onGuideClick={handleGuideClick}
      />
      <GuideModal
        guide={selectedGuide}
        isOpen={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
