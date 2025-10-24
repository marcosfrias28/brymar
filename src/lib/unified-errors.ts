/**
 * Unified Error Handling System
 *
 * This file consolidates all error handling into a single, simple system
 * that replaces the complex DDD error hierarchy with a straightforward approach.
 */

import { z } from "zod";

// ============================================================================
// BASE ERROR TYPES
// ============================================================================

/**
 * Base application error class - replaces all DDD error classes
 */
export class AppError extends Error {
	public readonly timestamp: Date;
	public readonly context?: Record<string, any>;

	constructor(
		message: string,
		public readonly code: string,
		public readonly statusCode: number = 500,
		context?: Record<string, any>,
		public readonly cause?: Error,
	) {
		super(message);
		this.name = "AppError";
		this.timestamp = new Date();
		this.context = context;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}

	/**
	 * Get a serializable representation of the error
	 */
	toJSON(): object {
		return {
			name: this.name,
			message: this.message,
			code: this.code,
			statusCode: this.statusCode,
			timestamp: this.timestamp.toISOString(),
			context: this.context,
			cause: this.cause
				? {
						name: this.cause.name,
						message: this.cause.message,
					}
				: undefined,
		};
	}

	/**
	 * Check if this is a validation error
	 */
	isValidationError(): boolean {
		return this.code.startsWith("VALIDATION_");
	}

	/**
	 * Check if this is a business rule error
	 */
	isBusinessRuleError(): boolean {
		return this.code.startsWith("BUSINESS_RULE_");
	}

	/**
	 * Check if this is a not found error
	 */
	isNotFoundError(): boolean {
		return this.code === "NOT_FOUND";
	}

	/**
	 * Check if this is an authentication error
	 */
	isAuthError(): boolean {
		return this.code.startsWith("AUTH_");
	}
}

// ============================================================================
// SPECIFIC ERROR TYPES
// ============================================================================

/**
 * Validation error - for input validation failures
 */
export class ValidationError extends AppError {
	constructor(
		message: string,
		public readonly validationErrors?: Record<string, string[]>,
		context?: Record<string, any>,
	) {
		super(message, "VALIDATION_ERROR", 400, context);
		this.name = "ValidationError";
	}

	static fromZodError(
		error: z.ZodError,
		context?: Record<string, any>,
	): ValidationError {
		const validationErrors: Record<string, string[]> = {};

		for (const issue of error.issues) {
			const path = issue.path.join(".");
			if (!validationErrors[path]) {
				validationErrors[path] = [];
			}
			validationErrors[path].push(issue.message);
		}

		const message = error.issues
			.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
			.join(", ");

		return new ValidationError(message, validationErrors, context);
	}
}

/**
 * Business rule violation error
 */
export class BusinessRuleError extends AppError {
	constructor(
		message: string,
		public readonly rule: string,
		context?: Record<string, any>,
	) {
		super(message, `BUSINESS_RULE_${rule}`, 400, context);
		this.name = "BusinessRuleError";
	}
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
	constructor(
		resource: string,
		identifier: string | number,
		context?: Record<string, any>,
	) {
		super(
			`${resource} with identifier ${identifier} not found`,
			"NOT_FOUND",
			404,
			context,
		);
		this.name = "NotFoundError";
	}
}

/**
 * Authentication error
 */
export class AuthError extends AppError {
	constructor(
		message: string,
		code: string = "AUTH_FAILED",
		context?: Record<string, any>,
	) {
		super(message, code, 401, context);
		this.name = "AuthError";
	}
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
	constructor(
		message: string = "Access denied",
		context?: Record<string, any>,
	) {
		super(message, "AUTHORIZATION_FAILED", 403, context);
		this.name = "AuthorizationError";
	}
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
	constructor(
		message: string,
		operation: string,
		cause?: Error,
		context?: Record<string, any>,
	) {
		super(message, `DATABASE_${operation.toUpperCase()}`, 500, context, cause);
		this.name = "DatabaseError";
	}
}

