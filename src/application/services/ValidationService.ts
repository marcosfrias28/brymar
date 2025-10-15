import { z, ZodError, ZodSchema } from 'zod';
import { UseCaseValidationError } from '../errors/ApplicationError';
// Domain ValidationService not implemented yet

export interface ValidationResult<T = any> {
    success: boolean;
    data?: T;
    errors?: Record<string, string[]>;
}

export interface ValidationRule<T = any> {
    name: string;
    validate: (value: T) => boolean | Promise<boolean>;
    message: string;
}

/**
 * Application layer validation service that integrates with Zod schemas
 */
export class ApplicationValidationService {
    private customRules: Map<string, ValidationRule[]> = new Map();

    /**
     * Validate data against a Zod schema
     */
    validateWithSchema<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
        try {
            const validatedData = schema.parse(data);
            return {
                success: true,
                data: validatedData
            };
        } catch (error) {
            if (error instanceof ZodError) {
                return {
                    success: false,
                    errors: this.formatZodErrors(error)
                };
            }

            return {
                success: false,
                errors: {
                    general: ['Validation failed']
                }
            };
        }
    }

    /**
     * Validate data against a Zod schema and throw on failure
     */
    validateWithSchemaOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
        const result = this.validateWithSchema(schema, data);

        if (!result.success) {
            throw new UseCaseValidationError(
                'Validation failed',
                result.errors || {}
            );
        }

        return result.data!;
    }

    /**
     * Register custom validation rules for a field
     */
    registerRule(fieldName: string, rule: ValidationRule): void {
        if (!this.customRules.has(fieldName)) {
            this.customRules.set(fieldName, []);
        }

        this.customRules.get(fieldName)!.push(rule);
    }

    /**
     * Validate data against custom rules
     */
    async validateWithCustomRules(data: Record<string, any>): Promise<ValidationResult> {
        const errors: Record<string, string[]> = {};

        for (const [fieldName, value] of Object.entries(data)) {
            const rules = this.customRules.get(fieldName) || [];

            for (const rule of rules) {
                try {
                    const isValid = await rule.validate(value);
                    if (!isValid) {
                        if (!errors[fieldName]) {
                            errors[fieldName] = [];
                        }
                        errors[fieldName].push(rule.message);
                    }
                } catch (error) {
                    if (!errors[fieldName]) {
                        errors[fieldName] = [];
                    }
                    errors[fieldName].push(`Validation rule '${rule.name}' failed`);
                }
            }
        }

        return {
            success: Object.keys(errors).length === 0,
            data: Object.keys(errors).length === 0 ? data : undefined,
            errors: Object.keys(errors).length > 0 ? errors : undefined
        };
    }

    /**
     * Combine Zod schema validation with custom rules
     */
    async validateComplete<T>(
        schema: ZodSchema<T>,
        data: unknown
    ): Promise<ValidationResult<T>> {
        // First validate with Zod schema
        const schemaResult = this.validateWithSchema(schema, data);

        if (!schemaResult.success) {
            return schemaResult;
        }

        // Then validate with custom rules
        const customResult = await this.validateWithCustomRules(schemaResult.data as any);

        if (!customResult.success) {
            return {
                success: false,
                errors: customResult.errors
            };
        }

        return schemaResult;
    }

    /**
     * Create common validation schemas
     */
    static createCommonSchemas() {
        return {
            email: z.string().email('Invalid email format'),

            phone: z.string().regex(
                /^[\+]?[1-9][\d]{0,15}$/,
                'Invalid phone number format'
            ),

            password: z.string()
                .min(8, 'Password must be at least 8 characters')
                .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),

            url: z.string().url('Invalid URL format'),

            positiveNumber: z.number().positive('Must be a positive number'),

            nonEmptyString: z.string().min(1, 'Cannot be empty'),

            currency: z.string().length(3, 'Currency code must be 3 characters').regex(/^[A-Z]{3}$/, 'Invalid currency code format'),

            coordinates: z.object({
                latitude: z.number().min(-90).max(90),
                longitude: z.number().min(-180).max(180)
            }),

            dateRange: z.object({
                startDate: z.date(),
                endDate: z.date()
            }).refine(
                (data) => data.startDate <= data.endDate,
                'End date must be after start date'
            ),

            fileSize: (maxSizeMB: number) => z.number().max(maxSizeMB * 1024 * 1024, `File size must not exceed ${maxSizeMB}MB`),

            fileExtension: (allowedExtensions: string[]) => z.string().refine(
                (filename) => {
                    const extension = filename.split('.').pop()?.toLowerCase();
                    return extension && allowedExtensions.map(ext => ext.toLowerCase()).includes(extension);
                },
                `File must have one of these extensions: ${allowedExtensions.join(', ')}`
            )
        };
    }

    /**
     * Format Zod validation errors into a consistent structure
     */
    private formatZodErrors(error: ZodError): Record<string, string[]> {
        const errors: Record<string, string[]> = {};

        for (const issue of error.issues) {
            const path = issue.path.join('.');
            const fieldName = path || 'general';

            if (!errors[fieldName]) {
                errors[fieldName] = [];
            }

            errors[fieldName].push(issue.message);
        }

        return errors;
    }

    /**
     * Clear all custom rules
     */
    clearCustomRules(): void {
        this.customRules.clear();
    }

    /**
     * Get registered rules for a field
     */
    getRules(fieldName: string): ValidationRule[] {
        return this.customRules.get(fieldName) || [];
    }
}

