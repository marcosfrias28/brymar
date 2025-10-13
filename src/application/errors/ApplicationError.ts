import { DomainError } from '@/domain/shared/errors/DomainError';

/**
 * Base application error class
 */
export abstract class ApplicationError extends Error {
    public readonly timestamp: Date;
    public readonly context?: Record<string, any>;

    constructor(
        message: string,
        public readonly code?: string,
        public readonly cause?: Error,
        context?: Record<string, any>
    ) {
        super(message);
        this.name = this.constructor.name;
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
            timestamp: this.timestamp.toISOString(),
            context: this.context,
            cause: this.cause ? {
                name: this.cause.name,
                message: this.cause.message
            } : undefined,
            stack: this.stack
        };
    }

    /**
     * Check if this error is caused by a domain error
     */
    isDomainError(): boolean {
        return this.cause instanceof DomainError;
    }

    /**
     * Get the underlying domain error if it exists
     */
    getDomainError(): DomainError | null {
        return this.cause instanceof DomainError ? this.cause : null;
    }
}

/**
 * Error thrown when use case validation fails
 */
export class UseCaseValidationError extends ApplicationError {
    constructor(
        message: string,
        public readonly validationErrors: Record<string, string[]>,
        cause?: Error,
        context?: Record<string, any>
    ) {
        super(message, 'USE_CASE_VALIDATION_ERROR', cause, context);
    }
}

/**
 * Error thrown when use case execution fails
 */
export class UseCaseExecutionError extends ApplicationError {
    constructor(
        message: string,
        public readonly useCaseName: string,
        cause?: Error,
        context?: Record<string, any>
    ) {
        super(message, 'USE_CASE_EXECUTION_ERROR', cause, context);
    }
}

/**
 * Error thrown when external service is unavailable
 */
export class ExternalServiceError extends ApplicationError {
    constructor(
        message: string,
        public readonly serviceName: string,
        public readonly operation?: string,
        cause?: Error,
        context?: Record<string, any>
    ) {
        super(message, 'EXTERNAL_SERVICE_ERROR', cause, context);
    }
}

/**
 * Error thrown when repository operation fails
 */
export class RepositoryError extends ApplicationError {
    constructor(
        message: string,
        public readonly repositoryName: string,
        public readonly operation: string,
        cause?: Error,
        context?: Record<string, any>
    ) {
        super(message, 'REPOSITORY_ERROR', cause, context);
    }
}

/**
 * Error thrown when configuration is invalid or missing
 */
export class ConfigurationError extends ApplicationError {
    constructor(
        message: string,
        public readonly configKey?: string,
        context?: Record<string, any>
    ) {
        super(message, 'CONFIGURATION_ERROR', undefined, context);
    }
}

/**
 * Error thrown when resource conflicts occur
 */
export class ResourceConflictError extends ApplicationError {
    constructor(
        message: string,
        public readonly resourceType: string,
        public readonly resourceId: string,
        context?: Record<string, any>
    ) {
        super(message, 'RESOURCE_CONFLICT_ERROR', undefined, context);
    }
}

/**
 * Error thrown when rate limits are exceeded
 */
export class RateLimitError extends ApplicationError {
    constructor(
        message: string,
        public readonly limit: number,
        public readonly windowMs: number,
        public readonly retryAfterMs?: number,
        context?: Record<string, any>
    ) {
        super(message, 'RATE_LIMIT_ERROR', undefined, context);
    }
}

/**
 * Error thrown when timeout occurs
 */
export class TimeoutError extends ApplicationError {
    constructor(
        message: string,
        public readonly timeoutMs: number,
        public readonly operation?: string,
        context?: Record<string, any>
    ) {
        super(message, 'TIMEOUT_ERROR', undefined, context);
    }
}