/**
 * Blog Types
 *
 * Types specific to blog functionality
 */

export type BlogPostStatus = "draft" | "published" | "archived";

export interface BlogPost {
	id: string;
	title: string;
	content: string;
	excerpt?: string;
	author: string;
	status: BlogPostStatus;
	publishedDate?: string;
	readTime?: number;
	coverImage?: string;
	tags?: string[];
	createdAt: string;
	updatedAt: string;
}
