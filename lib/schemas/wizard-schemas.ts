import { z } from "zod";
import { PropertyType } from "@/types/wizard";

// Base schemas for reusable types
export const CoordinatesSchema = z.object({
    latitude: z.number().min(17.5).max(19.9), // Dominican Republic bounds
    longitude: z.number().min(-72.0).max(-68.3),
});

export const AddressSchema = z.object({
    street: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
    city: z.string().min(2, "La ciudad debe tener al menos 2 caracteres"),
    province: z.string().min(2, "La provincia debe tener al menos 2 caracteres"),
    postalCode: z.string().optional(),
    country: z.literal("Dominican Republic"),
    formattedAddress: z.string().min(1),
});

export const PropertyCharacteristicSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    category: z.enum(["amenity", "feature", "location"]),
    selected: z.boolean(),
});

export const ImageMetadataSchema = z.object({
    id: z.string(),
    url: z.string().url("URL de imagen inválida"),
    filename: z.string().min(1),
    size: z.number().max(10 * 1024 * 1024, "La imagen no puede superar 10MB"),
    contentType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/, "Tipo de archivo no válido"),
    width: z.number().optional(),
    height: z.number().optional(),
    displayOrder: z.number().min(0),
});

export const VideoMetadataSchema = z.object({
    id: z.string(),
    url: z.string().url("URL de video inválida"),
    filename: z.string().min(1),
    size: z.number().max(100 * 1024 * 1024, "El video no puede superar 100MB"),
    contentType: z.string().regex(/^video\/(mp4|webm|ogg)$/, "Tipo de video no válido"),
    duration: z.number().optional(),
    displayOrder: z.number().min(0),
});

// Step 1: General Information Schema
export const Step1Schema = z.object({
    title: z
        .string()
        .min(10, "El título debe tener al menos 10 caracteres")
        .max(100, "El título no puede superar 100 caracteres"),
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
    propertyType: z.nativeEnum(PropertyType, {
        errorMap: () => ({ message: "Selecciona un tipo de propiedad válido" }),
    }),
    bedrooms: z.number().min(0).max(50).optional(),
    bathrooms: z.number().min(0).max(50).optional(),
    characteristics: z
        .array(PropertyCharacteristicSchema)
        .min(1, "Selecciona al menos una característica"),
});

// Step 2: Location Schema
export const Step2Schema = z.object({
    coordinates: CoordinatesSchema,
    address: AddressSchema,
});

// Step 3: Media Schema
export const Step3Schema = z.object({
    images: z
        .array(ImageMetadataSchema)
        .min(1, "Sube al menos una imagen")
        .max(20, "No puedes subir más de 20 imágenes"),
    videos: z.array(VideoMetadataSchema).max(5, "No puedes subir más de 5 videos").optional(),
});

// Step 4: Meta Schema (for final validation)
export const Step4Schema = z.object({
    status: z.enum(["draft", "published"]).default("draft"),
    language: z.enum(["es", "en"]).default("es"),
    aiGenerated: z.object({
        title: z.boolean().default(false),
        description: z.boolean().default(false),
        tags: z.boolean().default(false),
    }).default({
        title: false,
        description: false,
        tags: false,
    }),
});

// Complete Property Form Schema
export const PropertyFormDataSchema = z.object({
    // Step 1 fields
    title: Step1Schema.shape.title,
    description: Step1Schema.shape.description,
    price: Step1Schema.shape.price,
    surface: Step1Schema.shape.surface,
    propertyType: Step1Schema.shape.propertyType,
    bedrooms: Step1Schema.shape.bedrooms,
    bathrooms: Step1Schema.shape.bathrooms,
    characteristics: Step1Schema.shape.characteristics,

    // Step 2 fields
    coordinates: Step2Schema.shape.coordinates,
    address: Step2Schema.shape.address,

    // Step 3 fields
    images: Step3Schema.shape.images,
    videos: Step3Schema.shape.videos,

    // Step 4 fields
    status: Step4Schema.shape.status.default("draft"),
    language: Step4Schema.shape.language.default("es"),
    aiGenerated: Step4Schema.shape.aiGenerated.default({
        title: false,
        description: false,
        tags: false,
    }),
});

// Partial schemas for draft validation
export const PartialStep1Schema = Step1Schema.partial();
export const PartialStep2Schema = Step2Schema.partial();
export const PartialStep3Schema = Step3Schema.partial();
export const PartialStep4Schema = Step4Schema.partial();

// Draft schema (all fields optional)
export const PropertyDraftSchema = PropertyFormDataSchema.partial();

// Wizard state schema
export const WizardStateSchema = z.object({
    currentStep: z.number().min(1).max(4),
    formData: PropertyDraftSchema,
    isValid: z.record(z.number(), z.boolean()),
    isDirty: z.boolean(),
    isLoading: z.boolean(),
    errors: z.record(z.string(), z.string()),
});

// AI Service schemas
export const PropertyBasicInfoSchema = z.object({
    type: z.string(),
    location: z.string(),
    price: z.number().positive(),
    surface: z.number().positive(),
    characteristics: z.array(z.string()),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
});

// Upload service schemas
export const SignedUrlResponseSchema = z.object({
    uploadUrl: z.string().url(),
    publicUrl: z.string().url(),
    expiresAt: z.date(),
});

export const UploadResultSchema = z.object({
    url: z.string().url(),
    filename: z.string(),
    size: z.number().positive(),
    contentType: z.string(),
});

// Validation helper functions
export function validateStep(stepNumber: number, data: any): { success: boolean; errors?: any } {
    try {
        let dataToValidate = data;

        // Apply defaults for step 4 (preview) to ensure required fields are present
        if (stepNumber === 4) {
            dataToValidate = {
                ...data,
                status: data.status || "draft",
                aiGenerated: data.aiGenerated || {
                    title: false,
                    description: false,
                    tags: false,
                },
            };
        }

        switch (stepNumber) {
            case 1:
                Step1Schema.parse(dataToValidate);
                break;
            case 2:
                Step2Schema.parse(dataToValidate);
                break;
            case 3:
                Step3Schema.parse(dataToValidate);
                break;
            case 4:
                Step4Schema.parse(dataToValidate);
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

export function validatePartialStep(stepNumber: number, data: any): { success: boolean; errors?: any } {
    try {
        let dataToValidate = data;

        // Apply defaults for step 4 (preview) to ensure required fields are present
        if (stepNumber === 4) {
            dataToValidate = {
                ...data,
                status: data.status || "draft",
                aiGenerated: data.aiGenerated || {
                    title: false,
                    description: false,
                    tags: false,
                },
            };
        }

        switch (stepNumber) {
            case 1:
                PartialStep1Schema.parse(dataToValidate);
                break;
            case 2:
                PartialStep2Schema.parse(dataToValidate);
                break;
            case 3:
                PartialStep3Schema.parse(dataToValidate);
                break;
            case 4:
                PartialStep4Schema.parse(dataToValidate);
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