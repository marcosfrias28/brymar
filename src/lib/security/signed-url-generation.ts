/**
 * Secure signed URL generation for cloud storage
 * Provides time-limited, secure access to cloud storage resources
 */

import crypto from "node:crypto";
import { ValidationError } from "../errors/wizard-errors";

// Signed URL configuration
const SIGNED_URL_CONFIG = {
	// Default expiration times
	DEFAULT_EXPIRY: {
		upload: 60 * 60 * 1000, // 1 hour for uploads
		download: 24 * 60 * 60 * 1000, // 24 hours for downloads
		preview: 7 * 24 * 60 * 60 * 1000, // 7 days for previews
		delete: 60 * 60 * 1000, // 1 hour for deletes
	},

	// Maximum expiration times
	MAX_EXPIRY: {
		upload: 24 * 60 * 60 * 1000, // 24 hours max for uploads
		download: 7 * 24 * 60 * 60 * 1000, // 7 days max for downloads
		preview: 30 * 24 * 60 * 60 * 1000, // 30 days max for previews
		delete: 24 * 60 * 60 * 1000, // 24 hours max for deletes
	},

	// Allowed operations
	ALLOWED_OPERATIONS: ["upload", "download", "preview", "delete"] as const,

	// File type restrictions
	ALLOWED_FILE_TYPES: {
		image: ["image/jpeg", "image/jpg", "image/png", "image/webp"] as string[],
		video: ["video/mp4", "video/webm", "video/ogg"] as string[],
	},

	// Size limits (in bytes)
	SIZE_LIMITS: {
		image: 10 * 1024 * 1024, // 10MB
		video: 100 * 1024 * 1024, // 100MB
	},

	// Path prefixes for different resource types
	PATH_PREFIXES: {
		properties: "properties",
		drafts: "drafts",
		temp: "temp",
	},
} as const;

// Types
export type SignedUrlOperation =
	(typeof SIGNED_URL_CONFIG.ALLOWED_OPERATIONS)[number];
export type FileType = "image" | "video";
export type ResourceType = keyof typeof SIGNED_URL_CONFIG.PATH_PREFIXES;

export interface SignedUrlOptions {
	operation: SignedUrlOperation;
	expiresIn?: number;
	userId?: string;
	resourceType?: ResourceType;
	fileType?: FileType;
	maxSize?: number;
	allowedMimeTypes?: string[];
	metadata?: Record<string, any>;
}

export interface SignedUrlResult {
	url: string;
	expires: Date;
	token: string;
	uploadPath?: string;
	restrictions: {
		maxSize?: number;
		allowedMimeTypes?: string[];
		operation: SignedUrlOperation;
	};
}

/**
 * Generate a secure signed URL for cloud storage operations
 */
export async function generateSignedUrl(
	filename: string,
	options: SignedUrlOptions,
): Promise<SignedUrlResult> {
	// Validate inputs
	validateSignedUrlInputs(filename, options);

	const {
		operation,
		expiresIn,
		userId,
		resourceType = "properties",
		fileType = "image",
		maxSize,
		allowedMimeTypes,
		metadata = {},
	} = options;

	// Calculate expiration
	const defaultExpiry =
		SIGNED_URL_CONFIG.DEFAULT_EXPIRY[operation] ||
		SIGNED_URL_CONFIG.DEFAULT_EXPIRY.upload;
	const maxExpiry =
		SIGNED_URL_CONFIG.MAX_EXPIRY[operation] ||
		SIGNED_URL_CONFIG.MAX_EXPIRY.upload;
	const requestedExpiry = expiresIn || defaultExpiry;
	const actualExpiry = Math.min(requestedExpiry, maxExpiry);
	const expires = new Date(Date.now() + actualExpiry);

	// Generate secure token
	const token = generateSecureToken(
		filename,
		operation,
		expires,
		userId,
		metadata,
	);

	// Construct upload path
	const uploadPath = constructUploadPath(filename, resourceType, userId);

	// Determine restrictions
	const restrictions = {
		maxSize: maxSize || SIGNED_URL_CONFIG.SIZE_LIMITS[fileType],
		allowedMimeTypes:
			allowedMimeTypes || SIGNED_URL_CONFIG.ALLOWED_FILE_TYPES[fileType],
		operation,
	};

	// For Vercel Blob, we'll return a structured response
	// The actual upload will be handled by the upload service
	const signedUrl = constructSignedUrl(uploadPath, token, expires, operation);

	return {
		url: signedUrl,
		expires,
		token,
		uploadPath,
		restrictions,
	};
}

/**
 * Validate signed URL inputs
 */
