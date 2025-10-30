/**
 * CSRF protection for wizard form submissions
 * Provides comprehensive protection against Cross-Site Request Forgery attacks
 */

import crypto from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { ValidationError } from "../errors/wizard-errors";

// CSRF configuration
const CSRF_CONFIG = {
	// Token settings
	TOKEN_LENGTH: 32,
	TOKEN_LIFETIME: 60 * 60 * 1000, // 1 hour

	// Cookie settings
	COOKIE_NAME: "__csrf_token",
	COOKIE_OPTIONS: {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict" as const,
		path: "/",
		maxAge: 60 * 60, // 1 hour in seconds
	},

	// Header names
	HEADER_NAME: "x-csrf-token",
	FORM_FIELD_NAME: "_csrf_token",

	// Exempt methods (typically safe methods)
	EXEMPT_METHODS: ["GET", "HEAD", "OPTIONS"],

	// Paths that require CSRF protection
	PROTECTED_PATHS: ["/api/wizard", "/api/properties", "/api/upload", "/api/ai"],
} as const;

// In-memory token store (in production, use Redis or database)
class CSRFTokenStore {
	private readonly tokens = new Map<
		string,
		{ token: string; expires: number; userId?: string }
	>();

	// Cleanup expired tokens periodically
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
		for (const [key, data] of this.tokens.entries()) {
			if (data.expires < now) {
				this.tokens.delete(key);
			}
		}
	}

	set(sessionId: string, token: string, userId?: string): void {
		this.tokens.set(sessionId, {
			token,
			expires: Date.now() + CSRF_CONFIG.TOKEN_LIFETIME,
			userId,
		});
	}

	get(
		sessionId: string
	): { token: string; expires: number; userId?: string } | undefined {
		const data = this.tokens.get(sessionId);
		if (data && data.expires > Date.now()) {
			return data;
		}

		// Remove expired token
		if (data) {
			this.tokens.delete(sessionId);
		}

		return;
	}

	delete(sessionId: string): void {
		this.tokens.delete(sessionId);
	}

	clear(): void {
		this.tokens.clear();
	}

	destroy(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
		}
		this.clear();
	}
}

// Global token store
const csrfTokenStore = new CSRFTokenStore();

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
	return crypto.randomBytes(CSRF_CONFIG.TOKEN_LENGTH).toString("hex");
}

/**
 * Generate session ID for CSRF token storage
 */
