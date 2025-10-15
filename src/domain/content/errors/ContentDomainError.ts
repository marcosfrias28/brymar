import { ValueObjectValidationError, BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

/**
 * Error thrown when blog post validation fails
 */
export class BlogPostValidationError extends ValueObjectValidationError {
    constructor(message: string, public readonly field?: string) {
        super(message);
    }
}

/**
 * Error thrown when page section validation fails
 */
export class PageSectionValidationError extends ValueObjectValidationError {
    constructor(message: string, public readonly field?: string) {
        super(message);
    }
}

/**
 * Error thrown when content business rules are violated
 */
export class ContentBusinessRuleError extends BusinessRuleViolationError {
    constructor(message: string, rule: string = "CONTENT_RULE") {
        super(message, rule);
    }
}

/**
 * Error thrown when SEO validation fails
 */
export class SEOValidationError extends ValueObjectValidationError {
    constructor(message: string, public readonly field?: string) {
        super(message);
    }
}

/**
 * Error thrown when media validation fails
 */
export class MediaValidationError extends ValueObjectValidationError {
    constructor(message: string, public readonly field?: string) {
        super(message);
    }
}