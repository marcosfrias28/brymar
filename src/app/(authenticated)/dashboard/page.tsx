"use client";

import { Plus, Settings, TrendingUp } from "lucide-react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/route-guard";
import { PropertyChart } from "@/components/dashboard/property-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DashboardPageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";

export default function DashboardPage() {
	const breadcrumbs = useBreadcrumbs();

	const actions = (
		<div className="flex items-center gap-3">
			<Button
				variant="outline"
				size="sm"
				asChild
				className="hover:bg-secondary/10 hover:border-secondary/30 transition-colors"
			>
				<Link href="/dashboard/settings">
					<Settings className="h-4 w-4 mr-2" />
					Configuración
				</Link>
			</Button>
			<Button
				size="sm"
				asChild
				className="bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary/50"
			>
				<Link href="/dashboard/properties/new">
					<Plus className="h-4 w-4 mr-2" />
					Agregar Propiedad
				</Link>
			</Button>
		</div>
	);

	return (
		<RouteGuard requiredPermission="dashboard.access">
			<DashboardPageLayout
				title="Dashboard"
				description="Resumen general de tu actividad y estadísticas de la plataforma"
				breadcrumbs={breadcrumbs}
				actions={actions}
				showSearch={true}
				searchPlaceholder="Buscar en dashboard..."
				className="bg-background"
				contentClassName="space-y-8"
			>
				{/* Overview Cards Section */}
				<section className="space-y-4">
					<div className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5 text-secondary" />
						<h2 className="text-xl font-semibold text-foreground">
							Resumen General
						</h2>
					</div>
					<StatsCards />
				</section>

				{/* Charts and Activity Section */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-foreground">
						Análisis y Actividad
					</h2>
					<div className="grid gap-6 lg:grid-cols-7">
						<div className="lg:col-span-4 space-y-4">
							<PropertyChart />
						</div>
						<div className="lg:col-span-3 space-y-4">
							<RecentActivity />
							<QuickActions />
						</div>
					</div>
				</section>
			</DashboardPageLayout>
		</RouteGuard>
	);
}
