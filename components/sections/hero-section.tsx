"use client";

import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Home, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Discover Unparalleled Luxury",
      subtitle: "Exclusive properties in the world's most coveted locations",
      search: "Search for your dream property",
      cta: "Explore Listings",
      stats: [
        { icon: MapPin, value: "50+", label: "Prime Locations" },
        { icon: Home, value: "1000+", label: "Luxury Properties" },
        { icon: TrendingUp, value: "$2B+", label: "Property Value" },
      ],
    },
    es: {
      title: "Descubre el Lujo Sin Igual",
      subtitle:
        "Propiedades exclusivas en las ubicaciones más codiciadas del mundo",
      search: "Busca tu propiedad de ensueño",
      cta: "Explorar Listados",
      stats: [
        { icon: MapPin, value: "50+", label: "Ubicaciones Prime" },
        { icon: Home, value: "1000+", label: "Propiedades de Lujo" },
        { icon: TrendingUp, value: "2000M€+", label: "Valor de Propiedades" },
      ],
    },
    it: {
      title: "Scopri il Lusso Senza Paragoni",
      subtitle: "Proprietà esclusive nelle località più ambite del mondo",
      search: "Cerca la tua proprietà da sogno",
      cta: "Esplora gli Annunci",
      stats: [
        { icon: MapPin, value: "50+", label: "Location di Prestigio" },
        { icon: Home, value: "1000+", label: "Proprietà di Lusso" },
        { icon: TrendingUp, value: "2000M€+", label: "Valore Immobiliare" },
      ],
    },
  };

  const t = translations[language];

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-center mb-6 leading-tight text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {t.title}
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-center mb-12 max-w-3xl text-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t.subtitle}
        </motion.p>
        <motion.div
          className="w-full max-w-2xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex">
            <Input
              placeholder={t.search}
              className="rounded-r-none bg-white/10 border-white/20 text-white placeholder-gray-300"
            />
            <Button
              size="lg"
              className="rounded-l-none bg-gold hover:bg-gold/90 text-black"
            >
              <Search className="mr-2 h-5 w-5" />
              {t.cta}
            </Button>
          </div>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {t.stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center bg-white/10 rounded-lg p-6"
            >
              <stat.icon className="h-12 w-12 mb-4 text-gold" />
              <span className="text-4xl font-bold text-white mb-2">
                {stat.value}
              </span>
              <span className="text-gray-300">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
