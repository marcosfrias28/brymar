/**
 * Utility functions index
 * Centralized exports for all utility functions
 */

// Basic utilities (client-safe)
export * from "../utils";
// Re-export commonly used utility functions
export {
	calculateReadTime,
	cn,
	extractExcerpt,
	formatDate,
	generateSlug,
	truncateText,
} from "../utils";

// Error handling utilities
export * from "./errors";
// Re-export commonly used error classes and functions
export {
	AIServiceError,
	AppError,
	ConflictError,
	DatabaseError,
	ExternalServiceError,
	errorResult,
	FileUploadError,
	ForbiddenError,
	handleActionError,
	NotFoundError,
	successResult,
	UnauthorizedError,
	ValidationError,
	withErrorHandling,
} from "./errors";

// Server action utilities (server-only)
export * from "./server-action-errors";
export {
	createAuthenticatedAction,
	createAuthorizedAction,
	createServerAction,
	parseJsonField,
	validateFormData,
	validateUploadedFile,
	validateUploadedFiles,
} from "./server-action-errors";

// User utilities
export * from "./user-helpers";
