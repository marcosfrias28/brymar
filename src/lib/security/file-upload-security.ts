/**
 * File upload security utilities
 * Provides comprehensive validation and security measures for file uploads
 */

import { z } from "zod";
import { ValidationError } from "../errors/wizard-errors";

// Security configuration for file uploads
const UPLOAD_SECURITY_CONFIG = {
	// File size limits (in bytes)
	MAX_FILE_SIZES: {
		image: 10 * 1024 * 1024, // 10MB
		video: 100 * 1024 * 1024, // 100MB
	},

	// Allowed MIME types
	ALLOWED_MIME_TYPES: {
		image: ["image/jpeg", "image/jpg", "image/png", "image/webp"] as string[],
		video: ["video/mp4", "video/webm", "video/ogg"] as string[],
	},

	// Allowed file extensions
	ALLOWED_EXTENSIONS: {
		image: [".jpg", ".jpeg", ".png", ".webp"] as string[],
		video: [".mp4", ".webm", ".ogg"] as string[],
	},

	// Maximum number of files
	MAX_FILES: {
		images: 20,
		videos: 5,
	},

	// Dangerous file signatures (magic bytes)
	DANGEROUS_SIGNATURES: [
		// Executable files
		[0x4d, 0x5a] as number[], // PE/EXE
		[0x7f, 0x45, 0x4c, 0x46] as number[], // ELF
		[0xca, 0xfe, 0xba, 0xbe] as number[], // Mach-O

		// Script files
		[0x23, 0x21] as number[], // Shebang (#!)

		// Archive files that could contain executables
		[0x50, 0x4b, 0x03, 0x04] as number[], // ZIP
		[0x52, 0x61, 0x72, 0x21] as number[], // RAR

		// HTML/JavaScript
		[0x3c, 0x68, 0x74, 0x6d, 0x6c] as number[], // <html
		[0x3c, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74] as number[], // <script
	],

	// Trusted domains for image URLs
	TRUSTED_DOMAINS: [
		"vercel-storage.com",
		"blob.vercel-storage.com",
		// Add other trusted CDN domains as needed
	],
} as const;

/**
 * File validation schema
 */
const FileValidationSchema = z.object({
	name: z.string().min(1, "Nombre de archivo requerido"),
	size: z.number().positive("Tamaño de archivo debe ser positivo"),
	type: z.string().min(1, "Tipo de archivo requerido"),
	lastModified: z.number().optional(),
});

/**
 * Validate file basic properties
 */
export function validateFileBasics(file: File): void {
	const validation = FileValidationSchema.safeParse({
		name: file.name,
		size: file.size,
		type: file.type,
		lastModified: file.lastModified,
	});

	if (!validation.success) {
		throw new ValidationError(
			validation.error.flatten().fieldErrors,
			"Propiedades básicas del archivo no válidas",
		);
	}
}

/**
 * Check if file extension is allowed
 */
export function validateFileExtension(
	filename: string,
	fileType: "image" | "video",
): void {
	const extension = getFileExtension(filename);
	const allowedExtensions = UPLOAD_SECURITY_CONFIG.ALLOWED_EXTENSIONS[fileType];

	if (!allowedExtensions.includes(extension)) {
		throw new ValidationError(
			{ extension: [`Extensión de archivo no permitida: ${extension}`] },
			`Solo se permiten archivos: ${allowedExtensions.join(", ")}`,
		);
	}
}

/**
 * Check if MIME type is allowed
 */
export function validateMimeType(
	mimeType: string,
	fileType: "image" | "video",
): void {
	const allowedTypes = UPLOAD_SECURITY_CONFIG.ALLOWED_MIME_TYPES[fileType];

	if (!allowedTypes.includes(mimeType)) {
		throw new ValidationError(
			{ mimeType: [`Tipo MIME no permitido: ${mimeType}`] },
			`Solo se permiten tipos: ${allowedTypes.join(", ")}`,
		);
	}
}

/**
 * Check file size limits
 */
export function validateFileSize(
	size: number,
	fileType: "image" | "video",
): void {
	const maxSize = UPLOAD_SECURITY_CONFIG.MAX_FILE_SIZES[fileType];

	if (size > maxSize) {
		const maxSizeMB = Math.round(maxSize / (1024 * 1024));
		throw new ValidationError(
			{ size: [`Archivo demasiado grande: ${formatFileSize(size)}`] },
			`El archivo excede el tamaño máximo de ${maxSizeMB}MB`,
		);
	}

	if (size === 0) {
		throw new ValidationError(
			{ size: ["El archivo está vacío"] },
			"No se pueden subir archivos vacíos",
		);
	}
}

/**
 * Validate file count limits
 */
export function validateFileCount(
	count: number,
	fileType: "images" | "videos",
): void {
	const maxCount = UPLOAD_SECURITY_CONFIG.MAX_FILES[fileType];

	if (count > maxCount) {
		throw new ValidationError(
			{ count: [`Demasiados archivos: ${count}`] },
			`Solo se permiten máximo ${maxCount} ${fileType}`,
		);
	}
}

