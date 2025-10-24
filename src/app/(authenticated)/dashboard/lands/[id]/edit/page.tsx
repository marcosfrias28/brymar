"use client";

import { useParams } from "next/navigation";
import { RouteGuard } from "@/components/auth/route-guard";
import { LandForm } from "@/components/forms/land-form";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { InlineErrorState } from "@/components/ui/error-states";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { useLand } from "@/hooks/use-lands";

export default function EditLandPage() {
	// All hooks must be called before any conditional returns
	const params = useParams();
	const breadcrumbs = useBreadcrumbs();
	const landId = (params?.id as string) || "";
	const { data: land, isLoading: loading, error, refetch } = useLand(landId);

	// Conditional rendering after all hooks are called
	if (!params || !params.id) {
		return (
			<DashboardPageLayout
				title="Error"
				description="Terreno no encontrado"
				breadcrumbs={breadcrumbs}
			>
				<div className="flex items-center justify-center h-64">
					<InlineErrorState message="ID de terreno no válido" />
				</div>
			</DashboardPageLayout>
		);
	}

	if (loading) {
		return (
			<DashboardPageLayout
				title="Cargando terreno..."
				description="Obteniendo información del terreno para editar"
				breadcrumbs={breadcrumbs}
			>
				<div className="flex items-center justify-center h-64">
					<LoadingSpinner />
				</div>
			</DashboardPageLayout>
		);
	}

	if (error || !land) {
		return (
			<DashboardPageLayout
				title="Error"
				description="No se pudo cargar el terreno"
				breadcrumbs={breadcrumbs}
			>
				<div className="flex items-center justify-center h-64">
					<InlineErrorState
						message={error?.message || "Terreno no encontrado"}
						onRetry={refetch}
					/>
				</div>
			</DashboardPageLayout>
		);
	}

	return (
		<RouteGuard requiredPermission="lands.manage">
			<DashboardPageLayout
				title={`Editar ${land.name}`}
				description="Modifica la información del terreno"
				breadcrumbs={breadcrumbs}
			>
				<LandForm initialData={land} isEditing={true} />
			</DashboardPageLayout>
		</RouteGuard>
	);
}
