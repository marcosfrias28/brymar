'use client';

import { useLanguage } from '@/components/language-provider';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote } from 'lucide-react';

export function Testimonials() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: 'What Our Clients Say',
      subtitle: 'Real experiences from satisfied customers',
    },
    es: {
      title: 'Lo Que Dicen Nuestros Clientes',
      subtitle: 'Experiencias reales de clientes satisfechos',
    },
    it: {
      title: 'Cosa Dicono i Nostri Clienti',
      subtitle: 'Esperienze reali da clienti soddisfatti',
    },
  };

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Homeowner',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      quote: {
        en: 'They helped me find my dream home in record time. Exceptional service!',
        es: 'Me ayudaron a encontrar la casa de mis sueños en tiempo récord. ¡Servicio excepcional!',
        it: 'Mi hanno aiutato a trovare la casa dei miei sogni in tempo record. Servizio eccezionale!',
      },
    },
    {
      name: 'Marco Rossi',
      role: 'Investor',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      quote: {
        en: 'Professional team with deep market knowledge. Great investment advice!',
        es: 'Equipo profesional con profundo conocimiento del mercado. ¡Excelente asesoramiento!',
        it: 'Team professionale con profonda conoscenza del mercato. Ottimi consigli per gli investimenti!',
      },
    },
    {
      name: 'Elena García',
      role: 'Property Seller',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      quote: {
        en: 'Sold my property above market value. Couldn\'t be happier with the results!',
        es: 'Vendí mi propiedad por encima del valor de mercado. ¡No podría estar más feliz!',
        it: 'Ho venduto la mia proprietà sopra il valore di mercato. Non potrei essere più felice!',
      },
    },
  ];

  const t = translations[language];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">{t.title}</h2>
        <p className="text-xl text-muted-foreground text-center mb-12">
          {t.subtitle}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardHeader>
                <Quote className="h-8 w-8 text-primary mb-4" />
                <p className="text-lg mb-6">{testimonial.quote[language]}</p>
                <div className="flex items-center">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}