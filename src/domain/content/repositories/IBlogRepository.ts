import { BlogPost } from "../entities/BlogPost";
import { BlogPostId } from "../value-objects/BlogPostId";
import { BlogCategory } from "../value-objects/BlogCategory";
import { ContentStatus } from "../value-objects/ContentStatus";

export interface BlogSearchFilters {
    status?: ContentStatus;
    category?: BlogCategory;
    author?: string;
    searchTerm?: string;
}

export interface BlogSearchResult {
    blogPosts: BlogPost[];
    total: number;
    totalPages: number;
}

export interface IBlogRepository {
    /**
     * Save a blog post (create or update)
     */
    save(blogPost: BlogPost): Promise<void>;

    /**
     * Find a blog post by its ID
     */
    findById(id: BlogPostId): Promise<BlogPost | null>;

    /**
     * Find blog posts with pagination and filters
     */
    findWithFilters(
        filters: BlogSearchFilters,
        page: number,
        limit: number
    ): Promise<BlogSearchResult>;

    /**
     * Find all published blog posts
     */
    findPublished(page: number, limit: number): Promise<BlogSearchResult>;

    /**
     * Find blog posts by category
     */
    findByCategory(
        category: BlogCategory,
        page: number,
        limit: number
    ): Promise<BlogSearchResult>;

    /**
     * Find blog posts by status
     */
    findByStatus(
        status: ContentStatus,
        page: number,
        limit: number
    ): Promise<BlogSearchResult>;

    /**
     * Find blog posts by author
     */
    findByAuthor(
        author: string,
        page: number,
        limit: number
    ): Promise<BlogSearchResult>;

    /**
     * Search blog posts by title or content
     */
    search(
        searchTerm: string,
        page: number,
        limit: number
    ): Promise<BlogSearchResult>;

    /**
     * Get recent blog posts
     */
    findRecent(limit: number): Promise<BlogPost[]>;

    /**
     * Get featured blog posts (could be based on views, likes, etc.)
     */
    findFeatured(limit: number): Promise<BlogPost[]>;

    /**
     * Delete a blog post
     */
    delete(id: BlogPostId): Promise<void>;

    /**
     * Check if a blog post exists
     */
    exists(id: BlogPostId): Promise<boolean>;

    /**
     * Get total count of blog posts
     */
    count(): Promise<number>;

    /**
     * Get count by status
     */
    countByStatus(status: ContentStatus): Promise<number>;

    /**
     * Get count by category
     */
    countByCategory(category: BlogCategory): Promise<number>;
}