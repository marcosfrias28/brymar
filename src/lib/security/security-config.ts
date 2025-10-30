/**
 * Centralized security configuration
 * Contains all security-related settings and constants
 */

export const SECURITY_CONFIG = {
	// Input sanitization settings
	INPUT_SANITIZATION: {
		MAX_LENGTHS: {
			title: 100,
			description: 2000,
			address: 200,
			city: 100,
			province: 100,
			filename: 255,
			characteristic: 50,
		},

		ALLOWED_HTML_TAGS: ["p", "br", "strong", "em", "ul", "ol", "li"],

		BLOCKED_PATTERNS: [
			// Script injection
			/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
			/javascript:/gi,
			/on\w+\s*=/gi,
			/data:text\/html/gi,
			/vbscript:/gi,

			// HTML injection
			/<iframe/gi,
			/<object/gi,
			/<embed/gi,
			/<link/gi,
			/<meta/gi,
			/<style/gi,

			// CSS injection
			/expression\s*\(/gi,
			/url\s*\(/gi,
			/@import/gi,
			/binding\s*:/gi,

			// SQL injection patterns
			/union\s+select/gi,
			/drop\s+table/gi,
			/insert\s+into/gi,
			/delete\s+from/gi,
			/update\s+set/gi,

			// Command injection
			/\|\s*\w+/g,
			/;\s*\w+/g,
			/&&\s*\w+/g,
			/\$\(/g,
			/`[^`]*`/g,
		],
	},

	// File upload security settings
	FILE_UPLOAD: {
		MAX_FILE_SIZES: {
			image: 10 * 1024 * 1024, // 10MB
			video: 100 * 1024 * 1024, // 100MB
		},

		ALLOWED_MIME_TYPES: {
			image: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
			video: ["video/mp4", "video/webm", "video/ogg"],
		},

		ALLOWED_EXTENSIONS: {
			image: [".jpg", ".jpeg", ".png", ".webp"],
			video: [".mp4", ".webm", ".ogg"],
		},

		MAX_FILES: {
			images: 20,
			videos: 5,
		},

		TRUSTED_DOMAINS: ["vercel-storage.com", "blob.vercel-storage.com"],
	},

	// Rate limiting settings
	RATE_LIMITING: {
		AI_GENERATION: {
			windowMs: 60 * 1000, // 1 minute
			maxRequests: 5, // 5 requests per minute per user
		},

		IMAGE_UPLOAD: {
			windowMs: 60 * 1000, // 1 minute
			maxRequests: 20, // 20 uploads per minute per user
		},

		DRAFT_SAVE: {
			windowMs: 60 * 1000, // 1 minute
			maxRequests: 30, // 30 saves per minute per user
		},

		FORM_SUBMISSION: {
			windowMs: 5 * 60 * 1000, // 5 minutes
			maxRequests: 10, // 10 submissions per 5 minutes per user
		},

		GLOBAL_API: {
			windowMs: 15 * 60 * 1000, // 15 minutes
			maxRequests: 100, // 100 requests per 15 minutes per IP
		},
	},

	// CSRF protection settings
	CSRF_PROTECTION: {
		TOKEN_LENGTH: 32,
		TOKEN_LIFETIME: 60 * 60 * 1000, // 1 hour

		COOKIE_NAME: "__csrf_token",
		HEADER_NAME: "x-csrf-token",
		FORM_FIELD_NAME: "_csrf_token",

		EXEMPT_METHODS: ["GET", "HEAD", "OPTIONS"],

		PROTECTED_PATHS: [
			"/api/wizard",
			"/api/properties",
			"/api/upload",
			"/api/ai",
		],
	},

	// Signed URL settings
	SIGNED_URLS: {
		DEFAULT_EXPIRY: {
			upload: 60 * 60 * 1000, // 1 hour for uploads
			download: 24 * 60 * 60 * 1000, // 24 hours for downloads
			preview: 7 * 24 * 60 * 60 * 1000, // 7 days for previews
		},

		MAX_EXPIRY: {
			upload: 24 * 60 * 60 * 1000, // 24 hours max for uploads
			download: 7 * 24 * 60 * 60 * 1000, // 7 days max for downloads
			preview: 30 * 24 * 60 * 60 * 1000, // 30 days max for previews
		},

		ALLOWED_OPERATIONS: ["upload", "download", "preview", "delete"] as const,
	},

	// Security headers
	SECURITY_HEADERS: {
		"X-Content-Type-Options": "nosniff",
		"X-Frame-Options": "DENY",
		"X-XSS-Protection": "1; mode=block",
		"Referrer-Policy": "strict-origin-when-cross-origin",
		"Permissions-Policy": "camera=(), microphone=(), geolocation=()",
		"Strict-Transport-Security": "max-age=31536000; includeSubDomains",
	},

	// Content Security Policy
	CSP_DIRECTIVES: {
		"default-src": ["'self'"],
		"script-src": [
			"'self'",
			"'unsafe-inline'",
			"https://api-inference.huggingface.co",
		],
		"style-src": ["'self'", "'unsafe-inline'"],
		"img-src": ["'self'", "data:", "https:", "blob:"],
		"font-src": ["'self'", "https:"],
		"connect-src": [
			"'self'",
			"https://api-inference.huggingface.co",
			"https://*.vercel-storage.com",
		],
		"media-src": ["'self'", "https:", "blob:"],
		"object-src": ["'none'"],
		"base-uri": ["'self'"],
		"form-action": ["'self'"],
		"frame-ancestors": ["'none'"],
		"upgrade-insecure-requests": [],
	},

	// Monitoring and alerting
	MONITORING: {
		MAX_SECURITY_EVENTS: 1000,
		ALERT_THRESHOLDS: {
			csrf_failures: 10, // Alert after 10 CSRF failures
			rate_limit_exceeded: 25, // Alert after 25 rate limit violations
			suspicious_activity: 5, // Alert after 5 suspicious activities
		},

		CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
	},

	// Environment-specific settings
	ENVIRONMENT: {
		DEVELOPMENT: {
			LOG_SECURITY_EVENTS: true,
			STRICT_CSP: false,
			ALLOW_HTTP: true,
		},

		PRODUCTION: {
			LOG_SECURITY_EVENTS: false, // Use external monitoring
			STRICT_CSP: true,
			ALLOW_HTTP: false,
		},
	},
} as const;

/**
 * Get environment-specific security configuration
 */
export function getSecurityConfig() {
	const env = process.env.NODE_ENV || "development";
	const baseConfig = SECURITY_CONFIG;

	if (env === "production") {
		return {
			...baseConfig,
			...baseConfig.ENVIRONMENT.PRODUCTION,
		};
	}

	return {
		...baseConfig,
		...baseConfig.ENVIRONMENT.DEVELOPMENT,
	};
}

/**
 * Validate security configuration
 */
export function validateSecurityConfig(): {
	valid: boolean;
	errors: string[];
	warnings: string[];
} {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Check required environment variables
	if (!(process.env.SIGNED_URL_SECRET || process.env.NEXTAUTH_SECRET)) {
		errors.push(
			"Missing SIGNED_URL_SECRET or NEXTAUTH_SECRET environment variable"
		);
	}

	if (!process.env.HUGGINGFACE_API_KEY) {
		warnings.push(
			"Missing HUGGINGFACE_API_KEY environment variable - AI features will use fallbacks"
		);
	}

	// Check security settings
	if (SECURITY_CONFIG.RATE_LIMITING.AI_GENERATION.maxRequests > 10) {
		warnings.push(
			"AI generation rate limit is quite high - consider reducing for better security"
		);
	}

	if (SECURITY_CONFIG.FILE_UPLOAD.MAX_FILE_SIZES.image > 20 * 1024 * 1024) {
		warnings.push(
			"Image file size limit is quite high - consider reducing for better performance"
		);
	}

	// Check CSP configuration
	if (
		SECURITY_CONFIG.CSP_DIRECTIVES["script-src"].includes("'unsafe-inline'")
	) {
		warnings.push(
			"CSP allows 'unsafe-inline' scripts - consider using nonces for better security"
		);
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Security configuration for different deployment environments
 */
export const DEPLOYMENT_SECURITY_CONFIGS = {
	development: {
		rateLimiting: {
			enabled: true,
			strict: false,
		},
		csrfProtection: {
			enabled: true,
			strict: false,
		},
		inputSanitization: {
			enabled: true,
			strict: false,
		},
		fileUploadSecurity: {
			enabled: true,
			virusScanning: false,
			contentAnalysis: false,
		},
	},

	staging: {
		rateLimiting: {
			enabled: true,
			strict: true,
		},
		csrfProtection: {
			enabled: true,
			strict: true,
		},
		inputSanitization: {
			enabled: true,
			strict: true,
		},
		fileUploadSecurity: {
			enabled: true,
			virusScanning: true,
			contentAnalysis: false,
		},
	},

	production: {
		rateLimiting: {
			enabled: true,
			strict: true,
		},
		csrfProtection: {
			enabled: true,
			strict: true,
		},
		inputSanitization: {
			enabled: true,
			strict: true,
		},
		fileUploadSecurity: {
			enabled: true,
			virusScanning: true,
			contentAnalysis: true,
		},
	},
} as const;

/**
 * Get deployment-specific security configuration
 */
export function getDeploymentSecurityConfig(
	environment: keyof typeof DEPLOYMENT_SECURITY_CONFIGS = "development"
) {
	return DEPLOYMENT_SECURITY_CONFIGS[environment];
}