function validateSignedUrlInputs(
	filename: string,
	options: SignedUrlOptions,
): void {
	// Validate filename
	if (!filename || typeof filename !== "string") {
		throw new ValidationError(
			{ filename: ["Nombre de archivo requerido"] },
			"Nombre de archivo no válido",
		);
	}

	if (filename.length > 255) {
		throw new ValidationError(
			{ filename: ["Nombre de archivo demasiado largo"] },
			"El nombre del archivo excede la longitud máxima",
		);
	}

	// Validate operation
	if (!SIGNED_URL_CONFIG.ALLOWED_OPERATIONS.includes(options.operation)) {
		throw new ValidationError(
			{ operation: ["Operación no permitida"] },
			"Operación de URL firmada no válida",
		);
	}

	// Validate expiration
	if (options.expiresIn !== undefined) {
		if (typeof options.expiresIn !== "number" || options.expiresIn <= 0) {
			throw new ValidationError(
				{ expiresIn: ["Tiempo de expiración inválido"] },
				"El tiempo de expiración debe ser un número positivo",
			);
		}

		const maxExpiry =
			SIGNED_URL_CONFIG.MAX_EXPIRY[options.operation] ||
			SIGNED_URL_CONFIG.MAX_EXPIRY.upload;
		if (options.expiresIn > maxExpiry) {
			throw new ValidationError(
				{ expiresIn: ["Tiempo de expiración demasiado largo"] },
				"El tiempo de expiración excede el máximo permitido",
			);
		}
	}

	// Validate file type restrictions
	if (options.fileType) {
		const allowedTypes = SIGNED_URL_CONFIG.ALLOWED_FILE_TYPES[options.fileType];
		if (options.allowedMimeTypes) {
			const invalidTypes = options.allowedMimeTypes.filter(
				(type) => !allowedTypes.includes(type),
			);
			if (invalidTypes.length > 0) {
				throw new ValidationError(
					{
						allowedMimeTypes: [
							`Tipos MIME no válidos: ${invalidTypes.join(", ")}`,
						],
					},
					"Algunos tipos MIME especificados no están permitidos",
				);
			}
		}
	}

	// Validate size limits
	if (options.maxSize !== undefined) {
		if (typeof options.maxSize !== "number" || options.maxSize <= 0) {
			throw new ValidationError(
				{ maxSize: ["Tamaño máximo inválido"] },
				"El tamaño máximo debe ser un número positivo",
			);
		}

		const absoluteMaxSize = Math.max(
			...Object.values(SIGNED_URL_CONFIG.SIZE_LIMITS),
		);
		if (options.maxSize > absoluteMaxSize) {
			throw new ValidationError(
				{ maxSize: ["Tamaño máximo demasiado grande"] },
				"El tamaño máximo excede el límite absoluto",
			);
		}
	}
}

/**
 * Generate a secure token for the signed URL
 */
function generateSecureToken(
	filename: string,
	operation: SignedUrlOperation,
	expires: Date,
	userId?: string,
	metadata: Record<string, any> = {},
): string {
	const secret =
		process.env.SIGNED_URL_SECRET ||
		process.env.NEXTAUTH_SECRET ||
		"fallback-secret";

	if (!secret || secret === "fallback-secret") {
		console.warn(
			"Using fallback secret for signed URLs. Set SIGNED_URL_SECRET in production.",
		);
	}

	// Create payload
	const payload = {
		filename,
		operation,
		expires: expires.getTime(),
		userId: userId || "anonymous",
		metadata,
		nonce: crypto.randomBytes(16).toString("hex"),
	};

	// Create signature
	const payloadString = JSON.stringify(payload);
	const signature = crypto
		.createHmac("sha256", secret)
		.update(payloadString)
		.digest("hex");

	// Combine payload and signature
	const token = Buffer.from(JSON.stringify({ payload, signature })).toString(
		"base64url",
	);

	return token;
}

/**
 * Verify a signed URL token
 */
export function verifySignedUrlToken(token: string): {
	valid: boolean;
	payload?: any;
	error?: string;
} {
	try {
		// Decode token
		const decoded = JSON.parse(Buffer.from(token, "base64url").toString());
		const { payload, signature } = decoded;

		if (!payload || !signature) {
			return { valid: false, error: "Token malformado" };
		}

		// Verify signature
		const secret =
			process.env.SIGNED_URL_SECRET ||
			process.env.NEXTAUTH_SECRET ||
			"fallback-secret";
		const payloadString = JSON.stringify(payload);
		const expectedSignature = crypto
			.createHmac("sha256", secret)
			.update(payloadString)
			.digest("hex");

		if (
			!crypto.timingSafeEqual(
				Buffer.from(signature, "hex"),
				Buffer.from(expectedSignature, "hex"),
			)
		) {
			return { valid: false, error: "Firma inválida" };
		}

		// Check expiration
		if (Date.now() > payload.expires) {
			return { valid: false, error: "Token expirado" };
		}

		return { valid: true, payload };
	} catch (_error) {
		return { valid: false, error: "Error al verificar token" };
	}
}

/**
 * Construct upload path with proper structure
 */
