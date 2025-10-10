import { z } from "zod";
import { CoordinatesSchema, ImageMetadataSchema } from "./wizard-schemas";

// Land types enum
export const LandType = {
    COMMERCIAL: "commercial",
    RESIDENTIAL: "residential",
    AGRICULTURAL: "agricultural",
    BEACHFRONT: "beachfront",
} as const;

export type LandType = typeof LandType[keyof typeof LandType];

// Land-specific schemas
export const LandCharacteristicSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    category: z.enum(["zoning", "utilities", "access", "features"]),
    selected: z.boolean(),
});

// Step 1: General Information Schema for Land
export const LandStep1Schema = z.object({
    name: z
        .string()
        .min(10, "El nombre debe tener al menos 10 caracteres")
        .max(100, "El nombre no puede superar 100 caracteres"),
    description: z
        .string()
        .min(50, "La descripción debe tener al menos 50 caracteres")
        .max(2000, "La descripción no puede superar 2000 caracteres"),
    price: z
        .number()
        .positive("El precio debe ser mayor a 0")
        .max(999999999, "El precio es demasiado alto"),
    surface: z
        .number()
        .positive("La superficie debe ser mayor a 0")
        .max(999999, "La superficie es demasiado grande"),
    landType: z.nativeEnum(LandType, {
        errorMap: () => ({ message: "Selecciona un tipo de terreno válido" }),
    }),
    zoning: z.string().optional(),
    utilities: z.array(z.string()).optional(),
    characteristics: z
        .array(LandCharacteristicSchema)
        .min(1, "Selecciona al menos una característica"),
});

// Step 2: Location Schema for Land
export const LandStep2Schema = z.object({
    location: z
        .string()
        .min(5, "La ubicación debe tener al menos 5 caracteres")
        .max(200, "La ubicación no puede superar 200 caracteres"),
    coordinates: CoordinatesSchema.optional(),
    address: z.object({
        street: z.string().optional(),
        city: z.string().min(2, "La ciudad debe tener al menos 2 caracteres"),
        province: z.string().min(2, "La provincia debe tener al menos 2 caracteres"),
        postalCode: z.string().optional(),
        country: z.literal("Dominican Republic").default("Dominican Republic"),
        formattedAddress: z.string().min(1),
    }).optional(),
    accessRoads: z.array(z.string()).optional(),
    nearbyLandmarks: z.array(z.string()).optional(),
});

// Step 3: Media Schema for Land
export const LandStep3Schema = z.object({
    images: z
        .array(ImageMetadataSchema)
        .min(1, "Sube al menos una imagen")
        .max(15, "No puedes subir más de 15 imágenes"),
    aerialImages: z.array(ImageMetadataSchema).optional(),
    documentImages: z.array(ImageMetadataSchema).optional(),
});

// Step 4: Preview Schema for Land
export const LandStep4Schema = z.object({
    status: z.enum(["draft", "published"]).default("draft"),
    language: z.enum(["es", "en"]).default("es"),
    aiGenerated: z.object({
        name: z.boolean().default(false),
        description: z.boolean().default(false),
        characteristics: z.boolean().default(false),
    }).default({
        name: false,
        description: false,
        characteristics: false,
    }),
    tags: z.array(z.string()).optional(),
    seoTitle: z.string().max(60).optional(),
    seoDescription: z.string().max(160).optional(),
});

// Complete Land Form Schema
export const LandFormDataSchema = z.object({
    // Step 1 fields
    name: LandStep1Schema.shape.name,
    title: LandStep1Schema.shape.name, // Alias for compatibility with WizardData
    description: LandStep1Schema.shape.description,
    price: LandStep1Schema.shape.price,
    surface: LandStep1Schema.shape.surface,
    landType: LandStep1Schema.shape.landType,
    zoning: LandStep1Schema.shape.zoning,
    utilities: LandStep1Schema.shape.utilities,
    characteristics: LandStep1Schema.shape.characteristics,

    // Step 2 fields
    location: LandStep2Schema.shape.location,
    coordinates: LandStep2Schema.shape.coordinates,
    address: LandStep2Schema.shape.address,
    accessRoads: LandStep2Schema.shape.accessRoads,
    nearbyLandmarks: LandStep2Schema.shape.nearbyLandmarks,

    // Step 3 fields
    images: LandStep3Schema.shape.images,
    aerialImages: LandStep3Schema.shape.aerialImages,
    documentImages: LandStep3Schema.shape.documentImages,

    // Step 4 fields
    status: LandStep4Schema.shape.status.default("draft"),
    language: LandStep4Schema.shape.language.default("es"),
    aiGenerated: LandStep4Schema.shape.aiGenerated.default({
        name: false,
        description: false,
        characteristics: false,
    }),
    tags: LandStep4Schema.shape.tags,
    seoTitle: LandStep4Schema.shape.seoTitle,
    seoDescription: LandStep4Schema.shape.seoDescription,
});

