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

interface CategoriesSectionProps {
  categories?: Category[];
}

export function CategoriesSection({ categories = [] }: CategoriesSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mappa delle icone per categoria
  const categoryIcons: Record<string, React.ComponentType<any>> = {
    "residential-home": Home,
    "luxury-villa": Building,
    apartment: Building,
    "office-spaces": Briefcase,
    default: MapPin,
  };

  // Dati di fallback se non ci sono categorie dal database
  const fallbackCategories = [
    {
      id: 1,
      name: "residential-home",
      slug: "residential-home",
      title: "Residential Homes",
      description:
        "Experience elegance and comfort with our exclusive luxury villas, designed for sophisticated living.",
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
      title: "Luxury villas",
      description:
        "Experience elegance and comfort with our exclusive luxury villas, designed for sophisticated living.",
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
      title: "Appartment",
      description:
        "Experience elegance and comfort with our exclusive luxury villas, designed for sophisticated living.",
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
      title: "Office Spaces",
      description:
        "Experience elegance and comfort with our exclusive luxury villas, designed for sophisticated living.",
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

  if (!mounted) {
    return null;
  }

  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-5 2xl:px-0 py-10 relative z-10">
        <Logo />
        <div className="grid grid-cols-12 items-center gap-10">
          {/* Header Section */}
          <div className="lg:col-span-6 col-span-12">
            <p className="text-dark/75 dark:text-white/75 text-base font-semibold flex gap-2.5">
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
              Categories
            </p>
            <h2 className="lg:text-52 text-40 mt-4 mb-2 lg:max-w-full font-medium leading-[1.2] text-dark dark:text-white">
              Explore best properties with expert services.
            </h2>
            <p className="text-dark/50 dark:text-white/50 text-lg lg:max-w-full leading-[1.3] md:max-w-3/4">
              Discover a diverse range of premium properties, from luxurious
              apartments to spacious villas, tailored to your needs
            </p>
            <Link
              className="py-4 px-8 bg-primary text-base leading-4 block w-fit text-white rounded-full font-semibold mt-8 hover:bg-dark duration-300"
              href="/properties"
            >
              View properties
            </Link>
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
                        <h3 className="text-white text-2xl">
                          {category.title}
                        </h3>
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
      </div>
    </section>
  );
}

export default CategoriesSection;
