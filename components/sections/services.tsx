'use client';

import { useLanguage } from '@/components/language-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Search, Key, HeartHandshake } from 'lucide-react';

export function Services() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: 'Our Services',
      subtitle: 'Comprehensive real estate solutions tailored to your needs',
      services: [
        {
          title: 'Property Search',
          description: 'Find your perfect property with our advanced search tools',
          icon: Search,
        },
        {
          title: 'Property Management',
          description: 'Professional management services for property owners',
          icon: Building2,
        },
        {
          title: 'Buying Guidance',
          description: 'Expert guidance throughout the buying process',
          icon: Key,
        },
        {
          title: 'Investment Advice',
          description: 'Strategic advice for real estate investments',
          icon: HeartHandshake,
        },
      ],
    },
    es: {
      title: 'Nuestros Servicios',
      subtitle: 'Soluciones inmobiliarias integrales adaptadas a tus necesidades',
      services: [
        {
          title: 'Búsqueda de Propiedades',
          description: 'Encuentra tu propiedad perfecta con nuestras herramientas de búsqueda avanzada',
          icon: Search,
        },
        {
          title: 'Gestión de Propiedades',
          description: 'Servicios profesionales de gestión para propietarios',
          icon: Building2,
        },
        {
          title: 'Guía de Compra',
          description: 'Orientación experta durante todo el proceso de compra',
          icon: Key,
        },
        {
          title: 'Asesoría de Inversión',
          description: 'Asesoramiento estratégico para inversiones inmobiliarias',
          icon: HeartHandshake,
        },
      ],
    },
    it: {
      title: 'I Nostri Servizi',
      subtitle: 'Soluzioni immobiliari complete su misura per le tue esigenze',
      services: [
        {
          title: 'Ricerca Immobili',
          description: 'Trova la tua proprietà perfetta con i nostri strumenti di ricerca avanzati',
          icon: Search,
        },
        {
          title: 'Gestione Immobili',
          description: 'Servizi professionali di gestione per proprietari',
          icon: Building2,
        },
        {
          title: 'Guida all\'Acquisto',
          description: 'Guida esperta durante tutto il processo di acquisto',
          icon: Key,
        },
        {
          title: 'Consulenza Investimenti',
          description: 'Consulenza strategica per investimenti immobiliari',
          icon: HeartHandshake,
        },
      ],
    },
  };

  const t = translations[language];

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">{t.title}</h2>
        <p className="text-xl text-muted-foreground text-center mb-12">
          {t.subtitle}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {t.services.map((service, index) => (
            <Card key={index} className="bg-background">
              <CardHeader>
                <service.icon className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}