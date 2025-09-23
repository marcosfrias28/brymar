"use client";

import { FeaturedPropertiesGallery } from "./featured-gallery";
import { SectionWrapper, SectionHeader } from "../ui/section-wrapper";
import { useSection, getSectionContent } from "@/hooks/use-sections";

export function FeaturedPropertiesSection() {
  const { section, loading } = useSection("home", "featured-properties");

  if (loading) {
    return (
      <SectionWrapper>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4 mx-auto"></div>
          <div className="h-8 bg-muted rounded w-1/2 mx-auto"></div>
          <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
        </div>
      </SectionWrapper>
    );
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
