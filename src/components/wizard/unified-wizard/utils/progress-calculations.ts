// Constants for progress calculation
export const PROGRESS_PERCENTAGE_MULTIPLIER = 100;

// Helper functions to count fields for different step types
export function countRelevantFields(
	stepId: string,
	data: Record<string, unknown>
): number {
	switch (stepId) {
		case "general":
			return countGeneralFields(data);
		case "location":
			return countLocationFields(data);
		case "media":
			return countMediaFields(data);
		default:
			return 0;
	}
}

export function countFilledFields(
	stepId: string,
	data: Record<string, unknown>,
	errors: Record<string, string> | null
): number {
	switch (stepId) {
		case "general":
			return countFilledGeneralFields(data, errors);
		case "location":
			return countFilledLocationFields(data, errors);
		case "media":
			return countFilledMediaFields(data);
		default:
			return 0;
	}
}

function countGeneralFields(data: Record<string, unknown>): number {
	let count = 0;
	if (data.title !== undefined) {
		count += 1;
	}
	if (data.description !== undefined) {
		count += 1;
	}
	if (data.price !== undefined) {
		count += 1;
	}
	if (data.surface !== undefined) {
		count += 1;
	}
	if (data.propertyType !== undefined) {
		count += 1;
	}
	if (data.bedrooms !== undefined) {
		count += 1;
	}
	if (data.bathrooms !== undefined) {
		count += 1;
	}
	if (data.characteristics !== undefined) {
		count += 1;
	}
	return count;
}

function countFilledGeneralFields(
	data: Record<string, unknown>,
	errors: Record<string, string> | null
): number {
	const filled =
		countStringFields(data, ["title", "description"]) +
		countNumberFields(data, ["price", "surface", "bedrooms", "bathrooms"]) +
		countEnumFields(data, ["propertyType"]) +
		countArrayFields(data, ["characteristics"]);

	// Subtract fields with errors
	const errorCount = errors ? Object.keys(errors).length : 0;
	return Math.max(0, filled - errorCount);
}

export function countStringFields(
	data: Record<string, unknown>,
	fieldNames: string[]
): number {
	return fieldNames.filter((name) => {
		const value = data[name];
		return typeof value === "string" && value.trim().length > 0;
	}).length;
}

export function countNumberFields(
	data: Record<string, unknown>,
	fieldNames: string[]
): number {
	return fieldNames.filter((name) => {
		const value = data[name];
		return typeof value === "number" && value > 0;
	}).length;
}

export function countEnumFields(
	data: Record<string, unknown>,
	fieldNames: string[]
): number {
	return fieldNames.filter(
		(name) => data[name] !== undefined && data[name] !== null
	).length;
}

export function countArrayFields(
	data: Record<string, unknown>,
	fieldNames: string[]
): number {
	return fieldNames.filter((name) => {
		const value = data[name];
		return Array.isArray(value) && value.length > 0;
	}).length;
}

function countLocationFields(data: Record<string, unknown>): number {
	return countObjectFields(data.address, ["street", "city", "state", "country", "postalCode"]) +
		countObjectFields(data.coordinates, ["lat", "lng"]);
}

function countObjectFields(obj: unknown, fieldNames: string[]): number {
	if (typeof obj !== "object" || obj === null) {
		return 0;
	}
	
	const record = obj as Record<string, unknown>;
	return fieldNames.filter((field) => record[field] !== undefined).length;
}

function countFilledLocationFields(
	data: Record<string, unknown>,
	errors: Record<string, string> | null
): number {
	const addressFilled = countAddressFields(data);
	const coordinatesFilled = countCoordinatesFields(data);
	const errorCount = errors ? Object.keys(errors).length : 0;

	return Math.max(0, addressFilled + coordinatesFilled - errorCount);
}

function countAddressFields(data: Record<string, unknown>): number {
	if (typeof data.address !== "object" || data.address === null) {
		return 0;
	}

	const address = data.address as Record<string, unknown>;
	const addressFields = ["street", "city", "state", "country", "postalCode"];

	return addressFields.filter((field) => {
		const value = address[field];
		return typeof value === "string" && value.trim().length > 0;
	}).length;
}

function countCoordinatesFields(data: Record<string, unknown>): number {
	if (typeof data.coordinates !== "object" || data.coordinates === null) {
		return 0;
	}

	const coordinates = data.coordinates as Record<string, unknown>;
	let filled = 0;

	if (typeof coordinates.lat === "number" && coordinates.lat !== 0) {
		filled += 1;
	}
	if (typeof coordinates.lng === "number" && coordinates.lng !== 0) {
		filled += 1;
	}

	return filled;
}

function countMediaFields(data: Record<string, unknown>): number {
	let count = 0;
	if (data.images !== undefined) {
		count += 1;
	}
	if (data.videos !== undefined) {
		count += 1;
	}
	return count;
}

function countFilledMediaFields(data: Record<string, unknown>): number {
	let filled = 0;
	if (Array.isArray(data.images) && data.images.length > 0) {
		filled += 1;
	}
	if (Array.isArray(data.videos) && data.videos.length > 0) {
		filled += 1;
	}
	return filled;
}
