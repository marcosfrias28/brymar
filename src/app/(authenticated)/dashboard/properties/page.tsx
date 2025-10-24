"use client";

import {
	DollarSign,
	FileText,
	Home,
	Key,
	Plus,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { PropertyCardList } from "@/components/properties/property-card-list";
import { PropertyFilters } from "@/components/properties/property-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProperties } from "@/hooks/use-properties";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

export default function PropertiesPage() {
	const [statusFilter, setStatusFilter] = useState<"all" | "sold" | "rented">(
		"all",
	);
	const [searchTerm, setSearchTerm] = useState("");

	const {
		data: propertiesData,
		isLoading: loading,
		error,
		refetch,
	} = useProperties();

	const properties = propertiesData?.data?.items || [];

	const filteredByStatus =
		statusFilter === "all"
			? properties
			: properties.filter((p) => p.status === statusFilter);

	const filteredBySearch = filteredByStatus.filter(
		(property) =>
			property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			property.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	if (loading) {
		return (
			<DashboardPageLayout
				title="Gestión de Propiedades"
				description="Administra todas las propiedades del sistema"
			>
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center">
						<h2 className="text-xl font-semibold mb-2">Cargando...</h2>
						<p className="text-muted-foreground mb-4">Cargando propiedades.</p>
					</div>
				</div>
			</DashboardPageLayout>
		);
	}

	if (error) {
		return (
			<DashboardPageLayout
				title="Gestión de Propiedades"
				description="Administra todas las propiedades del sistema"
			>
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center">
						<h2 className="text-xl font-semibold mb-2">
							Error al cargar propiedades
						</h2>
						<p className="text-muted-foreground mb-4">
							{error?.message || "Error desconocido"}
						</p>
						<Button onClick={() => refetch()}>Reintentar</Button>
					</div>
				</div>
			</DashboardPageLayout>
		);
	}

	const stats = [
		{
			id: "total-properties",
			label: "Total Propiedades",
			value: properties.length,
			icon: <Home className="h-5 w-5" />,
			color: "text-foreground",
		},
		{
			id: "for-sale",
			label: "En Venta",
			value: properties.filter((p) => p.status === "sold").length,
			icon: <DollarSign className="h-5 w-5" />,
			color: "text-green-600",
		},
		{
			id: "for-rent",
			label: "En Alquiler",
			value: properties.filter((p) => p.status === "rented").length,
			icon: <Key className="h-5 w-5" />,
			color: "text-blue-600",
		},
		{
			id: "featured",
			label: "Destacadas",
			value: properties.filter((p) => p.featured).length,
			icon: <TrendingUp className="h-5 w-5" />,
			color: "text-orange-600",
		},
	];

	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard" },
		{ label: "Propiedades" },
	];

	const actions = (
		<div className="flex gap-2">
			<Button
				variant="outline"
				asChild
				className={cn(secondaryColorClasses.interactive)}
			>
				<Link href="/dashboard/properties/drafts">
					<FileText className="h-4 w-4 mr-2" />
					Borradores
				</Link>
			</Button>
			<Button
				asChild
				className={cn(
					"bg-primary hover:bg-primary/90",
					secondaryColorClasses.focusRing,
				)}
			>
				<Link href="/dashboard/properties/new">
					<Plus className="h-4 w-4 mr-2" />
					Agregar Propiedad
				</Link>
			</Button>
		</div>
	);

	return (
		<RouteGuard requiredPermission="properties.manage">
			<DashboardPageLayout
				title="Gestión de Propiedades"
				description="Administra todas las propiedades del sistema"
				breadcrumbs={breadcrumbs}
				actions={actions}
			>
				<div className="space-y-6">
					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{stats.map((stat) => (
							<Card
								key={stat.id}
								className={cn(
									"transition-all duration-200",
									secondaryColorClasses.cardHover,
								)}
							>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium text-muted-foreground">
										{stat.label}
									</CardTitle>
									<div className={stat.color}>{stat.icon}</div>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stat.value}</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Status Filters */}
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-sm text-muted-foreground font-medium">
							Estado:
						</span>
						{[
							{ label: "Todas", value: "all" },
							{ label: "En Venta", value: "sold" },
							{ label: "En Alquiler", value: "rented" },
						].map((filter) => (
							<Button
								key={filter.value}
								variant={statusFilter === filter.value ? "default" : "outline"}
								size="sm"
								onClick={() =>
									setStatusFilter(filter.value as "all" | "sold" | "rented")
								}
								className={cn(
									statusFilter === filter.value
										? cn(
												"bg-secondary text-secondary-foreground",
												secondaryColorClasses.buttonSecondary,
											)
										: cn(
												"border-border hover:bg-secondary/10",
												secondaryColorClasses.interactive,
											),
								)}
							>
								{filter.label}
							</Button>
						))}
					</div>

					{/* Search and Filters */}
					<PropertyFilters
						searchTerm={searchTerm}
						onSearchChange={setSearchTerm}
						properties={properties}
					/>

					{/* Properties List */}
					<PropertyCardList properties={filteredBySearch} />

					{/* Results Summary */}
					{filteredBySearch.length === 0 && searchTerm && (
						<div className="text-center py-8">
							<p className="text-muted-foreground">
								No se encontraron propiedades que coincidan con &quot;
								{searchTerm}&quot;
							</p>
						</div>
					)}

					{filteredBySearch.length > 0 && (
						<div className="flex items-center justify-between text-sm text-muted-foreground">
							<span>
								Mostrando {filteredBySearch.length} de {properties.length}{" "}
								propiedades
							</span>
							<Badge
								variant="secondary"
								className={secondaryColorClasses.badge}
							>
								{statusFilter === "all"
									? "Todas"
									: statusFilter === "sold"
										? "En Venta"
										: "En Alquiler"}
							</Badge>
						</div>
					)}
				</div>
			</DashboardPageLayout>
		</RouteGuard>
	);
}
