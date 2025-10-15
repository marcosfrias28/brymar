import { BlogPost } from '@/domain/content/entities/BlogPost';
import { GetBlogPostByIdOutput } from './GetBlogPostByIdOutput';

export class SearchBlogPostsOutput {
    constructor(
        public readonly blogPosts: GetBlogPostByIdOutput[],
        public readonly total: number,
        public readonly page: number,
        public readonly limit: number,
        public readonly totalPages: number
    ) { }

    static create(
        blogPosts: BlogPost[],
        total: number,
        page: number,
        limit: number
    ): SearchBlogPostsOutput {
        const blogPostOutputs = blogPosts.map(blogPost => GetBlogPostByIdOutput.from(blogPost));
        const totalPages = Math.ceil(total / limit);

        return new SearchBlogPostsOutput(
            blogPostOutputs,
            total,
            page,
            limit,
            totalPages
        );
    }

    /**
     * Frontend compatibility methods
     */
    getBlogPosts(): GetBlogPostByIdOutput[] {
        return this.blogPosts;
    }

    getTotal(): number {
        return this.total;
    }

    getPage(): number {
        return this.page;
    }

    getLimit(): number {
        return this.limit;
    }

    getTotalPages(): number {
        return this.totalPages;
    }

    hasNextPage(): boolean {
        return this.page < this.totalPages;
    }

    hasPreviousPage(): boolean {
        return this.page > 1;
    }

    toJSON(): string {
        return JSON.stringify({
            blogPosts: this.blogPosts.map(bp => JSON.parse(bp.toJSON())),
            total: this.total,
            page: this.page,
            limit: this.limit,
            totalPages: this.totalPages,
        });
    }
}