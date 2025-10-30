/**
 * Rate limiting implementation for AI API calls and image uploads
 * Provides comprehensive protection against abuse and resource exhaustion
 */

import type { NextRequest } from "next/server";
import { ValidationError } from "../errors/wizard-errors";

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
	// AI Generation limits
	AI_GENERATION: {
		windowMs: 60 * 1000, // 1 minute
		maxRequests: 5, // 5 requests per minute per user
		skipSuccessfulRequests: false,
		skipFailedRequests: false,
	},

	// Image upload limits
	IMAGE_UPLOAD: {
		windowMs: 60 * 1000, // 1 minute
		maxRequests: 20, // 20 uploads per minute per user
		skipSuccessfulRequests: false,
		skipFailedRequests: true, // Don't count failed uploads
	},

	// Draft save limits
	DRAFT_SAVE: {
		windowMs: 60 * 1000, // 1 minute
		maxRequests: 30, // 30 saves per minute per user
		skipSuccessfulRequests: false,
		skipFailedRequests: true,
	},

	// Form submission limits
	FORM_SUBMISSION: {
		windowMs: 5 * 60 * 1000, // 5 minutes
		maxRequests: 10, // 10 submissions per 5 minutes per user
		skipSuccessfulRequests: false,
		skipFailedRequests: false,
	},

	// Global API limits (per IP)
	GLOBAL_API: {
		windowMs: 15 * 60 * 1000, // 15 minutes
		maxRequests: 100, // 100 requests per 15 minutes per IP
		skipSuccessfulRequests: false,
		skipFailedRequests: false,
	},
} as const;

// In-memory store for rate limiting (in production, use Redis)
class RateLimitStore {
	private readonly store = new Map<
		string,
		{ count: number; resetTime: number; requests: number[] }
	>();

	// Clean up expired entries periodically
	private readonly cleanupInterval: NodeJS.Timeout;

	constructor() {
		this.cleanupInterval = setInterval(
			() => {
				this.cleanup();
			},
			5 * 60 * 1000
		); // Cleanup every 5 minutes
	}

	private cleanup(): void {
		const now = Date.now();
		for (const [key, data] of this.store.entries()) {
			if (data.resetTime < now) {
				this.store.delete(key);
			}
		}
	}

	get(
		key: string
	): { count: number; resetTime: number; requests: number[] } | undefined {
		return this.store.get(key);
	}

	set(
		key: string,
		value: { count: number; resetTime: number; requests: number[] }
	): void {
		this.store.set(key, value);
	}

	delete(key: string): void {
		this.store.delete(key);
	}

	clear(): void {
		this.store.clear();
	}

	size(): number {
		return this.store.size;
	}

	destroy(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
		}
		this.clear();
	}
}

// Global rate limit store
const rateLimitStore = new RateLimitStore();

/**
 * Rate limiter class
 */
export class RateLimiter {
	constructor(
		private readonly windowMs: number,
		private readonly maxRequests: number,
		private readonly skipSuccessfulRequests: boolean = false,
		private readonly skipFailedRequests: boolean = false
	) {}

	/**
	 * Check if request is allowed
	 */
	async isAllowed(
		identifier: string,
		success?: boolean
	): Promise<{
		allowed: boolean;
		remaining: number;
		resetTime: number;
		totalHits: number;
	}> {
		const now = Date.now();
		const key = `rate_limit:${identifier}`;

		let data = rateLimitStore.get(key);

		// Initialize or reset if window expired
		if (!data || data.resetTime < now) {
			data = {
				count: 0,
				resetTime: now + this.windowMs,
				requests: [],
			};
		}

		// Filter requests within current window
		const windowStart = now - this.windowMs;
		data.requests = data.requests.filter((time) => time > windowStart);

		// Check if we should skip this request
		const shouldSkip =
			(success === true && this.skipSuccessfulRequests) ||
			(success === false && this.skipFailedRequests);

		if (!shouldSkip) {
			data.requests.push(now);
			data.count = data.requests.length;
		}

		// Update store
		rateLimitStore.set(key, data);

		const allowed = data.count <= this.maxRequests;
		const remaining = Math.max(0, this.maxRequests - data.count);

		return {
			allowed,
			remaining,
			resetTime: data.resetTime,
			totalHits: data.count,
		};
	}

	/**
	 * Record a request (for post-processing)
	 */
	async recordRequest(identifier: string, success: boolean): Promise<void> {
		await this.isAllowed(identifier, success);
	}

	/**
	 * Get current status without recording a request
	 */
	async getStatus(identifier: string): Promise<{
		remaining: number;
		resetTime: number;
		totalHits: number;
	}> {
		const now = Date.now();
		const key = `rate_limit:${identifier}`;

		const data = rateLimitStore.get(key);

		if (!data || data.resetTime < now) {
			return {
				remaining: this.maxRequests,
				resetTime: now + this.windowMs,
				totalHits: 0,
			};
		}

		// Filter requests within current window
		const windowStart = now - this.windowMs;
		const validRequests = data.requests.filter((time) => time > windowStart);

		return {
			remaining: Math.max(0, this.maxRequests - validRequests.length),
			resetTime: data.resetTime,
			totalHits: validRequests.length,
		};
	}

