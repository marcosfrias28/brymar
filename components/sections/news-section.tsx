"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";


export function NewsSection() {

  const news = [
    {
      title: "Tendencias del Mercado 2024",
      description: "Análisis de las últimas tendencias del mercado inmobiliario y predicciones",
      date: "2024-03-15",
      image:
        "https://images.unsplash.com/photo-1460472178825-e5240623afd5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Oportunidades de Inversión",
      description: "Descubre las mejores zonas para invertir en inmuebles este año",
      date: "2024-03-10",
      image:
        "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <section className="py-16 px-4 bg-muted/50">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">Últimas Noticias</h2>
        <p className="text-xl text-muted-foreground text-center mb-12">
          Mantente actualizado con las tendencias del mercado inmobiliario
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {news.map((item, index) => (
            <Card key={index} className="">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <CardHeader>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(item.date).toLocaleDateString('es')}
                </div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline">Leer Más</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
