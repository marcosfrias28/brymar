import type {
	BulkImportData,
	PropertyFormData,
	PropertyTemplate,
} from "@/types/template";

export class TemplateService {
	private static readonly DEFAULT_TEMPLATES: PropertyTemplate[] = [
		{
			id: "residential-house",
			name: "Casa Residencial",
			description: "Plantilla para casas residenciales típicas",
			category: "residential",
			propertyType: "house",
			defaultData: {
				title: "Casa en [Ubicación]",
				description:
					"Hermosa casa residencial con excelente ubicación y acabados de calidad.",
				surface: 150,
				bedrooms: 3,
				bathrooms: 2,
				characteristics: ["parking", "garden", "security"],
				language: "es",
				status: "draft",
			},
			characteristics: ["parking", "garden", "security", "terrace", "laundry"],
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: "luxury-villa",
			name: "Villa de Lujo",
			description: "Plantilla para propiedades de lujo y villas",
			category: "luxury",
			propertyType: "villa",
			defaultData: {
				title: "Villa de Lujo en [Ubicación]",
				description:
					"Exclusiva villa de lujo con amenidades premium y vistas espectaculares.",
				surface: 400,
				bedrooms: 5,
				bathrooms: 4,
				characteristics: [
					"pool",
					"ocean_view",
					"gym",
					"wine_cellar",
					"smart_home",
				],
				language: "es",
				status: "draft",
			},
			characteristics: [
				"pool",
				"ocean_view",
				"gym",
				"wine_cellar",
				"smart_home",
				"elevator",
				"spa",
			],
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: "commercial-office",
			name: "Oficina Comercial",
			description: "Plantilla para espacios comerciales y oficinas",
			category: "commercial",
			propertyType: "commercial",
			defaultData: {
				title: "Oficina Comercial en [Ubicación]",
				description:
					"Moderno espacio comercial ideal para oficinas con excelente conectividad.",
				surface: 100,
				characteristics: [
					"air_conditioning",
					"elevator",
					"parking",
					"security",
				],
				language: "es",
				status: "draft",
			},
			characteristics: [
				"air_conditioning",
				"elevator",
				"parking",
				"security",
				"conference_room",
			],
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: "land-plot",
			name: "Terreno",
			description: "Plantilla para terrenos y lotes",
			category: "land",
			propertyType: "land",
			defaultData: {
				title: "Terreno en [Ubicación]",
				description:
					"Excelente terreno con potencial de desarrollo en ubicación privilegiada.",
				surface: 500,
				characteristics: ["utilities_ready", "flat_terrain", "road_access"],
				language: "es",
				status: "draft",
			},
			characteristics: [
				"utilities_ready",
				"flat_terrain",
				"road_access",
				"corner_lot",
				"development_potential",
			],
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	];

	static getTemplates(): PropertyTemplate[] {
		return TemplateService.DEFAULT_TEMPLATES.filter(
			(template) => template.isActive
		);
	}

	static getTemplateById(id: string): PropertyTemplate | null {
		return (
			TemplateService.DEFAULT_TEMPLATES.find(
				(template) => template.id === id
			) || null
		);
	}

	static getTemplatesByCategory(
		category: PropertyTemplate["category"]
	): PropertyTemplate[] {
		return TemplateService.DEFAULT_TEMPLATES.filter(
			(template) => template.category === category && template.isActive
		);
	}

	static applyTemplate(
		template: PropertyTemplate,
		customData?: Partial<PropertyFormData>
	): PropertyFormData {
		const baseData = {
			...template.defaultData,
			images: [],
			characteristics: [...template.characteristics],
		};

		if (customData) {
			return {
				...baseData,
				...customData,
				characteristics: [
					...new Set([
						...baseData.characteristics,
						...(customData.characteristics || []),
					]),
				],
			} as PropertyFormData;
		}

		return baseData as PropertyFormData;
	}

	static validateBulkImportData(
		data: Partial<PropertyFormData>[]
	): BulkImportData["validationResults"] {
		const errors: Array<{ row: number; field: string; message: string }> = [];
		let valid = 0;
		let invalid = 0;

		data.forEach((property, index) => {
			const row = index + 1;
			let hasErrors = false;

			// Required field validations
			if (!property.title || property.title.trim().length < 10) {
				errors.push({
					row,
					field: "title",
					message: "El título debe tener al menos 10 caracteres",
				});
				hasErrors = true;
			}

			if (!property.price || property.price <= 0) {
				errors.push({
					row,
					field: "price",
					message: "El precio debe ser mayor a 0",
				});
				hasErrors = true;
			}

			if (!property.surface || property.surface <= 0) {
				errors.push({
					row,
					field: "surface",
					message: "La superficie debe ser mayor a 0",
				});
				hasErrors = true;
			}

			if (!property.propertyType) {
				errors.push({
					row,
					field: "propertyType",
					message: "El tipo de propiedad es requerido",
				});
				hasErrors = true;
			}

			if (!property.description || property.description.trim().length < 50) {
				errors.push({
					row,
					field: "description",
					message: "La descripción debe tener al menos 50 caracteres",
				});
				hasErrors = true;
			}

			if (hasErrors) {
				invalid++;
			} else {
				valid++;
			}
		});

		return { valid, invalid, errors };
	}

	static createCustomTemplate(
		name: string,
		description: string,
		category: PropertyTemplate["category"],
		baseData: Partial<PropertyFormData>
	): PropertyTemplate {
		return {
			id: `custom-${Date.now()}`,
			name,
			description,
			category,
			propertyType: baseData.propertyType || "house",
			defaultData: baseData,
			characteristics: baseData.characteristics || [],
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
	}
}
