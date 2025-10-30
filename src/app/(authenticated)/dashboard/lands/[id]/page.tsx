"use client";

import { ArrowLeft, Edit, MapPin, Square, Trash2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InlineErrorState } from "@/components/ui/error-states";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { Separator } from "@/components/ui/separator";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { useLand } from "@/hooks/use-lands";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/utils/sanitize";
import {
	badgeVariants,
	interactiveClasses,
	secondaryColorClasses,
} from "@/lib/utils/secondary-colors";

export default function LandDetailPage() {
	// All hooks must be called before any conditional returns
	const params = useParams();
	const router = useRouter();
	const breadcrumbs = useBreadcrumbs();
	const landId = (params?.id as string) || "";
	const { data: land, isLoading: loading, error, refetch } = useLand(landId);

	// Helper functions defined after hooks
	const formatPrice = (price: number, currency = "USD") =>
		new Intl.NumberFormat("es-DO", {
			style: "currency",
			currency,
			minimumFractionDigits: 0,
		}).format(price);

	const getTypeLabel = (type: string) => {
		const labels = {
			commercial: "Comercial",
			residential: "Residencial",
			agricultural: "Agrícola",
			beachfront: "Frente al Mar",
			industrial: "Industrial",
			mixed: "Mixto",
			tourist: "Turístico",
			development: "Para Desarrollo",
		};
		return labels[type as keyof typeof labels] || type;
	};

	const getTypeBadgeColor = (type: string) => {
		const colors = {
			commercial: "bg-chart-1/20 text-chart-1 border-chart-1/30",
			residential: "bg-chart-2/20 text-chart-2 border-chart-2/30",
			agricultural: "bg-chart-3/20 text-chart-3 border-chart-3/30",
			beachfront: "bg-chart-4/20 text-chart-4 border-chart-4/30",
			industrial: "bg-chart-5/20 text-chart-5 border-chart-5/30",
		};
		return (
			colors[type as keyof typeof colors] ||
			"bg-muted text-muted-foreground border-border"
		);
	};

	// Conditional rendering after all hooks and helper functions
	if (!params?.id) {
		return (
			<DashboardPageLayout
				actions={
					<Button
						onClick={() => router.push("/dashboard/lands")}
						variant="outline"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Volver a Terrenos
					</Button>
				}
				breadcrumbs={breadcrumbs}
				description="Terreno no encontrado"
				title="Error"
			>
				<div className="flex h-64 items-center justify-center">
					<InlineErrorState message="ID de terreno no válido" />
				</div>
			</DashboardPageLayout>
		);
	}

	if (loading) {
		return (
			<DashboardPageLayout
				actions={
					<Button
						onClick={() => router.push("/dashboard/lands")}
						variant="outline"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Volver a Terrenos
					</Button>
				}
				breadcrumbs={breadcrumbs}
				description="Obteniendo información del terreno"
				title="Cargando terreno..."
			>
				<div className="flex h-64 items-center justify-center">
					<LoadingSpinner />
				</div>
			</DashboardPageLayout>
		);
	}

	if (error || !land) {
		return (
			<DashboardPageLayout
				actions={
					<Button
						onClick={() => router.push("/dashboard/lands")}
						variant="outline"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Volver a Terrenos
					</Button>
				}
				breadcrumbs={breadcrumbs}
				description="No se pudo cargar el terreno"
				title="Error"
			>
				<div className="flex h-64 items-center justify-center">
					<InlineErrorState
						message={error?.message || "Terreno no encontrado"}
						onRetry={refetch}
					/>
				</div>
			</DashboardPageLayout>
		);
	}

	const pricePerM2 = land.price / land.area;
	const hectares = (land.area / 10_000).toFixed(4);
	const tareas = (land.area / 629).toFixed(2);

	const actions = (
		<div className="flex gap-2">
			<Button
				className={cn(interactiveClasses.button)}
				onClick={() => router.back()}
				variant="outline"
			>
				<ArrowLeft className="mr-2 h-4 w-4" />
				Volver
			</Button>
			<Button
				className={cn(
					"bg-arsenic hover:bg-blackCoral",
					secondaryColorClasses.focusRing
				)}
				onClick={() => router.push(`/dashboard/lands/${landId}/edit`)}
			>
				<Edit className="mr-2 h-4 w-4" />
				Editar
			</Button>
			<Button onClick={() => {}} variant="destructive">
				<Trash2 className="mr-2 h-4 w-4" />
				Eliminar
			</Button>
		</div>
	);

	return (
		<RouteGuard requiredPermission="lands.manage">
			<DashboardPageLayout
				actions={actions}
				breadcrumbs={breadcrumbs}
				description={`Detalles del terreno ${getTypeLabel(
					land.type
				).toLowerCase()}`}
				title={land.name}
			>
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					{/* Main Content */}
					<div className="space-y-6 lg:col-span-2">
						{/* Images */}
						<Card
							className={cn(
								"border-blackCoral/20 shadow-lg transition-all duration-200",
								secondaryColorClasses.cardHover
							)}
						>
							<CardContent className="p-0">
								<div className="relative h-96 overflow-hidden rounded-lg">
									<Image
										alt={land.name}
										className="object-cover"
										fill
										src={
											(Array.isArray(land.images) && land.images[0]?.url) ||
											"/placeholder.svg"
										}
									/>
									<div className="absolute top-4 left-4">
										<Badge className={getTypeBadgeColor(land.type)}>
											{getTypeLabel(land.type)}
										</Badge>
									</div>
								</div>
								{Array.isArray(land.images) && land.images.length > 1 && (
									<div className="p-4">
										<div className="grid grid-cols-4 gap-2">
											{land.images.slice(1, 5).map((image, index) => (
												<div
													className="relative h-20 overflow-hidden rounded"
													key={image.url || index}
												>
													<Image
														alt={`${land.name} - imagen adicional`}
														className="object-cover"
														fill
														src={image.url || "/placeholder.svg"}
													/>
												</div>
											))}
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Description */}
						<Card
							className={cn(
								"border-blackCoral/20 shadow-lg transition-all duration-200",
								secondaryColorClasses.cardHover
							)}
						>
							<CardHeader>
								<CardTitle className="text-arsenic">Descripción</CardTitle>
							</CardHeader>
							<CardContent>
								{/* Content is sanitized with DOMPurify before rendering to prevent XSS attacks */}
								<div
									className="prose prose-sm max-w-none text-blackCoral"
									dangerouslySetInnerHTML={{
										__html: sanitizeHtml(land.description),
									}}
								/>
							</CardContent>
						</Card>

						{/* Features */}
						{land.features && Object.keys(land.features).length > 0 && (
							<Card
								className={cn(
									"border-blackCoral/20 shadow-lg transition-all duration-200",
									secondaryColorClasses.cardHover
								)}
							>
								<CardHeader>
									<CardTitle className="text-arsenic">
										Características
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex flex-wrap gap-2">
										{Object.entries(land.features).map(([key, value]) => (
											<Badge
												className={badgeVariants.secondarySubtle}
												key={key}
												variant="secondary"
											>
												{typeof value === "string" ? value : key}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Price & Details */}
						<Card
							className={cn(
								"border-blackCoral/20 shadow-lg transition-all duration-200",
								secondaryColorClasses.cardHover
							)}
						>
							<CardHeader>
								<CardTitle className="text-arsenic">
									Información del Precio
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="text-center">
									<div className="font-bold text-3xl text-arsenic">
										{formatPrice(land.price, land.currency || "USD")}
									</div>
									<div className="text-blackCoral/70 text-sm">
										${Math.round(pricePerM2).toLocaleString()}/m²
									</div>
								</div>

								<Separator />

								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2 text-blackCoral">
											<Square className="h-4 w-4" />
											<span className="text-sm">Área</span>
										</div>
										<span className="font-medium text-arsenic">
											{land.area?.toLocaleString() || 0} m²
										</span>
									</div>

									<div className="flex items-center justify-between">
										<span className="text-blackCoral text-sm">Hectáreas</span>
										<span className="font-medium text-arsenic">
											{hectares} ha
										</span>
									</div>

									<div className="flex items-center justify-between">
										<span className="text-blackCoral text-sm">Tareas</span>
										<span className="font-medium text-arsenic">
											{tareas} tareas
										</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Location */}
						<Card
							className={cn(
								"border-blackCoral/20 shadow-lg transition-all duration-200",
								secondaryColorClasses.cardHover
							)}
						>
							<CardHeader>
								<CardTitle className="text-arsenic">Ubicación</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-start gap-2">
									<MapPin className="mt-1 h-4 w-4 text-blackCoral" />
									<span className="text-blackCoral text-sm">
										{land.location || "Ubicación no especificada"}
									</span>
								</div>
							</CardContent>
						</Card>

						{/* Status */}
						<Card
							className={cn(
								"border-blackCoral/20 shadow-lg transition-all duration-200",
								secondaryColorClasses.cardHover
							)}
						>
							<CardHeader>
								<CardTitle className="text-arsenic">Estado</CardTitle>
							</CardHeader>
							<CardContent>
								<Badge
									className={
										land.status === "published"
											? "bg-green-100 text-green-800"
											: badgeVariants.secondary
									}
									variant={
										land.status === "published" ? "default" : "secondary"
									}
								>
									{land.status === "published" ? "Disponible" : "No Disponible"}
								</Badge>
							</CardContent>
						</Card>

						{/* Dates */}
						<Card
							className={cn(
								"border-blackCoral/20 shadow-lg transition-all duration-200",
								secondaryColorClasses.cardHover
							)}
						>
							<CardHeader>
								<CardTitle className="text-arsenic">Fechas</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<div className="text-sm">
									<span className="text-blackCoral">Creado:</span>
									<span className="ml-2 font-medium text-arsenic">
										{new Date(land.createdAt).toLocaleDateString()}
									</span>
								</div>
								<div className="text-sm">
									<span className="text-blackCoral">Actualizado:</span>
									<span className="ml-2 font-medium text-arsenic">
										{new Date(land.updatedAt).toLocaleDateString()}
									</span>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</DashboardPageLayout>
		</RouteGuard>
	);
}
