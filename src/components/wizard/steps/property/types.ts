import { z } from "zod";

// Validation constants
export const MIN_TITLE_LENGTH = 5;
export const MAX_TITLE_LENGTH = 100;
export const MIN_DESCRIPTION_LENGTH = 20;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const MAX_PRICE = 10_000_000;
export const MAX_SURFACE = 10_000;
export const MAX_BEDROOMS = 20;
export const MAX_BATHROOMS = 20;
export const MAX_CHARACTERISTICS = 20;
export const MAX_IMAGES = 50;
export const MAX_VIDEOS = 10;
export const MIN_STREET_LENGTH = 5;
export const MIN_CITY_LENGTH = 2;
export const MIN_STATE_LENGTH = 2;
export const MIN_COUNTRY_LENGTH = 2;
export const MIN_LAT = -90;
export const MAX_LAT = 90;
export const MIN_LNG = -180;
export const MAX_LNG = 180;

// Enhanced property wizard schema with better validation
export const PropertyWizardSchema = z.object({
	// Base info
	title: z
		.string()
		.min(
			MIN_TITLE_LENGTH,
			`El título debe tener al menos ${MIN_TITLE_LENGTH} caracteres`
		)
		.max(
			MAX_TITLE_LENGTH,
			`El título no puede exceder ${MAX_TITLE_LENGTH} caracteres`
		),
	description: z
		.string()
		.min(
			MIN_DESCRIPTION_LENGTH,
			`La descripción debe tener al menos ${MIN_DESCRIPTION_LENGTH} caracteres`
		)
		.max(
			MAX_DESCRIPTION_LENGTH,
			`La descripción no puede exceder ${MAX_DESCRIPTION_LENGTH} caracteres`
		),
	price: z
		.number()
		.min(1, "El precio debe ser mayor a 0")
		.max(MAX_PRICE, `El precio no puede exceder ${MAX_PRICE}`),
	surface: z
		.number()
		.min(1, "La superficie debe ser mayor a 0")
		.max(MAX_SURFACE, `La superficie no puede exceder ${MAX_SURFACE}`),

	// Property details
	propertyType: z.enum(["apartment", "house", "commercial", "land", "other"]),
	rooms: z.number().min(0).max(MAX_BEDROOMS).optional(),
	bedrooms: z.number().min(0).max(MAX_BEDROOMS).optional(),
	bathrooms: z.number().min(0).max(MAX_BATHROOMS).optional(),

	// Location
	address: z.object({
		street: z
			.string()
			.min(
				MIN_STREET_LENGTH,
				`La calle debe tener al menos ${MIN_STREET_LENGTH} caracteres`
			),
		city: z
			.string()
			.min(
				MIN_CITY_LENGTH,
				`La ciudad debe tener al menos ${MIN_CITY_LENGTH} caracteres`
			),
		state: z
			.string()
			.min(
				MIN_STATE_LENGTH,
				`La provincia debe tener al menos ${MIN_STATE_LENGTH} caracteres`
			),
		country: z
			.string()
			.min(
				MIN_COUNTRY_LENGTH,
				`El país debe tener al menos ${MIN_COUNTRY_LENGTH} caracteres`
			),
		postalCode: z.string().optional(),
	}),
	coordinates: z
		.object({
			lat: z.number().min(MIN_LAT).max(MAX_LAT).optional(),
			lng: z.number().min(MIN_LNG).max(MAX_LNG).optional(),
		})
		.optional(),

	// Features
	characteristics: z
		.array(z.string())
		.max(
			MAX_CHARACTERISTICS,
			`No puede haber más de ${MAX_CHARACTERISTICS} características`
		),

	// Media
	images: z
		.array(
			z.object({
				url: z.string().url(),
				filename: z.string(),
				size: z.number(),
				contentType: z.string(),
			})
		)
		.max(MAX_IMAGES, `No puede haber más de ${MAX_IMAGES} imágenes`),
	videos: z
		.array(
			z.object({
				url: z.string().url(),
				title: z.string().optional(),
			})
		)
		.max(MAX_VIDEOS, `No puede haber más de ${MAX_VIDEOS} videos`),

	// Metadata
	language: z.enum(["es", "en"]).default("es"),
	aiGenerated: z
		.object({
			title: z.boolean().default(false),
			description: z.boolean().default(false),
			tags: z.boolean().default(false),
		})
		.default({
			title: false,
			description: false,
			tags: false,
		}),
});

// Type inference
export type PropertyWizardData = z.infer<typeof PropertyWizardSchema>;

// Step props type
export type PropertyStepProps = {
	data: PropertyWizardData;
	onChange: (data: PropertyWizardData) => void;
	errors?: Record<string, string>;
};
