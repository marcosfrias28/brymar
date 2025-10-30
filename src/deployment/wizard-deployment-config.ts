/**
 * AI Property Wizard Deployment Configuration
 *
 * This file contains all deployment-related configurations for the wizard,
 * including environment variables, service endpoints, and deployment settings.
 */

export type DeploymentConfig = {
	environment: "development" | "staging" | "production";
	services: {
		ai: AIServiceConfig;
		storage: StorageConfig;
		maps: MapServiceConfig;
		analytics: AnalyticsConfig;
		database: DatabaseConfig;
	};
	security: SecurityConfig;
	performance: PerformanceConfig;
	monitoring: MonitoringConfig;
};

export type AIServiceConfig = {
	provider: "huggingface" | "openai" | "anthropic";
	apiKey: string;
	baseUrl: string;
	models: {
		textGeneration: string;
		titleGeneration: string;
		tagGeneration: string;
	};
	rateLimits: {
		requestsPerMinute: number;
		requestsPerHour: number;
		requestsPerDay: number;
	};
	timeout: number;
	retryAttempts: number;
	fallbackEnabled: boolean;
};

export type StorageConfig = {
	provider: "vercel-blob" | "aws-s3" | "cloudinary";
	apiKey: string;
	bucketName?: string;
	region?: string;
	maxFileSize: number;
	allowedTypes: string[];
	cdnUrl?: string;
	signedUrlExpiration: number;
};

export type MapServiceConfig = {
	provider: "mapbox" | "google-maps" | "leaflet-osm";
	apiKey?: string;
	defaultBounds: {
		north: number;
		south: number;
		east: number;
		west: number;
	};
	defaultZoom: number;
	geocodingProvider: "mapbox" | "nominatim" | "google";
};

export type AnalyticsConfig = {
	enabled: boolean;
	provider: "custom" | "google-analytics" | "mixpanel";
	trackingId?: string;
	events: {
		stepCompletion: boolean;
		aiGeneration: boolean;
		imageUpload: boolean;
		errors: boolean;
		performance: boolean;
	};
};

export type DatabaseConfig = {
	provider: "neon" | "vercel-postgres" | "supabase";
	connectionString: string;
	poolSize: number;
	ssl: boolean;
	migrations: {
		autoRun: boolean;
		directory: string;
	};
};

export type SecurityConfig = {
	csrf: {
		enabled: boolean;
		secret: string;
	};
	rateLimiting: {
		enabled: boolean;
		windowMs: number;
		maxRequests: number;
	};
	fileUpload: {
		virusScanning: boolean;
		contentTypeValidation: boolean;
		fileSizeLimit: number;
	};
	cors: {
		origins: string[];
		credentials: boolean;
	};
};

export type PerformanceConfig = {
	caching: {
		enabled: boolean;
		ttl: number;
		provider: "redis" | "memory" | "vercel-kv";
	};
	compression: {
		enabled: boolean;
		level: number;
	};
	bundleOptimization: {
		codesplitting: boolean;
		lazyLoading: boolean;
		treeshaking: boolean;
	};
};

export type MonitoringConfig = {
	logging: {
		level: "debug" | "info" | "warn" | "error";
		provider: "console" | "winston" | "pino";
	};
	errorTracking: {
		enabled: boolean;
		provider: "sentry" | "bugsnag" | "rollbar";
		dsn?: string;
	};
	performance: {
		enabled: boolean;
		sampleRate: number;
		vitals: boolean;
	};
	healthChecks: {
		enabled: boolean;
		endpoints: string[];
		interval: number;
	};
};

