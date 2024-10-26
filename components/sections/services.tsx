"use client";

import { useLanguage } from "@/components/language-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  Home,
  Key,
  TrendingUp,
  Globe,
  Shield,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

export function Services() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Our Exclusive Services",
      subtitle:
        "Tailored solutions for discerning clients in the luxury real estate market",
      learnMore: "Learn More",
      services: [
        {
          title: "Global Property Search",
          description:
            "Access our curated portfolio of the world's most prestigious properties, from beachfront villas to urban penthouses.",
          icon: Search,
          color: "bg-blue-500",
        },
        {
          title: "Luxury Property Management",
          description:
            "Comprehensive management services to maintain and enhance the value of your high-end properties.",
          icon: Home,
          color: "bg-green-500",
        },
        {
          title: "VIP Buying Experience",
          description:
            "Personalized guidance throughout your luxury property acquisition, including private viewings and negotiations.",
          icon: Key,
          color: "bg-purple-500",
        },
        {
          title: "Investment Advisory",
          description:
            "Expert advice on prime real estate investment opportunities and portfolio diversification strategies.",
          icon: TrendingUp,
          color: "bg-red-500",
        },
        {
          title: "International Relocation",
          description:
            "Seamless relocation services for global clients, including visa assistance and local orientation.",
          icon: Globe,
          color: "bg-yellow-500",
        },
        {
          title: "Secure Transactions",
          description:
            "Ensure the confidentiality and security of your high-value property transactions with our specialized legal team.",
          icon: Shield,
          color: "bg-indigo-500",
        },
      ],
    },
    es: {
      title: "Nuestros Servicios Exclusivos",
      subtitle:
        "Soluciones a medida para clientes exigentes en el mercado inmobiliario de lujo",
      learnMore: "Más Información",
      services: [
        {
          title: "Búsqueda Global de Propiedades",
          description:
            "Acceda a nuestro portafolio seleccionado de las propiedades más prestigiosas del mundo, desde villas frente al mar hasta áticos urbanos.",
          icon: Search,
          color: "bg-blue-500",
        },
        {
          title: "Gestión de Propiedades de Lujo",
          description:
            "Servicios integrales de gestión para mantener y mejorar el valor de sus propiedades de alta gama.",
          icon: Home,
          color: "bg-green-500",
        },
        {
          title: "Experiencia de Compra VIP",
          description:
            "Orientación personalizada durante la adquisición de su propiedad de lujo, incluyendo visitas privadas y negociaciones.",
          icon: Key,
          color: "bg-purple-500",
        },
        {
          title: "Asesoría de Inversiones",
          description:
            "Asesoramiento experto sobre oportunidades de inversión inmobiliaria prime y estrategias de diversificación de cartera.",
          icon: TrendingUp,
          color: "bg-red-500",
        },
        {
          title: "Reubicación Internacional",
          description:
            "Servicios de reubicación sin problemas para clientes globales, incluyendo asistencia con visados y orientación local.",
          icon: Globe,
          color: "bg-yellow-500",
        },
        {
          title: "Transacciones Seguras",
          description:
            "Garantice la confidencialidad y seguridad de sus transacciones inmobiliarias de alto valor con nuestro equipo legal especializado.",
          icon: Shield,
          color: "bg-indigo-500",
        },
      ],
    },
    it: {
      title: "I Nostri Servizi Esclusivi",
      subtitle:
        "Soluzioni su misura per clienti esigenti nel mercato immobiliare di lusso",
      learnMore: "Scopri di Più",
      services: [
        {
          title: "Ricerca Globale di Proprietà",
          description:
            "Accedi al nostro portfolio curato delle proprietà più prestigiose al mondo, dalle ville fronte mare ai attici urbani.",
          icon: Search,
          color: "bg-blue-500",
        },
        {
          title: "Gestione Proprietà di Lusso",
          description:
            "Servizi di gestione completi per mantenere e aumentare il valore delle tue proprietà di alta gamma.",
          icon: Home,
          color: "bg-green-500",
        },
        {
          title: "Esperienza di Acquisto VIP",
          description:
            "Guida personalizzata durante l'acquisizione della tua proprietà di lusso, incluse visite private e negoziazioni.",
          icon: Key,
          color: "bg-purple-500",
        },
        {
          title: "Consulenza sugli Investimenti",
          description:
            "Consulenza esperta su opportunità di investimento immobiliare di prima classe e strategie di diversificazione del portafoglio.",
          icon: TrendingUp,
          color: "bg-red-500",
        },
        {
          title: "Trasferimento Internazionale",
          description:
            "Servizi di trasferimento senza problemi per clienti globali, inclusa assistenza per i visti e orientamento locale.",
          icon: Globe,
          color: "bg-yellow-500",
        },
        {
          title: "Transazioni Sicure",
          description:
            "Garantisci la riservatezza e la sicurezza delle tue transazioni immobiliari di alto valore con il nostro team legale specializzato.",
          icon: Shield,
          color: "bg-indigo-500",
        },
      ],
    },
  };

  const t = translations[language];

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {t.title}
        </motion.h2>
        <motion.p
          className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t.subtitle}
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {t.services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 * (index + 1) }}
            >
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div
                    className={`${service.color} w-16 h-16 rounded-full flex items-center justify-center mb-4`}
                  >
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-6">
                    {service.description}
                  </CardDescription>
                  <Button
                    variant="outline"
                    className="text-gray-800 border-gray-300 hover:bg-gray-100"
                  >
                    {t.learnMore}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
