/**
 * Vercel Blob configuration and validation
 */

export type BlobConfig = {
	isConfigured: boolean;
	token?: string;
	storeUrl?: string;
	error?: string;
};

/**
 * Validate Vercel Blob configuration
 */
export function validateBlobConfig(): BlobConfig {
	const token = process.env.BLOB_READ_WRITE_TOKEN;

	if (!token) {
		return {
			isConfigured: false,
			error: "BLOB_READ_WRITE_TOKEN environment variable is not set",
		};
	}

	// Basic token format validation
	if (!token.startsWith("vercel_blob_")) {
		return {
			isConfigured: false,
			error:
				"BLOB_READ_WRITE_TOKEN appears to be invalid (should start with vercel_blob_)",
		};
	}

	return {
		isConfigured: true,
		token,
	};
}

/**
 * Check if blob storage is available
 */
export function isBlobStorageAvailable(): boolean {
	const config = validateBlobConfig();
	return config.isConfigured;
}

/**
 * Get blob configuration with detailed error information
 */
export function getBlobConfigInfo(): BlobConfig & {
	recommendations: string[];
	isDevelopment: boolean;
} {
	const config = validateBlobConfig();
	const isDevelopment = process.env.NODE_ENV === "development";

	const recommendations: string[] = [];

	if (!config.isConfigured) {
		recommendations.push(
			"Set up Vercel Blob storage:",
			"1. Go to your Vercel dashboard",
			"2. Navigate to Storage tab",
			"3. Create a new Blob store",
			"4. Copy the BLOB_READ_WRITE_TOKEN to your .env file"
		);

		if (isDevelopment) {
			recommendations.push(
				"5. For development, you can use mock storage by setting MOCK_BLOB_STORAGE=true"
			);
		}
	}

	return {
		...config,
		recommendations,
		isDevelopment,
	};
}

/**
 * Should use mock storage (for development/testing)
 */
export function shouldUseMockStorage(): boolean {
	const isDevelopment = process.env.NODE_ENV === "development";
	const mockEnabled = process.env.MOCK_BLOB_STORAGE === "true";
	const blobConfigured = isBlobStorageAvailable();

	// Use mock storage if:
	// 1. Explicitly enabled via env var, OR
	// 2. In development and blob is not configured
	return mockEnabled || (isDevelopment && !blobConfigured);
}
