import { z } from 'zod';
import { IdSchema } from '@/domain/shared/schemas';

const GetBlogPostByIdInputSchema = z.object({
    id: IdSchema,
});

export type GetBlogPostByIdInputData = z.infer<typeof GetBlogPostByIdInputSchema>;

export class GetBlogPostByIdInput {
    constructor(
        public readonly id: string
    ) { }

    static create(data: GetBlogPostByIdInputData): GetBlogPostByIdInput {
        const validated = GetBlogPostByIdInputSchema.parse(data);
        return new GetBlogPostByIdInput(validated.id);
    }

    static fromId(id: string): GetBlogPostByIdInput {
        return GetBlogPostByIdInput.create({ id });
    }

    toJSON(): string {
        return JSON.stringify({
            id: this.id,
        });
    }
}