import { IBlogRepository } from '@/domain/content/repositories/IBlogRepository';
import { SearchBlogPostsInput } from '../../dto/content/SearchBlogPostsInput';
import { SearchBlogPostsOutput } from '../../dto/content/SearchBlogPostsOutput';
import { EntityValidationError } from '@/domain/shared/errors/DomainError';

export class SearchBlogPostsUseCase {
    constructor(
        private readonly blogRepository: IBlogRepository
    ) { }

    async execute(input: SearchBlogPostsInput): Promise<SearchBlogPostsOutput> {
        try {
            // Search for blog posts with pagination
            const { blogPosts, total } = await this.blogRepository.search({
                search: input.search,
                status: input.status,
                category: input.category,
                author: input.author,
                sortBy: input.sortBy,
                sortOrder: input.sortOrder,
                offset: input.getOffset(),
                limit: input.limit,
            });

            // Return the output
            return SearchBlogPostsOutput.create(
                blogPosts,
                total,
                input.page,
                input.limit
            );

        } catch (error) {
            throw new EntityValidationError(`Failed to search blog posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}