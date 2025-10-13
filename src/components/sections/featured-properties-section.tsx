"use client";

import { FeaturedPropertiesGallery } from "./featured-gallery";
import { SectionWrapper, SectionHeader } from "../ui/section-wrapper";
import {
  useSectionFromPage,
  getSectionContent,
} from '@/hooks/queries/use-sections-query';
import { FeaturedPropertiesSkeleton } from "../skeletons/home/featured-properties-skeleton";

export function FeaturedPropertiesSection() {
  const { section, isLoading } = useSectionFromPage(
    "home",
    "featured-properties"
  );

  if (isLoading) {
    return <FeaturedPropertiesSkeleton />;
  }

  // Fallbacks si no hay datos en la base de datos
  const subtitle = getSectionContent(
    section,
    "subtitle",
    "Propiedades Destacadas"
  );
  const title = getSectionContent(
    section,
    "title",
    "Últimas Propiedades Destacadas"
  );
  const description = getSectionContent(
    section,
    "description",
    "Descubre nuestra selección cuidadosamente elegida de propiedades premium - cada una seleccionada por su valor excepcional y características únicas."
  );

  return (
    <SectionWrapper>
      <SectionHeader
        subtitle={subtitle}
        title={title}
        description={description}
      />
      <FeaturedPropertiesGallery />
    </SectionWrapper>
  );
}
