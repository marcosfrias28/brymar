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

const CreateBlogPostInputSchema = z.object({
    title: ShortTextSchema.min(10, 'Title must be at least 10 characters').max(200, 'Title cannot exceed 200 characters'),
    content: LongTextSchema.min(100, 'Content must be at least 100 characters').max(50000, 'Content cannot exceed 50,000 characters'),
    author: ShortTextSchema.min(2, 'Author must be at least 2 characters').max(100, 'Author cannot exceed 100 characters'),
    category: z.enum(['market-analysis', 'investment-tips', 'property-news', 'legal-advice', 'lifestyle']),
    excerpt: z.string().min(50, 'Excerpt must be at least 50 characters').max(500, 'Excerpt cannot exceed 500 characters').optional(),
    seoTitle: z.string().max(60, 'SEO title cannot exceed 60 characters').optional(),
    seoDescription: z.string().max(160, 'SEO description cannot exceed 160 characters').optional(),
    tags: TagsSchema.min(1, 'Must include at least one tag').max(10, 'Cannot exceed 10 tags'),
    slug: z.string().min(3, 'Slug must be at least 3 characters').max(100, 'Slug cannot exceed 100 characters').optional(),
    featured: BooleanFlagSchema,
    coverImage: OptionalUrlSchema,
    images: z.array(z.object({
        id: IdSchema,
        url: UrlSchema,
        filename: ShortTextSchema,
        alt: OptionalShortTextSchema,
        caption: OptionalShortTextSchema,
    })).default([]),
});

export type CreateBlogPostInputData = z.infer<typeof CreateBlogPostInputSchema>;

export class CreateBlogPostInput {
    constructor(
        public readonly title: string,
        public readonly content: string,
        public readonly author: string,
        public readonly category: string,
        public readonly tags: string[],
        public readonly excerpt?: string,
        public readonly seoTitle?: string,
        public readonly seoDescription?: string,
        public readonly slug?: string,
        public readonly featured: boolean = false,
        public readonly coverImage?: string,
        public readonly images: Array<{
            id: string;
            url: string;
            filename: string;
            alt?: string;
            caption?: string;
        }> = []
    ) { }

    static create(data: CreateBlogPostInputData): CreateBlogPostInput {
        const validated = CreateBlogPostInputSchema.parse(data);

        return new CreateBlogPostInput(
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

    static fromFormData(formData: FormData): CreateBlogPostInput {
        const data: CreateBlogPostInputData = {
            title: formData.get('title') as string,
            content: formData.get('content') as string,
            author: formData.get('author') as string,
            category: formData.get('category') as any,
            tags: JSON.parse(formData.get('tags') as string || '[]'),
            excerpt: formData.get('excerpt') as string || undefined,
            seoTitle: formData.get('seoTitle') as string || undefined,
            seoDescription: formData.get('seoDescription') as string || undefined,
            slug: formData.get('slug') as string || undefined,
            featured: formData.get('featured') === 'true',
            coverImage: formData.get('coverImage') as string || undefined,
            images: JSON.parse(formData.get('images') as string || '[]'),
        };

        return CreateBlogPostInput.create(data);
    }

    static fromJSON(json: string): CreateBlogPostInput {
        const data = JSON.parse(json);
        return CreateBlogPostInput.create(data);
    }

    toJSON(): string {
        return JSON.stringify({
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