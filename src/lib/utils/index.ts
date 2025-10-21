/**
 * Utility functions index
 * Centralized exports for all utility functions
 */

// Error handling utilities
export * from "./errors";
export * from "./server-action-errors";

// Re-export commonly used error classes and functions
export {
    AppError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    DatabaseError,
    ExternalServiceError,
    FileUploadError,
    AIServiceError,
    handleActionError,
    successResult,
    errorResult,
    withErrorHandling,
} from "./errors";

export {
    createServerAction,
    createAuthenticatedAction,
    createAuthorizedAction,
    validateFormData,
    safeRedirect,
    safeRevalidate,
    validateUploadedFile,
    validateUploadedFiles,
    parseJsonField,
} from "./server-action-errors";