import { z } from 'zod';
import { IdSchema } from '@/domain/shared/schemas';

export const MarkAllNotificationsAsReadInputSchema = z.object({
    userId: IdSchema,
});

export type MarkAllNotificationsAsReadInputData = z.infer<typeof MarkAllNotificationsAsReadInputSchema>;

export class MarkAllNotificationsAsReadInput {
    private constructor(private readonly data: MarkAllNotificationsAsReadInputData) { }

    static create(data: MarkAllNotificationsAsReadInputData): MarkAllNotificationsAsReadInput {
        const validated = MarkAllNotificationsAsReadInputSchema.parse(data);
        return new MarkAllNotificationsAsReadInput(validated);
    }

    static fromFormData(formData: FormData): MarkAllNotificationsAsReadInput {
        const data = {
            userId: formData.get('userId') as string,
        };
        return MarkAllNotificationsAsReadInput.create(data);
    }

    getUserId(): string {
        return this.data.userId;
    }

    toData(): MarkAllNotificationsAsReadInputData {
        return { ...this.data };
    }
}