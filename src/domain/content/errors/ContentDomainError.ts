import { ValueObjectValidationError, BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

/**
 * Error thrown when blog post validation fails
 */
export class BlogPostValidationError extends ValueObjectValidationError {
    constructor(message: string, field?: string) {
        super(message, field);
    }
}

/**
 * Error thrown when page section validation fails
 */
export class PageSectionValidationError extends ValueObjectValidationError {
    constructor(message: string, field?: string) {
        super(message, field);
    }
}

/**
 * Error thrown when content business rules are violated
 */
export class ContentBusinessRuleError extends BusinessRuleViolationError {
    constructor(message: string, rule?: string) {
        super(message, rule);
    }
}

/**
 * Error thrown when SEO validation fails
 */
export class SEOValidationError extends ValueObjectValidationError {
    constructor(message: string, field?: string) {
        super(message, field);
    }
}

/**
 * Error thrown when media validation fails
 */
export class MediaValidationError extends ValueObjectValidationError {
    constructor(message: string, field?: string) {
        super(message, field);
    }
}