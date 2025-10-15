/**
 * Base infrastructure error class
 */
export abstract class InfrastructureError extends Error {
    public readonly timestamp: Date;
    public readonly context?: Record<string, any>;
    public readonly code?: string;
    public readonly cause?: Error;

    constructor(
        message: string,
        code?: string,
        cause?: Error,
        context?: Record<string, any>
    ) {
        super(message);
        this.name = this.constructor.name;
        this.timestamp = new Date();
        this.context = context;
        this.code = code;
        this.cause = cause;

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
}

/**
 * Error thrown when database operations fail
 */
export class DatabaseError extends InfrastructureError {
    constructor(
        message: string,
        _operation: string,
        _table?: string,
        cause?: Error,
        context?: Record<string, any>
    ) {
        super(message, 'DATABASE_ERROR', cause, context);
    }
}

/**
 * Error thrown when database connection fails
 */
export class DatabaseConnectionError extends InfrastructureError {
    constructor(
        message: string,
        public readonly _connectionString?: string,
        cause?: Error,
        context?: Record<string, any>
    ) {
        super(message, 'DATABASE_CONNECTION_ERROR', cause, context);
    }
}

/**
 * Error thrown when database transaction fails
 */
export class DatabaseTransactionError extends InfrastructureError {
    constructor(
        message: string,
        public readonly _transactionId?: string,
        cause?: Error,
        context?: Record<string, any>
    ) {
        super(message, 'DATABASE_TRANSACTION_ERROR', cause, context);
    }
}

/**
 * Error thrown when external API calls fail
 */
export class ExternalApiError extends InfrastructureError {
    constructor(
        message: string,
        public readonly _apiName: string,
        public readonly _endpoint?: string,
        public readonly _statusCode?: number,
        public readonly _responseBody?: any,
        cause?: Error,
        context?: Record<string, any>
    ) {
        super(message, 'EXTERNAL_API_ERROR', cause, context);
    }
}

/**
 * Error thrown when file system operations fail
 */
export class FileSystemError extends InfrastructureError {
    constructor(
        message: string,
        public readonly _operation: string,
        public readonly _filePath?: string,
        cause?: Error,
        context?: Record<string, any>
    ) {
        super(message, 'FILE_SYSTEM_ERROR', cause, context);
    }
}

/**
 * Error thrown when network operations fail
 */
export class NetworkError extends InfrastructureError {
    constructor(
        message: string,
        public readonly _operation: string,
        public readonly _url?: string,
        public readonly _statusCode?: number,
        cause?: Error,
        context?: Record<string, any>
    ) {
        super(message, 'NETWORK_ERROR', cause, context);
    }
}

/**
 * Error thrown when caching operations fail
 */
export class CacheError extends InfrastructureError {
    constructor(
        message: string,
        public readonly _operation: string,
        public readonly _key?: string,
        cause?: Error,
        context?: Record<string, any>
    ) {
        super(message, 'CACHE_ERROR', cause, context);
    }
}

/**
 * Error thrown when message queue operations fail
 */
export class MessageQueueError extends InfrastructureError {
    constructor(
        message: string,
        public readonly _operation: string,
        public readonly _queue?: string,
        public readonly _messageId?: string,
        cause?: Error,
        context?: Record<string, any>
    ) {
        super(message, 'MESSAGE_QUEUE_ERROR', cause, context);
    }
}

/**
 * Error thrown when storage operations fail
 */
export class StorageError extends InfrastructureError {
    constructor(
        message: string,
        public readonly _operation: string,
        public readonly _bucket?: string,
        public readonly _key?: string,
        cause?: Error,
        context?: Record<string, any>
    ) {
        super(message, 'STORAGE_ERROR', cause, context);
    }
}

/**
 * Error thrown when email service operations fail
 */
export class EmailServiceError extends InfrastructureError {
    constructor(
        message: string,
        public readonly _operation: string,
        public readonly _recipient?: string,
        public readonly _messageId?: string,
        cause?: Error,
        context?: Record<string, any>
    ) {
        super(message, 'EMAIL_SERVICE_ERROR', cause, context);
    }
}