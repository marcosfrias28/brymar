/**
 * Server-side validation as security backup
 * Provides comprehensive validation for all wizard data on the server
 */

import { z } from "zod";
import {
	type PropertyBasicInfo,
	type PropertyFormData,
	PropertyType,
} from "@/types/wizard";
import { ValidationError } from "../errors/wizard-errors";

// Enhanced validation schemas with security considerations
export const ServerPropertyValidationSchema = z.object({
	// Step 1: General Information
	title: z
		.string()
		.min(10, "El título debe tener al menos 10 caracteres")
		.max(100, "El título no puede exceder 100 caracteres")
		.regex(
			/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-.,()]+$/,
			"El título contiene caracteres no permitidos",
		),

	description: z
		.string()
		.min(50, "La descripción debe tener al menos 50 caracteres")
		.max(5000, "La descripción no puede exceder 5000 caracteres")
		.refine(
			(desc) => !containsMaliciousContent(desc),
			"La descripción contiene contenido no permitido",
		),

	price: z.coerce
		.number()
		.positive("El precio debe ser mayor a 0")
		.max(100000000, "El precio excede el límite máximo")
		.refine(
			(price) => Number.isFinite(price) && price > 0,
			"El precio debe ser un número válido",
		),

	surface: z.coerce
		.number()
		.positive("La superficie debe ser mayor a 0")
		.max(100000, "La superficie excede el límite máximo")
		.refine(
			(surface) => Number.isFinite(surface) && surface > 0,
			"La superficie debe ser un número válido",
		),

	propertyType: z.nativeEnum(PropertyType, {
		message: "Tipo de propiedad no válido",
	}),

	bedrooms: z.coerce
		.number()
		.int("El número de habitaciones debe ser un entero")
		.min(0, "El número de habitaciones no puede ser negativo")
		.max(20, "El número de habitaciones excede el límite")
		.optional(),

	bathrooms: z.coerce
		.number()
		.int("El número de baños debe ser un entero")
		.min(0, "El número de baños no puede ser negativo")
		.max(20, "El número de baños excede el límite")
		.optional(),

	characteristics: z
		.array(
			z.object({
				id: z.string(),
				name: z.string().max(50, "Característica demasiado larga"),
				category: z.enum(["amenity", "feature", "location"]),
				selected: z.boolean(),
			}),
		)
		.min(1, "Debe seleccionar al menos una característica")
		.max(20, "Demasiadas características seleccionadas")
		.refine(
			(chars) => chars.every((char) => !containsMaliciousContent(char.name)),
			"Las características contienen contenido no permitido",
		),

	// Step 2: Location
	coordinates: z.object({
		latitude: z.coerce
			.number()
			.min(17.5, "Latitud fuera del rango de República Dominicana")
			.max(19.9, "Latitud fuera del rango de República Dominicana"),
		longitude: z.coerce
			.number()
			.min(-72.0, "Longitud fuera del rango de República Dominicana")
			.max(-68.3, "Longitud fuera del rango de República Dominicana"),
	}),

	address: z.object({
		street: z
			.string()
			.min(5, "La dirección debe tener al menos 5 caracteres")
			.max(200, "La dirección es demasiado larga")
			.refine(
				(street) => !containsMaliciousContent(street),
				"La dirección contiene caracteres no permitidos",
			),
		city: z
			.string()
			.min(2, "La ciudad debe tener al menos 2 caracteres")
			.max(100, "El nombre de la ciudad es demasiado largo")
			.refine(
				(city) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/.test(city),
				"El nombre de la ciudad contiene caracteres no válidos",
			),
		province: z
			.string()
			.min(2, "La provincia debe tener al menos 2 caracteres")
			.max(100, "El nombre de la provincia es demasiado largo")
			.refine(
				(province) => isValidDominicanProvince(province),
				"Provincia no válida para República Dominicana",
			),
		postalCode: z
			.string()
			.regex(/^\d{5}$/, "Código postal debe tener 5 dígitos")
			.optional(),
		country: z.literal("Dominican Republic", {
			message: "Solo se permiten propiedades en República Dominicana",
		}),
		formattedAddress: z
			.string()
			.max(300, "Dirección formateada demasiado larga"),
	}),

	// Step 3: Media
	images: z
		.array(
			z.object({
				id: z.string().regex(/^img_\d+_[a-z0-9]+$/, "ID de imagen no válido"),
				url: z
					.string()
					.url("URL de imagen no válida")
					.refine((url) => isValidImageUrl(url), "URL de imagen no permitida"),
				filename: z
					.string()
					.min(1, "Nombre de archivo requerido")
					.max(255, "Nombre de archivo demasiado largo")
					.refine(
						(filename) => /\.(jpg|jpeg|png|webp)$/i.test(filename),
						"Tipo de archivo de imagen no válido",
					),
				size: z.coerce
					.number()
					.positive("El tamaño del archivo debe ser positivo")
					.max(10 * 1024 * 1024, "Archivo demasiado grande (máximo 10MB)"),
				contentType: z.enum(
					["image/jpeg", "image/jpg", "image/png", "image/webp"],
					{
						message: "Tipo de contenido de imagen no válido",
					},
				),
				displayOrder: z.coerce
					.number()
					.int("El orden de visualización debe ser un entero")
					.min(0, "El orden de visualización no puede ser negativo"),
				width: z.coerce.number().positive().optional(),
				height: z.coerce.number().positive().optional(),
			}),
		)
		.min(1, "Debe incluir al menos una imagen")
		.max(20, "Demasiadas imágenes (máximo 20)"),

	videos: z
		.array(
			z.object({
				id: z.string(),
				url: z.string().url(),
				filename: z.string(),
				size: z.coerce.number().max(100 * 1024 * 1024), // 100MB max for videos
				contentType: z.string().regex(/^video\//),
				displayOrder: z.coerce.number().int().min(0),
			}),
		)
		.optional(),

	// Step 4: Meta
	status: z.enum(["draft", "published"], {
		message: "Estado de propiedad no válido",
	}),

	language: z.enum(["es", "en"], {
		message: "Idioma no soportado",
	}),

	aiGenerated: z
		.object({
			title: z.boolean(),
			description: z.boolean(),
			tags: z.boolean(),
		})
		.optional(),
});