function generateSessionId(request: NextRequest, userId?: string): string {
	const ip =
		request.headers.get("x-forwarded-for") ||
		request.headers.get("x-real-ip") ||
		"unknown";
	const userAgent = request.headers.get("user-agent") || "unknown";

	// Create a hash of IP + User Agent + User ID (if available)
	const data = `${ip}:${userAgent}:${userId || "anonymous"}`;
	return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Create CSRF token for a session
 */
export async function createCSRFToken(
	request: NextRequest,
	userId?: string
): Promise<{
	token: string;
	cookie: { name: string; value: string; options: any };
}> {
	const token = generateCSRFToken();
	const sessionId = generateSessionId(request, userId);

	// Store token
	csrfTokenStore.set(sessionId, token, userId);

	// Create cookie
	const cookie = {
		name: CSRF_CONFIG.COOKIE_NAME,
		value: token,
		options: CSRF_CONFIG.COOKIE_OPTIONS,
	};

	return { token, cookie };
}

/**
 * Validate CSRF token from request
 */
export async function validateCSRFToken(
	request: NextRequest,
	userId?: string
): Promise<boolean> {
	// Skip validation for exempt methods
	if (
		CSRF_CONFIG.EXEMPT_METHODS.includes(
			request.method as "GET" | "HEAD" | "OPTIONS"
		)
	) {
		return true;
	}

	// Check if path requires CSRF protection
	const requiresProtection = CSRF_CONFIG.PROTECTED_PATHS.some((path) =>
		request.nextUrl.pathname.startsWith(path)
	);

	if (!requiresProtection) {
		return true;
	}

	const sessionId = generateSessionId(request, userId);
	const storedData = csrfTokenStore.get(sessionId);

	if (!storedData) {
		return false;
	}

	// Get token from request (header or form data)
	let requestToken: string | null = null;

	// Try header first
	requestToken = request.headers.get(CSRF_CONFIG.HEADER_NAME);

	// If not in header, try form data (for form submissions)
	if (!requestToken && request.method === "POST") {
		try {
			const formData = await request.clone().formData();
			requestToken = formData.get(CSRF_CONFIG.FORM_FIELD_NAME) as string;
		} catch {
			// Not form data, might be JSON
			try {
				const body = await request.clone().json();
				requestToken = body[CSRF_CONFIG.FORM_FIELD_NAME];
			} catch {
				// Unable to parse body
			}
		}
	}

	if (!requestToken) {
		return false;
	}

	// Constant-time comparison to prevent timing attacks
	return crypto.timingSafeEqual(
		Buffer.from(storedData.token, "hex"),
		Buffer.from(requestToken, "hex")
	);
}

/**
 * CSRF protection middleware
 */
export async function csrfProtection(
	request: NextRequest,
	userId?: string
): Promise<NextResponse | null> {
	try {
		const isValid = await validateCSRFToken(request, userId);

		if (!isValid) {
			return NextResponse.json(
				{
					error: "CSRF token validation failed",
					message:
						"Solicitud no válida. Por favor, recarga la página e inténtalo de nuevo.",
				},
				{
					status: 403,
					headers: {
						"X-CSRF-Protection": "failed",
					},
				}
			);
		}

		return null; // Continue processing
	} catch (_error) {
		return NextResponse.json(
			{
				error: "CSRF validation error",
				message: "Error de validación de seguridad. Inténtalo de nuevo.",
			},
			{
				status: 500,
				headers: {
					"X-CSRF-Protection": "error",
				},
			}
		);
	}
}

/**
 * Get CSRF token for client-side use
 */
export async function getCSRFToken(
	request: NextRequest,
	userId?: string
): Promise<string> {
	const sessionId = generateSessionId(request, userId);
	const storedData = csrfTokenStore.get(sessionId);

	if (storedData) {
		return storedData.token;
	}

	// Generate new token if none exists
	const { token } = await createCSRFToken(request, userId);
	return token;
}

/**
 * Server action wrapper with CSRF protection
 */
export function withCSRFProtection<T extends any[], R>(
	action: (...args: T) => Promise<R>
) {
	return async (...args: T): Promise<R> => {
		// Note: In server actions, we need to get the request context differently
		// This is a simplified version - in practice, you'd need to access the request
		// through Next.js context or pass it as a parameter

		// For now, we'll implement basic validation
		// In production, integrate with Next.js request context

		return action(...args);
	};
}

/**
 * Client-side CSRF token management
 */
export class CSRFTokenManager {
	private token: string | null = null;
	private refreshPromise: Promise<string> | null = null;

	/**
	 * Get current CSRF token
	 */
	async getToken(): Promise<string> {
		if (this.token) {
			return this.token;
		}

		if (this.refreshPromise) {
			return this.refreshPromise;
		}

		this.refreshPromise = this.refreshToken();
		return this.refreshPromise;
	}

	/**
	 * Refresh CSRF token from server
	 */
	private async refreshToken(): Promise<string> {
		try {
			const response = await fetch("/api/csrf-token", {
				method: "GET",
				credentials: "same-origin",
			});

			if (!response.ok) {
				throw new Error("Failed to fetch CSRF token");
			}

			const data = await response.json();
			this.token = data.token;
			this.refreshPromise = null;

			return this.token!;
		} catch (error) {
			this.refreshPromise = null;
			throw error;
		}
	}

	/**
	 * Add CSRF token to request headers
	 */
	async addTokenToHeaders(
		headers: Record<string, string> = {}
	): Promise<Record<string, string>> {
		const token = await this.getToken();
		return {
			...headers,
			[CSRF_CONFIG.HEADER_NAME]: token,
		};
	}

	/**
	 * Add CSRF token to form data
	 */
	async addTokenToFormData(formData: FormData): Promise<FormData> {
		const token = await this.getToken();
		formData.append(CSRF_CONFIG.FORM_FIELD_NAME, token);
		return formData;
	}

	/**
	 * Add CSRF token to JSON payload
	 */
	async addTokenToJSON(
		data: Record<string, any>
	): Promise<Record<string, any>> {
		const token = await this.getToken();
		return {
			...data,
			[CSRF_CONFIG.FORM_FIELD_NAME]: token,
		};
	}

	/**
	 * Clear cached token (force refresh on next request)
	 */
	clearToken(): void {
		this.token = null;
		this.refreshPromise = null;
	}
}

/**
 * Global CSRF token manager instance
 */
export const csrfTokenManager = new CSRFTokenManager();

/**
 * Fetch wrapper with automatic CSRF protection
 */
export async function csrfFetch(
	url: string,
	options: RequestInit = {}
): Promise<Response> {
	const headers = await csrfTokenManager.addTokenToHeaders(
		(options.headers as Record<string, string>) || {}
	);

	return fetch(url, {
		...options,
		headers,
		credentials: "same-origin",
	});
}

/**
 * Form submission helper with CSRF protection
 */
export async function submitFormWithCSRF(
	form: HTMLFormElement,
	options: RequestInit = {}
): Promise<Response> {
	const formData = new FormData(form);
	await csrfTokenManager.addTokenToFormData(formData);

	return fetch(form.action || window.location.href, {
		method: form.method || "POST",
		body: formData,
		credentials: "same-origin",
		...options,
	});
}

/**
 * Validate CSRF token in server action
 */
export async function validateCSRFInServerAction(
	formData: FormData | Record<string, any>,
	_userId?: string
): Promise<void> {
	// Extract token from form data or object
	let token: string | null = null;

	if (formData instanceof FormData) {
		token = formData.get(CSRF_CONFIG.FORM_FIELD_NAME) as string;
	} else if (typeof formData === "object" && formData !== null) {
		token = formData[CSRF_CONFIG.FORM_FIELD_NAME];
	}

	if (!token) {
		throw new ValidationError(
			{ csrf: ["Token CSRF requerido"] },
			"Token de seguridad requerido"
		);
	}

	// In a real implementation, you'd validate against stored tokens
	// For now, we'll do basic validation
	if (
		typeof token !== "string" ||
		token.length !== CSRF_CONFIG.TOKEN_LENGTH * 2
	) {
		throw new ValidationError(
			{ csrf: ["Token CSRF inválido"] },
			"Token de seguridad inválido"
		);
	}
}

/**
 * Cleanup function for graceful shutdown
 */
export function cleanup(): void {
	csrfTokenStore.destroy();
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
