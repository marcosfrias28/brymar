import { eq, and, or, like, desc, asc, count, sql } from 'drizzle-orm';
import * as logger from '@/lib/logger';
import { BlogPost } from '@/domain/content/entities/BlogPost';
import { PageSection } from '@/domain/content/entities/PageSection';
import { BlogCategory } from '@/domain/content/value-objects/BlogCategory';
import { ContentStatus } from '@/domain/content/value-objects/ContentStatus';
import { PageName } from '@/domain/content/value-objects/PageName';
import { SectionName } from '@/domain/content/value-objects/SectionName';
import { blogPosts, pageSections } from '@/lib/db/schema';
import type { Database } from '@/lib/db/drizzle';
import { BlogMapper } from '../mappers/BlogMapper';
import { PageSectionMapper } from '../mappers/PageSectionMapper';

export interface ContentSearchFilters {
    query?: string;
    category?: BlogCategory;
    status?: ContentStatus;
    author?: string;
    page?: PageName;
    section?: SectionName;
    contentType?: 'blog' | 'page-section' | 'all';
}

export interface ContentSearchOptions {
    limit?: number;
    offset?: number;
    sortBy?: 'relevance' | 'date' | 'title';
    sortOrder?: 'asc' | 'desc';
}

export interface ContentSearchResult {
    blogPosts: BlogPost[];
    pageSections: PageSection[];
    total: number;
    hasMore: boolean;
}

export class ContentSearchService {
    constructor(private readonly _db: Database) { }

