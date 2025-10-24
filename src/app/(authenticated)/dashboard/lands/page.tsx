"use client";

import { DollarSign, MapPin, Plus, Ruler, TreePine } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
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

	const {
		data: landsData,
		isLoading: loading,
		error,
		refetch: searchLands,
	} = useLands({
		landTypes: typeFilter === "all" ? undefined : [typeFilter as LandType],
	});

	const lands = landsData?.items || [];

	const filteredByType = useMemo(() => {
		return typeFilter === "all"
			? lands
			: lands.filter((l) => l.type === typeFilter);
	}, [lands, typeFilter]);

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
		[lands],
	);

	const handleFilterChange = (newFilter: typeof typeFilter) => {
		setTypeFilter(newFilter);
		searchLands();
	};

	if (error) {
		return (
			<DashboardPageLayout
				title="Gestión de Terrenos"
				description="Administra y gestiona todos los terrenos disponibles"
				breadcrumbs={breadcrumbs}
			>
				<div className="flex items-center justify-center h-64">
					<div className="text-center">
						<p className="text-red-600 mb-2">Error al cargar terrenos</p>
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
				secondaryColorClasses.focusRing,
			)}
		>
			<Link href="/dashboard/lands/new">
				<Plus className="h-4 w-4 mr-2" />
				Agregar Terreno
			</Link>
		</Button>
	);

	return (
		<RouteGuard requiredPermission="lands.manage">
			<DashboardPageLayout
				title="Gestión de Terrenos"
				description="Administra y gestiona todos los terrenos disponibles"
				breadcrumbs={breadcrumbs}
				actions={actions}
				showSearch={true}
				searchPlaceholder="Buscar terrenos..."
			>
				<div className="space-y-6">
					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{stats.map((stat) => (
							<Card
								key={stat.label}
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
									<div className="text-2xl font-bold text-arsenic">
										{stat.value}
									</div>
									<Badge
										variant="secondary"
										className={cn(badgeVariants.secondarySubtle, "mt-2")}
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
							<CardTitle className="text-lg font-semibold text-arsenic">
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
							<h2 className="text-xl font-semibold text-arsenic">
								Terrenos ({filteredByType.length})
							</h2>
							<Badge
								variant="outline"
								className={badgeVariants.secondaryOutline}
							>
								{filteredByType.length} de {lands.length} terrenos
							</Badge>
						</div>

						{loading ? (
							<div className="text-center py-8 text-muted-foreground">
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
