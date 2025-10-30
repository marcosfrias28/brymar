import type { ZodError } from "zod";

/**
 * Generic form state type for use with useActionState
 * @template T - The type of data returned on success
 */
export type FormState<T = any> = {
	success: boolean;
	message?: string;
	errors?: Record<string, string[]>;
	data?: T;
};

/**
 * Generic form action type for server actions
 * @template T - The type of data returned on success
 */
export type FormAction<T = any> = (
	prevState: FormState<T>,
	formData: FormData
) => Promise<FormState<T>>;

/**
 * Extracts validation errors from a Zod error object
 * @param error - The Zod error object
 * @returns A record of field names to error messages
 */
export function extractValidationErrors(
	error: ZodError
): Record<string, string[]> {
	const errors: Record<string, string[]> = {};

	for (const issue of error.issues) {
		const path = issue.path.join(".");
		if (!errors[path]) {
			errors[path] = [];
		}
		errors[path].push(issue.message);
	}

	return errors;
}
