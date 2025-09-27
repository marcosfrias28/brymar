"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/lib/db/schema";
import {
  Home,
  Building,
  TreePine,
  Warehouse,
  MapPin,
  Briefcase,
} from "lucide-react";
import Logo from "../ui/logo";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { SectionWrapper, SectionHeader } from "../ui/section-wrapper";
import {
  useSectionFromPage,
  getSectionContent,
} from "@/hooks/queries/use-sections-query";
import { CategoriesSkeleton } from "../skeletons/home/categories-skeleton";

interface CategoriesSectionProps {
  categories?: Category[];
}

// Componente separado para el header que usa el hook
function CategoriesSectionHeader() {
  const { section, isLoading } = useSectionFromPage("home", "categories");

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-1/4"></div>
        <div className="h-8 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-full"></div>
      </div>
    );
  }

  const subtitle = getSectionContent(section, "subtitle", "Categorías");
  const title = getSectionContent(
    section,
    "title",
    "Explora las mejores propiedades con servicios expertos"
  );
  const description = getSectionContent(
    section,
    "description",
    "Descubre una amplia gama de propiedades premium, desde apartamentos de lujo hasta villas espaciosas, adaptadas a tus necesidades"
  );

  return (
    <SectionHeader
      subtitle={subtitle}
      title={title}
      description={description}
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          role="img"
          className="text-2xl text-primary"
          width="1em"
          height="1em"
          viewBox="0 0 256 256"
        >
          <path
            fill="currentColor"
            d="M224 120v96a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8v-96a15.87 15.87 0 0 1 4.69-11.32l80-80a16 16 0 0 1 22.62 0l80 80A15.87 15.87 0 0 1 224 120"
          />
        </svg>
      }
      className="text-left mb-8"
      subtitleClassName="text-left justify-start"
      titleClassName="text-left text-3xl md:text-4xl lg:text-5xl"
      descriptionClassName="text-left max-w-none"
    />
  );
}

export function CategoriesSection({ categories = [] }: CategoriesSectionProps) {
  const [mounted, setMounted] = useState(false);
  const { isLoading } = useSectionFromPage("home", "categories");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show skeleton while loading or not mounted
  if (!mounted || isLoading) {
    return <CategoriesSkeleton />;
  }

  // Mappa delle icone per categoria
  const categoryIcons: Record<string, React.ComponentType<any>> = {
    "residential-home": Home,
    "luxury-villa": Building,
    apartment: Building,
    "office-spaces": Briefcase,
    default: MapPin,
  };

  // Datos de respaldo preparados para i18n
  const fallbackCategories = [
    {
      id: 1,
      name: "residential-home",
      slug: "residential-home",
      title: "Casas Residenciales",
      description:
        "Experimenta elegancia y comodidad con nuestras exclusivas villas de lujo, diseñadas para una vida sofisticada.",
      image: "/residencial/1.webp",
      href: "/properties?category=residential-home",
      status: "active",
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: "luxury-villa",
      slug: "luxury-villa",
      title: "Villas de Lujo",
      description:
        "Experimenta elegancia y comodidad con nuestras exclusivas villas de lujo, diseñadas para una vida sofisticada.",
      image: "/residencial/2.webp",
      href: "/properties?category=luxury-villa",
      status: "active",
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: "apartment",
      slug: "apartment",
      title: "Apartamentos",
      description:
        "Experimenta elegancia y comodidad con nuestros exclusivos apartamentos de lujo, diseñados para una vida sofisticada.",
      image: "/residencial/3.webp",
      href: "/properties?category=apartment",
      status: "active",
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      name: "office-spaces",
      slug: "office-spaces",
      title: "Espacios de Oficina",
      description:
        "Espacios comerciales premium diseñados para el éxito empresarial con ubicaciones estratégicas y amenidades modernas.",
      image: "/residencial/4.webp",
      href: "/properties?category=office-spaces",
      status: "active",
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const displayCategories =
    categories.length > 0 ? categories : fallbackCategories;
  const activeCategories = displayCategories
    .filter((cat) => cat.status === "active")
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <SectionWrapper className="relative overflow-hidden">
      <div className="grid grid-cols-12 items-center gap-10">
        {/* Header Section */}
        <div className="lg:col-span-6 col-span-12">
          <CategoriesSectionHeader />
          <Button asChild>
            <Link href="/properties">Ver Propiedades</Link>
          </Button>
        </div>

        {/* Categories Grid */}
        {activeCategories.map((category, index) => {
          const isLarge = index < 2;
          const width = isLarge ? 680 : 300;
          const colSpan = isLarge
            ? "lg:col-span-6 col-span-12"
            : "lg:col-span-3 col-span-6";

          return (
            <div key={category.id} className={cn(colSpan, "w-full")}>
              <Link href={category.href} className="w-full">
                <div
                  style={{
                    height: "25rem",
                  }}
                  className={cn("relative rounded-2xl overflow-hidden group")}
                >
                  <Image
                    alt={category.title}
                    fill
                    src={category.image}
                    className="object-cover"
                  />
                  <div className="absolute w-full h-full bg-gradient-to-b from-black/0 to-black/80 top-full flex flex-col justify-between pl-10 pb-10 group-hover:top-0 transition-all duration-500">
                    <div className="flex justify-end mt-6 mr-6">
                      <div className="bg-white text-dark rounded-full w-fit p-4">
                        {(() => {
                          const IconComponent =
                            categoryIcons[category.name] ||
                            categoryIcons.default;
                          return <IconComponent size={24} />;
                        })()}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <h3 className="text-white text-2xl">{category.title}</h3>
                      <p className="text-white/80 text-base leading-6">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

export default CategoriesSection;
