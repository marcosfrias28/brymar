/**
 * Centralized blog types
 * Replaces scattered blog DTOs across the application
 */

import { BlogPost, BlogCategory } from "@/lib/db/schema";

// Core blog types (re-exported from schema)
export type { BlogPost, BlogCategory } from "@/lib/db/schema";

// Blog post input types
export interface CreateBlogPostInput {
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
}

export interface UpdateBlogPostInput {
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
}

export interface PublishBlogPostInput {
    id: string;
    publishedAt?: Date;
}

// Blog search and filter types
export interface BlogSearchFilters {
    query?: string;
    category?: string;
    status?: "draft" | "published" | "archived";
    authorId?: string;
    tags?: string[];
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "updatedAt" | "title" | "publishedAt" | "views";
    sortOrder?: "asc" | "desc";
}

export interface BlogSearchResult {
    posts: BlogPost[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
}

// Action result types
export interface ActionResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: Record<string, string[]>;
}

// Blog category types
export interface CreateBlogCategoryInput {
    name: string;
    slug?: string;
    description?: string;
    color?: string;
}

export interface UpdateBlogCategoryInput {
    id: string;
    name?: string;
    slug?: string;
    description?: string;
    color?: string;
    isActive?: boolean;
}

// Blog analytics types
export interface BlogAnalytics {
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
}

// Utility types
export type BlogStatus = "draft" | "published" | "archived";
export type BlogSortField = "createdAt" | "updatedAt" | "title" | "publishedAt" | "views";
export type SortOrder = "asc" | "desc";