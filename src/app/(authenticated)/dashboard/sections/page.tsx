"use client";

import { HelpCircle, Home, Phone, Settings, Star, Users } from "lucide-react";
import { Suspense, useState } from "react";
import { SectionsManager } from "@/components/dashboard/sections-manager";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function SectionsPage() {
	const [currentPage, setCurrentPage] = useState<"home" | "contact">("home");

	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard", icon: Home },
		{ label: "Secciones", icon: Settings },
	];

	return (
		<DashboardPageLayout
			title="Gestión de Secciones"
			description="Administra el contenido de las secciones de tu sitio web"
			breadcrumbs={breadcrumbs}
		>
			<div className="space-y-6">
				{/* Navigation Buttons */}
				<div className="flex gap-2">
					<Button
						variant={currentPage === "home" ? "default" : "outline"}
						onClick={() => setCurrentPage("home")}
						className="flex items-center gap-2"
					>
						<Home className="w-4 h-4" />
						Página Principal
					</Button>
					<Button
						variant={currentPage === "contact" ? "default" : "outline"}
						onClick={() => setCurrentPage("contact")}
						className="flex items-center gap-2"
					>
						<Phone className="w-4 h-4" />
						Información de Contacto
					</Button>
				</div>

				{/* Content */}
				<div className="grid gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								{currentPage === "home" ? (
									<>
										<Settings className="w-5 h-5" />
										Secciones de la Página Principal
									</>
								) : (
									<>
										<Phone className="w-5 h-5" />
										Información de Contacto
									</>
								)}
							</CardTitle>
							<CardDescription>
								{currentPage === "home"
									? "Gestiona el contenido de las secciones: Hero, Categorías, Propiedades Destacadas, Equipo y FAQ"
									: "Gestiona teléfonos, emails, direcciones y redes sociales"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Suspense
								fallback={
									<div>
										{currentPage === "home"
											? "Cargando secciones..."
											: "Cargando información de contacto..."}
									</div>
								}
							>
								<SectionsManager page={currentPage} />
							</Suspense>
						</CardContent>
					</Card>
				</div>

				{/* Información sobre las secciones disponibles */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<Star className="w-4 h-4 text-primary" />
								Hero Section
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-xs text-muted-foreground">
								Título principal, subtítulo y descripción de la página de inicio
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<Settings className="w-4 h-4 text-primary" />
								Categorías
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-xs text-muted-foreground">
								Título, descripción y configuración de la sección de categorías
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<Users className="w-4 h-4 text-primary" />
								Equipo
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-xs text-muted-foreground">
								Información del equipo, biografías y datos de contacto
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<HelpCircle className="w-4 h-4 text-primary" />
								FAQ
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-xs text-muted-foreground">
								Preguntas frecuentes y sus respuestas
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</DashboardPageLayout>
	);
}
