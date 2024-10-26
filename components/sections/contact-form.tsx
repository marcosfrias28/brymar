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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

export function ContactForm() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Contact Our Experts",
      subtitle: "Get in touch with our professional team",
      name: "Name",
      email: "Email",
      message: "Message",
      send: "Send Message",
      contact: "Contact Information",
      address: "123 Luxury Real Estate Ave, Prestige City",
      phone: "+1 234 567 890",
      emailAddress: "contact@luxuryrealestate.com",
    },
    es: {
      title: "Contacta a Nuestros Expertos",
      subtitle: "Ponte en contacto con nuestro equipo profesional",
      name: "Nombre",
      email: "Correo",
      message: "Mensaje",
      send: "Enviar Mensaje",
      contact: "Información de Contacto",
      address: "Av. Inmobiliaria de Lujo 123, Ciudad Prestigio",
      phone: "+34 123 456 789",
      emailAddress: "contacto@inmobiliariadelujo.com",
    },
    it: {
      title: "Contatta i Nostri Esperti",
      subtitle: "Mettiti in contatto con il nostro team professionale",
      name: "Nome",
      email: "Email",
      message: "Messaggio",
      send: "Invia Messaggio",
      contact: "Informazioni di Contatto",
      address: "Via Immobiliare di Lusso 123, Città Prestigio",
      phone: "+39 123 456 789",
      emailAddress: "contatto@immobiliaredilusso.com",
    },
  };

  const t = translations[language];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
          {t.title}
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12">{t.subtitle}</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white  border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-800">{t.contact}</CardTitle>
              <CardDescription className="text-gray-600">
                {t.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-gray-700">
                <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                <p>{t.address}</p>
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="h-5 w-5 mr-3 text-gray-500" />
                <p>{t.phone}</p>
              </div>
              <div className="flex items-center text-gray-700">
                <Mail className="h-5 w-5 mr-3 text-gray-500" />
                <p>{t.emailAddress}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-800">{t.title}</CardTitle>
              <CardDescription className="text-gray-600">
                {t.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Input
                    placeholder={t.name}
                    className="border-gray-300 focus:border-gray-500"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder={t.email}
                    className="border-gray-300 focus:border-gray-500"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder={t.message}
                    rows={4}
                    className="border-gray-300 focus:border-gray-500"
                  />
                </div>
                <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white">
                  {t.send}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