/**
 * External service error
 */
export class ExternalServiceError extends AppError {
	constructor(
		message: string,
		service: string,
		cause?: Error,
		context?: Record<string, any>,
	) {
		super(
			message,
			`EXTERNAL_SERVICE_${service.toUpperCase()}`,
			502,
			context,
			cause,
		);
		this.name = "ExternalServiceError";
	}
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
	constructor(
		message: string = "Rate limit exceeded",
		public readonly retryAfterMs?: number,
		context?: Record<string, any>,
	) {
		super(message, "RATE_LIMIT_EXCEEDED", 429, context);
		this.name = "RateLimitError";
	}
}

// ============================================================================
// ERROR FACTORY FUNCTIONS
// ============================================================================

/**
 * Creates a validation error from Zod validation result
 */
export function createValidationError(
	error: z.ZodError,
	context?: Record<string, any>,
): ValidationError {
	return ValidationError.fromZodError(error, context);
}

/**
 * Creates a business rule error
 */
export function createBusinessRuleError(
	message: string,
	rule: string,
	context?: Record<string, any>,
): BusinessRuleError {
	return new BusinessRuleError(message, rule, context);
}

/**
 * Creates a not found error
 */
export function createNotFoundError(
	resource: string,
	identifier: string | number,
	context?: Record<string, any>,
): NotFoundError {
	return new NotFoundError(resource, identifier, context);
}

/**
 * Creates an authentication error
 */
export function createAuthError(
	message: string,
	code?: string,
	context?: Record<string, any>,
): AuthError {
	return new AuthError(message, code, context);
}

/**
 * Creates an authorization error
 */
export function createAuthorizationError(
	message?: string,
	context?: Record<string, any>,
): AuthorizationError {
	return new AuthorizationError(message, context);
}

/**
 * Creates a database error
 */
export function createDatabaseError(
	message: string,
	operation: string,
	cause?: Error,
	context?: Record<string, any>,
): DatabaseError {
	return new DatabaseError(message, operation, cause, context);
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
	return error instanceof AppError;
}

/**
 * Type guard to check if an error is a validation error
 */
export function isValidationError(error: unknown): error is ValidationError {
	return error instanceof ValidationError;
}

/**
 * Type guard to check if an error is a business rule error
 */
export function isBusinessRuleError(
	error: unknown,
): error is BusinessRuleError {
	return error instanceof BusinessRuleError;
}

/**
 * Type guard to check if an error is a not found error
 */
export function isNotFoundError(error: unknown): error is NotFoundError {
	return error instanceof NotFoundError;
}

/**
 * Type guard to check if an error is an auth error
 */
export function isAuthError(error: unknown): error is AuthError {
	return error instanceof AuthError;
}

/**
 * Handles any error and converts it to an AppError
 */
export function handleError(
	error: unknown,
	context?: Record<string, any>,
): AppError {
	// If it's already an AppError, return as is
	if (isAppError(error)) {
		return error;
	}

	// If it's a Zod validation error, convert it
	if (error instanceof z.ZodError) {
		return createValidationError(error, context);
	}

	// If it's a regular Error, wrap it
	if (error instanceof Error) {
		return new AppError(error.message, "UNKNOWN_ERROR", 500, context, error);
	}

	// If it's something else, create a generic error
	return new AppError("An unknown error occurred", "UNKNOWN_ERROR", 500, {
		...context,
		originalError: error,
	});
}

/**
 * Extracts error message from any error type
 */
export function getErrorMessage(error: unknown): string {
	if (isAppError(error)) {
		return error.message;
	}

	if (error instanceof Error) {
		return error.message;
	}

	if (typeof error === "string") {
		return error;
	}

	return "An unknown error occurred";
}

/**
 * Extracts error code from any error type
 */
