/**
 * Validation Error Handler
 * Provides comprehensive error handling and user-friendly messages for validation failures
 */

import { ZodError, ZodIssue } from 'zod';

export interface ValidationErrorDetails {
    field: string;
    message: string;
    code: string;
    value?: any;
}

export interface ValidationResult {
    success: boolean;
    errors: ValidationErrorDetails[];
    fieldErrors: Record<string, string[]>;
    summary: string;
}

/**
 * Processes Zod validation errors into user-friendly format
 */
export function processValidationError(error: ZodError): ValidationResult {
    const errors: ValidationErrorDetails[] = [];
    const fieldErrors: Record<string, string[]> = {};

    for (const issue of error.issues) {
        const field = issue.path.join('.');
        const errorDetail: ValidationErrorDetails = {
            field,
            message: getCustomErrorMessage(issue),
            code: issue.code,
            value: 'received' in issue ? issue.received : ('input' in issue ? issue.input : undefined)
        };

        errors.push(errorDetail);

        if (!fieldErrors[field]) {
            fieldErrors[field] = [];
        }
        fieldErrors[field].push(errorDetail.message);
    }

    return {
        success: false,
        errors,
        fieldErrors,
        summary: generateErrorSummary(errors)
    };
}

/**
 * Generates custom error messages based on field context
 */
function getCustomErrorMessage(issue: ZodIssue): string {
    const field = issue.path.join('.');

    // Handle type conversion errors specifically
    if (issue.code === 'invalid_type') {
        return getTypeErrorMessage(field, issue as any);
    }

    // Handle range/validation errors
    if (issue.code === 'too_small' || issue.code === 'too_big') {
        return getRangeErrorMessage(field, issue as any);
    }

    // Handle custom validation errors
    if (issue.code === 'custom') {
        return issue.message || `Validation failed for ${field}`;
    }

    // Handle enum errors
    if (issue.code === 'invalid_enum_value') {
        return getEnumErrorMessage(field, issue as any);
    }

    // Default to the original message
    return issue.message;
}

/**
 * Generates type-specific error messages
 */
function getTypeErrorMessage(field: string, issue: any): string {
    const fieldName = getFieldDisplayName(field);

    if (issue.expected === 'number') {
        if (issue.received === 'string') {
            return `${fieldName} debe ser un número válido`;
        }
        return `${fieldName} debe ser un número`;
    }

    if (issue.expected === 'string') {
        if (issue.received === 'number') {
            return `${fieldName} debe ser texto`;
        }
        return `${fieldName} es requerido`;
    }

    if (issue.expected === 'boolean') {
        return `${fieldName} debe ser verdadero o falso`;
    }

    if (issue.expected === 'array') {
        return `${fieldName} debe ser una lista`;
    }

    if (issue.expected === 'object') {
        return `${fieldName} debe ser un objeto válido`;
    }

    return `${fieldName} tiene un tipo de dato incorrecto`;
}

/**
 * Generates range-specific error messages
 */
function getRangeErrorMessage(field: string, issue: any): string {
    const fieldName = getFieldDisplayName(field);

    if (issue.code === 'too_small') {
        if (issue.type === 'string') {
            return `${fieldName} debe tener al menos ${issue.minimum} caracteres`;
        }
        if (issue.type === 'number') {
            return `${fieldName} debe ser al menos ${issue.minimum}`;
        }
        if (issue.type === 'array') {
            return `${fieldName} debe tener al menos ${issue.minimum} elementos`;
        }
    }

    if (issue.code === 'too_big') {
        if (issue.type === 'string') {
            return `${fieldName} no puede exceder ${issue.maximum} caracteres`;
        }
        if (issue.type === 'number') {
            return `${fieldName} no puede ser mayor a ${issue.maximum}`;
        }
        if (issue.type === 'array') {
            return `${fieldName} no puede tener más de ${issue.maximum} elementos`;
        }
    }

    return issue.message;
}

/**
 * Generates enum-specific error messages
 */