	/**
	 * Reset rate limit for identifier
	 */
	async reset(identifier: string): Promise<void> {
		const key = `rate_limit:${identifier}`;
		rateLimitStore.delete(key);
	}
}

// Pre-configured rate limiters
export const rateLimiters = {
	aiGeneration: new RateLimiter(
		RATE_LIMIT_CONFIG.AI_GENERATION.windowMs,
		RATE_LIMIT_CONFIG.AI_GENERATION.maxRequests,
		RATE_LIMIT_CONFIG.AI_GENERATION.skipSuccessfulRequests,
		RATE_LIMIT_CONFIG.AI_GENERATION.skipFailedRequests
	),

	imageUpload: new RateLimiter(
		RATE_LIMIT_CONFIG.IMAGE_UPLOAD.windowMs,
		RATE_LIMIT_CONFIG.IMAGE_UPLOAD.maxRequests,
		RATE_LIMIT_CONFIG.IMAGE_UPLOAD.skipSuccessfulRequests,
		RATE_LIMIT_CONFIG.IMAGE_UPLOAD.skipFailedRequests
	),

	draftSave: new RateLimiter(
		RATE_LIMIT_CONFIG.DRAFT_SAVE.windowMs,
		RATE_LIMIT_CONFIG.DRAFT_SAVE.maxRequests,
		RATE_LIMIT_CONFIG.DRAFT_SAVE.skipSuccessfulRequests,
		RATE_LIMIT_CONFIG.DRAFT_SAVE.skipFailedRequests
	),

	formSubmission: new RateLimiter(
		RATE_LIMIT_CONFIG.FORM_SUBMISSION.windowMs,
		RATE_LIMIT_CONFIG.FORM_SUBMISSION.maxRequests,
		RATE_LIMIT_CONFIG.FORM_SUBMISSION.skipSuccessfulRequests,
		RATE_LIMIT_CONFIG.FORM_SUBMISSION.skipFailedRequests
	),

	globalApi: new RateLimiter(
		RATE_LIMIT_CONFIG.GLOBAL_API.windowMs,
		RATE_LIMIT_CONFIG.GLOBAL_API.maxRequests,
		RATE_LIMIT_CONFIG.GLOBAL_API.skipSuccessfulRequests,
		RATE_LIMIT_CONFIG.GLOBAL_API.skipFailedRequests
	),
} as const;

/**
 * Get client identifier from request
 */
export function getClientIdentifier(
	request: NextRequest,
	userId?: string
): string {
	// Prefer user ID if available
	if (userId) {
		return `user:${userId}`;
	}

	// Fallback to IP address
	const forwarded = request.headers.get("x-forwarded-for");
	const ip = forwarded
		? forwarded.split(",")[0].trim()
		: request.headers.get("x-real-ip") || "unknown";

	return `ip:${ip}`;
}

/**
 * Rate limiting middleware for AI generation
 */
export async function checkAIGenerationRateLimit(
	identifier: string
): Promise<void> {
	const result = await rateLimiters.aiGeneration.isAllowed(identifier);

	if (!result.allowed) {
		const resetDate = new Date(result.resetTime);
		throw new ValidationError(
			{ rateLimit: ["Límite de generación AI excedido"] },
			`Has excedido el límite de generación con IA. Inténtalo de nuevo después de ${resetDate.toLocaleTimeString()}.`,
			{
				rateLimitInfo: {
					remaining: result.remaining,
					resetTime: result.resetTime,
					totalHits: result.totalHits,
				},
			}
		);
	}
}

/**
 * Rate limiting middleware for image uploads
 */
export async function checkImageUploadRateLimit(
	identifier: string
): Promise<void> {
	const result = await rateLimiters.imageUpload.isAllowed(identifier);

	if (!result.allowed) {
		const resetDate = new Date(result.resetTime);
		throw new ValidationError(
			{ rateLimit: ["Límite de subida de imágenes excedido"] },
			`Has excedido el límite de subida de imágenes. Inténtalo de nuevo después de ${resetDate.toLocaleTimeString()}.`,
			{
				rateLimitInfo: {
					remaining: result.remaining,
					resetTime: result.resetTime,
					totalHits: result.totalHits,
				},
			}
		);
	}
}

/**
 * Rate limiting middleware for draft saves
 */
export async function checkDraftSaveRateLimit(
	identifier: string
): Promise<void> {
	const result = await rateLimiters.draftSave.isAllowed(identifier);

	if (!result.allowed) {
		const resetDate = new Date(result.resetTime);
		throw new ValidationError(
			{ rateLimit: ["Límite de guardado de borradores excedido"] },
			`Has excedido el límite de guardado de borradores. Inténtalo de nuevo después de ${resetDate.toLocaleTimeString()}.`,
			{
				rateLimitInfo: {
					remaining: result.remaining,
					resetTime: result.resetTime,
					totalHits: result.totalHits,
				},
			}
		);
	}
}