export function getErrorCode(error: unknown): string {
	if (isAppError(error)) {
		return error.code;
	}

	return "UNKNOWN_ERROR";
}

/**
 * Extracts status code from any error type
 */
export function getErrorStatusCode(error: unknown): number {
	if (isAppError(error)) {
		return error.statusCode;
	}

	return 500;
}

/**
 * Formats error for API response
 */
export function formatErrorResponse(error: unknown): {
	success: false;
	error: string;
	code: string;
	statusCode: number;
	details?: any;
} {
	const appError = handleError(error);

	return {
		success: false,
		error: appError.message,
		code: appError.code,
		statusCode: appError.statusCode,
		details:
			appError instanceof ValidationError
				? appError.validationErrors
				: undefined,
	};
}

/**
 * Logs error with appropriate level
 */
export function logError(error: unknown, context?: Record<string, any>): void {
	const appError = handleError(error, context);

	const logData = {
		message: appError.message,
		code: appError.code,
		statusCode: appError.statusCode,
		timestamp: appError.timestamp,
		context: appError.context,
		stack: appError.stack,
	};

	// Log based on severity
	if (appError.statusCode >= 500) {
		console.error("Server Error:", logData);
	} else if (appError.statusCode >= 400) {
		console.warn("Client Error:", logData);
	} else {
		console.info("Error:", logData);
	}
}

// ============================================================================
// BUSINESS RULE HELPERS
// ============================================================================

/**
 * Validates business rules for properties
 */
export function validatePropertyBusinessRules(data: {
	type: string;
	bedrooms: number;
	bathrooms: number;
	area: number;
	price: number;
}): void {
	// Residential properties must have at least 1 bedroom and 1 bathroom
	if (
		data.type.toLowerCase().includes("house") ||
		data.type.toLowerCase().includes("apartment")
	) {
		if (data.bedrooms < 1) {
			throw createBusinessRuleError(
				"Residential properties must have at least 1 bedroom",
				"MIN_BEDROOMS",
				{ type: data.type, bedrooms: data.bedrooms },
			);
		}
		if (data.bathrooms < 1) {
			throw createBusinessRuleError(
				"Residential properties must have at least 1 bathroom",
				"MIN_BATHROOMS",
				{ type: data.type, bathrooms: data.bathrooms },
			);
		}
	}

	// Price must be reasonable
	if (data.price < 1000) {
		throw createBusinessRuleError(
			"Property price must be at least $1,000",
			"MIN_PRICE",
			{ price: data.price },
		);
	}

	// Large properties should have multiple bathrooms (warning, not error)
	if (data.area > 200 && data.bathrooms < 2) {
		console.warn("Large property with few bathrooms:", {
			area: data.area,
			bathrooms: data.bathrooms,
		});
	}
}

/**
 * Validates business rules for lands
 */
export function validateLandBusinessRules(data: {
	type: string;
	area: number;
	price: number;
}): void {
	// Land must have minimum area
	if (data.area < 100) {
		throw createBusinessRuleError(
			"Land must have at least 100 m² of area",
			"MIN_LAND_AREA",
			{ area: data.area },
		);
	}

	// Land price must be reasonable
	if (data.price < 1000) {
		throw createBusinessRuleError(
			"Land price must be at least $1,000",
			"MIN_LAND_PRICE",
			{ price: data.price },
		);
	}
}

/**
 * Validates business rules for blog posts
 */
export function validateBlogBusinessRules(data: {
	title: string;
	content: string;
	readingTime: number;
}): void {
	// Reading time should be reasonable based on content length
	const wordsCount = data.content.split(/\s+/).length;
	const estimatedReadingTime = Math.ceil(wordsCount / 200); // 200 words per minute

	if (Math.abs(data.readingTime - estimatedReadingTime) > 5) {
		console.warn("Reading time might be inaccurate:", {
			provided: data.readingTime,
			estimated: estimatedReadingTime,
			wordsCount,
		});
	}
}
