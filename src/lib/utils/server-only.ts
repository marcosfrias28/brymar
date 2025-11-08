/**
 * Server-only utilities
 * Functions that require Next.js server-side APIs
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Redirect with error handling
export function safeRedirect(path: string): never {
	redirect(path);
}

// Revalidate with error handling
export function safeRevalidate(path: string): void {
	try {
		revalidatePath(path);
	} catch (_error) {
		// Don't throw, as this is not critical
	}
}
