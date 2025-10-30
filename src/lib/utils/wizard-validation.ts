/**
 * Calculate completion percentage based on form data
 */
export function calculateCompletionPercentage(
	formData: Record<string, any>
): number {
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
				if (formData[field].length > 0) {
					completedFields++;
				}
			} else {
				completedFields++;
			}
		}
	});

	// Step 2: Location (2 fields)
	const step2Fields = ["coordinates", "address"];
	step2Fields.forEach((field) => {
		totalFields++;
		if (formData[field]) {
			completedFields++;
		}
	});

	// Step 3: Media (1 field)
	totalFields++;
	if (
		formData.images &&
		Array.isArray(formData.images) &&
		formData.images.length > 0
	) {
		completedFields++;
	}

	// Step 4: Meta (3 fields)
	const step4Fields = ["status", "language", "aiGenerated"];
	step4Fields.forEach((field) => {
		totalFields++;
		if (formData[field]) {
			completedFields++;
		}
	});

	return Math.round((completedFields / totalFields) * 100);
}
