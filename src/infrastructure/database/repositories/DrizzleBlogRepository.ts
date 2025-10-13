import { eq, and, or, like, desc, asc, count, sql } from 'drizzle-orm';
import { BlogPost } from '@/domain/content/entities/BlogPost';
import { BlogPostId } from '@/domain/content/value-objects/BlogPostId';
import { BlogCategory } from '@/domain/content/value-objects/BlogCategory';
import { ContentStatus } from '@/domain/content/value-objects/ContentStatus';
import {
    IBlogRepository,
    BlogSearchFilters,
    BlogSearchOptions,
    BlogSearchResult
} from '@/domain/content/repositories/IBlogRepository';
import { blogPosts } from '@/lib/db/schema';
import type { Database } from '@/lib/db/drizzle';
import { BlogMapper } from '../mappers/BlogMapper.js';

export class DrizzleBlogRepository implements IBlogRepository {
    constructor(private readonly db: Database) { }

    private getOrderBy(sortBy: string, sortOrder: string) {
        switch (sortBy) {
            case 'title':
                return sortOrder === 'asc' ? asc(blogPosts.title) : desc(blogPosts.title);
            case 'updatedAt':
                return sortOrder === 'asc' ? asc(blogPosts.updatedAt) : desc(blogPosts.updatedAt);
            case 'readingTime':
                return sortOrder === 'asc' ? asc(blogPosts.readingTime) : desc(blogPosts.readingTime);
            case 'createdAt':
            default:
                return sortOrder === 'asc' ? asc(blogPosts.createdAt) : desc(blogPosts.createdAt);
        }
    }