// Validation for property basic info (used in AI generation)
export const PropertyBasicInfoSchema = z.object({
	type: z.string().min(1, "Tipo de propiedad requerido"),
	location: z.string().min(1, "Ubicación requerida"),
	price: z.coerce.number().positive("Precio debe ser positivo"),
	surface: z.coerce.number().positive("Superficie debe ser positiva"),
	characteristics: z
		.array(z.string())
		.min(1, "Al menos una característica requerida"),
	bedrooms: z.coerce.number().int().min(0).optional(),
	bathrooms: z.coerce.number().int().min(0).optional(),
});

// Security validation functions
function containsMaliciousContent(text: string): boolean {
	const maliciousPatterns = [
		/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
		/javascript:/gi,
		/on\w+\s*=/gi,
		/data:text\/html/gi,
		/vbscript:/gi,
		/<iframe/gi,
		/<object/gi,
		/<embed/gi,
		/<link/gi,
		/<meta/gi,
		/expression\s*\(/gi,
		/url\s*\(/gi,
		/@import/gi,
		/binding\s*:/gi,
	];

	return maliciousPatterns.some((pattern) => pattern.test(text));
}

function isValidImageUrl(url: string): boolean {
	try {
		const parsedUrl = new URL(url);

		// Only allow specific domains for security
		const allowedDomains = [
			"vercel-storage.com",
			"blob.vercel-storage.com",
			// Add other trusted domains as needed
		];

		return allowedDomains.some((domain) => parsedUrl.hostname.endsWith(domain));
	} catch {
		return false;
	}
}

function isValidDominicanProvince(province: string): boolean {
	const dominicanProvinces = [
		"Azua",
		"Baoruco",
		"Barahona",
		"Dajabón",
		"Distrito Nacional",
		"Duarte",
		"Elías Piña",
		"El Seibo",
		"Espaillat",
		"Hato Mayor",
		"Hermanas Mirabal",
		"Independencia",
		"La Altagracia",
		"La Romana",
		"La Vega",
		"María Trinidad Sánchez",
		"Monseñor Nouel",
		"Monte Cristi",
		"Monte Plata",
		"Pedernales",
		"Peravia",
		"Puerto Plata",
		"Samaná",
		"San Cristóbal",
		"San José de Ocoa",
		"San Juan",
		"San Pedro de Macorís",
		"Sánchez Ramírez",
		"Santiago",
		"Santiago Rodríguez",
		"Santo Domingo",
		"Valverde",
	];

	return dominicanProvinces.some(
		(validProvince) => validProvince.toLowerCase() === province.toLowerCase(),
	);
}

/**
 * Validate complete property form data on server
 */
export async function validatePropertyFormData(
	data: unknown,
): Promise<PropertyFormData> {
	try {
		return ServerPropertyValidationSchema.parse(data);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const fieldErrors: Record<string, string[]> = {};

			error.issues.forEach((err) => {
				const path = err.path.join(".");
				if (!fieldErrors[path]) {
					fieldErrors[path] = [];
				}
				fieldErrors[path].push(err.message);
			});

			throw new ValidationError(fieldErrors, "Datos de formulario no válidos", {
				zodError: error.issues,
			});
		}

		throw error;
	}
}

/**
 * Validate property basic info for AI generation
 */
export async function validatePropertyBasicInfo(
	data: unknown,
): Promise<PropertyBasicInfo> {
	try {
		return PropertyBasicInfoSchema.parse(data);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const fieldErrors: Record<string, string[]> = {};

			error.issues.forEach((err) => {
				const path = err.path.join(".");
				if (!fieldErrors[path]) {
					fieldErrors[path] = [];
				}
				fieldErrors[path].push(err.message);
			});

			throw new ValidationError(
				fieldErrors,
				"Información básica de propiedad no válida",
				{ zodError: error.issues },
			);
		}

		throw error;
	}
}

