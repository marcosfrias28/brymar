import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "") // Remove special characters
		.replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
		.replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Calculate estimated reading time for content
 */
export function calculateReadTime(content: string): number {
	const wordsPerMinute = 200; // Average reading speed
	const words = content.trim().split(/\s+/).length;
	const readTime = Math.ceil(words / wordsPerMinute);
	return Math.max(1, readTime); // Minimum 1 minute
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) {
		return text;
	}
	return `${text.slice(0, maxLength).trim()}...`;
}

/**
 * Extract excerpt from content
 */
export function extractExcerpt(content: string, maxLength = 160): string {
	// Remove HTML tags and markdown
	const plainText = content
		.replace(/<[^>]*>/g, "") // Remove HTML tags
		.replace(/[#*_`]/g, "") // Remove basic markdown
		.replace(/\n+/g, " ") // Replace newlines with spaces
		.trim();

	return truncateText(plainText, maxLength);
}
