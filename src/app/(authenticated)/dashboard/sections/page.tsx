"use client";

import {
	ArrowLeft,
	HelpCircle,
	Home,
	Link,
	Phone,
	Settings,
	Star,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { cn } from "@/lib/utils";

export default function SectionsPage() {
	const _router = useRouter();
	const [currentPage, setCurrentPage] = useState<"home" | "contact">("home");

	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard", icon: Home },
		{ label: "Secciones", icon: Settings },
	];

	const actions = (
		<Link href="/dashboard">
			<Button
				className={cn(
					"text-arsenic",
					"hover:text-arsenic/80",
					"focus-visible:outline-none",
					"focus-visible:ring-2",
					"focus-visible:ring-arsenic/50"
				)}
				size="sm"
				variant="link"
			>
				<ArrowLeft className="h-4 w-4" />
				Volver al Dashboard
			</Button>
		</Link>
	);

	return (
		<DashboardPageLayout
			actions={actions}
			breadcrumbs={breadcrumbs}
			description="Administra el contenido de las secciones de tu sitio web"
			title="Gestión de Secciones"
		>
			<div className="space-y-6">
				{/* Navigation Buttons */}
				<div className="flex gap-2">
					<Button
						className="flex items-center gap-2"
						onClick={() => setCurrentPage("home")}
						variant={currentPage === "home" ? "default" : "outline"}
					>
						<Home className="h-4 w-4" />
						Página Principal
					</Button>
					<Button
						className="flex items-center gap-2"
						onClick={() => setCurrentPage("contact")}
						variant={currentPage === "contact" ? "default" : "outline"}
					>
						<Phone className="h-4 w-4" />
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
										<Settings className="h-5 w-5" />
										Secciones de la Página Principal
									</>
								) : (
									<>
										<Phone className="h-5 w-5" />
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
							<CardTitle className="flex items-center gap-2 font-medium text-sm">
								<Star className="h-4 w-4 text-primary" />
								Hero Section
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-xs">
								Título principal, subtítulo y descripción de la página de inicio
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 font-medium text-sm">
								<Settings className="h-4 w-4 text-primary" />
								Categorías
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-xs">
								Título, descripción y configuración de la sección de categorías
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 font-medium text-sm">
								<Users className="h-4 w-4 text-primary" />
								Equipo
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-xs">
								Información del equipo, biografías y datos de contacto
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 font-medium text-sm">
								<HelpCircle className="h-4 w-4 text-primary" />
								FAQ
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-xs">
								Preguntas frecuentes y sus respuestas
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</DashboardPageLayout>
	);
}
