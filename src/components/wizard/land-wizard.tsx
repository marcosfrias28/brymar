"use client";

import { useCreateWizardDraft, useSaveWizardDraft } from "@/hooks/use-wizard";
import { createLand } from "@/lib/actions/lands";
import type { CreateLandInput } from "@/lib/types/lands";
import { LandForm } from "../forms/land-form";
import { UnifiedWizard, type WizardStep } from "./unified-wizard";

type LandWizardData = {
	name?: string;
	price?: number;
	area?: number;
	[key: string]: unknown;
};

type LandStepProps = {
	data: LandWizardData;
	onChange: (data: LandWizardData) => void;
	errors?: Record<string, string>;
};

// Land wizard step components
const LandBasicInfoStep = ({ data, onChange, errors }: LandStepProps) => {
	return (
		<div className="space-y-4">
			<LandForm
				initialData={data as any}
				onSuccess={() => {
					// Handle success if needed
				}}
			/>
		</div>
	);
};

const landWizardSteps: WizardStep[] = [
	{
		id: "basic-info",
		title: "Información Básica",
		description: "Datos principales del terreno",
		component: LandBasicInfoStep,
		validation: (data: LandWizardData) => {
			const errors: Record<string, string> = {};
			if (!data.name) {
				errors.name = "El nombre es requerido";
			}
			if (!data.price) {
				errors.price = "El precio es requerido";
			}
			if (!data.area) {
				errors.area = "El área es requerida";
			}
			return Object.keys(errors).length > 0 ? errors : null;
		},
	},
];

type LandWizardProps = {
	draftId?: string;
	initialData?: LandWizardData;
	onComplete?: () => void;
};

export function LandWizard({
	draftId,
	initialData,
	onComplete,
}: LandWizardProps) {
	const createDraft = useCreateWizardDraft();
	const saveDraft = useSaveWizardDraft();

	const handleComplete = async (data: LandWizardData) => {
		try {
			const landData: CreateLandInput = {
				name: (data.name as string) || "Untitled Land",
				description: (data.description as string) || "",
				area: (data.area as number) || 0,
				price: (data.price as number) || 0,
				currency: "USD" as const,
				location: (data.location as string) || "",
				type: (data.type as any) || "residential",
				features: (data.features as any) || {},
				images: (data.images as any) || [],
			};
			const result = await createLand(landData);

			if (result.success) {
				onComplete?.();
				return { success: true, message: "Terreno creado exitosamente" };
			}
			return {
				success: false,
				error: result.error || "Error al crear el terreno",
			};
		} catch (_error) {
			return { success: false, error: "Error inesperado" };
		}
	};

	const handleSaveDraft = async (data: LandWizardData) => {
		try {
			if (draftId) {
				await saveDraft.mutateAsync({
					id: draftId,
					data,
				});
			} else {
				await createDraft.mutateAsync();
			}
		} catch (_error) {}
	};

	return (
		<UnifiedWizard
			description="Completa la información para agregar un nuevo terreno"
			initialData={initialData}
			onComplete={handleComplete}
			onSaveDraft={handleSaveDraft}
			showDraftOption={true}
			steps={landWizardSteps}
			title="Crear Nuevo Terreno"
		/>
	);
}