/**
 * Check for dangerous file signatures (magic bytes)
 */
export async function validateFileSignature(file: File): Promise<void> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (event) => {
			try {
				const arrayBuffer = event.target?.result as ArrayBuffer;
				if (!arrayBuffer) {
					reject(
						new ValidationError(
							{ signature: ["No se pudo leer el archivo"] },
							"Error al validar la firma del archivo",
						),
					);
					return;
				}

				const bytes = new Uint8Array(arrayBuffer.slice(0, 16)); // Check first 16 bytes

				// Check against dangerous signatures
				for (const signature of UPLOAD_SECURITY_CONFIG.DANGEROUS_SIGNATURES) {
					if (matchesSignature(bytes, signature)) {
						reject(
							new ValidationError(
								{ signature: ["Tipo de archivo peligroso detectado"] },
								"El archivo contiene una firma de archivo no permitida",
							),
						);
						return;
					}
				}

				// Validate expected image signatures
				if (file.type.startsWith("image/")) {
					if (!isValidImageSignature(bytes, file.type)) {
						reject(
							new ValidationError(
								{
									signature: [
										"La firma del archivo no coincide con el tipo declarado",
									],
								},
								"El archivo no es una imagen válida",
							),
						);
						return;
					}
				}

				resolve();
			} catch (_error) {
				reject(
					new ValidationError(
						{ signature: ["Error al validar la firma del archivo"] },
						"No se pudo verificar la seguridad del archivo",
					),
				);
			}
		};

		reader.onerror = () => {
			reject(
				new ValidationError(
					{ signature: ["Error al leer el archivo"] },
					"No se pudo leer el archivo para validación",
				),
			);
		};

		// Read first 16 bytes for signature validation
		reader.readAsArrayBuffer(file.slice(0, 16));
	});
}

/**
 * Check if bytes match a signature pattern
 */
function matchesSignature(bytes: Uint8Array, signature: number[]): boolean {
	if (bytes.length < signature.length) {
		return false;
	}

	for (let i = 0; i < signature.length; i++) {
		if (bytes[i] !== signature[i]) {
			return false;
		}
	}

	return true;
}

/**
 * Validate image file signatures
 */
function isValidImageSignature(bytes: Uint8Array, mimeType: string): boolean {
	const imageSignatures = {
		"image/jpeg": [[0xff, 0xd8, 0xff]],
		"image/jpg": [[0xff, 0xd8, 0xff]],
		"image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
		"image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header
	};

	const expectedSignatures =
		imageSignatures[mimeType as keyof typeof imageSignatures];
	if (!expectedSignatures) {
		return false;
	}

	// Special handling for WebP files
	if (mimeType === "image/webp") {
		// Check RIFF header (bytes 0-3) and WEBP identifier (bytes 8-11)
		if (bytes.length >= 12) {
			const hasRiffHeader = matchesSignature(bytes, [0x52, 0x49, 0x46, 0x46]);
			const hasWebpIdentifier = matchesSignature(
				bytes.slice(8),
				[0x57, 0x45, 0x42, 0x50],
			);
			return hasRiffHeader && hasWebpIdentifier;
		}
		// Fallback to just RIFF header if we don't have enough bytes
		return matchesSignature(bytes, [0x52, 0x49, 0x46, 0x46]);
	}

	return expectedSignatures.some((signature) =>
		matchesSignature(bytes, signature),
	);
}

/**
 * Validate image URL for security
 */
export function validateImageUrl(url: string): void {
	try {
		const parsedUrl = new URL(url);

		// Check protocol
		if (!["https:", "http:"].includes(parsedUrl.protocol)) {
			throw new ValidationError(
				{ url: ["Protocolo de URL no permitido"] },
				"Solo se permiten URLs HTTP/HTTPS",
			);
		}

		// Check trusted domains
		const isTrustedDomain = UPLOAD_SECURITY_CONFIG.TRUSTED_DOMAINS.some(
			(domain) => parsedUrl.hostname.endsWith(domain),
		);

		if (!isTrustedDomain) {
			throw new ValidationError(
				{ url: ["Dominio no confiable"] },
				"La URL de imagen debe ser de un dominio confiable",
			);
		}

		// Check for suspicious patterns in URL
		const suspiciousPatterns = [
			/javascript:/i,
			/data:/i,
			/vbscript:/i,
			/<script/i,
			/on\w+=/i,
		];

		if (suspiciousPatterns.some((pattern) => pattern.test(url))) {
			throw new ValidationError(
				{ url: ["URL contiene patrones sospechosos"] },
				"La URL de imagen contiene contenido no permitido",
			);
		}
	} catch (error) {
		if (error instanceof ValidationError) {
			throw error;
		}

		throw new ValidationError(
			{ url: ["URL malformada"] },
			"La URL de imagen no es válida",
		);
	}
}

