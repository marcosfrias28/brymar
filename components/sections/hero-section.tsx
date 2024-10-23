'use client';

import { useLanguage } from '@/components/language-provider';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function HeroSection() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: 'Find Your Dream Property',
      subtitle: 'Discover exclusive properties in prime locations',
      cta: 'Start Searching',
    },
    es: {
      title: 'Encuentra Tu Propiedad Soñada',
      subtitle: 'Descubre propiedades exclusivas en ubicaciones privilegiadas',
      cta: 'Empezar Búsqueda',
    },
    it: {
      title: 'Trova la Tua Proprietà dei Sogni',
      subtitle: 'Scopri proprietà esclusive in posizioni privilegiate',
      cta: 'Inizia la Ricerca',
    },
  };

  const t = translations[language];

  return (
    <div className="relative h-[80vh] w-full">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-6">
          {t.title}
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 max-w-2xl">
          {t.subtitle}
        </p>
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          <Search className="mr-2 h-5 w-5" />
          {t.cta}
        </Button>
      </div>
    </div>
  );
}