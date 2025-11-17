"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SectionHeader, SectionWrapper } from "@/components/ui/section-wrapper";
import { Building2, ContactRound, Newspaper, Home } from "lucide-react";

type HeaderConfig = {
  subtitle: string;
  title: string;
  description: string;
  icon: ReactNode;
};

function getHeaderConfig(pathname: string): HeaderConfig {
  if (pathname.startsWith("/about")) {
    return {
      subtitle: "Sobre nosotros",
      title: "Tu Socio Confiable en Bienes Raíces",
      description:
        "En Marbry, nos apasiona ayudar a las personas a encontrar no solo una casa, sino un hogar. Construimos confianza con profesionalidad y resultados excepcionales.",
      icon: <Home />,
    };
  }

  if (pathname.startsWith("/blog")) {
    return {
      subtitle: "Blog",
      title: "Historias y consejos inmobiliarios",
      description:
        "Artículos, noticias y guías prácticas para que tomes mejores decisiones en el mercado inmobiliario.",
      icon: <Newspaper />,
    };
  }

  if (pathname.startsWith("/contact")) {
    return {
      subtitle: "Contáctanos",
      title: "¿Tienes preguntas? ¡Estamos aquí para ayudarte!",
      description:
        "Nuestro equipo ofrece orientación personalizada y conocimiento del mercado adaptado a ti.",
      icon: <ContactRound />,
    };
  }

  if (pathname.startsWith("/properties")) {
    return {
      subtitle: "Propiedades",
      title: "Explora nuestras propiedades disponibles",
      description:
        "Encuentra la propiedad ideal con filtros avanzados, vistas flexibles y detalles completos.",
      icon: <Building2 />,
    };
  }

  return {
    subtitle: "",
    title: "",
    description: "",
    icon: null,
  };
}

export default function FrontLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const header = getHeaderConfig(pathname);

  return (
    <>
      <SectionWrapper>
        <SectionHeader
          subtitle={header.subtitle}
          title={header.title}
          description={header.description}
          icon={header.icon}
        />
      </SectionWrapper>
      {children}
    </>
  );
}

