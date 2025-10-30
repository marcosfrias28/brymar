/**
 * Security middleware for wizard operations
 * Integrates all security measures into a unified middleware system
 */

import { type NextRequest, NextResponse } from "next/server";
import { csrfProtection } from "./csrf-protection";
import { generateCSPHeader } from "./input-sanitization";
import {
	checkGlobalApiRateLimit,
	getClientIdentifier,
	getRateLimitHeaders,
} from "./rate-limiting";

// Security configuration
const SECURITY_CONFIG = {
	// Paths that require full security protection
	PROTECTED_PATHS: ["/api/wizard", "/api/properties", "/api/upload", "/api/ai"],

	// Paths that only need basic protection
	BASIC_PROTECTION_PATHS: ["/api/csrf-token", "/api/health-check"],

	// Paths that are exempt from security checks
	EXEMPT_PATHS: ["/api/auth", "/_next", "/favicon.ico"],

	// Security headers for all responses
	SECURITY_HEADERS: {
		"X-Content-Type-Options": "nosniff",
		"X-Frame-Options": "DENY",
		"X-XSS-Protection": "1; mode=block",
		"Referrer-Policy": "strict-origin-when-cross-origin",
		"Permissions-Policy": "camera=(), microphone=(), geolocation=()",
		"Strict-Transport-Security": "max-age=31536000; includeSubDomains",
	},
} as const;

/**
 * Check if path requires security protection
 */
function requiresProtection(pathname: string): "full" | "basic" | "none" {
	// Check exempt paths first
	if (SECURITY_CONFIG.EXEMPT_PATHS.some((path) => pathname.startsWith(path))) {
		return "none";
	}

	// Check protected paths
	if (
		SECURITY_CONFIG.PROTECTED_PATHS.some((path) => pathname.startsWith(path))
	) {
		return "full";
	}

	// Check basic protection paths
	if (
		SECURITY_CONFIG.BASIC_PROTECTION_PATHS.some((path) =>
			pathname.startsWith(path)
		)
	) {
		return "basic";
	}

	return "none";
}

/**
 * Apply security headers to response
 */
function applySecurityHeaders(response: NextResponse): void {
	// Apply standard security headers
	Object.entries(SECURITY_CONFIG.SECURITY_HEADERS).forEach(([key, value]) => {
		response.headers.set(key, value);
	});

	// Apply Content Security Policy
	const cspHeader = generateCSPHeader();
	response.headers.set("Content-Security-Policy", cspHeader);

	// Add security timestamp
	response.headers.set("X-Security-Check", Date.now().toString());
}

/**
 * Main security middleware
 */
export async function securityMiddleware(
	request: NextRequest,
	userId?: string
): Promise<NextResponse | null> {
	const { pathname } = request.nextUrl;
	const protectionLevel = requiresProtection(pathname);

	// Skip security checks for exempt paths
	if (protectionLevel === "none") {
		return null;
	}

	try {
		const clientId = getClientIdentifier(request, userId);

		// Global rate limiting (applies to all protected paths)
		await checkGlobalApiRateLimit(clientId);

		// Full protection for sensitive endpoints
		if (protectionLevel === "full") {
			// CSRF protection
			const csrfResult = await csrfProtection(request, userId);
			if (csrfResult) {
				return csrfResult; // CSRF validation failed
			}
		}

		return null; // Continue processing
	} catch (_error) {
		// Create error response with security headers
		const errorResponse = NextResponse.json(
			{
				error: "Security validation failed",
				message: "La solicitud no pudo ser validada por razones de seguridad.",
			},
			{ status: 403 }
		);

		applySecurityHeaders(errorResponse);
		return errorResponse;
	}
}

/**
 * Security response wrapper
 */
export function wrapSecurityResponse(response: NextResponse): NextResponse {
	applySecurityHeaders(response);
	return response;
}

/**
 * Create secure response with rate limit headers
 */
export async function createSecureResponse(
	data: any,
	request: NextRequest,
	userId?: string,
	status = 200
): Promise<NextResponse> {
	const clientId = getClientIdentifier(request, userId);

	// Get rate limit status for headers
	const rateLimitStatus = await import("./rate-limiting").then((m) =>
		m.getRateLimitStatus(clientId)
	);

	// Create response
	const response = NextResponse.json(data, { status });

	// Apply security headers
	applySecurityHeaders(response);

	// Add rate limit headers (using global API limits as default)
	const rateLimitHeaders = getRateLimitHeaders(
		rateLimitStatus.formSubmission.remaining,
		rateLimitStatus.formSubmission.resetTime,
		rateLimitStatus.formSubmission.totalHits
	);

	Object.entries(rateLimitHeaders).forEach(([key, value]) => {
		response.headers.set(key, value);
	});

	return response;
}

