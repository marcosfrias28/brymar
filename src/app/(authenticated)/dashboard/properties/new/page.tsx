"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { PropertyWizard } from "@/components/wizard";
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
	const { user } = useUser();
	const [initialData, setInitialData] = useState<Partial<PropertyWizardData>>(
		{}
	);
	const [loading, setLoading] = useState(false);

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

	const handleComplete = async () => {
		// Property creation is handled by the PropertyWizard component
		// Just navigate to the properties list
		toast.success("¡Propiedad publicada exitosamente!");
		router.push("/dashboard/properties");
	};

	const _handleSaveDraft = async (
		data: Partial<PropertyWizardData>,
		_currentStep: string
	): Promise<string> => {
		if (!user?.id) {
			toast.error("Usuario no autenticado");
			throw new Error("Usuario no autenticado");
		}

		try {
			const result = await savePropertyFromWizard({
				userId: user.id,
				data: {
					...data,
					// Garantisce compatibilità con l’enum centralizzato
					propertyType: (data.propertyType as PropertyType) || undefined,
					status: data.status || "draft",
					language: data.language || "es", // Ensure language is set
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
						: undefined,
				},
				propertyId: draftId || undefined,
			});

			if (result.success) {
				toast.success("Borrador guardado exitosamente");
				return result.data?.propertyId || "";
			}
			toast.error(result.error || "Error al guardar el borrador");
			throw new Error(result.error || "Error al guardar el borrador");
		} catch (error) {
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
					actions={
						<Button asChild variant="outline">
							<a href="/dashboard/properties">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Volver a Propiedades
							</a>
						</Button>
					}
					breadcrumbs={breadcrumbs}
					description="Cargando borrador"
					title="Cargando..."
				>
					<div className="flex min-h-[400px] items-center justify-center">
						<div className="text-center">
							<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
							<h2 className="mb-2 font-semibold text-xl">
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
				actions={
					<Button asChild variant="outline">
						<a href="/dashboard/properties">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Volver a Propiedades
						</a>
					</Button>
				}
				breadcrumbs={breadcrumbs}
				description={
					draftId
						? "Continúa editando tu borrador guardado"
						: "Crea una nueva propiedad usando el asistente inteligente"
				}
				title={draftId ? "Continuar Borrador" : "Nueva Propiedad"}
			>
				<div className="mx-auto max-w-6xl">
					<PropertyWizard
						draftId={draftId || undefined}
						initialData={initialData}
						onComplete={handleComplete}
					/>
				</div>
			</DashboardPageLayout>
		</RouteGuard>
	);
}
