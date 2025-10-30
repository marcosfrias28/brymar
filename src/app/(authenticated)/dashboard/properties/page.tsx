"use client";

import { ArrowLeft, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { PropertyCardList } from "@/components/properties/property-card-list";
import { PropertyFilters } from "@/components/properties/property-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProperties } from "@/hooks/use-properties";
import { getStatsAdapter } from "@/lib/adapters/stats-adapters";
import type { Property } from "@/lib/types/properties";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

export default function PropertiesPage() {
	const _router = useRouter();
	const [statusFilter, setStatusFilter] = useState<
		"all" | "published" | "sold" | "rented"
	>("all");
	const [searchTerm, setSearchTerm] = useState("");

	const {
		data: propertiesData,
		isLoading: loading,
		error,
		refetch,
	} = useProperties();

	const properties: Property[] = (propertiesData || []) as Property[];

	// Generate stats using the adapter system
	const propertiesAdapter = getStatsAdapter("properties");
	const statsCards = propertiesAdapter?.generateStats({ properties }) || [];

	const filterTabs = [
		{
			label: "Todas",
			value: "all",
			count: properties.length,
			active: statusFilter === "all",
			onClick: () => setStatusFilter("all"),
		},
		{
			label: "Publicadas",
			value: "published",
			count: properties.filter((p) => p.status === "published").length,
			active: statusFilter === "published",
			onClick: () => setStatusFilter("published"),
		},
		{
			label: "Vendidas",
			value: "sold",
			count: properties.filter((p) => p.status === "sold").length,
			active: statusFilter === "sold",
			onClick: () => setStatusFilter("sold"),
		},
		{
			label: "Alquiladas",
			value: "rented",
			count: properties.filter((p) => p.status === "rented").length,
			active: statusFilter === "rented",
			onClick: () => setStatusFilter("rented"),
		},
	];

	const filteredByStatus =
		statusFilter === "all"
			? properties
			: properties.filter((p) => p.status === statusFilter);

	const filteredBySearch = filteredByStatus.filter(
		(property) =>
			property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			property.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const backAction = (
		<Button asChild variant="outline">
			<Link href="/dashboard">
				<ArrowLeft className="mr-2 h-4 w-4" />
				Volver al Dashboard
			</Link>
		</Button>
	);

	if (loading) {
		return (
			<DashboardPageLayout
				actions={backAction}
				description="Administra todas las propiedades del sistema"
				title="Gestión de Propiedades"
			>
				<div className="flex min-h-[400px] items-center justify-center">
					<div className="text-center">
						<h2 className="mb-2 font-semibold text-xl">Cargando...</h2>
						<p className="mb-4 text-muted-foreground">Cargando propiedades.</p>
					</div>
				</div>
			</DashboardPageLayout>
		);
	}

	if (error) {
		return (
			<DashboardPageLayout
				actions={backAction}
				description="Administra todas las propiedades del sistema"
				title="Gestión de Propiedades"
			>
				<div className="flex min-h-[400px] items-center justify-center">
					<div className="text-center">
						<h2 className="mb-2 font-semibold text-xl">
							Error al cargar propiedades
						</h2>
						<p className="mb-4 text-muted-foreground">
							{error?.message || "Error desconocido"}
						</p>
						<Button onClick={() => refetch()}>Reintentar</Button>
					</div>
				</div>
			</DashboardPageLayout>
		);
	}

	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard" },
		{ label: "Propiedades" },
	];

	const actions = (
		<div className="flex gap-2">
			<Button
				asChild
				className={cn(secondaryColorClasses.interactive)}
				variant="outline"
			>
				<Link href="/dashboard/properties/drafts">
					<FileText className="mr-2 h-4 w-4" />
					Borradores
				</Link>
			</Button>
			<Button
				asChild
				className={cn(
					"bg-primary hover:bg-primary/90",
					secondaryColorClasses.focusRing
				)}
			>
				<Link href="/dashboard/properties/new">
					<Plus className="mr-2 h-4 w-4" />
					Agregar Propiedad
				</Link>
			</Button>
		</div>
	);

	return (
		<RouteGuard requiredPermission="properties.view">
			<DashboardPageLayout
				actions={actions}
				breadcrumbs={breadcrumbs}
				className="bg-background"
				description="Gestiona todas las propiedades inmobiliarias"
				headerExtras={<FilterTabs className="mb-4" tabs={filterTabs} />}
				searchPlaceholder="Buscar propiedades..."
				showSearch={true}
				stats={statsCards}
				statsLoading={loading}
				title="Propiedades"
			>
				<div className="space-y-4">
					{/* Search and Filters */}
					<PropertyFilters
						onSearchChange={setSearchTerm}
						properties={properties}
						searchTerm={searchTerm}
					/>

					{/* Properties List */}
					<PropertyCardList properties={filteredBySearch} />

					{/* Results Summary */}
					{filteredBySearch.length === 0 && searchTerm && (
						<div className="py-8 text-center">
							<p className="text-muted-foreground">
								No se encontraron propiedades que coincidan con &quot;
								{searchTerm}&quot;
							</p>
						</div>
					)}

					{filteredBySearch.length > 0 && (
						<div className="flex items-center justify-between text-muted-foreground text-sm">
							<span>
								Mostrando {filteredBySearch.length} de {properties.length}{" "}
								propiedades
							</span>
							<Badge
								className={secondaryColorClasses.badge}
								variant="secondary"
							>
								{statusFilter === "all"
									? "Todas"
									: statusFilter === "published"
										? "Publicadas"
										: statusFilter === "sold"
											? "Vendidas"
											: "Alquiladas"}
							</Badge>
						</div>
					)}
				</div>
			</DashboardPageLayout>
		</RouteGuard>
	);
}