// Environment-specific configurations
export const deploymentConfigs: Record<string, DeploymentConfig> = {
	development: {
		environment: "development",
		services: {
			ai: {
				provider: "huggingface",
				apiKey: process.env.HUGGINGFACE_API_KEY || "",
				baseUrl: "https://api-inference.huggingface.co",
				models: {
					textGeneration: "microsoft/DialoGPT-medium",
					titleGeneration: "google/flan-t5-base",
					tagGeneration: "facebook/bart-large-mnli",
				},
				rateLimits: {
					requestsPerMinute: 10,
					requestsPerHour: 100,
					requestsPerDay: 1000,
				},
				timeout: 30_000,
				retryAttempts: 3,
				fallbackEnabled: true,
			},
			storage: {
				provider: "vercel-blob",
				apiKey: process.env.BLOB_READ_WRITE_TOKEN || "",
				maxFileSize: 10 * 1024 * 1024, // 10MB
				allowedTypes: ["image/jpeg", "image/png", "image/webp", "video/mp4"],
				signedUrlExpiration: 3600, // 1 hour
			},
			maps: {
				provider: "leaflet-osm",
				defaultBounds: {
					north: 19.9,
					south: 17.5,
					east: -68.3,
					west: -72.0,
				},
				defaultZoom: 8,
				geocodingProvider: "nominatim",
			},
			analytics: {
				enabled: true,
				provider: "custom",
				events: {
					stepCompletion: true,
					aiGeneration: true,
					imageUpload: true,
					errors: true,
					performance: true,
				},
			},
			database: {
				provider: "neon",
				connectionString: process.env.DATABASE_URL || "",
				poolSize: 10,
				ssl: true,
				migrations: {
					autoRun: true,
					directory: "./lib/db/migrations",
				},
			},
		},
		security: {
			csrf: {
				enabled: false, // Disabled in development
				secret: process.env.CSRF_SECRET || "dev-secret",
			},
			rateLimiting: {
				enabled: false, // Disabled in development
				windowMs: 15 * 60 * 1000, // 15 minutes
				maxRequests: 100,
			},
			fileUpload: {
				virusScanning: false,
				contentTypeValidation: true,
				fileSizeLimit: 10 * 1024 * 1024,
			},
			cors: {
				origins: ["http://localhost:3000"],
				credentials: true,
			},
		},
		performance: {
			caching: {
				enabled: false,
				ttl: 300,
				provider: "memory",
			},
			compression: {
				enabled: false,
				level: 6,
			},
			bundleOptimization: {
				codesplitting: true,
				lazyLoading: true,
				treeshaking: true,
			},
		},
		monitoring: {
			logging: {
				level: "debug",
				provider: "console",
			},
			errorTracking: {
				enabled: false,
				provider: "sentry",
			},
			performance: {
				enabled: true,
				sampleRate: 1.0,
				vitals: true,
			},
			healthChecks: {
				enabled: true,
				endpoints: ["/api/health-check"],
				interval: 30_000,
			},
		},
	},

	staging: {
		environment: "staging",
		services: {
			ai: {
				provider: "huggingface",
				apiKey: process.env.HUGGINGFACE_API_KEY || "",
				baseUrl: "https://api-inference.huggingface.co",
				models: {
					textGeneration: "microsoft/DialoGPT-medium",
					titleGeneration: "google/flan-t5-base",
					tagGeneration: "facebook/bart-large-mnli",
				},
				rateLimits: {
					requestsPerMinute: 30,
					requestsPerHour: 500,
					requestsPerDay: 5000,
				},
				timeout: 30_000,
				retryAttempts: 3,
				fallbackEnabled: true,
			},
			storage: {
				provider: "vercel-blob",
				apiKey: process.env.BLOB_READ_WRITE_TOKEN || "",
				maxFileSize: 10 * 1024 * 1024,
				allowedTypes: ["image/jpeg", "image/png", "image/webp", "video/mp4"],
				signedUrlExpiration: 3600,
			},
			maps: {
				provider: "leaflet-osm",
				defaultBounds: {
					north: 19.9,
					south: 17.5,
					east: -68.3,
					west: -72.0,
				},
				defaultZoom: 8,
				geocodingProvider: "nominatim",
			},
			analytics: {
				enabled: true,
				provider: "custom",
				events: {
					stepCompletion: true,
					aiGeneration: true,
					imageUpload: true,
					errors: true,
					performance: true,
				},
			},
			database: {
				provider: "neon",
				connectionString: process.env.DATABASE_URL || "",
				poolSize: 20,
				ssl: true,
				migrations: {
					autoRun: false, // Manual in staging
					directory: "./lib/db/migrations",
				},
			},
		},
		security: {
			csrf: {
				enabled: true,
				secret: process.env.CSRF_SECRET || "",
			},
			rateLimiting: {
				enabled: true,
				windowMs: 15 * 60 * 1000,
				maxRequests: 200,
			},
			fileUpload: {
				virusScanning: false, // Enable in production
				contentTypeValidation: true,
				fileSizeLimit: 10 * 1024 * 1024,
			},
			cors: {
				origins: [process.env.STAGING_URL || ""],
				credentials: true,
			},
		},
		performance: {
			caching: {
				enabled: true,
				ttl: 600,
				provider: "vercel-kv",
			},
			compression: {
				enabled: true,
				level: 6,
			},
			bundleOptimization: {
				codesplitting: true,
				lazyLoading: true,
				treeshaking: true,
			},
		},
		monitoring: {
			logging: {
				level: "info",
				provider: "winston",
			},
			errorTracking: {
				enabled: true,
				provider: "sentry",
				dsn: process.env.SENTRY_DSN,
			},
			performance: {
				enabled: true,
				sampleRate: 0.5,
				vitals: true,
			},
			healthChecks: {
				enabled: true,
				endpoints: ["/api/health-check", "/api/analytics/wizard/health"],
				interval: 60_000,
			},
		},
	},

	production: {
		environment: "production",
		services: {
			ai: {
				provider: "huggingface",
				apiKey: process.env.HUGGINGFACE_API_KEY || "",
				baseUrl: "https://api-inference.huggingface.co",
				models: {
					textGeneration: "microsoft/DialoGPT-medium",
					titleGeneration: "google/flan-t5-base",
					tagGeneration: "facebook/bart-large-mnli",
				},
				rateLimits: {
					requestsPerMinute: 60,
					requestsPerHour: 1000,
					requestsPerDay: 10_000,
				},
				timeout: 30_000,
				retryAttempts: 3,
				fallbackEnabled: true,
			},
			storage: {
				provider: "vercel-blob",
				apiKey: process.env.BLOB_READ_WRITE_TOKEN || "",
				maxFileSize: 10 * 1024 * 1024,
				allowedTypes: ["image/jpeg", "image/png", "image/webp", "video/mp4"],
				signedUrlExpiration: 3600,
			},
			maps: {
				provider: "leaflet-osm",
				defaultBounds: {
					north: 19.9,
					south: 17.5,
					east: -68.3,
					west: -72.0,
				},
				defaultZoom: 8,
				geocodingProvider: "nominatim",
			},
			analytics: {
				enabled: true,
				provider: "custom",
				events: {
					stepCompletion: true,
					aiGeneration: true,
					imageUpload: true,
					errors: true,
					performance: true,
				},
			},
			database: {
				provider: "neon",
				connectionString: process.env.DATABASE_URL || "",
				poolSize: 50,
				ssl: true,
				migrations: {
					autoRun: false, // Manual in production
					directory: "./lib/db/migrations",
				},
			},
		},
		security: {
			csrf: {
				enabled: true,
				secret: process.env.CSRF_SECRET || "",
			},
			rateLimiting: {
				enabled: true,
				windowMs: 15 * 60 * 1000,
				maxRequests: 500,
			},
			fileUpload: {
				virusScanning: true,
				contentTypeValidation: true,
				fileSizeLimit: 10 * 1024 * 1024,
			},
			cors: {
				origins: [process.env.PRODUCTION_URL || ""],
				credentials: true,
			},
		},
		performance: {
			caching: {
				enabled: true,
				ttl: 1800, // 30 minutes
				provider: "vercel-kv",
			},
			compression: {
				enabled: true,
				level: 9,
			},
			bundleOptimization: {
				codesplitting: true,
				lazyLoading: true,
				treeshaking: true,
			},
		},
		monitoring: {
			logging: {
				level: "warn",
				provider: "winston",
			},
			errorTracking: {
				enabled: true,
				provider: "sentry",
				dsn: process.env.SENTRY_DSN,
			},
			performance: {
				enabled: true,
				sampleRate: 0.1,
				vitals: true,
			},
			healthChecks: {
				enabled: true,
				endpoints: [
					"/api/health-check",
					"/api/analytics/wizard/health",
					"/api/analytics/wizard/ai",
				],
				interval: 30_000,
			},
		},
	},
};

