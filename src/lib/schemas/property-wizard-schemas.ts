// Property Wizard Validation Schemas for New Framework

import { z } from "zod";
import { PropertyType } from "@/types/wizard";

// Geographic constants
const MIN_LATITUDE = 17.5;
const MAX_LATITUDE = 19.9;
const MIN_LONGITUDE = -72.0;
const MAX_LONGITUDE = -68.3;

// Address validation constants
const MIN_STREET_LENGTH = 5;
const MIN_CITY_LENGTH = 2;
const MIN_STATE_LENGTH = 2;
const MIN_COUNTRY_LENGTH = 2;

// Content validation constants
const MIN_TITLE_LENGTH = 10;
const MAX_TITLE_LENGTH = 100;
const MIN_DESCRIPTION_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_PRICE = 999_999_999;
const MAX_SURFACE = 999_999;

// Property feature limits
const MAX_BEDROOMS = 50;
const MAX_BATHROOMS = 50;
const MAX_CHARACTERISTICS = 20;

// Media limits
const MAX_IMAGES = 20;
const MAX_VIDEOS = 10;

// Base schemas for reusable types
export const CoordinatesSchema = z.object({
	latitude: z.number().min(MIN_LATITUDE).max(MAX_LATITUDE), // Dominican Republic bounds
	longitude: z.number().min(MIN_LONGITUDE).max(MAX_LONGITUDE),
});

export const AddressSchema = z.object({
	street: z.string().min(
		MIN_STREET_LENGTH,
		`La dirección debe tener al menos ${MIN_STREET_LENGTH} caracteres`
	),
	city: z.string().min(
		MIN_CITY_LENGTH,
		`La ciudad debe tener al menos ${MIN_CITY_LENGTH} caracteres`
	),
	province: z.string().min(
		MIN_STATE_LENGTH,
		`La provincia debe tener al menos ${MIN_STATE_LENGTH} caracteres`
	),
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
	contentType: z
		.string()
		.regex(/^image\/(jpeg|jpg|png|webp)$/, "Tipo de archivo no válido"),
	width: z.number().optional(),
	height: z.number().optional(),
	displayOrder: z.number().min(0),
});

export const VideoMetadataSchema = z.object({
	id: z.string(),
	url: z.string().url("URL de video inválida"),
	filename: z.string().min(1),
	size: z.number().max(100 * 1024 * 1024, "El video no puede superar 100MB"),
	contentType: z
		.string()
		.regex(/^video\/(mp4|webm|ogg)$/, "Tipo de video no válido"),
	duration: z.number().optional(),
	displayOrder: z.number().min(0),
});

// Step 1: General Information Schema
export const PropertyGeneralSchema = z.object({
	title: z
		.string()
		.min(MIN_TITLE_LENGTH, `El título debe tener al menos ${MIN_TITLE_LENGTH} caracteres`)
		.max(MAX_TITLE_LENGTH, `El título no puede superar ${MAX_TITLE_LENGTH} caracteres`),
	description: z
		.string()
		.min(MIN_DESCRIPTION_LENGTH, `La descripción debe tener al menos ${MIN_DESCRIPTION_LENGTH} caracteres`)
		.max(MAX_DESCRIPTION_LENGTH, `La descripción no puede superar ${MAX_DESCRIPTION_LENGTH} caracteres`),
	price: z
		.number()
		.positive("El precio debe ser mayor a 0")
		.max(MAX_PRICE, "El precio es demasiado alto"),
	surface: z
		.number()
		.positive("La superficie debe ser mayor a 0")
		.max(MAX_SURFACE, "La superficie es demasiado grande"),
	propertyType: z.nativeEnum(PropertyType, {
		message: "Selecciona un tipo de propiedad válido",
	}),
	bedrooms: z.number().min(0).max(MAX_BEDROOMS).optional(),
	bathrooms: z.number().min(0).max(MAX_BATHROOMS).optional(),
	characteristics: z
		.array(z.string())
		.max(
			MAX_CHARACTERISTICS,
			`No puede haber más de ${MAX_CHARACTERISTICS} características`
		),
});

