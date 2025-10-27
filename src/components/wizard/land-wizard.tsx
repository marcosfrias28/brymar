"use client";

import { useCreateWizardDraft, useSaveWizardDraft } from "@/hooks/use-wizard";
import { createLand } from "@/lib/actions/lands";
import type { CreateLandInput } from "@/lib/types/lands";
import { LandForm } from "../forms/land-form";
import { UnifiedWizard, type WizardStep } from "./unified-wizard";

interface LandWizardData {
	name?: string;
	price?: number;
	area?: number;
	[key: string]: unknown;
}

interface LandStepProps {
	data: LandWizardData;
	onChange: (data: LandWizardData) => void;
	errors?: Record<string, string>;
}

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
			if (!data.name) errors.name = "El nombre es requerido";
			if (!data.price) errors.price = "El precio es requerido";
			if (!data.area) errors.area = "El área es requerida";
			return Object.keys(errors).length > 0 ? errors : null;
		},
	},
];

interface LandWizardProps {
	draftId?: string;
	initialData?: LandWizardData;
	onComplete?: () => void;
}

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
			} else {
				return {
					success: false,
					error: result.error || "Error al crear el terreno",
				};
			}
		} catch (_error) {
			return { success: false, error: "Error inesperado" };
		}
	};

	const handleSaveDraft = async (data: LandWizardData) => {
		try {
			if (draftId) {
				await saveDraft.mutateAsync({
					id: draftId,
					data: data,
				});
			} else {
				await createDraft.mutateAsync();
			}
		} catch (error) {
			console.warn("Wizard draft functionality is temporarily disabled:", error);
		}
	};

	return (
		<UnifiedWizard
			title="Crear Nuevo Terreno"
			description="Completa la información para agregar un nuevo terreno"
			steps={landWizardSteps}
			initialData={initialData}
			onComplete={handleComplete}
			onSaveDraft={handleSaveDraft}
			showDraftOption={true}
		/>
	);
}
