import type { PropertyFormData } from '@/types/wizard';

/**
 * Validate final property data before publishing
 */
export function validatePropertyForPublication(
    data: Partial<PropertyFormData>
): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!data.title || data.title.length < 10) {
        errors.push("El título debe tener al menos 10 caracteres");
    }

    if (!data.description || data.description.length < 50) {
        errors.push("La descripción debe tener al menos 50 caracteres");
    }

    if (!data.price || data.price <= 0) {
        errors.push("El precio debe ser mayor a 0");
    }

    if (!data.surface || data.surface <= 0) {
        errors.push("La superficie debe ser mayor a 0");
    }

    if (!data.propertyType) {
        errors.push("Selecciona un tipo de propiedad");
    }

    if (!data.coordinates || !data.address) {
        errors.push("La ubicación es requerida");
    }

    if (!data.images || data.images.length === 0) {
        errors.push("Sube al menos una imagen");
    }

    if (!data.characteristics || data.characteristics.length === 0) {
        errors.push("Selecciona al menos una característica");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Calculate completion percentage based on form data
 */
export function calculateCompletionPercentage(formData: Record<string, any>): number {
    let completedFields = 0;
    let totalFields = 0;

    // Step 1: General Information (6 fields)
    const step1Fields = [
        "title",
        "description",
        "price",
        "surface",
        "propertyType",
        "characteristics",
    ];
    step1Fields.forEach((field) => {
        totalFields++;
        if (formData[field]) {
            if (field === "characteristics" && Array.isArray(formData[field])) {
                if (formData[field].length > 0) completedFields++;
            } else {
                completedFields++;
            }
        }
    });

    // Step 2: Location (2 fields)
    const step2Fields = ["coordinates", "address"];
    step2Fields.forEach((field) => {
        totalFields++;
        if (formData[field]) completedFields++;
    });

    // Step 3: Media (1 field)
    totalFields++;
    if (formData.images && Array.isArray(formData.images) && formData.images.length > 0) {
        completedFields++;
    }

    // Step 4: Meta (3 fields)
    const step4Fields = ["status", "language", "aiGenerated"];
    step4Fields.forEach((field) => {
        totalFields++;
        if (formData[field]) completedFields++;
    });

    return Math.round((completedFields / totalFields) * 100);
}