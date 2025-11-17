"use client";

import { DollarSign, MapPin, Plus, Ruler, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { StandardCardList } from "@/components/dashboard/standard-card-list";
import { UnifiedDashboardLayout } from "@/components/dashboard/unified-dashboard-layout";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { useLands } from "@/hooks/use-lands";
import type { LandType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

export default function LandsPage() {
	const breadcrumbs = useBreadcrumbs();

	const [typeFilter, setTypeFilter] = useState<"all" | LandType>("all");
	const [statusFilter, setStatusFilter] = useState<
		"all" | "published" | "sold" | "reserved" | "under-contract"
	>("all");

	const {
		data: landsData,
		isLoading: loading,
		error,
		refetch: searchLands,
	} = useLands({
		landTypes: typeFilter === "all" ? undefined : [typeFilter as LandType],
	});

	const lands = landsData?.items || [];

	const filteredByStatus = useMemo(
		() =>
			statusFilter === "all"
				? lands
				: lands.filter((l) => l.status === statusFilter),
		[lands, statusFilter]
	);

	const filteredByType = useMemo(
		() =>
			typeFilter === "all"
				? filteredByStatus
				: filteredByStatus.filter((l) => l.type === typeFilter),
		[filteredByStatus, typeFilter]
	);

	const stats = useMemo(
		() => [
			{
				title: "Total Terrenos",
				value: lands.length,
				icon: MapPin,
				color: "bg-emerald-500",
				description: "Disponibles",
			},
			{
				title: "Comerciales",
				value: lands.filter((l) => l.type === "commercial").length,
				icon: DollarSign,
				color: "bg-blue-500",
				description: "Disponibles",
			},
			{
				title: "Residenciales",
				value: lands.filter((l) => l.type === "residential").length,
				icon: Ruler,
				color: "bg-green-500",
				description: "Disponibles",
			},
			{
				title: "Industriales",
				value: lands.filter((l) => l.type === "industrial").length,
				icon: TreePine,
				color: "bg-cyan-500",
				description: "Sin registros",
			},
		],
		[lands]
	);

	// Quick status filter tabs aligned with layout
	const filterChips = [
		{
			label: "Todas",
			value: "all",
			count: lands.length,
			active: statusFilter === "all",
			onClick: () => setStatusFilter("all"),
		},
		{
			label: "Publicadas",
			value: "published",
			count: lands.filter((l) => l.status === "published").length,
			active: statusFilter === "published",
			onClick: () => setStatusFilter("published"),
		},
		{
			label: "Vendidas",
			value: "sold",
			count: lands.filter((l) => l.status === "sold").length,
			active: statusFilter === "sold",
			onClick: () => setStatusFilter("sold"),
		},
		{
			label: "Reservadas",
			value: "reserved",
			count: lands.filter((l) => l.status === "reserved").length,
			active: statusFilter === "reserved",
			onClick: () => setStatusFilter("reserved"),
		},
	];

	const handleFilterChange = (newFilter: typeof typeFilter) => {
		setTypeFilter(newFilter);
		searchLands();
	};

    const actions: { label: string; icon: any; href: string; variant: "default" | "outline" }[] = [];

	if (error) {
		return (
			<UnifiedDashboardLayout
				actions={actions}
				breadcrumbs={breadcrumbs}
				description="Administra y gestiona todos los terrenos disponibles"
				loading={loading}
				stats={stats}
				title="Gestión de Terrenos"
			>
				<div className="flex h-64 items-center justify-center">
					<div className="text-center">
						<p className="mb-2 text-red-600">Error al cargar terrenos</p>
						<Button onClick={() => searchLands()} variant="outline">
							Reintentar
						</Button>
					</div>
				</div>
			</UnifiedDashboardLayout>
		);
	}

	return (
		<RouteGuard requiredPermission="lands.manage">
			<UnifiedDashboardLayout
				actions={actions}
				breadcrumbs={breadcrumbs}
				description="Administra y gestiona todos los terrenos disponibles"
				filterChips={filterChips}
				loading={loading}
				stats={stats}
				title="Gestión de Terrenos"
			>
				<StandardCardList
					className="mt-6"
					items={filteredByType}
					onDelete={(id) => {
						// Handle delete logic here
						console.log("Delete land:", id);
					}}
					onEdit={(id) => {
						// Handle edit logic here
						console.log("Edit land:", id);
					}}
					onView={(id) => {
						// Handle view logic here
						console.log("View land:", id);
					}}
					showActions={true}
					type="land"
					variant="list"
				/>
			</UnifiedDashboardLayout>
		</RouteGuard>
	);
}