    async findById(id: BlogPostId): Promise<BlogPost | null> {
        try {
            const result = await this.db
                .select()
                .from(blogPosts)
                .where(eq(blogPosts.id, id.isNumeric() ? id.toNumber() : parseInt(id.value, 10)))
                .limit(1);

            if (result.length === 0) {
                return null;
            }

            return BlogMapper.toDomain(result[0]);
        } catch (error) {
            console.error('Error finding blog post by ID:', error);
            throw new Error(`Failed to find blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async save(blogPost: BlogPost): Promise<void> {
        try {
            const blogPostData = BlogMapper.toDatabase(blogPost);

            // Check if this is an update (existing post) or create (new post)
            const existingPost = await this.findById(blogPost.getId());

            if (existingPost) {
                // Update existing post
                await this.db
                    .update(blogPosts)
                    .set({
                        title: blogPostData.title,
                        content: blogPostData.content,
                        author: blogPostData.author,
                        category: blogPostData.category,
                        status: blogPostData.status,
                        image: blogPostData.image,
                        readingTime: blogPostData.readingTime,
                        updatedAt: new Date(),
                    })
                    .where(eq(blogPosts.id, blogPostData.id));
            } else {
                // Create new post
                await this.db
                    .insert(blogPosts)
                    .values(blogPostData);
            }
        } catch (error) {
            console.error('Error saving blog post:', error);
            throw new Error(`Failed to save blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async delete(id: BlogPostId): Promise<void> {
        try {
            await this.db
                .delete(blogPosts)
                .where(eq(blogPosts.id, id.isNumeric() ? id.toNumber() : parseInt(id.value, 10)));
        } catch (error) {
            console.error('Error deleting blog post:', error);
            throw new Error(`Failed to delete blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async exists(id: BlogPostId): Promise<boolean> {
        try {
            const result = await this.db
                .select({ count: count() })
                .from(blogPosts)
                .where(eq(blogPosts.id, id.isNumeric() ? id.toNumber() : parseInt(id.value, 10)));

            return (result[0]?.count || 0) > 0;
        } catch (error) {
            console.error('Error checking blog post existence:', error);
            throw new Error(`Failed to check blog post existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findAll(
        filters?: BlogSearchFilters,
        options?: BlogSearchOptions
    ): Promise<BlogSearchResult> {
        try {
            const whereConditions = this.buildWhereConditions(filters);
            const { sortBy = 'createdAt', sortOrder = 'desc', limit = 10, offset = 0 } = options || {};

            // Get total count
            const totalResult = await this.db
                .select({ count: count() })
                .from(blogPosts)
                .where(whereConditions);

            const total = totalResult[0]?.count || 0;

            // Get posts with pagination
            const orderBy = this.getOrderBy(sortBy, sortOrder);

            const results = await this.db
                .select()
                .from(blogPosts)
                .where(whereConditions)
                .orderBy(orderBy)
                .limit(limit)
                .offset(offset);

            const posts = results.map(row => BlogMapper.toDomain(row));
            const hasMore = offset + limit < total;

            return {
                posts,
                total,
                hasMore
            };
        } catch (error) {
            console.error('Error finding all blog posts:', error);
            throw new Error(`Failed to find blog posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findPublished(
        filters?: Omit<BlogSearchFilters, 'status'>,
        options?: BlogSearchOptions
    ): Promise<BlogSearchResult> {
        return this.findAll(
            { ...filters, status: ContentStatus.published() },
            options
        );
    }

    async findByCategory(
        category: BlogCategory,
        options?: BlogSearchOptions
    ): Promise<BlogPost[]> {
        try {
            const { sortBy = 'createdAt', sortOrder = 'desc' } = options || {};

            const orderBy = this.getOrderBy(sortBy, sortOrder);

            const results = await this.db
                .select()
                .from(blogPosts)
                .where(eq(blogPosts.category, category.value))
                .orderBy(orderBy);

            return results.map(row => BlogMapper.toDomain(row));
        } catch (error) {
            console.error('Error finding blog posts by category:', error);
            throw new Error(`Failed to find blog posts by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findByAuthor(
        author: string,
        options?: BlogSearchOptions
    ): Promise<BlogPost[]> {
        try {
            const { sortBy = 'createdAt', sortOrder = 'desc' } = options || {};

            const orderBy = this.getOrderBy(sortBy, sortOrder);

            const results = await this.db
                .select()
                .from(blogPosts)
                .where(eq(blogPosts.author, author))
                .orderBy(orderBy);

            return results.map(row => BlogMapper.toDomain(row));
        } catch (error) {
            console.error('Error finding blog posts by author:', error);
            throw new Error(`Failed to find blog posts by author: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findFeatured(limit: number = 5): Promise<BlogPost[]> {
        try {
            // Since the current schema doesn't have a featured field, 
            // we'll return the most recent published posts
            const results = await this.db
                .select()
                .from(blogPosts)
                .where(eq(blogPosts.status, 'published'))
                .orderBy(desc(blogPosts.createdAt))
                .limit(limit);

            return results.map(row => BlogMapper.toDomain(row));
        } catch (error) {
            console.error('Error finding featured blog posts:', error);
            throw new Error(`Failed to find featured blog posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async searchByText(
        searchTerm: string,
        filters?: BlogSearchFilters,
        options?: BlogSearchOptions
    ): Promise<BlogSearchResult> {
        try {
            const whereConditions = and(
                this.buildWhereConditions(filters),
                or(
                    like(blogPosts.title, `%${searchTerm}%`),
                    like(blogPosts.content, `%${searchTerm}%`)
                )
            );

            const { sortBy = 'createdAt', sortOrder = 'desc', limit = 10, offset = 0 } = options || {};

            // Get total count
            const totalResult = await this.db
                .select({ count: count() })
                .from(blogPosts)
                .where(whereConditions);

            const total = totalResult[0]?.count || 0;

            // Get posts with pagination
            const orderBy = this.getOrderBy(sortBy, sortOrder);

            const results = await this.db
                .select()
                .from(blogPosts)
                .where(whereConditions)
                .orderBy(orderBy)
                .limit(limit)
                .offset(offset);

            const posts = results.map(row => BlogMapper.toDomain(row));
            const hasMore = offset + limit < total;

            return {
                posts,
                total,
                hasMore
            };
        } catch (error) {
            console.error('Error searching blog posts by text:', error);
            throw new Error(`Failed to search blog posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findByTags(
        tags: string[],
        options?: BlogSearchOptions
    ): Promise<BlogPost[]> {
        // Note: Current schema doesn't have tags field, so this is a placeholder implementation
        // In a real implementation, you would need to add a tags field or separate tags table
        try {
            const { sortBy = 'createdAt', sortOrder = 'desc' } = options || {};

            const orderBy = this.getOrderBy(sortBy, sortOrder);

            // For now, search in content for tag-like terms
            const tagConditions = tags.map(tag => like(blogPosts.content, `%${tag}%`));

            const results = await this.db
                .select()
                .from(blogPosts)
                .where(or(...tagConditions))
                .orderBy(orderBy);

            return results.map(row => BlogMapper.toDomain(row));
        } catch (error) {
            console.error('Error finding blog posts by tags:', error);
            throw new Error(`Failed to find blog posts by tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async countByStatus(status: ContentStatus): Promise<number> {
        try {
            const result = await this.db
                .select({ count: count() })
                .from(blogPosts)
                .where(eq(blogPosts.status, status.value));

            return result[0]?.count || 0;
        } catch (error) {
            console.error('Error counting blog posts by status:', error);
            throw new Error(`Failed to count blog posts by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async countByCategory(category: BlogCategory): Promise<number> {
        try {
            const result = await this.db
                .select({ count: count() })
                .from(blogPosts)
                .where(eq(blogPosts.category, category.value));

            return result[0]?.count || 0;
        } catch (error) {
            console.error('Error counting blog posts by category:', error);
            throw new Error(`Failed to count blog posts by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findRelated(blogPost: BlogPost, limit: number = 5): Promise<BlogPost[]> {
        try {
            const results = await this.db
                .select()
                .from(blogPosts)
                .where(
                    and(
                        eq(blogPosts.category, blogPost.getCategory().value),
                        sql`${blogPosts.id} != ${blogPost.getId().isNumeric() ? blogPost.getId().toNumber() : parseInt(blogPost.getId().value, 10)}`,
                        eq(blogPosts.status, 'published')
                    )
                )
                .orderBy(desc(blogPosts.createdAt))
                .limit(limit);

            return results.map(row => BlogMapper.toDomain(row));
        } catch (error) {
            console.error('Error finding related blog posts:', error);
            throw new Error(`Failed to find related blog posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async existsBySlug(slug: string, excludeId?: BlogPostId): Promise<boolean> {
        // Note: Current schema doesn't have slug field, so we'll use title as approximation
        try {
            const whereConditions = excludeId
                ? and(
                    like(blogPosts.title, `%${slug}%`),
                    sql`${blogPosts.id} != ${excludeId.isNumeric() ? excludeId.toNumber() : parseInt(excludeId.value, 10)}`
                )
                : like(blogPosts.title, `%${slug}%`);

            const result = await this.db
                .select({ count: count() })
                .from(blogPosts)
                .where(whereConditions);
            return (result[0]?.count || 0) > 0;
        } catch (error) {
            console.error('Error checking blog post slug existence:', error);
            throw new Error(`Failed to check slug existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findBySlug(slug: string): Promise<BlogPost | null> {
        // Note: Current schema doesn't have slug field, so we'll use title as approximation
        try {
            const results = await this.db
                .select()
                .from(blogPosts)
                .where(like(blogPosts.title, `%${slug}%`))
                .limit(1);

            if (results.length === 0) {
                return null;
            }

            return BlogMapper.toDomain(results[0]);
        } catch (error) {
            console.error('Error finding blog post by slug:', error);
            throw new Error(`Failed to find blog post by slug: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findRecent(limit: number = 10): Promise<BlogPost[]> {
        try {
            const results = await this.db
                .select()
                .from(blogPosts)
                .where(eq(blogPosts.status, 'published'))
                .orderBy(desc(blogPosts.createdAt))
                .limit(limit);

            return results.map(row => BlogMapper.toDomain(row));
        } catch (error) {
            console.error('Error finding recent blog posts:', error);
            throw new Error(`Failed to find recent blog posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findPopular(limit: number = 10): Promise<BlogPost[]> {
        // Note: Without view tracking, we'll return recent posts as a placeholder
        return this.findRecent(limit);
    }

    async archiveOldPosts(olderThan: Date): Promise<number> {
        try {
            const result = await this.db
                .update(blogPosts)
                .set({ status: 'archived' })
                .where(
                    and(
                        sql`${blogPosts.createdAt} < ${olderThan}`,
                        eq(blogPosts.status, 'published')
                    )
                );

            return result.rowCount || 0;
        } catch (error) {
            console.error('Error archiving old blog posts:', error);
            throw new Error(`Failed to archive old posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getStatistics(): Promise<{
        totalPosts: number;
        publishedPosts: number;
        draftPosts: number;
        archivedPosts: number;
        postsByCategory: Record<string, number>;
        averageReadingTime: number;
    }> {
        try {
            // Get total counts by status
            const [totalResult, publishedResult, draftResult, archivedResult] = await Promise.all([
                this.db.select({ count: count() }).from(blogPosts),
                this.db.select({ count: count() }).from(blogPosts).where(eq(blogPosts.status, 'published')),
                this.db.select({ count: count() }).from(blogPosts).where(eq(blogPosts.status, 'draft')),
                this.db.select({ count: count() }).from(blogPosts).where(eq(blogPosts.status, 'archived'))
            ]);

            // Get posts by category
            const categoryResults = await this.db
                .select({
                    category: blogPosts.category,
                    count: count()
                })
                .from(blogPosts)
                .groupBy(blogPosts.category);

            const postsByCategory: Record<string, number> = {};
            categoryResults.forEach(result => {
                postsByCategory[result.category] = result.count;
            });

            // Get average reading time
            const avgResult = await this.db
                .select({
                    avg: sql<number>`AVG(${blogPosts.readingTime})`
                })
                .from(blogPosts);

            return {
                totalPosts: totalResult[0]?.count || 0,
                publishedPosts: publishedResult[0]?.count || 0,
                draftPosts: draftResult[0]?.count || 0,
                archivedPosts: archivedResult[0]?.count || 0,
                postsByCategory,
                averageReadingTime: Math.round(avgResult[0]?.avg || 0)
            };
        } catch (error) {
            console.error('Error getting blog statistics:', error);
            throw new Error(`Failed to get blog statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private buildWhereConditions(filters?: BlogSearchFilters) {
        if (!filters) return undefined;

        const conditions = [];

        if (filters.category) {
            conditions.push(eq(blogPosts.category, filters.category.value));
        }

        if (filters.status) {
            conditions.push(eq(blogPosts.status, filters.status.value));
        }

        if (filters.author) {
            conditions.push(eq(blogPosts.author, filters.author));
        }

        if (filters.publishedAfter) {
            conditions.push(sql`${blogPosts.createdAt} >= ${filters.publishedAfter}`);
        }

        if (filters.publishedBefore) {
            conditions.push(sql`${blogPosts.createdAt} <= ${filters.publishedBefore}`);
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
    }
}