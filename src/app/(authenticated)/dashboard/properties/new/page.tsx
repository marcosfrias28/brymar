"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { PropertyWizard } from "@/components/wizard";
import { useUser } from "@/hooks/use-user";
import { createProperty } from "@/lib/actions/properties";
import {
	loadPropertyDraft,
	savePropertyDraft,
} from "@/lib/actions/property-wizard-actions";
import type { PropertyWizardData } from "@/types/property-wizard";

export default function NewPropertyPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { user } = useUser();
	const [initialData, setInitialData] = useState<Partial<PropertyWizardData>>(
		{},
	);
	const [loading, setLoading] = useState(false);

	const draftId = searchParams?.get("draft");

	useEffect(() => {
		const loadDraftData = async () => {
			if (!draftId || !user?.id) return;

			setLoading(true);
			try {
				const result = await loadPropertyDraft(draftId, user.id);

				if (result.success && result.data) {
					setInitialData(result.data.data);
					toast.success("Borrador cargado exitosamente");
				} else {
					toast.error(result.error || "Error al cargar el borrador");
					// Redirect to new property without draft
					router.replace("/dashboard/properties/new");
				}
			} catch (error) {
				console.error("Error loading draft:", error);
				toast.error("Error inesperado al cargar el borrador");
				router.replace("/dashboard/properties/new");
			} finally {
				setLoading(false);
			}
		};

		loadDraftData();
	}, [draftId, user?.id, router]);

	const handleComplete = async (data: PropertyWizardData) => {
		if (!user?.id) {
			toast.error("Usuario no autenticado");
			return;
		}

		try {
			// Convert wizard data to FormData for DDD server action
			const formData = new FormData();
			formData.append("title", data.title || "");
			formData.append("description", data.description || "");
			formData.append("price", data.price?.toString() || "0");
			formData.append("propertyType", data.propertyType || "residential");
			formData.append("status", "published");

			// Add address fields
			if (data.address) {
				formData.append("address.street", data.address.street || "");
				formData.append("address.city", data.address.city || "");
				formData.append("address.province", data.address.province || "");
				formData.append(
					"address.country",
					data.address.country || "Dominican Republic",
				);
				formData.append("address.postalCode", data.address.postalCode || "");
			}

			// Add features
			formData.append("features.bedrooms", data.bedrooms?.toString() || "0");
			formData.append("features.bathrooms", data.bathrooms?.toString() || "0");
			formData.append("features.area", data.surface?.toString() || "0");
			if (data.characteristics) {
				data.characteristics.forEach((characteristic, index) => {
					formData.append(`features.amenities[${index}]`, characteristic.name);
				});
			}

			// Add images
			if (data.images) {
				data.images.forEach((image, index) => {
					formData.append(`images[${index}]`, image.url);
				});
			}

			const result = await createProperty(formData);

			if (result.success) {
				toast.success("¡Propiedad publicada exitosamente!");
				router.push(`/dashboard/properties/${result.data?.id}`);
			} else {
				toast.error(result.error || "Error al publicar la propiedad");
			}
		} catch (error) {
			console.error("Error publishing property:", error);
			toast.error("Error inesperado al publicar la propiedad");
		}
	};

	const handleSaveDraft = async (
		data: Partial<PropertyWizardData>,
		currentStep: string,
	): Promise<string> => {
		if (!user?.id) {
			toast.error("Usuario no autenticado");
			throw new Error("Usuario no autenticado");
		}

		try {
			const result = await savePropertyDraft({
				userId: user.id,
				data: {
					...data,
					status: data.status || "draft",
					address: data.address
						? {
								...data.address,
								country: "Dominican Republic" as const,
							}
						: undefined,
				},
				currentStep: currentStep,
				draftId: draftId || undefined,
			});

			if (result.success) {
				toast.success("Borrador guardado exitosamente");
				return result.data?.draftId || "";
			} else {
				toast.error(result.error || "Error al guardar el borrador");
				throw new Error(result.error || "Error al guardar el borrador");
			}
		} catch (error) {
			console.error("Error saving draft:", error);
			toast.error("Error inesperado al guardar el borrador");
			throw error;
		}
	};

	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard" },
		{ label: "Propiedades", href: "/dashboard/properties" },
		{ label: draftId ? "Continuar Borrador" : "Nueva Propiedad" },
	];

	if (loading) {
		return (
			<RouteGuard requiredPermission="properties.manage">
				<DashboardPageLayout
					title="Cargando..."
					description="Cargando borrador"
					breadcrumbs={breadcrumbs}
				>
					<div className="flex items-center justify-center min-h-[400px]">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
							<h2 className="text-xl font-semibold mb-2">
								Cargando borrador...
							</h2>
							<p className="text-muted-foreground">
								Preparando el asistente con tus datos guardados
							</p>
						</div>
					</div>
				</DashboardPageLayout>
			</RouteGuard>
		);
	}

	return (
		<RouteGuard requiredPermission="properties.manage">
			<DashboardPageLayout
				title={draftId ? "Continuar Borrador" : "Nueva Propiedad"}
				description={
					draftId
						? "Continúa editando tu borrador guardado"
						: "Crea una nueva propiedad usando el asistente inteligente"
				}
				breadcrumbs={breadcrumbs}
			>
				<div className="max-w-6xl mx-auto">
					<PropertyWizard
						initialData={initialData}
						draftId={draftId || undefined}
						onComplete={handleComplete}
						onSaveDraft={handleSaveDraft}
					/>
				</div>
			</DashboardPageLayout>
		</RouteGuard>
	);
}
