/**
 * Centralized blog types
 * Replaces scattered blog DTOs across the application
 */

import type { BlogPost } from "@/lib/db/schema";

// Core blog types (re-exported from schema)
export type { BlogCategory, BlogPost } from "@/lib/db/schema";

// Blog post input types
export type CreateBlogPostInput = {
	title: string;
	content: string;
	excerpt?: string;
	slug?: string;
	category: string;
	tags?: string[];
	coverImage?: {
		url: string;
		alt?: string;
		caption?: string;
	};
	authorId: string;
};

export type UpdateBlogPostInput = {
	id: string;
	title?: string;
	content?: string;
	excerpt?: string;
	slug?: string;
	category?: string;
	tags?: string[];
	coverImage?: {
		url: string;
		alt?: string;
		caption?: string;
	} | null;
};

export type PublishBlogPostInput = {
	id: string;
	publishedAt?: Date;
};

// Blog search and filter types
export type BlogSearchFilters = {
	query?: string;
	category?: string;
	status?: "draft" | "published" | "archived";
	authorId?: string;
	tags?: string[];
	page?: number;
	limit?: number;
	sortBy?: "createdAt" | "updatedAt" | "title" | "publishedAt" | "views";
	sortOrder?: "asc" | "desc";
};

export type BlogSearchResult = {
	posts: BlogPost[];
	total: number;
	page: number;
	totalPages: number;
	hasMore: boolean;
};

// Action result types are imported from shared.ts

// Blog category types
export type CreateBlogCategoryInput = {
	name: string;
	slug?: string;
	description?: string;
	color?: string;
};

export type UpdateBlogCategoryInput = {
	id: string;
	name?: string;
	slug?: string;
	description?: string;
	color?: string;
	isActive?: boolean;
};

// Blog analytics types
export type BlogAnalytics = {
	totalPosts: number;
	publishedPosts: number;
	draftPosts: number;
	totalViews: number;
	averageReadTime: number;
	topCategories: Array<{
		category: string;
		count: number;
	}>;
	recentPosts: BlogPost[];
};

// Utility types
export type BlogStatus = "draft" | "published" | "archived";
export type BlogSortField =
	| "createdAt"
	| "updatedAt"
	| "title"
	| "publishedAt"
	| "views";
// SortOrder is imported from shared.ts
