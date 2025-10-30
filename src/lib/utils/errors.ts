/**
 * Simplified error handling utilities for server actions
 * Replaces complex error handling across DDD layers
 */

import type { ActionResult } from "../types";

// Base application error class
export class AppError extends Error {
	constructor(
		message: string,
		public code = "UNKNOWN_ERROR",
		public statusCode = 500,
		public context?: Record<string, any>
	) {
		super(message);
		this.name = "AppError";
	}
}

// Validation error for form and input validation
export class ValidationError extends AppError {
	constructor(
		message: string,
		public errors: Record<string, string[]>,
		context?: Record<string, any>
	) {
		super(message, "VALIDATION_ERROR", 400, context);
	}
}

// Not found error for missing resources
export class NotFoundError extends AppError {
	constructor(resource: string, context?: Record<string, any>) {
		super(`${resource} not found`, "NOT_FOUND", 404, context);
	}
}

// Unauthorized error for authentication issues
export class UnauthorizedError extends AppError {
	constructor(message = "Unauthorized", context?: Record<string, any>) {
		super(message, "UNAUTHORIZED", 401, context);
	}
}

// Forbidden error for authorization issues
export class ForbiddenError extends AppError {
	constructor(message = "Forbidden", context?: Record<string, any>) {
		super(message, "FORBIDDEN", 403, context);
	}
}

// Conflict error for duplicate resources
export class ConflictError extends AppError {
	constructor(message: string, context?: Record<string, any>) {
		super(message, "CONFLICT", 409, context);
	}
}

// Rate limit error
export class RateLimitError extends AppError {
	constructor(message = "Rate limit exceeded", context?: Record<string, any>) {
		super(message, "RATE_LIMIT", 429, context);
	}
}

// Database error
export class DatabaseError extends AppError {
	constructor(message: string, context?: Record<string, any>) {
		super(message, "DATABASE_ERROR", 500, context);
	}
}

// External service error
export class ExternalServiceError extends AppError {
	constructor(service: string, message: string, context?: Record<string, any>) {
		super(`${service}: ${message}`, "EXTERNAL_SERVICE_ERROR", 502, context);
	}
}

// File upload error
export class FileUploadError extends AppError {
	constructor(message: string, context?: Record<string, any>) {
		super(message, "FILE_UPLOAD_ERROR", 400, context);
	}
}

// AI service error
export class AIServiceError extends AppError {
	constructor(message: string, context?: Record<string, any>) {
		super(message, "AI_SERVICE_ERROR", 502, context);
	}
}

// Error handler for server actions
export function handleActionError(error: unknown): ActionResult {
	if (error instanceof ValidationError) {
		return {
			success: false,
			error: error.message,
			errors: error.errors,
		};
	}

	if (error instanceof AppError) {
		return {
			success: false,
			error: error.message,
		};
	}

	if (error instanceof Error) {
		return {
			success: false,
			error: error.message,
		};
	}

	return {
		success: false,
		error: "An unexpected error occurred",
	};
}

// Success result helper
export function successResult<T>(data: T): ActionResult<T> {
	return {
		success: true,
		data,
	};
}

// Error result helper
export function errorResult(
	error: string,
	errors?: Record<string, string[]>
): ActionResult {
	return {
		success: false,
		error,
		errors,
	};
}

// Async error wrapper for server actions
export async function withErrorHandling<T>(
	action: () => Promise<T>
): Promise<ActionResult<T>> {
	try {
		const result = await action();
		return successResult(result);
	} catch (error) {
		return handleActionError(error);
	}
}

// Validation helper
export function validateRequired(
	data: Record<string, any>,
	requiredFields: string[]
): void {
	const errors: Record<string, string[]> = {};

	for (const field of requiredFields) {
		if (
			!data[field] ||
			(typeof data[field] === "string" && !data[field].trim())
		) {
			errors[field] = [`${field} is required`];
		}
	}

	if (Object.keys(errors).length > 0) {
		throw new ValidationError("Validation failed", errors);
	}
}

// Email validation helper
export function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

// Password validation helper
export function validatePassword(password: string): string[] {
	const errors: string[] = [];

	if (password.length < 8) {
		errors.push("Password must be at least 8 characters long");
	}

	if (!/[A-Z]/.test(password)) {
		errors.push("Password must contain at least one uppercase letter");
	}

	if (!/[a-z]/.test(password)) {
		errors.push("Password must contain at least one lowercase letter");
	}

	if (!/\d/.test(password)) {
		errors.push("Password must contain at least one number");
	}

	return errors;
}

// Phone validation helper
export function validatePhone(phone: string): boolean {
	const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
	return phoneRegex.test(phone);
}

// URL validation helper
export function validateUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

// File validation helpers
export function validateImageFile(file: File): void {
	const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
	const maxSize = 10 * 1024 * 1024; // 10MB

	if (!allowedTypes.includes(file.type)) {
		throw new FileUploadError(
			"Invalid file type. Only JPEG, PNG, and WebP are allowed."
		);
	}

	if (file.size > maxSize) {
		throw new FileUploadError("File too large. Maximum size is 10MB.");
	}
}

export function validateVideoFile(file: File): void {
	const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
	const maxSize = 100 * 1024 * 1024; // 100MB

	if (!allowedTypes.includes(file.type)) {
		throw new FileUploadError(
			"Invalid file type. Only MP4, WebM, and MOV are allowed."
		);
	}

	if (file.size > maxSize) {
		throw new FileUploadError("File too large. Maximum size is 100MB.");
	}
}

// Database error handler
export function handleDatabaseError(error: unknown): never {
	if (error instanceof Error) {
		if (error.message.includes("unique constraint")) {
			throw new ConflictError("Resource already exists");
		}

		if (error.message.includes("foreign key constraint")) {
			throw new ValidationError("Invalid reference", {
				reference: ["Referenced resource does not exist"],
			});
		}

		if (error.message.includes("not null constraint")) {
			throw new ValidationError("Missing required field", {
				field: ["This field is required"],
			});
		}
	}

	throw new DatabaseError("Database operation failed");
}

// Retry helper for external services
export async function withRetry<T>(
	action: () => Promise<T>,
	maxRetries = 3,
	delay = 1000
): Promise<T> {
	let lastError: unknown;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await action();
		} catch (error) {
			lastError = error;

			if (attempt === maxRetries) {
				break;
			}

			// Don't retry on client errors (4xx)
			if (
				error instanceof AppError &&
				error.statusCode >= 400 &&
				error.statusCode < 500
			) {
				break;
			}

			await new Promise((resolve) => setTimeout(resolve, delay * attempt));
		}
	}

	throw lastError;
}
