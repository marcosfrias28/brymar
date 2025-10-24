/**
 * Retry logic with exponential backoff for API failures
 * Implements sophisticated retry strategies for different types of operations
 */

import {
	AIServiceError,
	NetworkError,
	UploadError,
	WizardError,
} from "../errors/wizard-errors";

export interface RetryOptions {
	maxAttempts: number;
	baseDelay: number;
	maxDelay: number;
	backoffFactor: number;
	jitter: boolean;
	shouldRetry?: (error: Error, attempt: number) => boolean;
	onRetry?: (error: Error, attempt: number) => void;
}

export interface RetryResult<T> {
	success: boolean;
	data?: T;
	error?: Error;
	attempts: number;
	totalTime: number;
}

// Default retry configurations for different operation types
export const RETRY_CONFIGS = {
	AI_GENERATION: {
		maxAttempts: 3,
		baseDelay: 1000,
		maxDelay: 10000,
		backoffFactor: 2,
		jitter: true,
		shouldRetry: (error: Error, attempt: number) => {
			if (error instanceof AIServiceError) {
				return error.retryable && attempt < 3;
			}
			return error instanceof NetworkError && attempt < 3;
		},
	},
	IMAGE_UPLOAD: {
		maxAttempts: 2,
		baseDelay: 2000,
		maxDelay: 8000,
		backoffFactor: 2,
		jitter: true,
		shouldRetry: (error: Error, attempt: number) => {
			if (error instanceof UploadError) {
				return error.retryable && attempt < 2;
			}
			return error instanceof NetworkError && attempt < 2;
		},
	},
	NETWORK_REQUEST: {
		maxAttempts: 3,
		baseDelay: 500,
		maxDelay: 5000,
		backoffFactor: 2,
		jitter: true,
		shouldRetry: (error: Error, attempt: number) => {
			return error instanceof NetworkError && attempt < 3;
		},
	},
	DRAFT_OPERATIONS: {
		maxAttempts: 2,
		baseDelay: 1000,
		maxDelay: 3000,
		backoffFactor: 1.5,
		jitter: false,
		shouldRetry: (error: Error, attempt: number) => {
			if (error instanceof WizardError) {
				return error.retryable && attempt < 2;
			}
			return false;
		},
	},
} as const;

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
	attempt: number,
	baseDelay: number,
	maxDelay: number,
	backoffFactor: number,
	jitter: boolean,
): number {
	const exponentialDelay = Math.min(
		baseDelay * backoffFactor ** (attempt - 1),
		maxDelay,
	);

	if (!jitter) {
		return exponentialDelay;
	}

	// Add jitter to prevent thundering herd
	const jitterAmount = exponentialDelay * 0.1;
	const randomJitter = (Math.random() - 0.5) * 2 * jitterAmount;

	return Math.max(0, exponentialDelay + randomJitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
	operation: () => Promise<T>,
	options: RetryOptions,
): Promise<RetryResult<T>> {
	const startTime = Date.now();
	let lastError: Error | undefined;

	for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
		try {
			const result = await operation();
			return {
				success: true,
				data: result,
				attempts: attempt,
				totalTime: Date.now() - startTime,
			};
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			// Check if we should retry
			const shouldRetry = options.shouldRetry
				? options.shouldRetry(lastError, attempt)
				: lastError instanceof NetworkError ||
					(lastError instanceof WizardError && lastError.retryable);

			// If this is the last attempt or we shouldn't retry, break
			if (attempt === options.maxAttempts || !shouldRetry) {
				break;
			}

			// Call retry callback if provided
			if (options.onRetry) {
				options.onRetry(lastError, attempt);
			}

			// Calculate delay and wait
			const delay = calculateDelay(
				attempt,
				options.baseDelay,
				options.maxDelay,
				options.backoffFactor,
				options.jitter,
			);

			await sleep(delay);
		}
	}

	return {
		success: false,
		error: lastError,
		attempts: options.maxAttempts,
		totalTime: Date.now() - startTime,
	};
}