// Get current deployment configuration
export function getDeploymentConfig(): DeploymentConfig {
	const environment = (process.env.NODE_ENV ||
		"development") as keyof typeof deploymentConfigs;
	return deploymentConfigs[environment] || deploymentConfigs.development;
}

// Validate required environment variables
export function validateEnvironmentVariables(): {
	valid: boolean;
	missing: string[];
} {
	const config = getDeploymentConfig();
	const missing: string[] = [];

	// Check AI service configuration
	if (!config.services.ai.apiKey) {
		missing.push("HUGGINGFACE_API_KEY");
	}

	// Check storage configuration
	if (!config.services.storage.apiKey) {
		missing.push("BLOB_READ_WRITE_TOKEN");
	}

	// Check database configuration
	if (!config.services.database.connectionString) {
		missing.push("DATABASE_URL");
	}

	// Check security configuration for non-development environments
	if (config.environment !== "development" && !config.security.csrf.secret) {
		missing.push("CSRF_SECRET");
	}

	// Check monitoring configuration
	if (
		config.monitoring.errorTracking.enabled &&
		!config.monitoring.errorTracking.dsn
	) {
		missing.push("SENTRY_DSN");
	}

	return {
		valid: missing.length === 0,
		missing,
	};
}

// Service health check functions
export async function checkServiceHealth(): Promise<{
	healthy: boolean;
	services: Record<
		string,
		{ status: "healthy" | "unhealthy"; latency?: number; error?: string }
	>;
}> {
	const config = getDeploymentConfig();
	const services: Record<
		string,
		{ status: "healthy" | "unhealthy"; latency?: number; error?: string }
	> = {};

	// Check AI service
	try {
		const start = Date.now();
		const response = await fetch(`${config.services.ai.baseUrl}/models`, {
			headers: {
				Authorization: `Bearer ${config.services.ai.apiKey}`,
			},
			signal: AbortSignal.timeout(5000),
		});

		if (response.ok) {
			services.ai = { status: "healthy", latency: Date.now() - start };
		} else {
			services.ai = { status: "unhealthy", error: `HTTP ${response.status}` };
		}
	} catch (error) {
		services.ai = {
			status: "unhealthy",
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}

	// Check database
	try {
		const start = Date.now();
		// This would be replaced with actual database health check
		// const db = await getDatabase();
		// await db.raw('SELECT 1');
		services.database = { status: "healthy", latency: Date.now() - start };
	} catch (error) {
		services.database = {
			status: "unhealthy",
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}

	// Check storage service
	try {
		const start = Date.now();
		// This would be replaced with actual storage health check
		services.storage = { status: "healthy", latency: Date.now() - start };
	} catch (error) {
		services.storage = {
			status: "unhealthy",
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}

	const allHealthy = Object.values(services).every(
		(service) => service.status === "healthy"
	);

	return {
		healthy: allHealthy,
		services,
	};
}

// Performance monitoring utilities
export function getPerformanceMetrics() {
	return {
		memory: process.memoryUsage(),
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
	};
}

export default getDeploymentConfig;
