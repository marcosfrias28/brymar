'use client';

import { useLanguage } from '@/components/language-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export function NewsSection() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: 'Latest News',
      subtitle: 'Stay updated with real estate market trends',
      readMore: 'Read More',
    },
    es: {
      title: 'Últimas Noticias',
      subtitle: 'Mantente actualizado con las tendencias del mercado inmobiliario',
      readMore: 'Leer Más',
    },
    it: {
      title: 'Ultime Notizie',
      subtitle: 'Resta aggiornato sulle tendenze del mercato immobiliare',
      readMore: 'Leggi di Più',
    },
  };

  const news = [
    {
      title: {
        en: 'Market Trends 2024',
        es: 'Tendencias del Mercado 2024',
        it: 'Tendenze del Mercato 2024',
      },
      description: {
        en: 'Analysis of the latest real estate market trends and predictions',
        es: 'Análisis de las últimas tendencias del mercado inmobiliario y predicciones',
        it: 'Analisi delle ultime tendenze del mercato immobiliare e previsioni',
      },
      date: '2024-03-15',
      image: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      title: {
        en: 'Investment Opportunities',
        es: 'Oportunidades de Inversión',
        it: 'Opportunità di Investimento',
      },
      description: {
        en: 'Discover the best areas for real estate investment this year',
        es: 'Descubre las mejores zonas para invertir en inmuebles este año',
        it: 'Scopri le migliori zone per investimenti immobiliari quest\'anno',
      },
      date: '2024-03-10',
      image: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
  ];

  const t = translations[language];

  return (
    <section className="py-16 px-4 bg-muted/50">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">{t.title}</h2>
        <p className="text-xl text-muted-foreground text-center mb-12">
          {t.subtitle}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {news.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <img
                src={item.image}
                alt={item.title[language]}
                className="w-full h-48 object-cover"
              />
              <CardHeader>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(item.date).toLocaleDateString(language)}
                </div>
                <CardTitle>{item.title[language]}</CardTitle>
                <CardDescription>{item.description[language]}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline">{t.readMore}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}