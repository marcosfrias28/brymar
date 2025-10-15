import { z } from 'zod';

const SearchBlogPostsInputSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    category: z.enum(['market-analysis', 'investment-tips', 'property-news', 'legal-advice', 'lifestyle']).optional(),
    author: z.string().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'readingTime']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type SearchBlogPostsInputData = z.infer<typeof SearchBlogPostsInputSchema>;

export class SearchBlogPostsInput {
    constructor(
        public readonly page: number = 1,
        public readonly limit: number = 10,
        public readonly search?: string,
        public readonly status?: 'draft' | 'published' | 'archived',
        public readonly category?: 'market-analysis' | 'investment-tips' | 'property-news' | 'legal-advice' | 'lifestyle',
        public readonly author?: string,
        public readonly sortBy: 'createdAt' | 'updatedAt' | 'title' | 'readingTime' = 'createdAt',
        public readonly sortOrder: 'asc' | 'desc' = 'desc'
    ) { }

    static create(data: Partial<SearchBlogPostsInputData> = {}): SearchBlogPostsInput {
        const validated = SearchBlogPostsInputSchema.parse(data);

        return new SearchBlogPostsInput(
            validated.page,
            validated.limit,
            validated.search,
            validated.status,
            validated.category,
            validated.author,
            validated.sortBy,
            validated.sortOrder
        );
    }

    static fromQuery(query: URLSearchParams): SearchBlogPostsInput {
        const data: Partial<SearchBlogPostsInputData> = {
            page: query.get('page') ? parseInt(query.get('page')!) : 1,
            limit: query.get('limit') ? parseInt(query.get('limit')!) : 10,
            search: query.get('search') || undefined,
            status: query.get('status') as any || undefined,
            category: query.get('category') as any || undefined,
            author: query.get('author') || undefined,
            sortBy: query.get('sortBy') as any || 'createdAt',
            sortOrder: query.get('sortOrder') as any || 'desc',
        };

        return SearchBlogPostsInput.create(data);
    }

    getOffset(): number {
        return (this.page - 1) * this.limit;
    }

    toJSON(): string {
        return JSON.stringify({
            page: this.page,
            limit: this.limit,
            search: this.search,
            status: this.status,
            category: this.category,
            author: this.author,
            sortBy: this.sortBy,
            sortOrder: this.sortOrder,
        });
    }
}