import { z } from 'zod';
import {
    ShortTextSchema,
    LongTextSchema,
    OptionalShortTextSchema,
    OptionalMediumTextSchema,
    TagsSchema,
    BooleanFlagSchema,
    OptionalUrlSchema,
    IdSchema,
    UrlSchema
} from '@/domain/shared/schemas';

const UpdateBlogPostInputSchema = z.object({
    id: IdSchema,
    title: ShortTextSchema.min(10, 'Title must be at least 10 characters').max(200, 'Title cannot exceed 200 characters').optional(),
    content: LongTextSchema.min(100, 'Content must be at least 100 characters').max(50000, 'Content cannot exceed 50,000 characters').optional(),
    author: ShortTextSchema.min(2, 'Author must be at least 2 characters').max(100, 'Author cannot exceed 100 characters').optional(),
    category: z.enum(['market-analysis', 'investment-tips', 'property-news', 'legal-advice', 'lifestyle']).optional(),
    excerpt: z.string().min(50, 'Excerpt must be at least 50 characters').max(500, 'Excerpt cannot exceed 500 characters').optional(),
    seoTitle: z.string().max(60, 'SEO title cannot exceed 60 characters').optional(),
    seoDescription: z.string().max(160, 'SEO description cannot exceed 160 characters').optional(),
    tags: TagsSchema.min(1, 'Must include at least one tag').max(10, 'Cannot exceed 10 tags').optional(),
    slug: z.string().min(3, 'Slug must be at least 3 characters').max(100, 'Slug cannot exceed 100 characters').optional(),
    featured: BooleanFlagSchema.optional(),
    coverImage: OptionalUrlSchema,
    images: z.array(z.object({
        id: IdSchema,
        url: UrlSchema,
        filename: ShortTextSchema,
        alt: OptionalShortTextSchema,
        caption: OptionalShortTextSchema,
    })).optional(),
});

export type UpdateBlogPostInputData = z.infer<typeof UpdateBlogPostInputSchema>;

export class UpdateBlogPostInput {
    constructor(
        public readonly id: string,
        public readonly title?: string,
        public readonly content?: string,
        public readonly author?: string,
        public readonly category?: string,
        public readonly tags?: string[],
        public readonly excerpt?: string,
        public readonly seoTitle?: string,
        public readonly seoDescription?: string,
        public readonly slug?: string,
        public readonly featured?: boolean,
        public readonly coverImage?: string,
        public readonly images?: Array<{
            id: string;
            url: string;
            filename: string;
            alt?: string;
            caption?: string;
        }>
    ) { }

    static create(data: UpdateBlogPostInputData): UpdateBlogPostInput {
        const validated = UpdateBlogPostInputSchema.parse(data);

        return new UpdateBlogPostInput(
            validated.id,
            validated.title,
            validated.content,
            validated.author,
            validated.category,
            validated.tags,
            validated.excerpt,
            validated.seoTitle,
            validated.seoDescription,
            validated.slug,
            validated.featured,
            validated.coverImage,
            validated.images
        );
    }

    static fromFormData(formData: FormData): UpdateBlogPostInput {
        const data: UpdateBlogPostInputData = {
            id: formData.get('id') as string,
            title: formData.get('title') as string || undefined,
            content: formData.get('content') as string || undefined,
            author: formData.get('author') as string || undefined,
            category: formData.get('category') as any || undefined,
            tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : undefined,
            excerpt: formData.get('excerpt') as string || undefined,
            seoTitle: formData.get('seoTitle') as string || undefined,
            seoDescription: formData.get('seoDescription') as string || undefined,
            slug: formData.get('slug') as string || undefined,
            featured: formData.get('featured') ? formData.get('featured') === 'true' : undefined,
            coverImage: formData.get('coverImage') as string || undefined,
            images: formData.get('images') ? JSON.parse(formData.get('images') as string) : undefined,
        };

        return UpdateBlogPostInput.create(data);
    }

    toJSON(): string {
        return JSON.stringify({
            id: this.id,
            title: this.title,
            content: this.content,
            author: this.author,
            category: this.category,
            tags: this.tags,
            excerpt: this.excerpt,
            seoTitle: this.seoTitle,
            seoDescription: this.seoDescription,
            slug: this.slug,
            featured: this.featured,
            coverImage: this.coverImage,
            images: this.images,
        });
    }
}