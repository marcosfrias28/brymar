"use client";

import { useState } from "react";
import { SectionWrapper, SectionHeader } from "../ui/section-wrapper";
import { Button } from "../ui/button";
import {
  Users,
  Mail,
  Phone,
  Linkedin,
  Award,
  Star,
  MapPin,
  Calendar,
  Trophy,
  Target,
} from "lucide-react";
import Image from "next/image";
import { cn } from '@/lib/utils';
import {
  useSectionFromPage,
  getSectionContent,
} from '@/hooks/queries/use-sections-query';
import { TeamSkeleton } from "../skeletons/home/team-skeleton";

// Preparado para i18n - datos del equipo
const teamMembers = [
  {
    id: 1,
    name: "Marco Brymar",
    role: "Propietario y CEO",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=face",
    bio: "Líder visionario transformando el sector inmobiliario de lujo con más de 15 años de experiencia y estrategias innovadoras.",
    specialties: [
      "Propiedades de Lujo",
      "Estrategia de Inversión",
      "Análisis de Mercado",
    ],
    contact: {
      email: "marco@marbry.com",
      phone: "+1 (555) 123-4567",
      linkedin: "marco-brymar",
    },
    achievements: "500+ Propiedades Vendidas",
    experience: "15+ Años",
    location: "Miami, FL",
    isOwner: true,
  },
  {
    id: 2,
    name: "Sofia Rodriguez",
    role: "Agente Inmobiliaria Senior",
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=600&h=800&fit=crop&crop=face",
    bio: "Defensora apasionada de las familias, especializada en convertir los sueños de encontrar hogar en realidad con servicio personalizado.",
    specialties: [
      "Ventas Residenciales",
      "Primeros Compradores",
      "Negociación",
    ],
    contact: {
      email: "sofia@marbry.com",
      phone: "+1 (555) 234-5678",
      linkedin: "sofia-rodriguez",
    },
    achievements: "200+ Familias Felices",
    experience: "8+ Años",
    location: "Orlando, FL",
    isOwner: false,
  },
  {
    id: 3,
    name: "Carlos Mendez",
    role: "Agente Inmobiliario Comercial",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=800&fit=crop&crop=face",
    bio: "Experto comercial estratégico construyendo imperios empresariales a través de inversiones inteligentes y desarrollo de portafolios.",
    specialties: [
      "Propiedades Comerciales",
      "Propiedades de Inversión",
      "Desarrollo de Negocios",
    ],
    contact: {
      email: "carlos@marbry.com",
      phone: "+1 (555) 345-6789",
      linkedin: "carlos-mendez",
    },
    achievements: "150+ Negocios Comerciales",
    experience: "12+ Años",
    location: "Tampa, FL",
    isOwner: false,
  },
];

// Componente separado para el header que usa el hook
function TeamSectionHeader() {
  const { section, isLoading } = useSectionFromPage("home", "team");

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 text-center">
        <div className="h-4 bg-muted rounded w-1/4 mx-auto"></div>
        <div className="h-8 bg-muted rounded w-1/2 mx-auto"></div>
        <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
      </div>
    );
  }

  const subtitle = getSectionContent(section, "subtitle", "Nuestro Equipo");
  const title = getSectionContent(
    section,
    "title",
    "Conoce a los Visionarios Detrás de Tu Éxito"
  );
  const description = getSectionContent(
    section,
    "description",
    "Un equipo poderoso de expertos inmobiliarios, cada uno aportando experiencia única y pasión para transformar tus sueños de propiedad en realidad."
  );

  return (
    <SectionHeader
      subtitle={subtitle}
      title={title}
      description={description}
      icon={<Users className="w-5 h-5" />}
    />
  );
}

