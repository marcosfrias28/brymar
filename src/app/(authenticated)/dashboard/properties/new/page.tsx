"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/route-guard";
import { PropertyWizardNew } from "@/components/wizard/property-wizard-new";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { useUser } from "@/hooks/use-user";
import { loadPropertyDraft } from "@/lib/actions/property-wizard-actions";
import type { PropertyWizardData } from "@/components/wizard/property-wizard-new";

const DEFAULT_PROPERTY_DATA: Partial<PropertyWizardData> = {
	title: "",
	description: "",
	price: 0,
	surface: 0,
	propertyType: "house" as const,
	bedrooms: 0,
	bathrooms: 0,
	coordinates: {
		lat: 18.735_693,
		lng: -70.162_651,
	},
	address: {
		street: "",
		city: "",
		state: "",
		country: "República Dominicana",
		postalCode: "",
	},
	characteristics: [],
	images: [],
	videos: [],
	language: "es" as const,
	aiGenerated: {
		title: false,
		description: false,
		tags: false,
	},
};

function useDraftLoader(
	draftId: string | null,
	userId: string | undefined,
	router: ReturnType<typeof useRouter>
) {
	const [initialData, setInitialData] = useState<Partial<PropertyWizardData>>();

	useEffect(() => {
		const loadDraftData = async () => {
			if (!(draftId && userId)) {
				return;
			}

			try {
				const result = await loadPropertyDraft(draftId, userId);

				if (result) {
					setInitialData(result);
					toast.success("Borrador cargado exitosamente");
				} else {
					toast.error("Error al cargar el borrador");
					router.replace("/dashboard/properties/new");
				}
			} catch {
				toast.error("Error inesperado al cargar el borrador");
				router.replace("/dashboard/properties/new");
			}
		};

		loadDraftData();
	}, [draftId, userId, router]);

	return initialData;
}

export default function NewPropertyPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const breadcrumbs = useBreadcrumbs();
	const { user } = useUser();

	const draftId = searchParams?.get("draft");
	const initialData = useDraftLoader(draftId, user?.id, router);

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
				<PropertyWizardNew
					initialData={initialData || DEFAULT_PROPERTY_DATA}
					onComplete={() => router.push("/dashboard/properties")}
				/>
			</DashboardPageLayout>
		</RouteGuard>
	);
}
