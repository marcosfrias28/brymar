'use client';

import { useLanguage } from '@/components/language-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';

export function ContactForm() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: 'Contact Us',
      subtitle: 'Get in touch with our expert team',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send Message',
      contact: 'Contact Information',
      address: '123 Real Estate Ave, City',
      phone: '+1 234 567 890',
      emailAddress: 'contact@realestate.com',
    },
    es: {
      title: 'Contáctanos',
      subtitle: 'Ponte en contacto con nuestro equipo de expertos',
      name: 'Nombre',
      email: 'Correo',
      message: 'Mensaje',
      send: 'Enviar Mensaje',
      contact: 'Información de Contacto',
      address: 'Av. Inmobiliaria 123, Ciudad',
      phone: '+34 123 456 789',
      emailAddress: 'contacto@realestate.com',
    },
    it: {
      title: 'Contattaci',
      subtitle: 'Mettiti in contatto con il nostro team di esperti',
      name: 'Nome',
      email: 'Email',
      message: 'Messaggio',
      send: 'Invia Messaggio',
      contact: 'Informazioni di Contatto',
      address: 'Via Immobiliare 123, Città',
      phone: '+39 123 456 789',
      emailAddress: 'contatto@realestate.com',
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{t.contact}</CardTitle>
              <CardDescription>
                {t.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-primary" />
                <p>{t.address}</p>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-primary" />
                <p>{t.phone}</p>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-primary" />
                <p>{t.emailAddress}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.title}</CardTitle>
              <CardDescription>
                {t.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Input placeholder={t.name} />
                </div>
                <div>
                  <Input type="email" placeholder={t.email} />
                </div>
                <div>
                  <Textarea placeholder={t.message} rows={4} />
                </div>
                <Button className="w-full">{t.send}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}