/**
 * Security audit logging
 */
export type SecurityEvent = {
	type:
		| "csrf_failure"
		| "rate_limit_exceeded"
		| "invalid_input"
		| "suspicious_activity";
	userId?: string;
	ip: string;
	userAgent: string;
	path: string;
	timestamp: Date;
	details?: Record<string, any>;
};

class SecurityAuditLogger {
	private events: SecurityEvent[] = [];
	private readonly maxEvents = 1000;

	log(event: Omit<SecurityEvent, "timestamp">): void {
		const fullEvent: SecurityEvent = {
			...event,
			timestamp: new Date(),
		};

		this.events.push(fullEvent);

		// Keep only recent events
		if (this.events.length > this.maxEvents) {
			this.events = this.events.slice(-this.maxEvents);
		}

		// Log to console in development
		if (process.env.NODE_ENV === "development") {
		}

		// In production, send to monitoring service
		if (process.env.NODE_ENV === "production") {
			this.sendToMonitoring(fullEvent);
		}
	}

	private sendToMonitoring(_event: SecurityEvent): void {}

	getRecentEvents(limit = 100): SecurityEvent[] {
		return this.events.slice(-limit);
	}

	getEventsByType(type: SecurityEvent["type"]): SecurityEvent[] {
		return this.events.filter((event) => event.type === type);
	}

	getEventsByUser(userId: string): SecurityEvent[] {
		return this.events.filter((event) => event.userId === userId);
	}

	clear(): void {
		this.events = [];
	}
}

// Global security audit logger
export const securityAuditLogger = new SecurityAuditLogger();

/**
 * Log security event
 */
export function logSecurityEvent(
	type: SecurityEvent["type"],
	request: NextRequest,
	userId?: string,
	details?: Record<string, any>
): void {
	const ip =
		request.headers.get("x-forwarded-for") ||
		request.headers.get("x-real-ip") ||
		"unknown";
	const userAgent = request.headers.get("user-agent") || "unknown";

	securityAuditLogger.log({
		type,
		userId,
		ip,
		userAgent,
		path: request.nextUrl.pathname,
		details,
	});
}

/**
 * Security health check
 */
export function getSecurityHealthStatus(): {
	status: "healthy" | "warning" | "critical";
	checks: Record<string, boolean>;
	recentEvents: number;
	recommendations: string[];
} {
	const recentEvents = securityAuditLogger.getRecentEvents(50);
	const recentFailures = recentEvents.filter((event) =>
		["csrf_failure", "rate_limit_exceeded", "suspicious_activity"].includes(
			event.type
		)
	);

	const checks = {
		csrfProtectionEnabled: true,
		rateLimitingEnabled: true,
		inputSanitizationEnabled: true,
		securityHeadersEnabled: true,
		auditLoggingEnabled: true,
	};

	const recommendations: string[] = [];
	let status: "healthy" | "warning" | "critical" = "healthy";

	// Check for high failure rate
	if (recentFailures.length > 10) {
		status = "warning";
		recommendations.push("High number of security failures detected");
	}

	if (recentFailures.length > 25) {
		status = "critical";
		recommendations.push("Critical: Very high security failure rate");
	}

	// Check for missing environment variables
	if (!(process.env.SIGNED_URL_SECRET || process.env.NEXTAUTH_SECRET)) {
		status = "critical";
		recommendations.push("Critical: No signing secret configured");
		checks.csrfProtectionEnabled = false;
	}

	if (!process.env.HUGGINGFACE_API_KEY) {
		recommendations.push("Warning: HuggingFace API key not configured");
	}

	return {
		status,
		checks,
		recentEvents: recentEvents.length,
		recommendations,
	};
}

/**
 * Cleanup function for graceful shutdown
 */
export function cleanupSecurity(): void {
	securityAuditLogger.clear();
}

// Handle process termination (only in Node.js runtime, not Edge Runtime)
if (
	typeof process !== "undefined" &&
	process.on &&
	typeof process.on === "function"
) {
	try {
		process.on("SIGTERM", cleanupSecurity);
		process.on("SIGINT", cleanupSecurity);
	} catch (_error) {
		// Ignore errors in Edge Runtime
	}
}