/**
 * Comprehensive file validation
 */
export async function validateUploadedFile(
	file: File,
	fileType: "image" | "video",
): Promise<void> {
	// Basic validation
	validateFileBasics(file);

	// Extension validation
	validateFileExtension(file.name, fileType);

	// MIME type validation
	validateMimeType(file.type, fileType);

	// Size validation
	validateFileSize(file.size, fileType);

	// File signature validation (async)
	await validateFileSignature(file);
}

/**
 * Validate multiple files
 */
export async function validateMultipleFiles(
	files: File[],
	fileType: "image" | "video",
): Promise<{
	valid: File[];
	invalid: Array<{ file: File; error: string }>;
}> {
	const fileTypeKey = fileType === "image" ? "images" : "videos";

	// Check file count
	validateFileCount(files.length, fileTypeKey);

	const results = await Promise.allSettled(
		files.map(async (file) => {
			await validateUploadedFile(file, fileType);
			return file;
		}),
	);

	const valid: File[] = [];
	const invalid: Array<{ file: File; error: string }> = [];

	results.forEach((result, index) => {
		if (result.status === "fulfilled") {
			valid.push(result.value);
		} else {
			invalid.push({
				file: files[index],
				error:
					result.reason instanceof Error
						? result.reason.message
						: "Error desconocido",
			});
		}
	});

	return { valid, invalid };
}

/**
 * Generate secure filename
 */
export function generateSecureFilename(
	originalFilename: string,
	fileType: "image" | "video",
): string {
	const extension = getFileExtension(originalFilename);
	const timestamp = Date.now();
	const randomString = Math.random().toString(36).substring(2, 15);
	const prefix = fileType === "image" ? "img" : "vid";

	return `${prefix}_${timestamp}_${randomString}${extension}`;
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
	const lastDotIndex = filename.lastIndexOf(".");
	return lastDotIndex > 0 ? filename.substring(lastDotIndex).toLowerCase() : "";
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

/**
 * Create upload security headers
 */
export function getUploadSecurityHeaders(): Record<string, string> {
	return {
		"X-Content-Type-Options": "nosniff",
		"X-Frame-Options": "DENY",
		"X-XSS-Protection": "1; mode=block",
		"Referrer-Policy": "strict-origin-when-cross-origin",
		"Permissions-Policy": "camera=(), microphone=(), geolocation=()",
	};
}

/**
 * Virus scanning placeholder (integrate with actual service)
 */
export async function scanFileForViruses(file: File): Promise<boolean> {
	// Placeholder for virus scanning integration
	// In production, integrate with services like:
	// - ClamAV
	// - VirusTotal API
	// - AWS GuardDuty
	// - Azure Defender

	console.log(`Virus scan placeholder for file: ${file.name}`);

	// For now, return true (clean)
	// In production, implement actual scanning
	return true;
}

/**
 * Content analysis for inappropriate content
 */
export async function analyzeImageContent(file: File): Promise<{
	safe: boolean;
	confidence: number;
	categories: string[];
}> {
	// Placeholder for content analysis
	// In production, integrate with services like:
	// - Google Cloud Vision API
	// - AWS Rekognition
	// - Azure Computer Vision
	// - Clarifai

	console.log(`Content analysis placeholder for file: ${file.name}`);

	// For now, return safe
	return {
		safe: true,
		confidence: 0.95,
		categories: ["property", "real-estate"],
	};
}

/**
 * Complete security validation pipeline
 */
export async function performCompleteSecurityValidation(
	file: File,
	fileType: "image" | "video",
): Promise<{
	valid: boolean;
	errors: string[];
	warnings: string[];
}> {
	const errors: string[] = [];
	const warnings: string[] = [];

	try {
		// Basic file validation
		await validateUploadedFile(file, fileType);

		// In development, skip virus scanning and content analysis to avoid blocking valid files
		if (process.env.NODE_ENV === "production") {
			// Virus scanning
			const virusScanResult = await scanFileForViruses(file);
			if (!virusScanResult) {
				errors.push("El archivo contiene contenido malicioso");
			}

			// Content analysis for images
			if (fileType === "image") {
				const contentAnalysis = await analyzeImageContent(file);
				if (!contentAnalysis.safe) {
					errors.push("El contenido de la imagen no es apropiado");
				} else if (contentAnalysis.confidence < 0.8) {
					warnings.push("La imagen podría contener contenido inapropiado");
				}
			}
		} else {
			// In development, just log that we're skipping these validations
			console.log(
				`[DEV] Skipping virus scan and content analysis for file: ${file.name}`,
			);
		}
	} catch (error) {
		if (error instanceof ValidationError) {
			errors.push(error.userMessage);
		} else {
			errors.push("Error durante la validación de seguridad");
		}
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
	};
}
