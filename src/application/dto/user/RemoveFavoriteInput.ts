import { z } from 'zod';
import { IdSchema } from '@/domain/shared/schemas';

export const RemoveFavoriteInputSchema = z.object({
    userId: IdSchema,
    favoriteId: IdSchema,
});

export type RemoveFavoriteInputData = z.infer<typeof RemoveFavoriteInputSchema>;

export class RemoveFavoriteInput {
    private constructor(private readonly data: RemoveFavoriteInputData) { }

    static create(data: RemoveFavoriteInputData): RemoveFavoriteInput {
        const validated = RemoveFavoriteInputSchema.parse(data);
        return new RemoveFavoriteInput(validated);
    }

    static fromFormData(formData: FormData): RemoveFavoriteInput {
        const data = {
            userId: formData.get('userId') as string,
            favoriteId: formData.get('favoriteId') as string,
        };
        return RemoveFavoriteInput.create(data);
    }

    getUserId(): string {
        return this.data.userId;
    }

    getFavoriteId(): string {
        return this.data.favoriteId;
    }

    toData(): RemoveFavoriteInputData {
        return { ...this.data };
    }
}