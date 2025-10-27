"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useFeaturedProperties } from "@/hooks/use-properties";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Square } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

interface PropertyCardProps {
  property: any;
  index: number;
  imageRef: React.RefObject<HTMLImageElement | null>;
}

function PropertyCard({ property, index, imageRef }: PropertyCardProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group relative overflow-hidden bg-background border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          ref={imageRef}
          src={property.images?.[0] || "/placeholder.svg"}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {property.featured && (
          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
            Destacada
          </Badge>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 text-white/90 text-sm">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{property.location}</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-primary">
            {formatPrice(property.price, property.currency)}
          </span>
          <Badge variant="outline" className="text-xs">
            {property.type === 'house' ? 'Casa' : 
             property.type === 'apartment' ? 'Apartamento' : 
             property.type === 'villa' ? 'Villa' : 'Propiedad'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{property.features?.bedrooms || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{property.features?.bathrooms || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            <span>{property.features?.area || 0}m²</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {property.description}
        </p>
        
        <Button asChild className="w-full">
          <Link href={`/properties/${property.id}`}>
            Ver Detalles
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function PropertiesSlider() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { data: propertiesResult, isLoading, error } = useFeaturedProperties();
  
  // Create refs for each property image
  const imageRefs = Array.from({ length: 6 }, () => useRef<HTMLImageElement | null>(null));

  useGSAP(() => {
    if (!titleRef.current || !sectionRef.current) return;

    // Animate title
    gsap.fromTo(
      titleRef.current,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "top 20%",
          scrub: true,
        },
      }
    );

    // Animate property cards
    imageRefs.forEach((imageRef, index) => {
      if (imageRef.current) {
        gsap.from(imageRef.current, {
          y: 100,
          opacity: 0,
          duration: 0.8,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 85%",
            end: "top 50%",
            scrub: true,
          },
        });
      }
    });
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Propiedades Destacadas
            </h2>
            <p className="text-muted-foreground">
              Descubre nuestras mejores propiedades
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded mb-4" />
                  <div className="h-8 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Propiedades Destacadas
          </h2>
          <p className="text-muted-foreground">
            No se pudieron cargar las propiedades. Intenta nuevamente.
          </p>
        </div>
      </section>
    );
  }

  const properties = propertiesResult?.data?.items || [];

  return (
    <section
      ref={sectionRef}
      className="py-16 px-4 bg-muted/30"
    >
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Propiedades Destacadas
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descubre nuestra selección de propiedades premium, cuidadosamente 
            elegidas para ofrecerte la mejor experiencia inmobiliaria.
          </p>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.slice(0, 6).map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={index}
                imageRef={imageRefs[index]}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No hay propiedades destacadas disponibles en este momento.
            </p>
          </div>
        )}

        {properties.length > 0 && (
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/search">
                Ver Todas las Propiedades
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
