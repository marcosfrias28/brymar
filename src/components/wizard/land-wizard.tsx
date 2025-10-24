"use client";

import { useCreateWizardDraft, useSaveWizardDraft } from "@/hooks/use-wizard";
import { createLand } from "@/lib/actions/lands";
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
				initialData={data}
				onSubmit={async (formData) => {
					const formObject = Object.fromEntries(formData.entries());
					onChange(formObject);
					return { success: true };
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
			const result = await createLand(data);

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
		if (draftId) {
			await saveDraft.mutateAsync({
				id: draftId,
				data,
			});
		} else {
			await createDraft.mutateAsync({
				type: "land",
				title: data.name || "Nuevo Terreno",
				initialData: data,
			});
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