export function TeamSection() {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const { isLoading } = useSectionFromPage("home", "team");

  if (isLoading) {
    return <TeamSkeleton />;
  }

  return (
    <SectionWrapper className="relative overflow-hidden">
      {/* Elementos de fondo usando colores del tema */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        <TeamSectionHeader />

        {/* Grid Dinámico del Equipo */}
        <div className="grid grid-cols-12 gap-6 mt-16">
          {/* Propietario - Tarjeta Grande Destacada */}
          <div className="col-span-12 lg:col-span-7">
            <div
              className="group relative h-[600px] rounded-3xl overflow-hidden cursor-pointer transform transition-all duration-700 hover:scale-[1.02]"
              onMouseEnter={() => setActiveCard(1)}
              onMouseLeave={() => setActiveCard(null)}
            >
              <Image
                src={teamMembers[0].image}
                alt={teamMembers[0].name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay de gradiente usando colores del tema */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/40 to-accent/60 transition-opacity duration-500",
                  activeCard === 1 ? "opacity-80" : "opacity-60"
                )}
              />

              {/* Elementos Flotantes */}
              <div className="absolute top-6 right-6 flex gap-3">
                <div className="bg-background/20 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm font-medium flex items-center gap-2 border border-white/20">
                  <Award className="w-4 h-4" />
                  Propietario y CEO
                </div>
                <div className="bg-background/20 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm font-medium flex items-center gap-2 border border-white/20">
                  <Trophy className="w-4 h-4" />
                  {teamMembers[0].achievements}
                </div>
              </div>

              {/* Overlay de Contenido */}
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="transform transition-all duration-500 group-hover:translate-y-0 translate-y-4">
                  <h3 className="text-4xl font-bold text-white mb-2">
                    {teamMembers[0].name}
                  </h3>
                  <p className="text-white/90 text-lg mb-4">
                    {teamMembers[0].role}
                  </p>
                  <p className="text-white/80 text-base leading-relaxed mb-6 max-w-lg">
                    {teamMembers[0].bio}
                  </p>

                  {/* Fila de Estadísticas */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 text-white/90">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {teamMembers[0].experience}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{teamMembers[0].location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm">5.0 Calificación</span>
                    </div>
                  </div>

                  {/* Especialidades */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {teamMembers[0].specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="bg-background/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium border border-white/20"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      className="bg-background/20 backdrop-blur-md hover:bg-background/30 text-white border-white/20"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contactar a Marco
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-background/20 border border-white/20"
                    >
                      <Linkedin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agentes - Tarjetas Apiladas */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            {teamMembers.slice(1).map((member, index) => (
              <div
                key={member.id}
                className="group relative h-[285px] rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2"
                onMouseEnter={() => setActiveCard(member.id)}
                onMouseLeave={() => setActiveCard(null)}
              >
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Gradiente usando colores del tema */}
                <div
                  className={cn(
                    "absolute inset-0 transition-opacity duration-300",
                    index === 0
                      ? "bg-gradient-to-br from-accent/70 via-accent/50 to-primary/60"
                      : "bg-gradient-to-br from-muted-foreground/70 via-muted-foreground/50 to-accent/60",
                    activeCard === member.id ? "opacity-85" : "opacity-70"
                  )}
                />

                {/* Estadísticas Flotantes */}
                <div className="absolute top-4 right-4 bg-background/20 backdrop-blur-md rounded-full px-3 py-1 text-white text-xs font-medium border border-white/20">
                  {member.achievements}
                </div>

                {/* Contenido */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <div className="transform transition-all duration-300 group-hover:translate-y-0 translate-y-2">
                    <h4 className="text-2xl font-bold text-white mb-1">
                      {member.name}
                    </h4>
                    <p className="text-white/90 text-sm mb-3">{member.role}</p>
                    <p className="text-white/80 text-sm leading-relaxed mb-4 line-clamp-2">
                      {member.bio}
                    </p>

                    {/* Estadísticas Rápidas */}
                    <div className="flex items-center gap-4 mb-4 text-white/90 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {member.experience}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {member.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        5.0
                      </div>
                    </div>

                    {/* Especialidades - Compactas */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {member.specialties.slice(0, 2).map((specialty, idx) => (
                        <span
                          key={idx}
                          className="bg-background/20 backdrop-blur-sm px-2 py-1 rounded-md text-white text-xs border border-white/20"
                        >
                          {specialty}
                        </span>
                      ))}
                      {member.specialties.length > 2 && (
                        <span className="bg-background/20 backdrop-blur-sm px-2 py-1 rounded-md text-white text-xs border border-white/20">
                          +{member.specialties.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Botón de Contacto */}
                    <Button
                      size="sm"
                      className="bg-background/20 backdrop-blur-md hover:bg-background/30 text-white border-white/20 w-full"
                    >
                      <Mail className="w-3 h-3 mr-2" />
                      Contactar a {member.name.split(" ")[0]}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
