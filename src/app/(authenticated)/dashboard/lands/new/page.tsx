"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { RouteGuard } from "@/components/auth/route-guard";
import { UnifiedForm, type FormConfig } from "@/components/forms/unified-form";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { createLandAction } from "@/lib/actions/land-actions";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { cn } from "@/lib/utils";

// Configurazione del form per la creazione di terreni
const landFormConfig: FormConfig = {
	title: "Nuevo Terreno",
	description: "Agrega un nuevo terreno al sistema",
	submitText: "Crear Terreno",
	cancelUrl: "/dashboard/lands",
	fields: [
		{
			name: "name",
			label: "Nombre del Terreno",
			type: "text",
			required: true,
			placeholder: "Ej: Terreno Comercial Bávaro",
		},
		{
			name: "landType",
			label: "Tipo de Terreno",
			type: "select",
			required: true,
			options: [
				{ value: "residential", label: "Residencial" },
				{ value: "commercial", label: "Comercial" },
				{ value: "agricultural", label: "Agrícola" },
				{ value: "beachfront", label: "Frente a la Playa" },
			],
		},
		{
			name: "location",
			label: "Ubicación",
			type: "text",
			required: true,
			placeholder: "Bávaro, Punta Cana",
		},
		{
			name: "surface",
			label: "Superficie (m²)",
			type: "number",
			required: true,
			placeholder: "2500",
		},
		{
			name: "price",
			label: "Precio (USD)",
			type: "number",
			required: true,
			placeholder: "180000",
		},
		{
			name: "description",
			label: "Descripción",
			type: "textarea",
			required: true,
			placeholder: "Describe las características principales del terreno...",
			rows: 4,
		},
		// Campi nascosti per compatibilità
		{
			name: "title",
			type: "hidden",
			defaultValue: "",
		},
		{
			name: "characteristics",
			type: "hidden",
			defaultValue: JSON.stringify([]),
		},
		{
			name: "utilities",
			type: "hidden",
			defaultValue: JSON.stringify([]),
		},
		{
			name: "accessRoads",
			type: "hidden",
			defaultValue: JSON.stringify([]),
		},
		{
			name: "nearbyLandmarks",
			type: "hidden",
			defaultValue: JSON.stringify([]),
		},
		{
			name: "images",
			type: "hidden",
			defaultValue: JSON.stringify([]),
		},
		{
			name: "aerialImages",
			type: "hidden",
			defaultValue: JSON.stringify([]),
		},
		{
			name: "documentImages",
			type: "hidden",
			defaultValue: JSON.stringify([]),
		},
		{
			name: "status",
			type: "hidden",
			defaultValue: "draft",
		},
		{
			name: "language",
			type: "hidden",
			defaultValue: "es",
		},
		{
			name: "tags",
			type: "hidden",
			defaultValue: JSON.stringify([]),
		},
	],
};

export default function NewLandPage() {
	const breadcrumbs = useBreadcrumbs();
	const router = useRouter();

	const actions = (
		<Button
			className={cn(
				"text-arsenic",
				"hover:text-arsenic/80",
				"focus-visible:outline-none",
				"focus-visible:ring-2",
				"focus-visible:ring-arsenic/50"
			)}
			onClick={() => router.push("/dashboard/lands")}
			size="sm"
			variant="link"
		>
			<ArrowLeft className="h-4 w-4" />
			Volver a Terrenos
		</Button>
	);

	return (
		<RouteGuard requiredPermission="lands.manage">
			<DashboardPageLayout
				actions={actions}
				breadcrumbs={breadcrumbs}
				description="Agrega un nuevo terreno al sistema"
				title="Crear Nuevo Terreno"
			>
				<UnifiedForm action={createLandAction} config={landFormConfig} />
			</DashboardPageLayout>
		</RouteGuard>
	);
}