// Partial schemas for draft validation
export const PartialLandStep1Schema = LandStep1Schema.partial();
export const PartialLandStep2Schema = LandStep2Schema.partial();
export const PartialLandStep3Schema = LandStep3Schema.partial();
export const PartialLandStep4Schema = LandStep4Schema.partial();

// Draft schema (all fields optional)
export const LandDraftSchema = LandFormDataSchema.partial();

// Land wizard state schema
export const LandWizardStateSchema = z.object({
    currentStep: z.number().min(1).max(4),
    formData: LandDraftSchema,
    isValid: z.record(z.number(), z.boolean()),
    isDirty: z.boolean(),
    isLoading: z.boolean(),
    errors: z.record(z.string(), z.string()),
});

// AI Service schema for land
export const LandBasicInfoSchema = z.object({
    landType: z.string(),
    location: z.string(),
    price: z.number().positive(),
    surface: z.number().positive(),
    characteristics: z.array(z.string()),
    zoning: z.string().optional(),
    utilities: z.array(z.string()).optional(),
});

// Validation helper functions for land wizard
export function validateLandStep(stepNumber: number, data: any): { success: boolean; errors?: any } {
    try {
        let dataToValidate = data;

        // Apply defaults for step 4 (preview) to ensure required fields are present
        if (stepNumber === 4) {
            dataToValidate = {
                ...data,
                status: data.status || "draft",
                aiGenerated: data.aiGenerated || {
                    name: false,
                    description: false,
                    characteristics: false,
                },
            };
        }

        switch (stepNumber) {
            case 1:
                LandStep1Schema.parse(dataToValidate);
                break;
            case 2:
                LandStep2Schema.parse(dataToValidate);
                break;
            case 3:
                LandStep3Schema.parse(dataToValidate);
                break;
            case 4:
                LandStep4Schema.parse(dataToValidate);
                break;
            default:
                return { success: false, errors: { step: "Paso inválido" } };
        }
        return { success: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, errors: error.flatten().fieldErrors };
        }
        return { success: false, errors: { general: "Error de validación" } };
    }
}

export function validatePartialLandStep(stepNumber: number, data: any): { success: boolean; errors?: any } {
    try {
        let dataToValidate = data;

        // Apply defaults for step 4 (preview) to ensure required fields are present
        if (stepNumber === 4) {
            dataToValidate = {
                ...data,
                status: data.status || "draft",
                aiGenerated: data.aiGenerated || {
                    name: false,
                    description: false,
                    characteristics: false,
                },
            };
        }

        switch (stepNumber) {
            case 1:
                PartialLandStep1Schema.parse(dataToValidate);
                break;
            case 2:
                PartialLandStep2Schema.parse(dataToValidate);
                break;
            case 3:
                PartialLandStep3Schema.parse(dataToValidate);
                break;
            case 4:
                PartialLandStep4Schema.parse(dataToValidate);
                break;
            default:
                return { success: false, errors: { step: "Paso inválido" } };
        }
        return { success: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, errors: error.flatten().fieldErrors };
        }
        return { success: false, errors: { general: "Error de validación" } };
    }
}

// Type exports
export type LandFormData = z.infer<typeof LandFormDataSchema>;
export type LandDraftData = z.infer<typeof LandDraftSchema>;
export type LandWizardState = z.infer<typeof LandWizardStateSchema>;
export type LandCharacteristic = z.infer<typeof LandCharacteristicSchema>;