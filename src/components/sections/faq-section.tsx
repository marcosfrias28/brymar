"use client";

import { SectionWrapper, SectionHeader } from "../ui/section-wrapper";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Image from "next/image";
import {
  useSectionFromPage,
  getSectionContent,
  getSectionCustomContent,
} from '@/hooks/queries/use-sections-query';
import { FAQSkeleton } from "../skeletons/home/faq-skeleton";

// Preparado para i18n - Solo 4 FAQ principales
const faqData = [
  {
    id: "faq-1",
    question: "¿Puedo personalizar mi propiedad ideal?",
    answer:
      "Absolutamente. En Marbry Inmobiliaria trabajamos contigo para encontrar propiedades que se adapten perfectamente a tus necesidades específicas, desde apartamentos de lujo hasta villas espaciosas, todo personalizado según tus preferencias y presupuesto.",
  },
  {
    id: "faq-2",
    question: "¿Dónde puedo encontrar propiedades con Marbry?",
    answer:
      "Operamos en las mejores ubicaciones de Florida, incluyendo Miami, Orlando, Tampa y áreas circundantes. Nuestro portafolio incluye propiedades residenciales, comerciales y de inversión en las zonas más exclusivas y prometedoras del estado.",
  },
  {
    id: "faq-3",
    question: "¿Cuáles son los pasos para comprar con Marbry?",
    answer:
      "Nuestro proceso es simple: 1) Consulta inicial gratuita para entender tus necesidades, 2) Búsqueda personalizada de propiedades, 3) Visitas guiadas a propiedades seleccionadas, 4) Negociación y asesoría legal, 5) Cierre exitoso con soporte completo.",
  },
  {
    id: "faq-4",
    question: "¿Qué hace diferente a Marbry Inmobiliaria?",
    answer:
      "Nuestra combinación única de experiencia local, tecnología avanzada, servicio personalizado y red de contactos exclusiva. Cada cliente recibe atención VIP con acceso a propiedades off-market y asesoría experta durante todo el proceso.",
  },
];

// Imágenes para el lado derecho - Grid corregido
const propertyImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
    alt: "Villa moderna con piscina",
    className: "col-span-1 row-span-1", // Primera imagen: 1 columna, 1 fila
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
    alt: "Interior de apartamento de lujo",
    className: "col-span-1 row-span-1", // Segunda imagen: 1 columna, 1 fila
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop",
    alt: "Oficina moderna",
    className: "col-span-2 row-span-1", // Tercera imagen: 2 columnas, 1 fila
  },
];

// Componente separado para el header que usa el hook
function FAQSectionHeader() {
  const { section, isLoading } = useSectionFromPage("home", "faq");

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 text-center">
        <div className="h-4 bg-muted rounded w-1/4 mx-auto"></div>
        <div className="h-8 bg-muted rounded w-1/2 mx-auto"></div>
        <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
      </div>
    );
  }

  const subtitle = getSectionContent(section, "subtitle", "FAQs");
  const title = getSectionContent(
    section,
    "title",
    "Todo sobre Marbry Inmobiliaria"
  );
  const description = getSectionContent(
    section,
    "description",
    "Sabemos que comprar, vender o invertir en bienes raíces puede ser abrumador. Aquí tienes las preguntas más frecuentes para guiarte en el proceso."
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
    />
  );
}

export function FAQSection() {
  const { section, isLoading } = useSectionFromPage("home", "faq");

  if (isLoading) {
    return <FAQSkeleton />;
  }

  // Obtener FAQ personalizadas del contenido de la sección
  const customFAQs = getSectionCustomContent(section, "faqs", null);
  const displayFAQs = customFAQs || faqData;

  return (
    <SectionWrapper className="bg-muted/30">
      {/* Header centrado arriba */}
      <FAQSectionHeader />

      {/* Grid con FAQ a la izquierda e imágenes a la derecha */}
      <div className="grid grid-cols-12 gap-10 items-start mt-12">
        {/* FAQ Accordion - Izquierda */}
        <div className="col-span-12 lg:col-span-7">
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-6"
            defaultValue="faq-1"
          >
            {displayFAQs.map((faq: any, index: number) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="bg-background/60 backdrop-blur-sm rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <AccordionTrigger className="text-left text-xl font-semibold text-foreground hover:text-primary transition-colors px-6 py-6 hover:no-underline accordion-trigger [&[data-state=open]>div>span:first-child]:bg-primary [&[data-state=open]>div>span:first-child]:text-primary-foreground">
                  <div className="flex items-start gap-4 w-full">
                    <span className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all duration-300">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-left">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed px-6 pb-6 pt-0 pl-16 text-base accordion-content">
                  <div className="pt-2">{faq.answer}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* CTA debajo de los FAQ */}
          <div className="mt-12 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20 backdrop-blur-sm">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                <HelpCircle className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-2xl font-semibold mb-3">
                ¿Tienes más preguntas?
              </h4>
              <p className="text-muted-foreground mb-6 text-lg max-w-md mx-auto">
                Nuestro equipo está listo para resolver todas tus dudas sobre
                bienes raíces.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
                  Contactar Experto
                </button>
                <button className="border-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 px-8 py-3 rounded-xl font-semibold transition-all duration-300">
                  Ver Más FAQs
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Imágenes Grid - Derecha */}
        <div className="col-span-12 lg:col-span-5">
          <div className="grid grid-cols-2 grid-rows-2 gap-10 h-[800px]">
            {propertyImages.map((image) => (
              <div
                key={image.id}
                className={`${image.className} relative rounded-2xl overflow-hidden cursor-none pointer-events-none`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
