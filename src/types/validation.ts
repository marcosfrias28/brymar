/**
 * Validation Types
 *
 * Common validation types used across the application
 */

export type ValidationResult = {
	success: boolean;
	errors?: Record<string, string[]>;
};

export type ValidationFunction<T = unknown> = (data: T) => ValidationResult;
