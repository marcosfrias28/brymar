"use client";

import { useState } from "react";
import type { DashboardHeaderAction } from "@/components/dashboard/unified-dashboard-layout";
import { RouteGuard } from "@/components/auth/route-guard";
import { StandardCardList } from "@/components/dashboard/standard-card-list";
import { UnifiedDashboardLayout } from "@/components/dashboard/unified-dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProperties } from "@/hooks/use-properties";
import { getStatsAdapter } from "@/lib/adapters/stats-adapters";
import type { Property } from "@/lib/types/properties";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";
import { Plus } from "lucide-react";

type ActionItem = DashboardHeaderAction;

const noop = () => null;

function getFilterChips(
	statusFilter: "all" | "published" | "sold" | "rented",
	setStatusFilter: (v: "all" | "published" | "sold" | "rented") => void,
	properties: Property[]
) {
	return [
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
}

function PropertiesLoadingLayout({
	actions,
	breadcrumbs,
	loading,
	stats,
}: {
    actions: ActionItem[];
    breadcrumbs: { label: string; href?: string }[];
    loading: boolean;
    stats: any[];
}) {
	return (
		<UnifiedDashboardLayout
			actions={actions}
			breadcrumbs={breadcrumbs}
			description="Gestiona todas las propiedades inmobiliarias"
			filterChips={[]}
			loading={loading}
			searchPlaceholder="Buscar propiedades..."
			showSearch={true}
			stats={stats}
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

function PropertiesErrorLayout({
	actions,
	breadcrumbs,
	loading,
	stats,
	message,
	onRetry,
}: {
    actions: ActionItem[];
    breadcrumbs: { label: string; href?: string }[];
    loading: boolean;
    stats: any[];
    message: string;
    onRetry: () => void;
}) {
	return (
		<UnifiedDashboardLayout
			actions={actions}
			breadcrumbs={breadcrumbs}
			description="Gestiona todas las propiedades inmobiliarias"
			filterChips={[]}
			loading={loading}
			searchPlaceholder="Buscar propiedades..."
			showSearch={true}
			stats={stats}
			title="Gestión de Propiedades"
		>
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="text-center">
					<h2 className="mb-2 font-semibold text-xl">
						Error al cargar propiedades
					</h2>
					<p className="mb-4 text-muted-foreground">{message}</p>
					<Button onClick={onRetry}>Reintentar</Button>
				</div>
			</div>
		</UnifiedDashboardLayout>
	);
}

function PropertiesContent({
	actions,
	breadcrumbs,
	loading,
	stats,
	properties,
	statusFilter,
	searchTerm,
	setSearchTerm,
	setStatusFilter,
}: {
    actions: ActionItem[];
    breadcrumbs: { label: string; href?: string }[];
    loading: boolean;
    stats: any[];
    properties: Property[];
    statusFilter: "all" | "published" | "sold" | "rented";
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    setStatusFilter: (v: "all" | "published" | "sold" | "rented") => void;
}) {
	const filteredByStatus =
		statusFilter === "all"
			? properties
			: properties.filter((p) => p.status === statusFilter);
	const filteredBySearch = filteredByStatus.filter(
		(property) =>
			property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			property.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
	);
	const filterChips = getFilterChips(statusFilter, setStatusFilter, properties);

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
				stats={stats}
				title="Gestión de Propiedades"
			>
				<StandardCardList
					className="mt-6"
					items={filteredBySearch}
					onDelete={noop}
					onEdit={noop}
					onView={noop}
					showActions={true}
					type="property"
					variant={"list"}
				/>

				{filteredBySearch.length === 0 && searchTerm && (
					<div className="py-8 text-center">
						<p className="text-muted-foreground">
							No se encontraron propiedades que coincidan con &quot;{searchTerm}
							&quot;
						</p>
					</div>
				)}

				{filteredBySearch.length > 0 && (
					<div className="mt-6 flex items-center justify-between text-muted-foreground text-sm">
						<span>
							Mostrando {filteredBySearch.length} de {properties.length}{" "}
							propiedades
						</span>
						<Badge className={secondaryColorClasses.badge} variant="secondary">
							{getStatusLabel(statusFilter)}
						</Badge>
					</div>
				)}
			</UnifiedDashboardLayout>
		</RouteGuard>
	);
}

function getStatusLabel(status: "all" | "published" | "sold" | "rented") {
	if (status === "all") {
		return "Todas";
	}
	if (status === "published") {
		return "Publicadas";
	}
	if (status === "sold") {
		return "Vendidas";
	}
	return "Alquiladas";
}

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
	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard" },
		{ label: "Propiedades" },
	];
	const actions: ActionItem[] = [
		{
			label: "Nueva Propiedad",
			href: "/dashboard/properties/new",
			icon: Plus,
			variant: "outline",
		},
	];
	const propertiesAdapter = getStatsAdapter("properties");
	const statsCards = propertiesAdapter?.generateStats({ properties }) || [];

	if (loading) {
		return (
			<PropertiesLoadingLayout
				actions={actions}
				breadcrumbs={breadcrumbs}
				loading={loading}
				stats={statsCards}
			/>
		);
	}
	if (error) {
		return (
			<PropertiesErrorLayout
				actions={actions}
				breadcrumbs={breadcrumbs}
				loading={loading}
				message={error?.message || "Error desconocido"}
				onRetry={() => refetch()}
				stats={statsCards}
			/>
		);
	}

	return (
		<PropertiesContent
			actions={actions}
			breadcrumbs={breadcrumbs}
			loading={loading}
			properties={properties}
			searchTerm={searchTerm}
			setSearchTerm={setSearchTerm}
			setStatusFilter={setStatusFilter}
			stats={statsCards}
			statusFilter={statusFilter}
		/>
	);
}