/**
 * Rate limiting middleware for form submissions
 */
export async function checkFormSubmissionRateLimit(
	identifier: string
): Promise<void> {
	const result = await rateLimiters.formSubmission.isAllowed(identifier);

	if (!result.allowed) {
		const resetDate = new Date(result.resetTime);
		throw new ValidationError(
			{ rateLimit: ["Límite de envío de formularios excedido"] },
			`Has excedido el límite de envío de formularios. Inténtalo de nuevo después de ${resetDate.toLocaleTimeString()}.`,
			{
				rateLimitInfo: {
					remaining: result.remaining,
					resetTime: result.resetTime,
					totalHits: result.totalHits,
				},
			}
		);
	}
}

/**
 * Global API rate limiting
 */
export async function checkGlobalApiRateLimit(
	identifier: string
): Promise<void> {
	const result = await rateLimiters.globalApi.isAllowed(identifier);

	if (!result.allowed) {
		const resetDate = new Date(result.resetTime);
		throw new ValidationError(
			{ rateLimit: ["Límite de API global excedido"] },
			`Has excedido el límite de solicitudes a la API. Inténtalo de nuevo después de ${resetDate.toLocaleTimeString()}.`,
			{
				rateLimitInfo: {
					remaining: result.remaining,
					resetTime: result.resetTime,
					totalHits: result.totalHits,
				},
			}
		);
	}
}

/**
 * Record successful operation
 */
export async function recordSuccessfulOperation(
	type: "aiGeneration" | "imageUpload" | "draftSave" | "formSubmission",
	identifier: string
): Promise<void> {
	await rateLimiters[type].recordRequest(identifier, true);
}

/**
 * Record failed operation
 */
export async function recordFailedOperation(
	type: "aiGeneration" | "imageUpload" | "draftSave" | "formSubmission",
	identifier: string
): Promise<void> {
	await rateLimiters[type].recordRequest(identifier, false);
}

/**
 * Get rate limit status for all operations
 */
export async function getRateLimitStatus(identifier: string): Promise<{
	aiGeneration: { remaining: number; resetTime: number; totalHits: number };
	imageUpload: { remaining: number; resetTime: number; totalHits: number };
	draftSave: { remaining: number; resetTime: number; totalHits: number };
	formSubmission: { remaining: number; resetTime: number; totalHits: number };
}> {
	const [aiGeneration, imageUpload, draftSave, formSubmission] =
		await Promise.all([
			rateLimiters.aiGeneration.getStatus(identifier),
			rateLimiters.imageUpload.getStatus(identifier),
			rateLimiters.draftSave.getStatus(identifier),
			rateLimiters.formSubmission.getStatus(identifier),
		]);

	return {
		aiGeneration,
		imageUpload,
		draftSave,
		formSubmission,
	};
}

/**
 * Rate limit headers for HTTP responses
 */
export function getRateLimitHeaders(
	remaining: number,
	resetTime: number,
	totalHits: number
): Record<string, string> {
	return {
		"X-RateLimit-Limit": String(remaining + totalHits),
		"X-RateLimit-Remaining": String(remaining),
		"X-RateLimit-Reset": String(Math.ceil(resetTime / 1000)),
		"X-RateLimit-Used": String(totalHits),
	};
}

/**
 * Adaptive rate limiting based on user behavior
 */
export class AdaptiveRateLimiter extends RateLimiter {
	private readonly suspiciousActivityThreshold = 0.8; // 80% of limit triggers monitoring
	private readonly suspiciousUsers = new Set<string>();

	async isAllowed(
		identifier: string,
		success?: boolean
	): Promise<{
		allowed: boolean;
		remaining: number;
		resetTime: number;
		totalHits: number;
		suspicious?: boolean;
	}> {
		const result = await super.isAllowed(identifier, success);

		// Check for suspicious activity
		const usageRatio = result.totalHits / (result.totalHits + result.remaining);
		const suspicious = usageRatio >= this.suspiciousActivityThreshold;

		if (suspicious) {
			this.suspiciousUsers.add(identifier);
		} else {
			this.suspiciousUsers.delete(identifier);
		}

		return {
			...result,
			suspicious,
		};
	}

	isSuspicious(identifier: string): boolean {
		return this.suspiciousUsers.has(identifier);
	}

	getSuspiciousUsers(): string[] {
		return Array.from(this.suspiciousUsers);
	}
}

/**
 * Cleanup function for graceful shutdown
 */
export function cleanup(): void {
	rateLimitStore.destroy();
}

// Handle process termination (only in Node.js runtime, not Edge Runtime)
if (
	typeof process !== "undefined" &&
	process.on &&
	typeof process.on === "function"
) {
	try {
		process.on("SIGTERM", cleanup);
		process.on("SIGINT", cleanup);
	} catch (_error) {
		// Ignore errors in Edge Runtime
	}
}
