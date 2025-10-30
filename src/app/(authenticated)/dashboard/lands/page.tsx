"use client";

import { DollarSign, MapPin, Plus, Ruler, TreePine } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { LandCardList } from "@/components/lands/land-card-list";
import { LandFilters } from "@/components/lands/land-filters";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { useLands } from "@/hooks/use-lands";
import type { LandType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
	badgeVariants,
	secondaryColorClasses,
} from "@/lib/utils/secondary-colors";

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
				label: "Total Terrenos",
				value: lands.length,
				icon: <MapPin className="h-5 w-5" />,
				color: "text-arsenic",
			},
			{
				label: "Comerciales",
				value: lands.filter((l) => l.type === "commercial").length,
				icon: <DollarSign className="h-5 w-5" />,
				color: "text-blue-600",
			},
			{
				label: "Residenciales",
				value: lands.filter((l) => l.type === "residential").length,
				icon: <Ruler className="h-5 w-5" />,
				color: "text-green-600",
			},
			{
				label: "Industriales",
				value: lands.filter((l) => l.type === "industrial").length,
				icon: <TreePine className="h-5 w-5" />,
				color: "text-cyan-600",
			},
		],
		[lands]
	);

	// Quick status filter tabs aligned with layout
	const filterTabs = [
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

	if (error) {
		return (
			<DashboardPageLayout
				actions={
					<Button
						asChild
						className={cn(
							"bg-arsenic hover:bg-blackCoral",
							secondaryColorClasses.focusRing
						)}
					>
						<Link href="/dashboard/lands/new">
							<Plus className="mr-2 h-4 w-4" />
							Agregar Terreno
						</Link>
					</Button>
				}
				breadcrumbs={breadcrumbs}
				description="Administra y gestiona todos los terrenos disponibles"
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
			</DashboardPageLayout>
		);
	}

	const actions = (
		<Button
			asChild
			className={cn(
				"bg-arsenic hover:bg-blackCoral",
				secondaryColorClasses.focusRing
			)}
		>
			<Link href="/dashboard/lands/new">
				<Plus className="mr-2 h-4 w-4" />
				Agregar Terreno
			</Link>
		</Button>
	);

	return (
		<RouteGuard requiredPermission="lands.manage">
			<DashboardPageLayout
				actions={actions}
				breadcrumbs={breadcrumbs}
				description="Administra y gestiona todos los terrenos disponibles"
				headerExtras={<FilterTabs className="mb-4" tabs={filterTabs} />}
				searchPlaceholder="Buscar terrenos..."
				showSearch={true}
				title="Gestión de Terrenos"
			>
				<div className="space-y-6">
					{/* Stats Cards */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
						{stats.map((stat) => (
							<Card
								className={cn(
									"transition-all duration-200",
									secondaryColorClasses.cardHover
								)}
								key={stat.label}
							>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="font-medium text-muted-foreground text-sm">
										{stat.label}
									</CardTitle>
									<div className={stat.color}>{stat.icon}</div>
								</CardHeader>
								<CardContent>
									<div className="font-bold text-2xl text-arsenic">
										{stat.value}
									</div>
									<Badge
										className={cn(badgeVariants.secondarySubtle, "mt-2")}
										variant="secondary"
									>
										{stat.value > 0 ? "Disponibles" : "Sin registros"}
									</Badge>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Filters */}
					<Card
						className={cn("border-blackCoral/20", secondaryColorClasses.accent)}
					>
						<CardHeader>
							<CardTitle className="font-semibold text-arsenic text-lg">
								Filtros
							</CardTitle>
						</CardHeader>
						<CardContent>
							<LandFilters
								currentFilter={typeFilter}
								onFilterChange={handleFilterChange}
								totalCount={lands.length}
							/>
						</CardContent>
					</Card>

					{/* Lands List */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="font-semibold text-arsenic text-xl">
								Terrenos ({filteredByType.length})
							</h2>
							<div className="flex items-center gap-2">
								<Badge
									className={badgeVariants.secondaryOutline}
									variant="outline"
								>
									{filteredByType.length} de {lands.length} terrenos
								</Badge>
								<Badge
									className={cn(badgeVariants.secondarySubtle)}
									variant="secondary"
								>
									{statusFilter === "all"
										? "Todas"
										: statusFilter === "published"
											? "Publicadas"
											: statusFilter === "sold"
												? "Vendidas"
												: statusFilter === "reserved"
													? "Reservadas"
													: "En Contrato"}
								</Badge>
							</div>
						</div>

						{loading ? (
							<div className="py-8 text-center text-muted-foreground">
								Cargando terrenos...
							</div>
						) : (
							<LandCardList lands={filteredByType} />
						)}
					</div>
				</div>
			</DashboardPageLayout>
		</RouteGuard>
	);
}
