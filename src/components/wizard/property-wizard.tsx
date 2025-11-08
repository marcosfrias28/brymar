"use client";

import {
	createPropertyFromWizard,
	savePropertyDraft,
} from "@/lib/actions/property-wizard-actions";
import type { PropertyWizardData } from "@/types/property-wizard";
import { PropertyForm } from "../forms/property-form";
import { UnifiedWizard, type WizardStep } from "./unified-wizard";

type PropertyStepProps = {
	data: PropertyWizardData;
	onChange: (data: PropertyWizardData) => void;
	errors?: Record<string, string>;
};

// Property wizard step components
const PropertyBasicInfoStep = ({
	data,
	onChange,
	errors,
}: PropertyStepProps) => {
	return (
		<div className="space-y-4">
			<PropertyForm
				initialData={data as any}
				onSubmit={async (formData) => {
					onChange(formData as any);
				}}
			/>
		</div>
	);
};

const propertyWizardSteps: WizardStep<PropertyWizardData>[] = [
	{
		id: "basic-info",
		title: "Información Básica",
		description: "Datos principales de la propiedad",
		component: PropertyBasicInfoStep,
		validation: (data: PropertyWizardData) => {
			const errors: Record<string, string> = {};
			if (!data.title) {
				errors.title = "El título es requerido";
			}
			if (!data.price) {
				errors.price = "El precio es requerido";
			}
			if (!data.propertyType) {
				errors.propertyType = "El tipo de propiedad es requerido";
			}
			return Object.keys(errors).length === 0 ? null : errors;
		},
	},
];

type PropertyWizardProps = {
	draftId?: string;
	initialData?: PropertyWizardData;
	onComplete?: () => void;
};

export function PropertyWizard({
	draftId,
	initialData,
	onComplete,
}: PropertyWizardProps) {
	const handleSaveDraft = async (data: PropertyWizardData) => {
		try {
			const result = await savePropertyDraft(data, "user-id"); // TODO: Get actual user ID
			if (result.success) {
			} else {
			}
		} catch (_error) {}
	};

	const handleComplete = async (data: PropertyWizardData) => {
		try {
			const result = await createPropertyFromWizard(data, "user-id"); // TODO: Get actual user ID

			if (result.success) {
				onComplete?.();
				return { success: true, message: "Propiedad creada exitosamente" };
			}
			return {
				success: false,
				error: result.error || "Error al crear la propiedad",
			};
		} catch (_error) {
			return { success: false, error: "Error al crear la propiedad" };
		}
	};

	return (
		<UnifiedWizard<PropertyWizardData>
			description="Completa los siguientes pasos para crear una nueva propiedad"
			initialData={initialData}
			onComplete={handleComplete}
			onSaveDraft={handleSaveDraft}
			showDraftOption={true}
			steps={propertyWizardSteps}
			title="Crear Nueva Propiedad"
		/>
	);
}
