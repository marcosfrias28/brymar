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
	loadPropertyForWizard,
	savePropertyFromWizard,
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
				const result = await loadPropertyForWizard(draftId, user.id);

				if (result.success && result.data) {
					setInitialData(result.data.data);
					toast.success("Borrador cargado exitosamente");
				} else {
					toast.error(result.error || "Error al cargar el borrador");
					// Redirect to new property without draft
					router.replace("/dashboard/properties/new");
				}
			} catch (_error) {
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
			const result = await savePropertyFromWizard({
				userId: user.id,
				data: {
					...data,
					propertyType: data.propertyType as PropertyType,
					status: "published", // Publicar directamente
					language: data.language || "es",
					aiGenerated: data.aiGenerated || {
						title: false,
						description: false,
						tags: false,
					},
					address: data.address
						? {
								...data.address,
								country: "Dominican Republic" as const,
							}
						: data.address,
				},
				propertyId: draftId || undefined,
			});

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
			const result = await savePropertyFromWizard({
				userId: user.id,
				data: {
					...data,
					propertyType: data.propertyType as PropertyType,
					status: "draft",
					language: data.language || "es",
					aiGenerated: data.aiGenerated || {
						title: false,
						description: false,
						tags: false,
					},
					address: data.address
						? {
								...data.address,
								country: "Dominican Republic" as const,
							}
						: data.address,
				},
				propertyId: draftId || undefined,
			});

			if (result.success) {
				toast.success("Borrador guardado exitosamente");
				// Actualizar la URL con el ID del borrador si es nuevo
				if (!draftId && result.data?.propertyId) {
					router.replace(
						`/dashboard/properties/new?draft=${result.data.propertyId}`
					);
				}
			} else {
				toast.error(result.error || "Error al guardar el borrador");
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
