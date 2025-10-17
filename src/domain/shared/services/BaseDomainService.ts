import { BusinessRuleViolationError } from '../errors/DomainError';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface SEOSuggestion {
    title: string;
    description: string;
    keywords: string[];
}

export abstract class BaseDomainService<TEntity> {
    protected entityType: string;

    constructor(entityType: string) {
        this.entityType = entityType;
    }

    /**
     * Validates entity according to business rules
     */
    abstract validateEntity(entity: TEntity): ValidationResult;

    /**
     * Validates entity for publication
     */
    abstract validateForPublication(entity: TEntity): void;

    /**
     * Generates SEO suggestions for entity
     */
    abstract generateSEOSuggestions(entity: TEntity): SEOSuggestion;

    /**
     * Common validation helper for required fields
     */
    protected validateRequiredField(value: any, fieldName: string): string[] {
        const errors: string[] = [];

        if (value === null || value === undefined) {
            errors.push(`${fieldName} is required`);
        } else if (typeof value === 'string' && value.trim().length === 0) {
            errors.push(`${fieldName} cannot be empty`);
        }

        return errors;
    }

    /**
     * Common validation helper for string length
     */
    protected validateStringLength(
        value: string,
        fieldName: string,
        minLength?: number,
        maxLength?: number
    ): string[] {
        const errors: string[] = [];

        if (minLength !== undefined && value.length < minLength) {
            errors.push(`${fieldName} must be at least ${minLength} characters long`);
        }

        if (maxLength !== undefined && value.length > maxLength) {
            errors.push(`${fieldName} cannot exceed ${maxLength} characters`);
        }

        return errors;
    }

    /**
     * Common validation helper for numeric ranges
     */
    protected validateNumericRange(
        value: number,
        fieldName: string,
        min?: number,
        max?: number
    ): string[] {
        const errors: string[] = [];

        if (min !== undefined && value < min) {
            errors.push(`${fieldName} must be at least ${min}`);
        }

        if (max !== undefined && value > max) {
            errors.push(`${fieldName} cannot exceed ${max}`);
        }

        return errors;
    }

    /**
     * Common validation helper for arrays
     */
    protected validateArray(
        value: any[],
        fieldName: string,
        minItems?: number,
        maxItems?: number
    ): string[] {
        const errors: string[] = [];

        if (!Array.isArray(value)) {
            errors.push(`${fieldName} must be an array`);
            return errors;
        }

        if (minItems !== undefined && value.length < minItems) {
            errors.push(`${fieldName} must have at least ${minItems} items`);
        }

        if (maxItems !== undefined && value.length > maxItems) {
            errors.push(`${fieldName} cannot have more than ${maxItems} items`);
        }

        return errors;
    }

    /**
     * Common helper for inappropriate content detection
     */
    protected containsInappropriateContent(text: string): boolean {
        const inappropriateWords = ["spam", "scam", "fake", "fraud"];
        const lowerText = text.toLowerCase();
        return inappropriateWords.some(word => lowerText.includes(word));
    }

    /**
     * Common helper for generating slug from text
     */
    protected generateSlug(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    /**
     * Common helper for calculating reading time
     */
    protected calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
        const wordCount = text.trim().split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }

    /**
     * Common helper for extracting excerpt from text
     */
    protected extractExcerpt(text: string, maxLength: number = 160): string {
        if (text.length <= maxLength) {
            return text;
        }

        // Try to break at word boundary
        const truncated = text.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');

        if (lastSpaceIndex > maxLength * 0.8) {
            return truncated.substring(0, lastSpaceIndex) + '...';
        }

        return truncated + '...';
    }

    /**
     * Common helper for validating business rules
     */
    protected validateBusinessRule(condition: boolean, message: string, code: string = "BUSINESS_RULE_VIOLATION"): void {
        if (!condition) {
            throw new BusinessRuleViolationError(message, code);
        }
    }

    /**
     * Common helper for merging validation results
     */
    protected mergeValidationResults(...results: ValidationResult[]): ValidationResult {
        const allErrors: string[] = [];
        const allWarnings: string[] = [];

        results.forEach(result => {
            allErrors.push(...result.errors);
            allWarnings.push(...result.warnings);
        });

        return {
            isValid: allErrors.length === 0,
            errors: allErrors,
            warnings: allWarnings
        };
    }
}