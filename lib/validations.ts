import { z } from 'zod';
import { User } from './db/schema';
import type { BetterCallAPIError } from '@/utils/types/types';

// ============================================================================
// GENERIC ACTION SYSTEM - TYPE DEFINITIONS
// ============================================================================

/**
 * Generic ActionState type that replaces all specific action state types.
 * Provides a consistent interface for all server action responses.
 * 
 * @template T - The type of data returned by the action (defaults to void)
 * 
 * @example
 * ```typescript
 * // For actions returning user data
 * type UserActionState = ActionState<{ user: User }>;
 * 
 * // For simple actions without specific data
 * type SimpleActionState = ActionState;
 * ```
 */
export type ActionState<T = void> = {
    success?: boolean;
    error?: string;
    message?: string;
    data?: T;
    redirect?: boolean;
    url?: string;
};

/**
 * Configuration options for createValidatedAction.
 * 
 * @property withUser - When true, automatically retrieves and validates the current user,
 *                      passing it as the second parameter to the action function
 * @property getUserFn - Function to get the current user (required when withUser is true)
 * 
 * @example
 * ```typescript
 * // Action that requires authentication
 * const updateProfile = createValidatedAction(
 *   profileSchema,
 *   updateProfileAction,
 *   { withUser: true, getUserFn: getUser }
 * );
 * ```
 */
export type ValidatedOptions = {
    withUser?: boolean;
    getUserFn?: () => Promise<User | null>;
};

/**
 * Type for action functions that work with the new system
 */
export type ActionFunction<TInput, TOutput> = (
    data: TInput,
    user?: User
) => Promise<TOutput>;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Centralized error handler for API errors.
 * Extracts error messages from BetterCallAPIError objects and provides consistent error formatting.
 * 
 * @param error - The error to handle (typically BetterCallAPIError)
 * @param fallbackMessage - Message to use if no specific error message is available
 * @returns Formatted error response with success: false and error message
 * 
 * @example
 * ```typescript
 * try {
 *   await apiCall();
 * } catch (error) {
 *   return handleAPIError(error, "Operation failed");
 * }
 * ```
 */
export function handleAPIError(
    error: unknown,
    fallbackMessage = "Error desconocido"
): { success: false; error: string } {
    const apiError = error as BetterCallAPIError;
    return {
        success: false,
        error: apiError?.body?.message || fallbackMessage
    };
}

/**
 * Utility function to safely parse FormData to a plain JavaScript object.
 * Handles type conversion for numbers, booleans, and files while preserving
 * string-only fields to avoid type issues.
 * 
 * @param formData - The FormData to parse
 * @returns Plain object with appropriately typed values
 * 
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('name', 'John');
 * formData.append('age', '25');
 * formData.append('active', 'true');
 * 
 * const parsed = parseFormData(formData);
 * // Result: { name: 'John', age: 25, active: true }
 * ```
 */
export function parseFormData(formData: FormData): Record<string, any> {
    const data: Record<string, any> = {};
    const entries = Array.from(formData.entries());

    // Fields that should never be converted to numbers
    const stringOnlyFields = ['email', 'password', 'name', 'token', 'otp', 'title', 'description', 'location', 'type', 'category', 'author', 'content'];

    for (const [key, value] of entries) {
        if (value instanceof File) {
            // Handle file uploads
            data[key] = value;
        } else {
            // Handle regular form fields
            const stringValue = value.toString();

            // Keep certain fields as strings to avoid type issues
            if (stringOnlyFields.includes(key)) {
                data[key] = stringValue;
            } else if (stringValue === 'true' || stringValue === 'false') {
                // Parse booleans
                data[key] = stringValue === 'true';
            } else if (!isNaN(Number(stringValue)) && stringValue !== '' && stringValue.trim() !== '') {
                // Only convert to number if it's clearly a numeric field and not empty
                data[key] = Number(stringValue);
            } else {
                data[key] = stringValue;
            }
        }
    }

    return data;
}

/**
 * Utility function to create success response
 * @template T - The data type
 * @param data - Optional data to include
 * @param message - Success message
 * @param redirect - Whether to redirect
 * @param url - URL to redirect to
 * @returns Success ActionState
 */
export function createSuccessResponse<T = void>(
    data?: T,
    message?: string,
    redirect?: boolean,
    url?: string
): ActionState<T> {
    return {
        success: true,
        data,
        message,
        redirect,
        url
    };
}

/**
 * Utility function to create error response
 * @param error - Error message
 * @returns Error ActionState
 */
export function createErrorResponse(error: string): ActionState {
    return {
        success: false,
        error
    };
}

/**
 * Unified validation function that replaces validatedAction and validatedActionWithUser.
 * Creates a validated server action that handles form data parsing, schema validation,
 * user authentication (if required), and error handling.
 * 
 * @template TInput - The validated input type from the schema
 * @template TOutput - The return type of the action function
 * @param schema - Zod schema for input validation
 * @param action - The action function to execute with validated data
 * @param options - Configuration options (e.g., { withUser: true })
 * @returns A function that accepts FormData and returns the action result
 * 
 * @example
 * ```typescript
 * // Simple action without user
 * const contactSchema = z.object({
 *   name: z.string().min(2),
 *   email: z.string().email()
 * });
 * 
 * async function contactAction(data: { name: string; email: string }) {
 *   // Handle contact form submission
 *   return createSuccessResponse(undefined, "Message sent");
 * }
 * 
 * export const sendContact = createValidatedAction(contactSchema, contactAction);
 * 
 * // Action with user authentication
 * export const updateProfile = createValidatedAction(
 *   profileSchema,
 *   updateProfileAction,
 *   { withUser: true }
 * );
 * ```
 */
export function createValidatedAction<TInput, TOutput>(
    schema: z.ZodType<TInput>,
    action: ActionFunction<TInput, TOutput>,
    options: ValidatedOptions = {}
): (formData: FormData) => Promise<TOutput> {
    return async (formData: FormData): Promise<TOutput> => {
        try {
            // Parse and validate form data
            const formObject = parseFormData(formData);
            const result = schema.safeParse(formObject);

            if (!result.success) {
                return createErrorResponse(result.error.errors[0].message) as TOutput;
            }

            // Handle user authentication if required
            let user: User | undefined;
            if (options.withUser) {
                if (!options.getUserFn) {
                    throw new Error('getUserFn is required when withUser is true');
                }
                const currentUser = await options.getUserFn();
                if (!currentUser) {
                    return createErrorResponse('User is not authenticated') as TOutput;
                }
                user = currentUser;
            }

            // Execute the action
            return await action(result.data, user);
        } catch (error) {
            // Handle unexpected errors
            return handleAPIError(error, 'An unexpected error occurred') as TOutput;
        }
    };
}

