import { z } from 'zod';
import {
    IdSchema,
    OptionalMediumTextSchema
} from '@/domain/shared/schemas';

const PublishPropertyInputSchema = z.object({
    id: IdSchema,
    publishedBy: IdSchema.optional(),
    publishNotes: OptionalMediumTextSchema,
    scheduledPublishDate: z.date().optional(),
    notifySubscribers: z.boolean().default(true),
    featuredUntil: z.date().optional(),
});

export type PublishPropertyInputData = z.infer<typeof PublishPropertyInputSchema>;

/**
 * Input DTO for publishing a property
 */
export class PublishPropertyInput {
    private constructor(
        public readonly id: string,
        public readonly publishedBy?: string,
        public readonly publishNotes?: string,
        public readonly scheduledPublishDate?: Date,
        public readonly notifySubscribers: boolean = true,
        public readonly featuredUntil?: Date
    ) { }

    /**
     * Creates and validates PublishPropertyInput from raw data
     */
    static create(data: PublishPropertyInputData): PublishPropertyInput {
        const validated = PublishPropertyInputSchema.parse(data);

        return new PublishPropertyInput(
            validated.id,
            validated.publishedBy,
            validated.publishNotes,
            validated.scheduledPublishDate,
            validated.notifySubscribers,
            validated.featuredUntil
        );
    }

    /**
     * Creates PublishPropertyInput from form data
     */
    static fromFormData(formData: FormData): PublishPropertyInput {
        const id = formData.get('id') as string;
        const publishedBy = formData.get('publishedBy') as string || undefined;
        const publishNotes = formData.get('publishNotes') as string || undefined;
        const notifySubscribers = formData.get('notifySubscribers') !== 'false';

        // Parse scheduled publish date
        let scheduledPublishDate: Date | undefined;
        const scheduledDateStr = formData.get('scheduledPublishDate') as string;
        if (scheduledDateStr) {
            scheduledPublishDate = new Date(scheduledDateStr);
        }

        // Parse featured until date
        let featuredUntil: Date | undefined;
        const featuredUntilStr = formData.get('featuredUntil') as string;
        if (featuredUntilStr) {
            featuredUntil = new Date(featuredUntilStr);
        }

        const data: PublishPropertyInputData = {
            id,
            publishedBy,
            publishNotes,
            scheduledPublishDate,
            notifySubscribers,
            featuredUntil,
        };

        return PublishPropertyInput.create(data);
    }

    /**
     * Validates the input data
     */
    static validate(data: any): PublishPropertyInputData {
        return PublishPropertyInputSchema.parse(data);
    }

    /**
     * Checks if this is a scheduled publish
     */
    isScheduled(): boolean {
        return !!this.scheduledPublishDate && this.scheduledPublishDate > new Date();
    }

    /**
     * Checks if property should be featured
     */
    shouldBeFeatured(): boolean {
        return !!this.featuredUntil && this.featuredUntil > new Date();
    }
}