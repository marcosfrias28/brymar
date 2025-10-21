/**
 * Server action error handling utilities
 * Provides consistent error handling for Next.js server actions
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ActionResult } from "../types";
import {
    AppError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    handleActionError
} from "./errors";

// Server action wrapper with error handling
export function createServerAction<T extends any[], R>(
    action: (...args: T) => Promise<R>
) {
    return async (...args: T): Promise<ActionResult<R>> => {
        try {
            const result = await action(...args);
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            return handleActionError(error);
        }
    };
}

// Server action wrapper with authentication check
export function createAuthenticatedAction<T extends any[], R>(
    action: (userId: string, ...args: T) => Promise<R>,
    getUserId: () => Promise<string | null>
) {
    return async (...args: T): Promise<ActionResult<R>> => {
        try {
            const userId = await getUserId();

            if (!userId) {
                throw new UnauthorizedError("Authentication required");
            }

            const result = await action(userId, ...args);
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            return handleActionError(error);
        }
    };
}

// Server action wrapper with role-based authorization
export function createAuthorizedAction<T extends any[], R>(
    action: (userId: string, userRole: string, ...args: T) => Promise<R>,
    getUserInfo: () => Promise<{ id: string; role: string } | null>,
    allowedRoles: string[]
) {
    return async (...args: T): Promise<ActionResult<R>> => {
        try {
            const userInfo = await getUserInfo();

            if (!userInfo) {
                throw new UnauthorizedError("Authentication required");
            }

            if (!allowedRoles.includes(userInfo.role)) {
                throw new ForbiddenError("Insufficient permissions");
            }

            const result = await action(userInfo.id, userInfo.role, ...args);
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            return handleActionError(error);
        }
    };
}

// Form data validation helper
export function validateFormData(
    formData: FormData,
    schema: Record<string, {
        required?: boolean;
        type?: "string" | "number" | "email" | "url" | "phone";
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
        pattern?: RegExp;
    }>
): Record<string, any> {
    const errors: Record<string, string[]> = {};
    const data: Record<string, any> = {};

    for (const [field, rules] of Object.entries(schema)) {
        const value = formData.get(field);

        // Check required fields
        if (rules.required && (!value || value.toString().trim() === "")) {
            errors[field] = [`${field} is required`];
            continue;
        }

        // Skip validation if field is not required and empty
        if (!value || value.toString().trim() === "") {
            data[field] = null;
            continue;
        }

        const stringValue = value.toString().trim();

        // Type validation
        if (rules.type === "number") {
            const numValue = parseFloat(stringValue);
            if (isNaN(numValue)) {
                errors[field] = [`${field} must be a valid number`];
                continue;
            }

            if (rules.min !== undefined && numValue < rules.min) {
                errors[field] = [`${field} must be at least ${rules.min}`];
                continue;
            }

            if (rules.max !== undefined && numValue > rules.max) {
                errors[field] = [`${field} must be at most ${rules.max}`];
                continue;
            }

            data[field] = numValue;
        } else if (rules.type === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(stringValue)) {
                errors[field] = [`${field} must be a valid email address`];
                continue;
            }
            data[field] = stringValue;
        } else if (rules.type === "url") {
            try {
                new URL(stringValue);
                data[field] = stringValue;
            } catch {
                errors[field] = [`${field} must be a valid URL`];
                continue;
            }
        } else if (rules.type === "phone") {
            const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(stringValue)) {
                errors[field] = [`${field} must be a valid phone number`];
                continue;
            }
            data[field] = stringValue;
        } else {
            // String validation
            if (rules.minLength && stringValue.length < rules.minLength) {
                errors[field] = [`${field} must be at least ${rules.minLength} characters`];
                continue;
            }

            if (rules.maxLength && stringValue.length > rules.maxLength) {
                errors[field] = [`${field} must be at most ${rules.maxLength} characters`];
                continue;
            }

            if (rules.pattern && !rules.pattern.test(stringValue)) {
                errors[field] = [`${field} format is invalid`];
                continue;
            }

            data[field] = stringValue;
        }
    }

    if (Object.keys(errors).length > 0) {
        throw new ValidationError("Form validation failed", errors);
    }

    return data;
}

// Redirect with error handling
export function safeRedirect(path: string): never {
    try {
        redirect(path);
    } catch (error) {
        // Next.js redirect throws an error internally, which is expected
        throw error;
    }
}

// Revalidate with error handling
export function safeRevalidate(path: string): void {
    try {
        revalidatePath(path);
    } catch (error) {
        console.error("Failed to revalidate path:", path, error);
        // Don't throw, as this is not critical
    }
}

// File upload validation for server actions
export function validateUploadedFile(
    file: File,
    options: {
        maxSize?: number;
        allowedTypes?: string[];
        required?: boolean;
    } = {}
): void {
    const {
        maxSize = 10 * 1024 * 1024, // 10MB default
        allowedTypes = ["image/jpeg", "image/png", "image/webp"],
        required = false
    } = options;

    if (!file || file.size === 0) {
        if (required) {
            throw new ValidationError("File is required", {
                file: ["File is required"]
            });
        }
        return;
    }

    if (file.size > maxSize) {
        throw new ValidationError("File too large", {
            file: [`File must be smaller than ${Math.round(maxSize / 1024 / 1024)}MB`]
        });
    }

    if (!allowedTypes.includes(file.type)) {
        throw new ValidationError("Invalid file type", {
            file: [`File type must be one of: ${allowedTypes.join(", ")}`]
        });
    }
}

// Batch validation for multiple files
export function validateUploadedFiles(
    files: File[],
    options: {
        maxFiles?: number;
        maxSize?: number;
        allowedTypes?: string[];
        required?: boolean;
    } = {}
): void {
    const {
        maxFiles = 10,
        maxSize = 10 * 1024 * 1024,
        allowedTypes = ["image/jpeg", "image/png", "image/webp"],
        required = false
    } = options;

    if (files.length === 0 && required) {
        throw new ValidationError("Files are required", {
            files: ["At least one file is required"]
        });
    }

    if (files.length > maxFiles) {
        throw new ValidationError("Too many files", {
            files: [`Maximum ${maxFiles} files allowed`]
        });
    }

    files.forEach((file, index) => {
        try {
            validateUploadedFile(file, { maxSize, allowedTypes, required: false });
        } catch (error) {
            if (error instanceof ValidationError) {
                throw new ValidationError(`File ${index + 1} validation failed`, {
                    [`file_${index}`]: error.errors.file || ["Invalid file"]
                });
            }
            throw error;
        }
    });
}

// JSON parsing with validation
export function parseJsonField<T>(
    value: string | null,
    fieldName: string,
    required: boolean = false
): T | null {
    if (!value || value.trim() === "") {
        if (required) {
            throw new ValidationError("JSON field is required", {
                [fieldName]: [`${fieldName} is required`]
            });
        }
        return null;
    }

    try {
        return JSON.parse(value) as T;
    } catch (error) {
        throw new ValidationError("Invalid JSON format", {
            [fieldName]: [`${fieldName} must be valid JSON`]
        });
    }
}