function constructUploadPath(
	filename: string,
	resourceType: ResourceType,
	userId?: string,
): string {
	const timestamp = Date.now();
	const randomId = crypto.randomBytes(8).toString("hex");
	const sanitizedFilename = sanitizeFilename(filename);

	const pathPrefix = SIGNED_URL_CONFIG.PATH_PREFIXES[resourceType];
	const userPath = userId ? `user-${userId}` : "anonymous";

	return `${pathPrefix}/${userPath}/${timestamp}-${randomId}-${sanitizedFilename}`;
}

/**
 * Sanitize filename for safe storage
 */
function sanitizeFilename(filename: string): string {
	// Extract extension
	const lastDotIndex = filename.lastIndexOf(".");
	const name =
		lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
	const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex) : "";

	// Sanitize name part
	const sanitizedName = name
		.toLowerCase()
		.replace(/[^a-z0-9\-_]/g, "_")
		.replace(/_{2,}/g, "_")
		.replace(/^_+|_+$/g, "")
		.substring(0, 50); // Limit length

	return (sanitizedName || "file") + extension;
}

/**
 * Construct the actual signed URL
 */
function constructSignedUrl(
	uploadPath: string,
	token: string,
	expires: Date,
	operation: SignedUrlOperation,
): string {
	// For Vercel Blob, we'll return a structured URL that our upload service can use
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
	const params = new URLSearchParams({
		path: uploadPath,
		token,
		expires: expires.getTime().toString(),
		operation,
	});

	return `${baseUrl}/api/signed-upload?${params.toString()}`;
}

/**
 * Generate multiple signed URLs for batch operations
 */
export async function generateBatchSignedUrls(
	filenames: string[],
	options: SignedUrlOptions,
): Promise<SignedUrlResult[]> {
	if (filenames.length > 20) {
		throw new ValidationError(
			{ batch: ["Demasiados archivos en lote"] },
			"No se pueden generar más de 20 URLs firmadas a la vez",
		);
	}

	const results = await Promise.all(
		filenames.map((filename) => generateSignedUrl(filename, options)),
	);

	return results;
}

/**
 * Revoke a signed URL (add to blacklist)
 */
const revokedTokens = new Set<string>();

export function revokeSignedUrl(token: string): void {
	revokedTokens.add(token);

	// Clean up old revoked tokens periodically
	if (revokedTokens.size > 10000) {
		// In production, implement proper cleanup with expiration tracking
		revokedTokens.clear();
	}
}

/**
 * Check if a token has been revoked
 */
export function isTokenRevoked(token: string): boolean {
	return revokedTokens.has(token);
}

/**
 * Middleware to validate signed URL requests
 */
export async function validateSignedUrlRequest(
	token: string,
	operation: SignedUrlOperation,
	filename?: string,
): Promise<{
	valid: boolean;
	payload?: any;
	error?: string;
}> {
	// Check if token is revoked
	if (isTokenRevoked(token)) {
		return { valid: false, error: "Token revocado" };
	}

	// Verify token
	const verification = verifySignedUrlToken(token);
	if (!verification.valid) {
		return verification;
	}

	const { payload } = verification;

	// Validate operation matches
	if (payload.operation !== operation) {
		return { valid: false, error: "Operación no coincide" };
	}

	// Validate filename if provided
	if (filename && payload.filename !== filename) {
		return { valid: false, error: "Nombre de archivo no coincide" };
	}

	return { valid: true, payload };
}

/**
 * Generate presigned URL for direct upload to Vercel Blob
 */
export async function generatePresignedUploadUrl(
	filename: string,
	contentType: string,
	options: Omit<SignedUrlOptions, "operation"> = {},
): Promise<SignedUrlResult> {
	return generateSignedUrl(filename, {
		...options,
		operation: "upload",
		allowedMimeTypes: options.allowedMimeTypes || [contentType],
	});
}

/**
 * Generate presigned URL for file download
 */
export async function generatePresignedDownloadUrl(
	filename: string,
	options: Omit<SignedUrlOptions, "operation"> = {},
): Promise<SignedUrlResult> {
	return generateSignedUrl(filename, {
		...options,
		operation: "download",
	});
}

/**
 * Generate presigned URL for file preview
 */
export async function generatePresignedPreviewUrl(
	filename: string,
	options: Omit<SignedUrlOptions, "operation"> = {},
): Promise<SignedUrlResult> {
	return generateSignedUrl(filename, {
		...options,
		operation: "preview",
		expiresIn: options.expiresIn || SIGNED_URL_CONFIG.DEFAULT_EXPIRY.preview,
	});
}

/**
 * Cleanup expired tokens and revoked tokens
 */
export function cleanupSignedUrls(): void {
	// In production, implement proper cleanup with database/Redis
	revokedTokens.clear();
}

// Periodic cleanup
if (typeof process !== "undefined") {
	setInterval(cleanupSignedUrls, 60 * 60 * 1000); // Cleanup every hour
}
