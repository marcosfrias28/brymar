"use client";

import {
	Award,
	Calendar,
	Linkedin,
	Mail,
	MapPin,
	Star,
	Trophy,
	Users,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useSection } from "@/hooks/use-static-content";
import { cn } from "@/lib/utils";
import { TeamSkeleton } from "../skeletons/home/team-skeleton";
import { Button } from "../ui/button";
import { SectionHeader, SectionWrapper } from "../ui/section-wrapper";

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
	const { data: section, loading: isLoading } = useSection("home", "team");

	if (isLoading) {
		return (
			<div className="animate-pulse space-y-4 text-center">
				<div className="mx-auto h-4 w-1/4 rounded bg-muted" />
				<div className="mx-auto h-8 w-1/2 rounded bg-muted" />
				<div className="mx-auto h-4 w-3/4 rounded bg-muted" />
			</div>
		);
	}

	const subtitle = section?.subtitle || "Nuestro Equipo";
	const title = section?.title || "Conoce a los Visionarios Detrás de Tu Éxito";
	const description =
		section?.description ||
		"Un equipo poderoso de expertos inmobiliarios, cada uno aportando experiencia única y pasión para transformar tus sueños de propiedad en realidad.";

	return (
		<SectionHeader
			description={description}
			icon={<Users className="h-5 w-5" />}
			subtitle={subtitle}
			title={title}
		/>
	);
}

export function TeamSection() {
	const [activeCard, setActiveCard] = useState<number | null>(null);
	const { loading: isLoading } = useSection("home", "team");

	if (isLoading) {
		return <TeamSkeleton />;
	}

	return (
		<SectionWrapper className="relative overflow-hidden">
			{/* Elementos de fondo usando colores del tema */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
			<div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
			<div className="absolute bottom-20 left-20 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

			<div className="relative z-10">
				<TeamSectionHeader />

				{/* Grid Dinámico del Equipo */}
				<div className="mt-16 grid grid-cols-12 gap-6">
					{/* Propietario - Tarjeta Grande Destacada */}
					<div className="col-span-12 lg:col-span-7">
						<div
							className="group relative h-[600px] transform cursor-pointer overflow-hidden rounded-3xl transition-all duration-700 hover:scale-[1.02]"
							onMouseEnter={() => setActiveCard(1)}
							onMouseLeave={() => setActiveCard(null)}
						>
							<Image
								alt={teamMembers[0].name}
								className="object-cover transition-transform duration-700 group-hover:scale-110"
								fill
								src={teamMembers[0].image}
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
								<div className="flex items-center gap-2 rounded-full border border-white/20 bg-background/20 px-4 py-2 font-medium text-sm text-white backdrop-blur-md">
									<Award className="h-4 w-4" />
									Propietario y CEO
								</div>
								<div className="flex items-center gap-2 rounded-full border border-white/20 bg-background/20 px-4 py-2 font-medium text-sm text-white backdrop-blur-md">
									<Trophy className="h-4 w-4" />
									{teamMembers[0].achievements}
								</div>
							</div>

							{/* Overlay de Contenido */}
							<div className="absolute inset-0 flex flex-col justify-end p-8">
								<div className="translate-y-4 transform transition-all duration-500 group-hover:translate-y-0">
									<h3 className="mb-2 font-bold text-4xl text-white">
										{teamMembers[0].name}
									</h3>
									<p className="mb-4 text-lg text-white/90">
										{teamMembers[0].role}
									</p>
									<p className="mb-6 max-w-lg text-base text-white/80 leading-relaxed">
										{teamMembers[0].bio}
									</p>

									{/* Fila de Estadísticas */}
									<div className="mb-6 flex flex-wrap gap-4">
										<div className="flex items-center gap-2 text-white/90">
											<Calendar className="h-4 w-4" />
											<span className="text-sm">
												{teamMembers[0].experience}
											</span>
										</div>
										<div className="flex items-center gap-2 text-white/90">
											<MapPin className="h-4 w-4" />
											<span className="text-sm">{teamMembers[0].location}</span>
										</div>
										<div className="flex items-center gap-2 text-white/90">
											<Star className="h-4 w-4 fill-current" />
											<span className="text-sm">5.0 Calificación</span>
										</div>
									</div>

									{/* Especialidades */}
									<div className="mb-6 flex flex-wrap gap-2">
										{teamMembers[0].specialties.map((specialty, index) => (
											<span
												className="rounded-full border border-white/20 bg-background/20 px-3 py-1 font-medium text-white text-xs backdrop-blur-sm"
												key={index}
											>
												{specialty}
											</span>
										))}
									</div>

									{/* Botones de Acción */}
									<div className="flex gap-3">
										<Button
											className="border-white/20 bg-background/20 text-white backdrop-blur-md hover:bg-background/30"
											size="sm"
										>
											<Mail className="mr-2 h-4 w-4" />
											Contactar a Marco
										</Button>
										<Button
											className="border border-white/20 text-white hover:bg-background/20"
											size="sm"
											variant="ghost"
										>
											<Linkedin className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Agentes - Tarjetas Apiladas */}
					<div className="col-span-12 space-y-6 lg:col-span-5">
						{teamMembers.slice(1).map((member, index) => (
							<div
								className="group hover:-translate-y-2 relative h-[285px] transform cursor-pointer overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.03]"
								key={member.id}
								onMouseEnter={() => setActiveCard(member.id)}
								onMouseLeave={() => setActiveCard(null)}
							>
								<Image
									alt={member.name}
									className="object-cover transition-transform duration-500 group-hover:scale-110"
									fill
									src={member.image}
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
								<div className="absolute top-4 right-4 rounded-full border border-white/20 bg-background/20 px-3 py-1 font-medium text-white text-xs backdrop-blur-md">
									{member.achievements}
								</div>

								{/* Contenido */}
								<div className="absolute inset-0 flex flex-col justify-end p-6">
									<div className="translate-y-2 transform transition-all duration-300 group-hover:translate-y-0">
										<h4 className="mb-1 font-bold text-2xl text-white">
											{member.name}
										</h4>
										<p className="mb-3 text-sm text-white/90">{member.role}</p>
										<p className="mb-4 line-clamp-2 text-sm text-white/80 leading-relaxed">
											{member.bio}
										</p>

										{/* Estadísticas Rápidas */}
										<div className="mb-4 flex items-center gap-4 text-white/90 text-xs">
											<div className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												{member.experience}
											</div>
											<div className="flex items-center gap-1">
												<MapPin className="h-3 w-3" />
												{member.location}
											</div>
											<div className="flex items-center gap-1">
												<Star className="h-3 w-3 fill-current" />
												5.0
											</div>
										</div>

										{/* Especialidades - Compactas */}
										<div className="mb-4 flex flex-wrap gap-1">
											{member.specialties.slice(0, 2).map((specialty, idx) => (
												<span
													className="rounded-md border border-white/20 bg-background/20 px-2 py-1 text-white text-xs backdrop-blur-sm"
													key={idx}
												>
													{specialty}
												</span>
											))}
											{member.specialties.length > 2 && (
												<span className="rounded-md border border-white/20 bg-background/20 px-2 py-1 text-white text-xs backdrop-blur-sm">
													+{member.specialties.length - 2}
												</span>
											)}
										</div>

										{/* Botón de Contacto */}
										<Button
											className="w-full border-white/20 bg-background/20 text-white backdrop-blur-md hover:bg-background/30"
											size="sm"
										>
											<Mail className="mr-2 h-3 w-3" />
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
