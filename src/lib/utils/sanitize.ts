import * as DOMPurify from "isomorphic-dompurify";

export interface SanitizeOptions {
	allowedTags?: string[];
	allowedAttributes?: string[];
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Uses DOMPurify with sensible defaults for blog/content rendering
 *
 * @param html - The HTML string to sanitize
 * @param options - Optional configuration for allowed tags and attributes
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(html: string, options?: SanitizeOptions): string {
	if (!html) {
		return "";
	}

	try {
		// Use DOMPurify with default safe configuration
		// The library already has sensible defaults for blog/content rendering
		const sanitized = DOMPurify.sanitize(html, {
			ALLOWED_TAGS: options?.allowedTags,
			ALLOWED_ATTR: options?.allowedAttributes,
		});

		return String(sanitized);
	} catch (error) {
		console.error("HTML sanitization failed:", error);
		// Fallback: strip all HTML tags if sanitization fails
		return html.replace(/<[^>]*>/g, "");
	}
}

/**
 * Strips all HTML tags from a string, leaving only text content
 * Useful as a fallback when sanitization fails or for plain text extraction
 *
 * @param html - The HTML string to strip
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
	if (!html) {
		return "";
	}
	return html.replace(/<[^>]*>/g, "");
}
