'use client';

import { useLanguage } from '@/components/language-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin } from 'lucide-react';

const properties = [
  {
    id: 1,
    title: 'Luxury Penthouse',
    location: 'Downtown',
    price: '2,500,000',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'penthouse',
  },
  {
    id: 2,
    title: 'Modern Villa',
    location: 'Beachfront',
    price: '3,200,000',
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'villa',
  },
  {
    id: 3,
    title: 'Urban Apartment',
    location: 'City Center',
    price: '850,000',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'apartment',
  },
];

export function FeaturedProperties() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: 'Featured Properties',
      subtitle: 'Discover our exclusive selection of premium properties',
      currency: '$',
    },
    es: {
      title: 'Propiedades Destacadas',
      subtitle: 'Descubre nuestra selección exclusiva de propiedades premium',
      currency: '€',
    },
    it: {
      title: 'Proprietà in Evidenza',
      subtitle: 'Scopri la nostra selezione esclusiva di proprietà premium',
      currency: '€',
    },
  };

  const t = translations[language];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">{t.title}</h2>
        <p className="text-xl text-muted-foreground text-center mb-12">
          {t.subtitle}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <AspectRatio ratio={16 / 9}>
                <img
                  src={property.image}
                  alt={property.title}
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{property.title}</CardTitle>
                    <CardDescription className="flex items-center mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.location}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    <Building2 className="h-3 w-3 mr-1" />
                    {property.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {t.currency}{property.price}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}