/**
 * Sanitize text input to prevent XSS and injection attacks
 */
export function sanitizeTextInput(text: string): string {
	return text
		.replace(/[<>]/g, "") // Remove angle brackets
		.replace(/javascript:/gi, "") // Remove javascript: protocol
		.replace(/on\w+\s*=/gi, "") // Remove event handlers
		.trim();
}

/**
 * Validate and sanitize file upload data
 */
export function validateFileUpload(file: {
	name: string;
	size: number;
	type: string;
}): void {
	const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
	const maxSize = 10 * 1024 * 1024; // 10MB

	if (!allowedTypes.includes(file.type)) {
		throw new ValidationError(
			{ fileType: ["Tipo de archivo no permitido"] },
			"Tipo de archivo no válido",
		);
	}

	if (file.size > maxSize) {
		throw new ValidationError(
			{ fileSize: ["Archivo demasiado grande"] },
			"Archivo excede el tamaño máximo",
		);
	}

	// Check for suspicious file names
	if (containsMaliciousContent(file.name)) {
		throw new ValidationError(
			{ fileName: ["Nombre de archivo no válido"] },
			"Nombre de archivo contiene caracteres no permitidos",
		);
	}
}

/**
 * Rate limiting validation
 */
export class RateLimiter {
	private requests: Map<string, number[]> = new Map();

	constructor(
		private maxRequests: number = 10,
		private windowMs: number = 60000, // 1 minute
	) {}

	isAllowed(identifier: string): boolean {
		const now = Date.now();
		const windowStart = now - this.windowMs;

		if (!this.requests.has(identifier)) {
			this.requests.set(identifier, []);
		}

		const userRequests = this.requests.get(identifier)!;

		// Remove old requests outside the window
		const validRequests = userRequests.filter((time) => time > windowStart);

		if (validRequests.length >= this.maxRequests) {
			return false;
		}

		// Add current request
		validRequests.push(now);
		this.requests.set(identifier, validRequests);

		return true;
	}

	getRemainingRequests(identifier: string): number {
		const now = Date.now();
		const windowStart = now - this.windowMs;

		if (!this.requests.has(identifier)) {
			return this.maxRequests;
		}

		const userRequests = this.requests.get(identifier)!;
		const validRequests = userRequests.filter((time) => time > windowStart);

		return Math.max(0, this.maxRequests - validRequests.length);
	}
}

// Global rate limiters for different operations
export const rateLimiters = {
	aiGeneration: new RateLimiter(5, 60000), // 5 requests per minute
	imageUpload: new RateLimiter(20, 60000), // 20 uploads per minute
	draftSave: new RateLimiter(30, 60000), // 30 saves per minute
} as const;
