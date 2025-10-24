"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { LandForm } from "@/components/forms/land-form";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";

export default function NewLandPage() {
	const breadcrumbs = useBreadcrumbs();

	return (
		<RouteGuard requiredPermission="lands.manage">
			<DashboardPageLayout
				title="Crear Nuevo Terreno"
				description="Agrega un nuevo terreno al sistema"
				breadcrumbs={breadcrumbs}
			>
				<LandForm />
			</DashboardPageLayout>
		</RouteGuard>
	);
}