// Lenient version for draft validation
export const PropertyGeneralDraftSchema = z.object({
	title: z.string().optional(),
	description: z.string().optional(),
	price: z.number().positive().optional(),
	surface: z.number().positive().optional(),
	propertyType: z.nativeEnum(PropertyType).optional(),
	bedrooms: z.number().min(0).max(MAX_BEDROOMS).optional(),
	bathrooms: z.number().min(0).max(MAX_BATHROOMS).optional(),
	characteristics: z.array(z.string()).optional(),
});

// Geometry schemas (GeoJSON-like)
const PositionSchema = z.tuple([z.number(), z.number()]); // [lng, lat]
export const PointGeometrySchema = z.object({
	type: z.literal("Point"),
	coordinates: PositionSchema,
});

export const PolygonGeometrySchema = z.object({
	type: z.literal("Polygon"),
	coordinates: z.array(z.array(PositionSchema)), // Array of linear rings
});

export const GeometrySchema = z.union([
	PointGeometrySchema,
	PolygonGeometrySchema,
]);

// Step 2: Location Schema
export const PropertyLocationSchema = z.object({
	coordinates: CoordinatesSchema.optional(),
	address: AddressSchema.optional(),
	geometry: GeometrySchema.optional(),
});

// Step 3: Media Schema
export const PropertyMediaSchema = z.object({
	images: z
		.array(ImageMetadataSchema)
		.min(1, "Sube al menos una imagen")
		.max(MAX_IMAGES, `No puedes subir más de ${MAX_IMAGES} imágenes`),
	videos: z
		.array(VideoMetadataSchema)
		.max(MAX_VIDEOS, `No puedes subir más de ${MAX_VIDEOS} videos`)
		.optional(),
});

// Complete Property Schema
export const PropertyCompleteSchema = z.object({
	// Base wizard data
	id: z.string().optional(),
	title: PropertyGeneralSchema.shape.title,
	description: PropertyGeneralSchema.shape.description,
	status: z.enum(["draft", "published"]).default("draft"),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),

	// Property-specific fields
	price: PropertyGeneralSchema.shape.price,
	surface: PropertyGeneralSchema.shape.surface,
	propertyType: PropertyGeneralSchema.shape.propertyType,
	bedrooms: PropertyGeneralSchema.shape.bedrooms,
	bathrooms: PropertyGeneralSchema.shape.bathrooms,
	characteristics: PropertyGeneralSchema.shape.characteristics,
	coordinates: PropertyLocationSchema.shape.coordinates,
	address: PropertyLocationSchema.shape.address,
	geometry: PropertyLocationSchema.shape.geometry,
	images: PropertyMediaSchema.shape.images,
	videos: PropertyMediaSchema.shape.videos,
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

// Partial schemas for draft validation
export const PartialPropertyGeneralSchema = PropertyGeneralSchema.partial();
export const PartialPropertyLocationSchema = PropertyLocationSchema.partial();
export const PartialPropertyMediaSchema = PropertyMediaSchema.partial();

// Lenient draft schemas for step validation
export const PropertyLocationDraftSchema = z.object({
	coordinates: CoordinatesSchema.optional(),
	address: AddressSchema.optional(),
});

export const PropertyMediaDraftSchema = z.object({
	images: z.array(ImageMetadataSchema).optional(),
	videos: z.array(VideoMetadataSchema).optional(),
});

// Draft schema (all fields optional with minimal validation)
export const PropertyDraftSchema = z.object({
	// Base wizard data (optional for drafts)
	id: z.string().optional(),
	title: z.string().optional(),
	description: z.string().optional(),
	status: z.enum(["draft", "published"]).default("draft"),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),

	// Property-specific fields (all optional for drafts)
	price: z.number().optional(),
	surface: z.number().optional(),
	propertyType: z.nativeEnum(PropertyType).optional(),
	bedrooms: z.number().optional(),
	bathrooms: z.number().optional(),
	characteristics: z.array(z.string()).optional(),
	coordinates: CoordinatesSchema.optional(),
	address: AddressSchema.optional(),
	geometry: GeometrySchema.optional(),
	images: z.array(ImageMetadataSchema).optional(),
	videos: z.array(VideoMetadataSchema).optional(),
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
