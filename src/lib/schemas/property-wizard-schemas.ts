// Property Wizard Validation Schemas for New Framework

import { z } from "zod";
import { PropertyType } from "@/types/property-wizard";

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
		.min(10, "El título debe tener al menos 10 caracteres")
		.max(100, "El título no puede superar 100 caracteres"),
	description: z
		.string()
		.min(50, "La descripción debe tener al menos 50 caracteres")
		.max(5000, "La descripción no puede superar 5000 caracteres"),
	price: z
		.number()
		.positive("El precio debe ser mayor a 0")
		.max(999999999, "El precio es demasiado alto"),
	surface: z
		.number()
		.positive("La superficie debe ser mayor a 0")
		.max(999999, "La superficie es demasiado grande"),
	propertyType: z.nativeEnum(PropertyType, {
		message: "Selecciona un tipo de propiedad válido",
	}),
	bedrooms: z.number().min(0).max(50).optional(),
	bathrooms: z.number().min(0).max(50).optional(),
	characteristics: z
		.array(PropertyCharacteristicSchema)
		.min(1, "Selecciona al menos una característica"),
});

// Lenient version for draft validation
export const PropertyGeneralDraftSchema = z.object({
	title: z.string().optional(),
	description: z.string().optional(),
	price: z.number().positive().optional(),
	surface: z.number().positive().optional(),
	propertyType: z.nativeEnum(PropertyType).optional(),
	bedrooms: z.number().min(0).max(50).optional(),
	bathrooms: z.number().min(0).max(50).optional(),
	characteristics: z.array(PropertyCharacteristicSchema).optional(),
});

// Step 2: Location Schema
export const PropertyLocationSchema = z.object({
	coordinates: CoordinatesSchema.optional(),
	address: AddressSchema.optional(),
});

// Step 3: Media Schema
export const PropertyMediaSchema = z.object({
	images: z
		.array(ImageMetadataSchema)
		.min(1, "Sube al menos una imagen")
		.max(20, "No puedes subir más de 20 imágenes"),
	videos: z
		.array(VideoMetadataSchema)
		.max(5, "No puedes subir más de 5 videos")
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
	characteristics: z.array(PropertyCharacteristicSchema).optional(),
	coordinates: CoordinatesSchema.optional(),
	address: AddressSchema.optional(),
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