/**
 * Retry wrapper for AI operations
 */
export async function retryAIOperation<T>(
	operation: () => Promise<T>,
	onRetry?: (error: Error, attempt: number) => void,
): Promise<T> {
	const result = await retryWithBackoff(operation, {
		...RETRY_CONFIGS.AI_GENERATION,
		onRetry,
	});

	if (result.success && result.data !== undefined) {
		return result.data;
	}

	throw (
		result.error ||
		new AIServiceError(
			"AI operation failed after all retry attempts",
			"API_ERROR",
			false,
		)
	);
}

/**
 * Retry wrapper for upload operations
 */
export async function retryUploadOperation<T>(
	operation: () => Promise<T>,
	onRetry?: (error: Error, attempt: number) => void,
): Promise<T> {
	const result = await retryWithBackoff(operation, {
		...RETRY_CONFIGS.IMAGE_UPLOAD,
		onRetry,
	});

	if (result.success && result.data !== undefined) {
		return result.data;
	}

	throw (
		result.error ||
		new UploadError(
			"Upload operation failed after all retry attempts",
			"UPLOAD_FAILED",
			false,
		)
	);
}

/**
 * Retry wrapper for network requests
 */
export async function retryNetworkRequest<T>(
	operation: () => Promise<T>,
	onRetry?: (error: Error, attempt: number) => void,
): Promise<T> {
	const result = await retryWithBackoff(operation, {
		...RETRY_CONFIGS.NETWORK_REQUEST,
		onRetry,
	});

	if (result.success && result.data !== undefined) {
		return result.data;
	}

	throw (
		result.error ||
		new NetworkError("Network request failed after all retry attempts")
	);
}

/**
 * Retry wrapper for draft operations
 */
export async function retryDraftOperation<T>(
	operation: () => Promise<T>,
	onRetry?: (error: Error, attempt: number) => void,
): Promise<T> {
	const result = await retryWithBackoff(operation, {
		...RETRY_CONFIGS.DRAFT_OPERATIONS,
		onRetry,
	});

	if (result.success && result.data !== undefined) {
		return result.data;
	}

	throw (
		result.error ||
		new WizardError(
			"Draft operation failed after all retry attempts",
			"OPERATION_FAILED",
			false,
		)
	);
}

/**
 * Circuit breaker pattern for preventing cascading failures
 */
export class CircuitBreaker {
	private failures = 0;
	private lastFailureTime = 0;
	private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

	constructor(
		private readonly failureThreshold: number = 5,
		private readonly recoveryTimeout: number = 60000, // 1 minute
	) {}

	async execute<T>(operation: () => Promise<T>): Promise<T> {
		if (this.state === "OPEN") {
			if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
				this.state = "HALF_OPEN";
			} else {
				throw new WizardError(
					"Circuit breaker is open",
					"CIRCUIT_BREAKER_OPEN",
					true,
					"El servicio está temporalmente deshabilitado. Inténtalo más tarde.",
				);
			}
		}

		try {
			const result = await operation();
			this.onSuccess();
			return result;
		} catch (error) {
			this.onFailure();
			throw error;
		}
	}

	private onSuccess(): void {
		this.failures = 0;
		this.state = "CLOSED";
	}

	private onFailure(): void {
		this.failures++;
		this.lastFailureTime = Date.now();

		if (this.failures >= this.failureThreshold) {
			this.state = "OPEN";
		}
	}

	getState(): string {
		return this.state;
	}

	reset(): void {
		this.failures = 0;
		this.lastFailureTime = 0;
		this.state = "CLOSED";
	}
}

// Global circuit breakers for different services
export const circuitBreakers = {
	aiService: new CircuitBreaker(3, 30000), // 3 failures, 30s recovery
	uploadService: new CircuitBreaker(5, 60000), // 5 failures, 1min recovery
	mapService: new CircuitBreaker(3, 30000), // 3 failures, 30s recovery
} as const;