    async searchContent(
        filters: ContentSearchFilters,
        options: ContentSearchOptions = {}
    ): Promise<ContentSearchResult> {
        const {
            limit = 20,
            offset = 0,
            sortBy = 'relevance',
            sortOrder = 'desc'
        } = options;

        const { contentType = 'all' } = filters;

        let blogPosts: BlogPost[] = [];
        let pageSections: PageSection[] = [];
        let total = 0;

        try {
            if (contentType === 'blog' || contentType === 'all') {
                const blogResults = await this.searchBlogPosts(filters, {
                    limit: contentType === 'blog' ? limit : Math.ceil(limit / 2),
                    offset: contentType === 'blog' ? offset : Math.floor(offset / 2),
                    sortBy,
                    sortOrder
                });
                blogPosts = blogResults.posts;
                total += blogResults.total;
            }

            if (contentType === 'page-section' || contentType === 'all') {
                const sectionResults = await this.searchPageSections(filters, {
                    limit: contentType === 'page-section' ? limit : Math.ceil(limit / 2),
                    offset: contentType === 'page-section' ? offset : Math.floor(offset / 2),
                    sortBy,
                    sortOrder
                });
                pageSections = sectionResults.sections;
                total += sectionResults.total;
            }

            const hasMore = offset + limit < total;

            return {
                blogPosts,
                pageSections,
                total,
                hasMore
            };
        } catch (error) {
            await logger.error('Failed to search content', error);
            throw new Error(`Failed to search content: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async searchBlogPosts(
        filters: ContentSearchFilters,
        options: ContentSearchOptions = {}
    ): Promise<{ posts: BlogPost[]; total: number; hasMore: boolean }> {
        try {
            const { limit = 10, offset = 0, sortBy = 'date', sortOrder = 'desc' } = options;

            const whereConditions = this.buildBlogWhereConditions(filters);

            // Get total count
            const totalResult = await this._db
                .select({ count: count() })
                .from(blogPosts)
                .where(whereConditions);

            const total = totalResult[0]?.count || 0;

            // Build order by clause
            let orderBy;
            switch (sortBy) {
                case 'title':
                    orderBy = sortOrder === 'asc' ? asc(blogPosts.title) : desc(blogPosts.title);
                    break;
                case 'relevance':
                    // For relevance, we'll use a simple scoring based on title matches
                    if (filters.query) {
                        orderBy = sql`
              CASE 
                WHEN ${blogPosts.title} ILIKE ${`%${filters.query}%`} THEN 2
                WHEN ${blogPosts.content} ILIKE ${`%${filters.query}%`} THEN 1
                ELSE 0
              END DESC, ${blogPosts.createdAt} DESC
            `;
                    } else {
                        orderBy = desc(blogPosts.createdAt);
                    }
                    break;
                case 'date':
                default:
                    orderBy = sortOrder === 'asc' ? asc(blogPosts.createdAt) : desc(blogPosts.createdAt);
                    break;
            }

            // Get posts with pagination
            const results = await this._db
                .select()
                .from(blogPosts)
                .where(whereConditions)
                .orderBy(orderBy)
                .limit(limit)
                .offset(offset);

            const posts = results.map(row => BlogMapper.toDomain(row));
            const hasMore = offset + limit < total;

            return { posts, total, hasMore };
        } catch (error) {
            await logger.error('Failed to search blog posts', error);
            throw new Error(`Failed to search blog posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async searchPageSections(
        filters: ContentSearchFilters,
        options: ContentSearchOptions = {}
    ): Promise<{ sections: PageSection[]; total: number; hasMore: boolean }> {
        try {
            const { limit = 10, offset = 0, sortBy = 'date', sortOrder = 'desc' } = options;

            const whereConditions = this.buildPageSectionWhereConditions(filters);

            // Get total count
            const totalResult = await this._db
                .select({ count: count() })
                .from(pageSections)
                .where(whereConditions);

            const total = totalResult[0]?.count || 0;

            // Build order by clause
            let orderBy;
            switch (sortBy) {
                case 'title':
                    orderBy = sortOrder === 'asc' ? asc(pageSections.title) : desc(pageSections.title);
                    break;
                case 'relevance':
                    // For relevance, we'll use a simple scoring based on title and description matches
                    if (filters.query) {
                        orderBy = sql`
              CASE 
                WHEN ${pageSections.title} ILIKE ${`%${filters.query}%`} THEN 3
                WHEN ${pageSections.description} ILIKE ${`%${filters.query}%`} THEN 2
                WHEN ${pageSections.subtitle} ILIKE ${`%${filters.query}%`} THEN 1
                ELSE 0
              END DESC, ${pageSections.updatedAt} DESC
            `;
                    } else {
                        orderBy = desc(pageSections.updatedAt);
                    }
                    break;
                case 'date':
                default:
                    orderBy = sortOrder === 'asc' ? asc(pageSections.updatedAt) : desc(pageSections.updatedAt);
                    break;
            }

            // Get sections with pagination
            const results = await this._db
                .select()
                .from(pageSections)
                .where(whereConditions)
                .orderBy(orderBy)
                .limit(limit)
                .offset(offset);

            const sections = results.map(row => PageSectionMapper.toDomain(row));
            const hasMore = offset + limit < total;

            return { sections, total, hasMore };
        } catch (error) {
            await logger.error('Failed to search page sections', error);
            throw new Error(`Failed to search page sections: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getContentStatistics(): Promise<{
        totalBlogPosts: number;
        publishedBlogPosts: number;
        draftBlogPosts: number;
        totalPageSections: number;
        activePageSections: number;
        contentByCategory: Record<string, number>;
        contentByPage: Record<string, number>;
    }> {
        try {
            // Get blog post statistics
            const [totalBlogResult, publishedBlogResult, draftBlogResult] = await Promise.all([
                this._db.select({ count: count() }).from(blogPosts),
                this._db.select({ count: count() }).from(blogPosts).where(eq(blogPosts.status, 'published')),
                this._db.select({ count: count() }).from(blogPosts).where(eq(blogPosts.status, 'draft'))
            ]);

            // Get page section statistics
            const [totalSectionResult, activeSectionResult] = await Promise.all([
                this._db.select({ count: count() }).from(pageSections),
                this._db.select({ count: count() }).from(pageSections).where(eq(pageSections.isActive, true))
            ]);

            // Get content by category
            const categoryResults = await this._db
                .select({
                    category: blogPosts.category,
                    count: count()
                })
                .from(blogPosts)
                .groupBy(blogPosts.category);

            const contentByCategory: Record<string, number> = {};
            categoryResults.forEach(result => {
                contentByCategory[result.category] = result.count;
            });

            // Get content by page
            const pageResults = await this._db
                .select({
                    page: pageSections.page,
                    count: count()
                })
                .from(pageSections)
                .groupBy(pageSections.page);

            const contentByPage: Record<string, number> = {};
            pageResults.forEach(result => {
                contentByPage[result.page] = result.count;
            });

            return {
                totalBlogPosts: totalBlogResult[0]?.count || 0,
                publishedBlogPosts: publishedBlogResult[0]?.count || 0,
                draftBlogPosts: draftBlogResult[0]?.count || 0,
                totalPageSections: totalSectionResult[0]?.count || 0,
                activePageSections: activeSectionResult[0]?.count || 0,
                contentByCategory,
                contentByPage
            };
        } catch (error) {
            await logger.error('Failed to get content statistics', error);
            throw new Error(`Failed to get content statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private buildBlogWhereConditions(filters: ContentSearchFilters) {
        const conditions = [];

        if (filters.query) {
            conditions.push(
                or(
                    like(blogPosts.title, `%${filters.query}%`),
                    like(blogPosts.content, `%${filters.query}%`)
                )
            );
        }

        if (filters.category) {
            conditions.push(eq(blogPosts.category, filters.category.value));
        }

        if (filters.status) {
            conditions.push(eq(blogPosts.status, filters.status.value));
        }

        if (filters.author) {
            conditions.push(eq(blogPosts.author, filters.author));
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
    }

    private buildPageSectionWhereConditions(filters: ContentSearchFilters) {
        const conditions = [];

        if (filters.query) {
            conditions.push(
                or(
                    like(pageSections.title, `%${filters.query}%`),
                    like(pageSections.subtitle, `%${filters.query}%`),
                    like(pageSections.description, `%${filters.query}%`)
                )
            );
        }

        if (filters.page) {
            conditions.push(eq(pageSections.page, filters.page.value));
        }

        if (filters.section) {
            conditions.push(eq(pageSections.section, filters.section.value));
        }

        // Only show active sections by default
        conditions.push(eq(pageSections.isActive, true));

        return conditions.length > 0 ? and(...conditions) : undefined;
    }
}