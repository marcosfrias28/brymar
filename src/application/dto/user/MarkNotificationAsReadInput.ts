import { z } from 'zod';
import { IdSchema } from '@/domain/shared/schemas';

export const MarkNotificationAsReadInputSchema = z.object({
    userId: IdSchema,
    notificationId: IdSchema,
});

export type MarkNotificationAsReadInputData = z.infer<typeof MarkNotificationAsReadInputSchema>;

export class MarkNotificationAsReadInput {
    private constructor(private readonly data: MarkNotificationAsReadInputData) { }

    static create(data: MarkNotificationAsReadInputData): MarkNotificationAsReadInput {
        const validated = MarkNotificationAsReadInputSchema.parse(data);
        return new MarkNotificationAsReadInput(validated);
    }

    static fromFormData(formData: FormData): MarkNotificationAsReadInput {
        const data = {
            userId: formData.get('userId') as string,
            notificationId: formData.get('notificationId') as string,
        };
        return MarkNotificationAsReadInput.create(data);
    }

    getUserId(): string {
        return this.data.userId;
    }

    getNotificationId(): string {
        return this.data.notificationId;
    }

    toData(): MarkNotificationAsReadInputData {
        return { ...this.data };
    }
}