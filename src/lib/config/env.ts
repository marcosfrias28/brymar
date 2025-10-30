/**
 * Environment variables configuration and validation
 */

export type EnvironmentConfig = {
	// Database
	POSTGRES_URL: string;
	POSTGRES_PRISMA_URL: string;
	POSTGRES_USER: string;
	POSTGRES_HOST: string;
	POSTGRES_PASSWORD: string;
	POSTGRES_DATABASE: string;

	// Authentication
	BETTER_AUTH_URL: string;
	BETTER_AUTH_SECRET: string;

	// External Services
	RESEND_API_KEY: string;
	GEMINI_API_KEY?: string;
	BLOB_READ_WRITE_TOKEN: string;

	// App Configuration
	NEXT_PUBLIC_APP_URL: string;
	NODE_ENV: string;
};

/**
 * Validates that all required environment variables are present
 */
export function validateEnvironmentVariables(): {
	isValid: boolean;
	missingVars: string[];
	config?: Partial<EnvironmentConfig>;
} {
	const requiredVars: (keyof EnvironmentConfig)[] = [
		"POSTGRES_URL",
		"POSTGRES_PRISMA_URL",
		"POSTGRES_USER",
		"POSTGRES_HOST",
		"POSTGRES_PASSWORD",
		"POSTGRES_DATABASE",
		"BETTER_AUTH_URL",
		"BETTER_AUTH_SECRET",
		"RESEND_API_KEY",
		"BLOB_READ_WRITE_TOKEN",
		"NEXT_PUBLIC_APP_URL",
	];

	const missingVars: string[] = [];
	const config: Partial<EnvironmentConfig> = {};

	// Check each required variable
	for (const varName of requiredVars) {
		const value = process.env[varName];
		if (value) {
			config[varName] = value;
		} else {
			missingVars.push(varName);
		}
	}

	// Add optional variables
	config.GEMINI_API_KEY = process.env.GEMINI_API_KEY;
	config.NODE_ENV = process.env.NODE_ENV || "development";

	return {
		isValid: missingVars.length === 0,
		missingVars,
		config: missingVars.length === 0 ? (config as EnvironmentConfig) : config,
	};
}

/**
 * Gets environment configuration with validation
 */
export function getEnvironmentConfig(): EnvironmentConfig {
	const validation = validateEnvironmentVariables();

	if (!validation.isValid) {
		const errorMessage = `Missing required environment variables: ${validation.missingVars.join(", ")}`;

		if (process.env.NODE_ENV === "production") {
			throw new Error(`Production deployment failed: ${errorMessage}`);
		}
	}

	return validation.config as EnvironmentConfig;
}

/**
 * Database-specific environment validation
 */
export function validateDatabaseConfig(): boolean {
	const dbVars = [
		"POSTGRES_URL",
		"POSTGRES_PRISMA_URL",
		"POSTGRES_USER",
		"POSTGRES_HOST",
		"POSTGRES_PASSWORD",
		"POSTGRES_DATABASE",
	];

	const missing = dbVars.filter((varName) => !process.env[varName]);

	if (missing.length > 0) {
		return false;
	}

	return true;
}
