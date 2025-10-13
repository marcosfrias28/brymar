import { z } from 'zod';

const PublishBlogPostInputSchema = z.object({
    id: z.string().min(1, 'Blog post ID is required'),
    publishDate: z.date().optional(),
    seoOptimizations: z.object({
        title: z.string().max(60).optional(),
        description: z.string().max(160).optional(),
        tags: z.array(z.string()).optional(),
        slug: z.string().min(3).max(100).optional(),
    }).optional(),
});

export type PublishBlogPostInputData = z.infer<typeof PublishBlogPostInputSchema>;

export class PublishBlogPostInput {
    constructor(
        public readonly id: string,
        public readonly publishDate?: Date,
        public readonly seoOptimizations?: {
            title?: string;
            description?: string;
            tags?: string[];
            slug?: string;
        }
    ) { }

    static create(data: PublishBlogPostInputData): PublishBlogPostInput {
        const validated = PublishBlogPostInputSchema.parse(data);

        return new PublishBlogPostInput(
            validated.id,
            validated.publishDate,
            validated.seoOptimizations
        );
    }

    static fromFormData(formData: FormData): PublishBlogPostInput {
        const publishDateStr = formData.get('publishDate') as string;
        const seoOptimizationsStr = formData.get('seoOptimizations') as string;

        const data: PublishBlogPostInputData = {
            id: formData.get('id') as string,
            publishDate: publishDateStr ? new Date(publishDateStr) : undefined,
            seoOptimizations: seoOptimizationsStr ? JSON.parse(seoOptimizationsStr) : undefined,
        };

        return PublishBlogPostInput.create(data);
    }

    static fromJSON(json: string): PublishBlogPostInput {
        const data = JSON.parse(json);
        if (data.publishDate) {
            data.publishDate = new Date(data.publishDate);
        }
        return PublishBlogPostInput.create(data);
    }

    toJSON(): string {
        return JSON.stringify({
            id: this.id,
            publishDate: this.publishDate?.toISOString(),
            seoOptimizations: this.seoOptimizations,
        });
    }
}