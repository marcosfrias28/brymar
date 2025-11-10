"use client";

import { createLand } from "@/lib/actions/lands";
import type { CreateLandInput, LandType } from "@/lib/types/lands";
import { LandGeneralStep } from "./steps/land/land-general-step";
import { LandLocationStep } from "./steps/land/land-location-step";
import { LandMediaStep } from "./steps/land/land-media-step";
import { UnifiedWizard, type WizardStep } from "./unified-wizard";
import { z } from "zod";

const LandWizardSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	description: z.string().min(1, "La descripción es requerida"),
	landType: z.string().min(1, "El tipo de terreno es requerido"),
	location: z.string().min(1, "La ubicación es requerida"),
	surface: z.number().min(1, "La superficie es requerida"),
	price: z.number().min(1, "El precio es requerido"),
	currency: z.string().default("USD"),
	images: z.array(z.string()).optional(),
});

export type LandWizardData = z.infer<typeof LandWizardSchema>;

// Land wizard steps - simplified
const landWizardSteps: WizardStep<LandWizardData>[] = [
	{
		id: "general",
		title: "Información General",
		description: "Datos principales del terreno",
		component: LandGeneralStep,
		validation: (data: LandWizardData) => {
			const errors: Record<string, string> = {};
			if (!data.name || data.name.trim() === "") {
				errors.name = "El nombre es requerido";
			}
			if (!data.description || data.description.trim() === "") {
				errors.description = "La descripción es requerida";
			}
			if (!data.surface || data.surface <= 0) {
				errors.surface = "La superficie es requerida";
			}
			if (!data.price || data.price <= 0) {
				errors.price = "El precio es requerido";
			}
			if (!data.landType) {
				errors.landType = "El tipo de terreno es requerido";
			}
			return errors;
		},
	},
	{
		id: "location",
		title: "Ubicación",
		description: "¿Dónde se encuentra el terreno?",
		component: LandLocationStep,
		validation: (data: LandWizardData) => {
			const errors: Record<string, string> = {};
			if (!data.location || data.location.trim() === "") {
				errors.location = "La ubicación es requerida";
			}
			return errors;
		},
	},
	{
		id: "media",
		title: "Imágenes",
		description: "Sube imágenes del terreno",
		component: LandMediaStep,
		validation: () => ({}),
	},
];

type LandWizardProps = {
	initialData?: Partial<LandWizardData>;
	onComplete?: () => void;
};

export function LandWizard({ initialData, onComplete }: LandWizardProps) {
	const handleComplete = async (data: LandWizardData) => {
		try {
			// Validate with Zod schema
			const validatedData = LandWizardSchema.parse(data);

			const landData: CreateLandInput = {
				name: validatedData.name,
				description: validatedData.description,
				area: validatedData.surface,
				price: validatedData.price,
				currency: "USD" as const,
				location: validatedData.location || "",
				type: (validatedData.landType as LandType) || "residential",
				features: {
					utilities: [],
					access: [],
				},
				images: [],
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

	const handleSaveDraft = async (_data: LandWizardData) => {
		// Draft functionality temporarily disabled
	};

	return (
		<UnifiedWizard<LandWizardData>
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
