"use client";

import { ArrowLeft, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { StandardCardList } from "@/components/dashboard/standard-card-list";
import { UnifiedDashboardLayout } from "@/components/dashboard/unified-dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProperties } from "@/hooks/use-properties";
import { getStatsAdapter } from "@/lib/adapters/stats-adapters";
import type { Property } from "@/lib/types/properties";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";


export default function PropertiesPage() {
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

	const filterChips = [
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

	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard" },
		{ label: "Propiedades" },
	];

    const actions: { label: string; icon: any; href: string; variant: "default" | "outline" }[] = [];

	if (loading) {
		return (
			<UnifiedDashboardLayout
				actions={actions}
				breadcrumbs={breadcrumbs}
				description="Gestiona todas las propiedades inmobiliarias"
				filterChips={filterChips}
				loading={loading}
				searchPlaceholder="Buscar propiedades..."
				showSearch={true}
				stats={statsCards}
				title="Gestión de Propiedades"
			>
				<div className="flex min-h-[400px] items-center justify-center">
					<div className="text-center">
						<h2 className="mb-2 font-semibold text-xl">Cargando...</h2>
						<p className="mb-4 text-muted-foreground">Cargando propiedades.</p>
					</div>
				</div>
			</UnifiedDashboardLayout>
		);
	}

	if (error) {
		return (
			<UnifiedDashboardLayout
				actions={actions}
				breadcrumbs={breadcrumbs}
				description="Gestiona todas las propiedades inmobiliarias"
				filterChips={filterChips}
				loading={loading}
				searchPlaceholder="Buscar propiedades..."
				showSearch={true}
				stats={statsCards}
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
			</UnifiedDashboardLayout>
		);
	}

	return (
		<RouteGuard requiredPermission="properties.view">
			<UnifiedDashboardLayout
				actions={actions}
				breadcrumbs={breadcrumbs}
				description="Gestiona todas las propiedades inmobiliarias"
				filterChips={filterChips}
				loading={loading}
				onSearchChange={setSearchTerm}
				searchPlaceholder="Buscar propiedades..."
				searchValue={searchTerm}
				showSearch={true}
				stats={statsCards}
				title="Gestión de Propiedades"
			>
				<StandardCardList
					className="mt-6"
					items={filteredBySearch}
					onDelete={(id) => {
						// Handle delete logic here
						console.log("Delete property:", id);
					}}
					onEdit={(id) => {
						// Handle edit logic here
						console.log("Edit property:", id);
					}}
					onView={(id) => {
						// Handle view logic here
						console.log("View property:", id);
					}}
					showActions={true}
					type="property"
					variant={"list"}
				/>
				
				{filteredBySearch.length === 0 && searchTerm && (
					<div className="py-8 text-center">
						<p className="text-muted-foreground">
							No se encontraron propiedades que coincidan con &quot;
							{searchTerm}&quot;
						</p>
					</div>
				)}
				
				{filteredBySearch.length > 0 && (
					<div className="mt-6 flex items-center justify-between text-muted-foreground text-sm">
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
			</UnifiedDashboardLayout>
		</RouteGuard>
	);
}
