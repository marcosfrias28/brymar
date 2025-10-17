import { BlogPost } from "../entities/BlogPost";
import { BlogPostId } from "../value-objects/BlogPostId";
import { BlogCategory } from "../value-objects/BlogCategory";
import { ContentStatus } from "../value-objects/ContentStatus";
import {
    SearchableRepository,
    StatusFilterableRepository,
    SearchCriteria
} from '@/domain/shared/interfaces/BaseRepository';

export interface BlogSearchCriteria extends SearchCriteria {
    search?: string;
    status?: string;
    category?: string;
    author?: string;
}

export interface IBlogRepository extends
    SearchableRepository<BlogPost, BlogPostId, BlogSearchCriteria>,
    StatusFilterableRepository<BlogPost, BlogPostId, ContentStatus> {

    /**
     * Find blog posts by category
     */
    findByCategory(category: BlogCategory, limit?: number): Promise<BlogPost[]>;

    /**
     * Find blog posts by author
     */
    findByAuthor(author: string, limit?: number): Promise<BlogPost[]>;

    /**
     * Get count by category
     */
    countByCategory(category: BlogCategory): Promise<number>;
}