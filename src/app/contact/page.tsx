import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SectionWrapper, SectionHeader } from "@/components/ui/section-wrapper";

const ContactIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 256 256"
    className="fill-current"
  >
    <path d="M224 120v96a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8v-96a15.87 15.87 0 0 1 4.69-11.32l80-80a16 16 0 0 1 22.62 0l80 80A15.87 15.87 0 0 1 224 120"></path>
  </svg>
);

export default function ContactPage() {
  return (
    <SectionWrapper>
      <SectionHeader
        title="¿Tienes preguntas? ¡Estamos aquí para ayudarte!"
        subtitle="Contáctanos"
        description="¿Buscas tu hogar soñado o estás listo para vender? Nuestro equipo de expertos ofrece orientación personalizada y conocimiento del mercado adaptado a ti."
        icon={<ContactIcon />}
      />

      <div className="border rounded-2xl p-4 shadow-lg bg-card max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="relative w-full lg:w-1/2 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-foreground/60 z-10">
              <Image
                src="/images/contact.jpg"
                alt="Contacto"
                fill
                className="object-cover mix-blend-overlay"
                priority
              />
            </div>
            <div className="relative z-20 p-8 h-full flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-2xl font-medium text-white">
                  Información de contacto
                </h3>
                <p className="text-white/80">
                  ¿Listo para encontrar tu hogar soñado o vender tu propiedad?
                  ¡Estamos aquí para ayudarte!
                </p>
              </div>

              <div className="space-y-6 mt-8">
                <Link href="tel:+1234567890" className="block group">
                  <div className="flex items-center gap-4 group-hover:text-primary transition-colors">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <Phone className="h-6 w-6" />
                    </div>
                    <span className="text-white font-medium">
                      +1 234 567 890
                    </span>
                  </div>
                </Link>

                <Link href="mailto:info@brymar.com" className="block group">
                  <div className="flex items-center gap-4 group-hover:text-primary transition-colors">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <Mail className="h-6 w-6" />
                    </div>
                    <span className="text-white font-medium">
                      info@brymar.com
                    </span>
                  </div>
                </Link>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-full text-primary mt-1">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Nuestra ubicación</p>
                    <p className="text-white/80">
                      Calle Principal 123, Ciudad, País
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 p-6 lg:p-8">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Nombre*"
                  required
                />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Teléfono*"
                  required
                />
              </div>

              <div className="space-y-6">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Correo electrónico*"
                  required
                />

                <Textarea
                  id="message"
                  name="message"
                  placeholder="Escribe tu mensaje aquí*"
                  required
                  rows={5}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" size="lg">
                  Enviar mensaje
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
