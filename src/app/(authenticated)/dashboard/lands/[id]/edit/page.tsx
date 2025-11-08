"use client";

import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RouteGuard } from "@/components/auth/route-guard";
import { UnifiedForm, type FormConfig } from "@/components/forms/unified-form";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { InlineErrorState } from "@/components/ui/error-states";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { useLand } from "@/hooks/use-lands";
import { updateLandAction } from "@/lib/actions/land-actions";

export default function EditLandPage() {
	// All hooks must be called before any conditional returns
	const params = useParams();
	const breadcrumbs = useBreadcrumbs();
	const landId = (params?.id as string) || "";
	const { data: land, isLoading: loading, error, refetch } = useLand(landId);

	// Configuración del formulario para editar terreno
	const landFormConfig: FormConfig = {
		title: "Editar Terreno",
		description: "Modifica la información del terreno",
		fields: [
			{ name: "id", type: "hidden" },
			{
				name: "name",
				label: "Nombre del terreno",
				type: "text",
				required: true,
				placeholder: "Ej: Terreno Los Pinos",
			},
			{
				name: "type",
				label: "Tipo de terreno",
				type: "select",
				required: true,
				options: [
					{ value: "residential", label: "Residencial" },
					{ value: "commercial", label: "Comercial" },
					{ value: "industrial", label: "Industrial" },
					{ value: "agricultural", label: "Agrícola" },
					{ value: "recreational", label: "Recreativo" },
				],
			},
			{
				name: "location",
				label: "Ubicación",
				type: "text",
				required: true,
				placeholder: "Dirección completa",
			},
			{
				name: "area",
				label: "Superficie (m²)",
				type: "number",
				required: true,
				placeholder: "1000",
			},
			{
				name: "price",
				label: "Precio (€)",
				type: "number",
				required: true,
				placeholder: "50000",
			},
			{
				name: "description",
				label: "Descripción",
				type: "textarea",
				rows: 4,
				placeholder: "Describe las características del terreno...",
			},
		],
		submitText: "Guardar Cambios",
		cancelText: "Cancelar",
		cancelUrl: "/dashboard/lands",
	};

	// Conditional rendering after all hooks are called
	if (!params?.id) {
		return (
			<DashboardPageLayout
				actions={
					<Button asChild variant="outline">
						<Link href="/dashboard/lands">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Volver a Terrenos
						</Link>
					</Button>
				}
				breadcrumbs={breadcrumbs}
				description="Terreno no encontrado"
				title="Error"
			>
				<div className="flex h-64 items-center justify-center">
					<InlineErrorState message="ID de terreno no válido" />
				</div>
			</DashboardPageLayout>
		);
	}

	if (loading) {
		return (
			<DashboardPageLayout
				actions={
					<Button asChild variant="outline">
						<Link href="/dashboard/lands">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Volver a Terrenos
						</Link>
					</Button>
				}
				breadcrumbs={breadcrumbs}
				description="Obteniendo información del terreno para editar"
				title="Cargando terreno..."
			>
				<div className="flex h-64 items-center justify-center">
					<LoadingSpinner />
				</div>
			</DashboardPageLayout>
		);
	}

	if (error || !land) {
		return (
			<DashboardPageLayout
				actions={
					<Button asChild variant="outline">
						<Link href="/dashboard/lands">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Volver a Terrenos
						</Link>
					</Button>
				}
				breadcrumbs={breadcrumbs}
				description="No se pudo obtener la información del terreno"
				title="Error al cargar terreno"
			>
				<div className="flex h-64 items-center justify-center">
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
				actions={
					<Button
						onClick={() => {
							const form = document.querySelector("form");
							if (form) {
								form.requestSubmit();
							}
						}}
					>
						<Save className="mr-2 h-4 w-4" />
						Guardar Cambios
					</Button>
				}
				breadcrumbs={breadcrumbs}
				description="Modifica la información del terreno"
				title={`Editar Terreno: ${land.name || "Sin título"}`}
			>
				<UnifiedForm
					action={updateLandAction}
					config={landFormConfig}
					initialData={land}
					isEditing={true}
				/>
			</DashboardPageLayout>
		</RouteGuard>
	);
}
