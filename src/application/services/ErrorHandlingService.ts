import { DomainError } from '@/domain/shared/errors/DomainError';
import { ApplicationError } from '../errors/ApplicationError';
import { InfrastructureError } from '../../infrastructure/errors/InfrastructureError';
import { ILoggingService } from '../../infrastructure/services/LoggingService';

export interface ErrorContext {
    userId?: string;
    requestId?: string;
    operation?: string;
    aggregateId?: string;
    metadata?: Record<string, any>;
}

export interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
        timestamp: string;
        requestId?: string;
    };
}

export interface SuccessResponse<T = any> {
    success: true;
    data: T;
    metadata?: Record<string, any>;
}

export type ServiceResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * Centralized error handling service
 */
export class ErrorHandlingService {
    constructor(private readonly logger: ILoggingService) { }

    /**
     * Handle any error and return appropriate response
     */
    handleError(error: Error, context?: ErrorContext): ErrorResponse {
        // Log the error
        this.logError(error, context);

        // Determine error type and create appropriate response
        if (error instanceof DomainError) {
            return this.handleDomainError(error, context);
        }

        if (error instanceof ApplicationError) {
            return this.handleApplicationError(error, context);
        }

        if (error instanceof InfrastructureError) {
            return this.handleInfrastructureError(error, context);
        }

        // Handle unknown errors
        return this.handleUnknownError(error, context);
    }

    /**
     * Wrap a function with error handling
     */
    async withErrorHandling<T>(
        operation: () => Promise<T>,
        context?: ErrorContext
    ): Promise<ServiceResponse<T>> {
        try {
            const result = await operation();
            return {
                success: true,
                data: result
            };
        } catch (error) {
            return this.handleError(error as Error, context);
        }
    }

    /**
     * Wrap a synchronous function with error handling
     */
    withSyncErrorHandling<T>(
        operation: () => T,
        context?: ErrorContext
    ): ServiceResponse<T> {
        try {
            const result = operation();
            return {
                success: true,
                data: result
            };
        } catch (error) {
            return this.handleError(error as Error, context);
        }
    }

    private handleDomainError(error: DomainError, context?: ErrorContext): ErrorResponse {
        return {
            success: false,
            error: {
                code: error.code || 'DOMAIN_ERROR',
                message: this.sanitizeErrorMessage(error.message),
                details: this.extractDomainErrorDetails(error),
                timestamp: new Date().toISOString(),
                requestId: context?.requestId
            }
        };
    }

    private handleApplicationError(error: ApplicationError, context?: ErrorContext): ErrorResponse {
        // If the application error wraps a domain error, handle it appropriately
        const domainError = error.getDomainError();
        if (domainError) {
            return this.handleDomainError(domainError, context);
        }

        return {
            success: false,
            error: {
                code: error.code || 'APPLICATION_ERROR',
                message: this.sanitizeErrorMessage(error.message),
                details: this.extractApplicationErrorDetails(error),
                timestamp: new Date().toISOString(),
                requestId: context?.requestId
            }
        };
    }

    private handleInfrastructureError(error: InfrastructureError, context?: ErrorContext): ErrorResponse {
        // Infrastructure errors should not expose internal details to clients
        return {
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'An internal error occurred. Please try again later.',
                timestamp: new Date().toISOString(),
                requestId: context?.requestId
            }
        };
    }

    private handleUnknownError(error: Error, context?: ErrorContext): ErrorResponse {
        return {
            success: false,
            error: {
                code: 'UNKNOWN_ERROR',
                message: 'An unexpected error occurred. Please try again later.',
                timestamp: new Date().toISOString(),
                requestId: context?.requestId
            }
        };
    }

    private logError(error: Error, context?: ErrorContext): void {
        const logContext = {
            ...context,
            errorType: error.constructor.name,
            errorCode: (error as any).code,
            stack: error.stack
        };

        if (error instanceof DomainError || error instanceof ApplicationError) {
            this.logger.warn(`${error.constructor.name}: ${error.message}`, logContext);
        } else {
            this.logger.error(`${error.constructor.name}: ${error.message}`, { error, ...logContext });
        }
    }

    private sanitizeErrorMessage(message: string): string {
        // Remove sensitive information from error messages
        // This is a simple implementation - in production you might want more sophisticated sanitization
        return message
            .replace(/password/gi, '[REDACTED]')
            .replace(/token/gi, '[REDACTED]')
            .replace(/secret/gi, '[REDACTED]')
            .replace(/key/gi, '[REDACTED]');
    }

    private extractDomainErrorDetails(error: DomainError): any {
        const details: any = {};

        // Add specific details based on error type
        if ('field' in error && error.field) {
            details.field = error.field;
        }

        if ('validationErrors' in error && error.validationErrors) {
            details.validationErrors = error.validationErrors;
        }

        if ('rule' in error && error.rule) {
            details.rule = error.rule;
        }

        if ('aggregateType' in error && error.aggregateType) {
            details.aggregateType = error.aggregateType;
            details.aggregateId = (error as any).aggregateId;
        }

        return Object.keys(details).length > 0 ? details : undefined;
    }

    private extractApplicationErrorDetails(error: ApplicationError): any {
        const details: any = {};

        if ('validationErrors' in error && error.validationErrors) {
            details.validationErrors = error.validationErrors;
        }

        if ('useCaseName' in error && error.useCaseName) {
            details.useCaseName = error.useCaseName;
        }

        if ('serviceName' in error && error.serviceName) {
            details.serviceName = error.serviceName;
        }

        return Object.keys(details).length > 0 ? details : undefined;
    }
}

/**
 * Utility functions for error handling
 */
export class ErrorUtils {
    /**
     * Check if an error is a specific type
     */
    static isErrorType<T extends Error>(error: Error, errorClass: new (...args: any[]) => T): error is T {
        return error instanceof errorClass;
    }

    /**
     * Extract error chain from nested errors
     */
    static getErrorChain(error: Error): Error[] {
        const chain: Error[] = [error];
        let current = error;

        while (current && 'cause' in current && current.cause instanceof Error) {
            chain.push(current.cause);
            current = current.cause;
        }

        return chain;
    }

    /**
     * Find the root cause of an error
     */
    static getRootCause(error: Error): Error {
        const chain = this.getErrorChain(error);
        return chain[chain.length - 1];
    }

    /**
     * Check if error chain contains a specific error type
     */
    static containsErrorType<T extends Error>(
        error: Error,
        errorClass: new (...args: any[]) => T
    ): boolean {
        const chain = this.getErrorChain(error);
        return chain.some(e => e instanceof errorClass);
    }

    /**
     * Create a standardized error response
     */
    static createErrorResponse(
        code: string,
        message: string,
        details?: any,
        requestId?: string
    ): ErrorResponse {
        return {
            success: false,
            error: {
                code,
                message,
                details,
                timestamp: new Date().toISOString(),
                requestId
            }
        };
    }

    /**
     * Create a standardized success response
     */
    static createSuccessResponse<T>(data: T, metadata?: Record<string, any>): SuccessResponse<T> {
        return {
            success: true,
            data,
            metadata
        };
    }
}