import type { z } from "zod";
import type { User } from "./db/schema";
import {
	createValidationError,
	formatErrorResponse,
	handleError,
} from "./unified-errors";

// ============================================================================
// UNIFIED ACTION SYSTEM - TYPE DEFINITIONS
// ============================================================================

/**
 * Unified ActionState type that provides consistent interface for all server action responses.
 * Replaces all specific action state types with a single, flexible interface.
 *
 * @template T - The type of data returned by the action (defaults to void)
 */
export type ActionState<T = void> = {
	success?: boolean;
	error?: string;
	message?: string;
	data?: T;
	redirect?: boolean;
	url?: string;
	code?: string;
	statusCode?: number;
	details?: any;
};

/**
 * Configuration options for createValidatedAction.
 */
export type ValidatedOptions = {
	withUser?: boolean;
	getUserFn?: () => Promise<User | null>;
};

/**
 * Type for action functions that work with the unified system
 */
export type ActionFunction<TInput, TOutput> = (
	data: TInput,
	user?: User
) => Promise<TOutput>;

// ============================================================================
// UNIFIED ERROR HANDLING
// ============================================================================

/**
 * Unified error handler that replaces handleAPIError and other error handlers.
 * Uses the new unified error system for consistent error handling.
 */
export function handleActionError(
	error: unknown,
	_fallbackMessage = "Error desconocido"
): ActionState {
	const appError = handleError(error);
	const response = formatErrorResponse(appError);

	return {
		success: false,
		error: response.error,
		code: response.code,
		statusCode: response.statusCode,
		details: response.details,
	};
}

/**
 * Utility function to safely parse FormData to a plain JavaScript object.
 * Enhanced to work with the unified schema system.
 */
export function parseFormData(formData: FormData): Record<string, any> {
	const data: Record<string, any> = {};
	const entries = Array.from(formData.entries());

	// Fields that should never be converted to numbers
	const stringOnlyFields = [
		"email",
		"password",
		"name",
		"token",
		"otp",
		"title",
		"description",
		"location",
		"type",
		"category",
		"author",
		"content",
		"slug",
		"label",
		"value",
		"icon",
		"wizardType",
		"mediaType",
		"itemType",
		"page",
		"section",
	];

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
			} else if (stringValue === "true" || stringValue === "false") {
				// Parse booleans
				data[key] = stringValue === "true";
			} else if (
				!Number.isNaN(Number(stringValue)) &&
				stringValue !== "" &&
				stringValue.trim() !== ""
			) {
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
		url,
		statusCode: 200,
	};
}

/**
 * Utility function to create error response
 */
export function createErrorResponse(
	error: string,
	code?: string,
	statusCode?: number,
	details?: any
): ActionState {
	return {
		success: false,
		error,
		code,
		statusCode: statusCode || 400,
		details,
	};
}

/**
 * Unified validation function that creates validated server actions.
 * Uses the new unified error handling and schema system.
 *
 * @template TInput - The validated input type from the schema
 * @template TOutput - The return type of the action function
 * @param schema - Zod schema for input validation
 * @param action - The action function to execute with validated data
 * @param options - Configuration options
 * @returns A function that accepts FormData and returns the action result
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
				const validationError = createValidationError(result.error);
				const errorResponse = formatErrorResponse(validationError);
				return {
					success: false,
					error: errorResponse.error,
					code: errorResponse.code,
					statusCode: errorResponse.statusCode,
					details: errorResponse.details,
				} as TOutput;
			}

			// Handle user authentication if required
			let user: User | undefined;
			if (options.withUser) {
				if (!options.getUserFn) {
					throw new Error("getUserFn is required when withUser is true");
				}
				const currentUser = await options.getUserFn();
				if (!currentUser) {
					return createErrorResponse(
						"User is not authenticated",
						"AUTH_REQUIRED",
						401
					) as TOutput;
				}
				user = currentUser;
			}

			// Execute the action
			return await action(result.data, user);
		} catch (error) {
			// Handle unexpected errors using unified error system
			return handleActionError(
				error,
				"An unexpected error occurred"
			) as TOutput;
		}
	};
}
