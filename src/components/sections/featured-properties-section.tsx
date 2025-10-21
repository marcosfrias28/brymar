"use client";

import { FeaturedPropertiesGallery } from "./featured-gallery";
import { SectionWrapper, SectionHeader } from "../ui/section-wrapper";
import { useSection } from "@/hooks/use-static-content";
import { FeaturedPropertiesSkeleton } from "../skeletons/home/featured-properties-skeleton";

export function FeaturedPropertiesSection() {
  const { data: section, loading: isLoading } = useSection(
    "home",
    "featured-properties"
  );

  if (isLoading) {
    return <FeaturedPropertiesSkeleton />;
  }

  // Use static content with fallbacks
  const subtitle = section?.subtitle || "Propiedades Destacadas";
  const title = section?.title || "Últimas Propiedades Destacadas";
  const description =
    section?.description ||
    "Descubre nuestra selección cuidadosamente elegida de propiedades premium - cada una seleccionada por su valor excepcional y características únicas.";

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
