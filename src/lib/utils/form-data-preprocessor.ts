/**
 * Form Data Preprocessing Utilities
 * Handles type conversion and validation preprocessing for form submissions
 */

/**
 * Preprocesses FormData to ensure consistent type handling
 * Converts string representations of numbers and booleans to proper types
 */
export function preprocessFormData(formData: FormData): Record<string, any> {
	const processed: Record<string, any> = {};

	for (const [key, value] of formData.entries()) {
		if (typeof value === "string") {
			// Handle numeric fields
			if (isNumericField(key) && value.trim() !== "") {
				const numValue = parseFloat(value);
				if (!Number.isNaN(numValue)) {
					processed[key] = numValue;
					continue;
				}
			}

			// Handle boolean fields
			if (isBooleanField(key)) {
				processed[key] = value === "true" || value === "1" || value === "on";
				continue;
			}

			// Handle JSON fields
			if (isJsonField(key) && value.trim() !== "") {
				try {
					processed[key] = JSON.parse(value);
					continue;
				} catch {
					// If JSON parsing fails, keep as string
				}
			}

			// Regular string field
			processed[key] = value;
		} else {
			// File or other non-string value
			processed[key] = value;
		}
	}

	return processed;
}

/**
 * Preprocesses regular object data to ensure consistent types
 */
export function preprocessObjectData(
	data: Record<string, any>,
): Record<string, any> {
	const processed: Record<string, any> = {};

	for (const [key, value] of Object.entries(data)) {
		if (typeof value === "string") {
			// Handle numeric fields that might be strings
			if (isNumericField(key) && value.trim() !== "") {
				const numValue = parseFloat(value);
				if (!Number.isNaN(numValue)) {
					processed[key] = numValue;
					continue;
				}
			}

			// Handle boolean fields that might be strings
			if (isBooleanField(key)) {
				processed[key] = value === "true" || value === "1" || value === "on";
				continue;
			}
		}

		processed[key] = value;
	}

	return processed;
}

/**
 * Determines if a field should be treated as numeric
 */
function isNumericField(fieldName: string): boolean {
	const numericFields = [
		"price",
		"surface",
		"area",
		"bedrooms",
		"bathrooms",
		"latitude",
		"longitude",
		"size",
		"width",
		"height",
		"displayOrder",
		"duration",
		"stepCompleted",
		"propertyId",
		"id",
		"page",
		"limit",
		"order",
		"currentStep",
		"completionPercentage",
	];

	return numericFields.some(
		(field) =>
			fieldName === field ||
			fieldName.endsWith(`_${field}`) ||
			fieldName.includes(field),
	);
}

/**
 * Determines if a field should be treated as boolean
 */
function isBooleanField(fieldName: string): boolean {
	const booleanFields = [
		"featured",
		"active",
		"isActive",
		"isDirty",
		"isLoading",
		"isValid",
		"aiGenerated",
		"selected",
	];

	return booleanFields.some(
		(field) =>
			fieldName === field ||
			fieldName.endsWith(`_${field}`) ||
			fieldName.startsWith(`${field}_`) ||
			fieldName.includes(field),
	);
}

/**
 * Determines if a field should be parsed as JSON
 */
function isJsonField(fieldName: string): boolean {
	const jsonFields = [
		"coordinates",
		"address",
		"images",
		"videos",
		"characteristics",
		"metadata",
		"settings",
	];

	return jsonFields.some(
		(field) =>
			fieldName === field ||
			fieldName.endsWith(`_${field}`) ||
			fieldName.includes(field),
	);
}

/**
 * Validates that required numeric fields are present and valid
 */
export function validateRequiredNumericFields(
	data: Record<string, any>,
	requiredFields: string[],
): { isValid: boolean; errors: string[] } {
	const errors: string[] = [];

	for (const field of requiredFields) {
		const value = data[field];

		if (value === undefined || value === null || value === "") {
			errors.push(`${field} is required`);
			continue;
		}

		if (typeof value === "string") {
			const numValue = parseFloat(value);
			if (Number.isNaN(numValue)) {
				errors.push(`${field} must be a valid number`);
			}
		} else if (typeof value !== "number") {
			errors.push(`${field} must be a number`);
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

/**
 * Converts string coordinates to proper coordinate object
 */
export function parseCoordinates(
	coordinatesStr: string,
): { latitude: number; longitude: number } | null {
	try {
		if (typeof coordinatesStr === "object") {
			return coordinatesStr as { latitude: number; longitude: number };
		}

		const parsed = JSON.parse(coordinatesStr);

		if (
			parsed &&
			typeof parsed.latitude === "number" &&
			typeof parsed.longitude === "number"
		) {
			return parsed;
		}

		return null;
	} catch {
		return null;
	}
}

/**
 * Safely converts a value to number with fallback
 */
export function safeNumberConversion(value: any, fallback: number = 0): number {
	if (typeof value === "number" && !Number.isNaN(value)) {
		return value;
	}

	if (typeof value === "string" && value.trim() !== "") {
		const parsed = parseFloat(value);
		if (!Number.isNaN(parsed)) {
			return parsed;
		}
	}

	return fallback;
}

/**
 * Safely converts a value to boolean with fallback
 */
export function safeBooleanConversion(
	value: any,
	fallback: boolean = false,
): boolean {
	if (typeof value === "boolean") {
		return value;
	}

	if (typeof value === "string") {
		const lower = value.toLowerCase().trim();
		return (
			lower === "true" || lower === "1" || lower === "on" || lower === "yes"
		);
	}

	if (typeof value === "number") {
		return value !== 0;
	}

	return fallback;
}
