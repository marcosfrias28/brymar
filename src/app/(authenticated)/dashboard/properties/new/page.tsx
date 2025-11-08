"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/route-guard";
import { PropertyForm } from "@/components/forms/property-form";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { useUser } from "@/hooks/use-user";
import {
	loadPropertyDraft,
	createPropertyFromWizard,
	updatePropertyFromWizard,
} from "@/lib/actions/property-wizard-actions";
import type { PropertyWizardData } from "@/types/property-wizard";
import { PropertyType } from "@/types/wizard";

export default function NewPropertyPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const breadcrumbs = useBreadcrumbs();
	const { user } = useUser();
	const [loading, setLoading] = useState(false);
	const [initialData, setInitialData] = useState<Partial<PropertyWizardData>>();

	const draftId = searchParams?.get("draft");

	useEffect(() => {
		const loadDraftData = async () => {
			if (!(draftId && user?.id)) {
				return;
			}

			setLoading(true);
			try {
				const result = await loadPropertyDraft(draftId, user.id);

				if (result) {
					setInitialData(result);
					toast.success("Borrador cargado exitosamente");
				} else {
					toast.error("Error al cargar el borrador");
					// Redirect to new property without draft
					router.replace("/dashboard/properties/new");
				}
			} catch (error) {
				toast.error("Error inesperado al cargar el borrador");
				router.replace("/dashboard/properties/new");
			} finally {
				setLoading(false);
			}
		};

		loadDraftData();
	}, [draftId, user?.id, router]);

	const handleSubmit = async (data: PropertyWizardData) => {
		if (!user?.id) {
			toast.error("Usuario no autenticado");
			throw new Error("Usuario no autenticado");
		}

		try {
			const result = draftId 
				? await updatePropertyFromWizard(draftId, data, user.id)
				: await createPropertyFromWizard(data, user.id);

			if (result.success) {
				toast.success("¡Propiedad creada exitosamente!");
				router.push("/dashboard/properties");
			} else {
				toast.error(result.error || "Error al crear la propiedad");
			}
		} catch (error) {
			toast.error("Error inesperado al crear la propiedad");
		}
	};

	const handleSaveDraft = async (data: PropertyWizardData) => {
		if (!user?.id) {
			toast.error("Usuario no autenticado");
			throw new Error("Usuario no autenticado");
		}

		try {
			// For draft saving, we need to use the savePropertyDraft function
			// or create a new draft if it doesn't exist
			if (draftId) {
				const result = await updatePropertyFromWizard(draftId, data, user.id);
				if (result.success) {
					toast.success("Borrador guardado exitosamente");
				} else {
					toast.error(result.error || "Error al guardar el borrador");
				}
			} else {
				// Create new draft - need to implement this function
				toast.error("Función de crear nuevo borrador no implementada");
			}
		} catch (error) {
			toast.error("Error inesperado al guardar el borrador");
		}
	};

	const actions = (
		<Button asChild variant="outline">
			<Link href="/dashboard/properties">
				<ArrowLeft className="mr-2 h-4 w-4" />
				Volver a Propiedades
			</Link>
		</Button>
	);

	return (
		<RouteGuard requiredPermission="properties.manage">
			<DashboardPageLayout
				actions={actions}
				breadcrumbs={breadcrumbs}
				description={
					draftId
						? "Continúa editando tu borrador guardado"
						: "Crea una nueva propiedad usando el asistente inteligente"
				}
				title={draftId ? "Continuar Borrador" : "Nueva Propiedad"}
			>
				<PropertyForm
					initialData={initialData}
					onSubmit={handleSubmit}
					onSaveDraft={handleSaveDraft}
					isLoading={loading}
				/>
			</DashboardPageLayout>
		</RouteGuard>
	);
}
