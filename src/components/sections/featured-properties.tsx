"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bed, Bath, Square, MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";


const properties = [
  {
    id: 1,
    title: "Opulent Oceanfront Villa",
    location: "Malibu, California",
    price: "$25,000,000",
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    beds: 6,
    baths: 8,
    area: "10,000 sq ft",
    description:
      "Breathtaking oceanfront villa with panoramic views, infinity pool, and private beach access.",
  },
  {
    id: 2,
    title: "Majestic Mountain Retreat",
    location: "Aspen, Colorado",
    price: "$18,500,000",
    image:
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    beds: 5,
    baths: 7,
    area: "8,500 sq ft",
    description:
      "Luxurious mountain home with ski-in/ski-out access, home theater, and stunning mountain views.",
  },
  {
    id: 3,
    title: "Urban Penthouse Oasis",
    location: "New York City, New York",
    price: "$32,000,000",
    image:
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    beds: 4,
    baths: 5,
    area: "6,500 sq ft",
    description:
      "Spectacular penthouse with 360-degree city views, private terrace, and state-of-the-art smart home features.",
  },
];

export default function FeaturedProperties() {

  return (
    <section className="py-24 px-4 bg-gray-50">
      <div className="container mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Propiedades Destacadas
        </motion.h2>
        <motion.p
          className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Descubre nuestra selección exclusiva de propiedades de lujo
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 * (index + 1) }}
            >
              <Card className=" bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 aspect-500/600">
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
                      <CardTitle className="text-2xl text-foreground mb-2">
                        {property.title}
                      </CardTitle>
                      <CardDescription className="flex items-center text-muted-foreground mb-4">
                        <MapPin className="h-4 w-4 mr-1" />
                        {property.location}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-lg font-semibold bg-primary text-primary-foreground px-3 py-1"
                    >
                      {property.price}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">{property.description}</p>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center text-muted-foreground">
                      <Bed className="h-5 w-5 mr-2" />
                      <span>{property.beds} Beds</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Bath className="h-5 w-5 mr-2" />
                      <span>{property.baths} Baths</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Square className="h-5 w-5 mr-2" />
                      <span>{property.area}</span>
                    </div>
                  </div>
                  <Button className="w-full bg-foreground hover:bg-foreground/90 text-background">
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Button
            size="lg"
            variant="outline"
            className="text-gray-800 dark:text-white border-gray-800 hover:bg-gray-100"
          >
            Ver Todas las Propiedades
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
