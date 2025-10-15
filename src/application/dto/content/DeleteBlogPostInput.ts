import { z } from 'zod';
import { IdSchema } from '@/domain/shared/schemas';

const DeleteBlogPostInputSchema = z.object({
    id: IdSchema,
});

export type DeleteBlogPostInputData = z.infer<typeof DeleteBlogPostInputSchema>;

export class DeleteBlogPostInput {
    constructor(
        public readonly id: string
    ) { }

    static create(data: DeleteBlogPostInputData): DeleteBlogPostInput {
        const validated = DeleteBlogPostInputSchema.parse(data);
        return new DeleteBlogPostInput(validated.id);
    }

    static fromId(id: string): DeleteBlogPostInput {
        return DeleteBlogPostInput.create({ id });
    }

    toJSON(): string {
        return JSON.stringify({
            id: this.id,
        });
    }
}