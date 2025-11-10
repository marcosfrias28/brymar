"use client";

import { createProperty } from "@/lib/actions/properties";
import type { CreatePropertyInput } from "@/lib/types/properties";
import { UnifiedWizard, type WizardStep } from "./unified-wizard";
import { z } from "zod";
import {
	PropertyLocationStep,
	PropertyMediaStep,
	PropertyWizardSchema,
	validatePropertyLocation,
	validatePropertyMedia,
	type PropertyWizardData,
} from "./property-wizard-steps";

// Property wizard steps - comprehensive to match complete schema
const propertyWizardSteps: WizardStep<PropertyWizardData>[] = [
	{
		id: "location",
		title: "Ubicación",
		description: "Dirección y coordenadas de la propiedad",
		component: PropertyLocationStep,
		validation: validatePropertyLocation,
	},
	{
		id: "media",
		title: "Medios",
		description: "Imágenes y videos de la propiedad",
		component: PropertyMediaStep,
		validation: validatePropertyMedia,
	},
];

type PropertyWizardProps = {
	initialData?: Partial<PropertyWizardData>;
	onComplete?: () => void;
};

// Helper function to transform wizard data to property input format
function transformWizardData(
	validatedData: PropertyWizardData
): CreatePropertyInput {
	return {
		title: validatedData.title,
		description: validatedData.description,
		price: validatedData.price,
		currency: "USD",
		type: validatedData.propertyType,
		address: {
			street: validatedData.address.street,
			city: validatedData.address.city,
			state: validatedData.address.state,
			country: validatedData.address.country,
			postalCode: validatedData.address.postalCode || "",
		},
		features: {
			bedrooms: validatedData.bedrooms || 0,
			bathrooms: validatedData.bathrooms || 0,
			area: validatedData.surface,
			amenities: validatedData.characteristics || [],
			features: [], // Additional features can be added here
		},
		images:
			validatedData.images?.map((img) => ({
				...img,
				mimeType: img.contentType, // Map contentType to mimeType
			})) || [],
		videos:
			validatedData.videos?.map((video) => ({
				...video,
				filename: video.title || "video", // Add required filename
				mimeType: "video/mp4", // Default video type
			})) || [],
		tags: [], // Can be derived from characteristics
		geometry:
			validatedData.coordinates?.lat && validatedData.coordinates?.lng
				? {
						type: "Point" as const,
						coordinates: [
							validatedData.coordinates.lng,
							validatedData.coordinates.lat,
						],
					}
				: undefined,
	};
}

// Extract completion handler to reduce complexity
function usePropertyCompletion(onComplete?: () => void) {
	return async (data: PropertyWizardData) => {
		try {
			// Validate with complete Zod schema
			const validatedData = PropertyWizardSchema.parse(data);

			// Transform data to match CreatePropertyInput format
			const propertyData = transformWizardData(validatedData);

			const result = await createProperty(propertyData);

			if (result.success) {
				onComplete?.();
				return { success: true, message: "Propiedad creada exitosamente" };
			}
			return {
				success: false,
				error: result.error || "Error al crear la propiedad",
			};
		} catch (error) {
			if (error instanceof z.ZodError) {
				return {
					success: false,
					error: `Datos inválidos: ${Object.values(error.flatten().fieldErrors).flat().join(", ")}`,
				};
			}
			return { success: false, error: "Error inesperado" };
		}
	};
}

export function PropertyWizard({
	initialData,
	onComplete,
}: PropertyWizardProps) {
	const handleComplete = usePropertyCompletion(onComplete);

	return (
		<UnifiedWizard<PropertyWizardData>
			description="Completa toda la información para agregar una nueva propiedad"
			initialData={initialData}
			onComplete={handleComplete}
			showDraftOption={true}
			steps={propertyWizardSteps}
			title="Crear Nueva Propiedad"
		/>
	);
}
