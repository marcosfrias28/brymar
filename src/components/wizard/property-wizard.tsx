"use client";

import { useCreateWizardDraft, useSaveWizardDraft } from "@/hooks/use-wizard";
import { createProperty } from "@/lib/actions/properties";
import type { CreatePropertyInput } from "@/lib/types/properties";
import { PropertyForm } from "../forms/property-form";
import { UnifiedWizard, type WizardStep } from "./unified-wizard";

interface PropertyWizardData {
	title?: string;
	price?: number;
	location?: string;
	[key: string]: unknown;
}

interface StepProps {
	data: PropertyWizardData;
	onChange: (data: PropertyWizardData) => void;
	errors?: Record<string, string>;
}

// Property wizard step components
const PropertyBasicInfoStep = ({ data, onChange, errors }: StepProps) => {
	return (
		<div className="space-y-4">
			<PropertyForm
				initialData={data as any}
				onSuccess={() => {
					// Handle success if needed
				}}
			/>
		</div>
	);
};

const propertyWizardSteps: WizardStep[] = [
	{
		id: "basic-info",
		title: "Información Básica",
		description: "Datos principales de la propiedad",
		component: PropertyBasicInfoStep,
		validation: (data: PropertyWizardData) => {
			const errors: Record<string, string> = {};
			if (!data.title) errors.title = "El título es requerido";
			if (!data.price) errors.price = "El precio es requerido";
			if (!data.location) errors.location = "La ubicación es requerida";
			return Object.keys(errors).length > 0 ? errors : null;
		},
	},
];

interface PropertyWizardProps {
	draftId?: string;
	initialData?: PropertyWizardData;
	onComplete?: () => void;
}

export function PropertyWizard({
	draftId,
	initialData,
	onComplete,
}: PropertyWizardProps) {
	const createDraft = useCreateWizardDraft();
	const saveDraft = useSaveWizardDraft();

	const handleComplete = async (data: PropertyWizardData) => {
		try {
			const propertyData: CreatePropertyInput = {
				title: (data.title as string) || "Untitled Property",
				description: (data.description as string) || "",
				price: (data.price as number) || 0,
				currency: "USD" as const,
				type: (data.type as any) || "house",
				address: (data.address as any) || {
					street: "",
					city: "",
					state: "",
					province: "",
					country: "Dominican Republic",
					postalCode: "",
					formattedAddress: "",
				},
				features: (data.features as any) || {
					bedrooms: 0,
					bathrooms: 0,
					area: 0,
					amenities: [],
					features: [],
				},
				images: (data.images as any) || [],
			};
			const result = await createProperty(propertyData);

			if (result.success) {
				onComplete?.();
				return { success: true, message: "Propiedad creada exitosamente" };
			} else {
				return {
					success: false,
					error: result.error || "Error al crear la propiedad",
				};
			}
		} catch (_error) {
			return { success: false, error: "Error inesperado" };
		}
	};

	const handleSaveDraft = async (data: PropertyWizardData) => {
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
			title="Crear Nueva Propiedad"
			description="Completa la información para agregar una nueva propiedad"
			steps={propertyWizardSteps}
			initialData={initialData}
			onComplete={handleComplete}
			onSaveDraft={handleSaveDraft}
			showDraftOption={true}
		/>
	);
}