function getEnumErrorMessage(field: string, issue: any): string {
    const fieldName = getFieldDisplayName(field);

    if (field === 'status') {
        return `Estado debe ser "en venta" o "en alquiler"`;
    }

    if (field === 'propertyType') {
        return `Tipo de propiedad no válido`;
    }

    if (field === 'language') {
        return `Idioma debe ser español o inglés`;
    }

    return `${fieldName} tiene un valor no válido`;
}

/**
 * Converts field names to user-friendly display names
 */
function getFieldDisplayName(field: string): string {
    const displayNames: Record<string, string> = {
        'title': 'Título',
        'description': 'Descripción',
        'price': 'Precio',
        'surface': 'Superficie',
        'area': 'Área',
        'bedrooms': 'Habitaciones',
        'bathrooms': 'Baños',
        'location': 'Ubicación',
        'propertyType': 'Tipo de propiedad',
        'status': 'Estado',
        'coordinates.latitude': 'Latitud',
        'coordinates.longitude': 'Longitud',
        'address.street': 'Dirección',
        'address.city': 'Ciudad',
        'address.province': 'Provincia',
        'address.postalCode': 'Código postal',
        'images': 'Imágenes',
        'videos': 'Videos',
        'characteristics': 'Características',
        'featured': 'Destacado',
        'active': 'Activo'
    };

    return displayNames[field] || field.charAt(0).toUpperCase() + field.slice(1);
}

/**
 * Generates a summary of validation errors
 */
function generateErrorSummary(errors: ValidationErrorDetails[]): string {
    if (errors.length === 0) {
        return 'No hay errores de validación';
    }

    if (errors.length === 1) {
        return `Error de validación: ${errors[0].message}`;
    }

    const fieldCount = new Set(errors.map(e => e.field)).size;

    if (fieldCount === 1) {
        return `${errors.length} errores en el campo ${getFieldDisplayName(errors[0].field)}`;
    }

    return `${errors.length} errores de validación en ${fieldCount} campos`;
}

/**
 * Checks if an error is related to type conversion
 */
export function isTypeConversionError(error: ZodError): boolean {
    return error.issues.some(issue =>
        issue.code === 'invalid_type' &&
        (
            (issue.expected === 'number' && issue.received === 'string') ||
            (issue.expected === 'string' && issue.received === 'number')
        )
    );
}

/**
 * Extracts field names that have type conversion errors
 */
export function getTypeConversionErrorFields(error: ZodError): string[] {
    return error.issues
        .filter(issue =>
            issue.code === 'invalid_type' &&
            (
                (issue.expected === 'number' && issue.received === 'string') ||
                (issue.expected === 'string' && issue.received === 'number')
            )
        )
        .map(issue => issue.path.join('.'));
}

/**
 * Provides suggestions for fixing validation errors
 */
export function getValidationSuggestions(errors: ValidationErrorDetails[]): string[] {
    const suggestions: string[] = [];

    for (const error of errors) {
        if (error.code === 'invalid_type' && error.field.match(/price|surface|bedrooms|bathrooms|area/)) {
            suggestions.push(`Asegúrate de que ${getFieldDisplayName(error.field)} sea un número válido`);
        }

        if (error.code === 'too_small' && error.field === 'title') {
            suggestions.push('El título debe ser más descriptivo');
        }

        if (error.code === 'too_small' && error.field === 'description') {
            suggestions.push('Agrega más detalles a la descripción de la propiedad');
        }

        if (error.field === 'images' && error.code === 'too_small') {
            suggestions.push('Sube al menos una imagen de la propiedad');
        }
    }

    return [...new Set(suggestions)]; // Remove duplicates
}

/**
 * Formats validation errors for API responses
 */
export function formatValidationErrorResponse(error: ZodError) {
    const result = processValidationError(error);

    return {
        success: false,
        message: result.summary,
        errors: result.fieldErrors,
        suggestions: getValidationSuggestions(result.errors),
        details: result.errors
    };
}