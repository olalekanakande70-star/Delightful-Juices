import React from 'react';
import { SiteContent, HeroSlide } from '../types';
import { HeroSlider } from './HeroSlider';
import { dataRepo } from '../lib/storage';

interface HeroProps {
  content: SiteContent;
  slides?: HeroSlide[];
  onNavigate?: (href: string) => void;
  onExploreClick?: () => void;
  onEventClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  content,
  slides,
  onNavigate,
  onExploreClick,
  onEventClick,
}) => {
  const resolvedSlides = slides || dataRepo.getHeroSlides();
  const handleNavigate = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    } else if (href.includes('event') && onEventClick) {
      onEventClick();
    } else if (onExploreClick) {
      onExploreClick();
    }
  };

  return (
    <HeroSlider
      slides={resolvedSlides}
      content={content}
      onNavigate={handleNavigate}
    />
  );
};