/**
 * Pre-configured validation schemas for common use cases
 */
export class ValidationSchemas {
    static readonly user = {
        create: z.object({
            email: ApplicationValidationService.createCommonSchemas().email,
            password: ApplicationValidationService.createCommonSchemas().password,
            name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
            phone: ApplicationValidationService.createCommonSchemas().phone.optional()
        }),

        update: z.object({
            name: z.string().min(2).max(100).optional(),
            phone: ApplicationValidationService.createCommonSchemas().phone.optional()
        })
    };

    static readonly property = {
        create: z.object({
            title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
            description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters'),
            price: ApplicationValidationService.createCommonSchemas().positiveNumber,
            currency: ApplicationValidationService.createCommonSchemas().currency,
            type: z.enum(['house', 'apartment', 'condo', 'land', 'commercial']),
            bedrooms: z.number().int().min(0).max(20).optional(),
            bathrooms: z.number().min(0).max(20).optional(),
            area: ApplicationValidationService.createCommonSchemas().positiveNumber.optional(),
            location: z.object({
                street: z.string().min(1).max(200),
                city: z.string().min(1).max(100),
                state: z.string().min(1).max(100),
                postalCode: z.string().min(1).max(20),
                country: z.string().length(2),
                coordinates: ApplicationValidationService.createCommonSchemas().coordinates.optional()
            })
        }),

        update: z.object({
            title: z.string().min(3).max(200).optional(),
            description: z.string().min(10).max(2000).optional(),
            price: ApplicationValidationService.createCommonSchemas().positiveNumber.optional(),
            currency: ApplicationValidationService.createCommonSchemas().currency.optional(),
            bedrooms: z.number().int().min(0).max(20).optional(),
            bathrooms: z.number().min(0).max(20).optional(),
            area: ApplicationValidationService.createCommonSchemas().positiveNumber.optional()
        })
    };

    static readonly wizard = {
        draft: z.object({
            type: z.enum(['property', 'land', 'blog']),
            step: z.number().int().min(1),
            data: z.record(z.any()),
            completionPercentage: z.number().min(0).max(100)
        })
    };

    static readonly blog = {
        create: z.object({
            title: z.string().min(3).max(200),
            content: z.string().min(50),
            excerpt: z.string().max(500).optional(),
            category: z.string().min(1),
            tags: z.array(z.string()).max(10).optional(),
            publishedAt: z.date().optional()
        })
    };
}