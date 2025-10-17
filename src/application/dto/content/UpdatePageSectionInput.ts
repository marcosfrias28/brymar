import { z } from 'zod';
import {
    IdSchema,
    ShortTextSchema,
    OptionalShortTextSchema,
    LongTextSchema,
    BooleanFlagSchema,
    UrlSchema
} from '@/domain/shared/schemas';

const UpdatePageSectionInputSchema = z.object({
    id: IdSchema,
    title: z.string().min(2).max(200).trim().optional(),
    content: z.object({
        subtitle: z.string().max(300).optional(),
        description: z.string().max(1000).optional(),
        content: z.record(z.string(), z.any()).optional(),
        images: z.array(UrlSchema).optional(),
    }).optional(),
    settings: z.record(z.string(), z.any()).optional(),
    isActive: z.boolean().optional(),
    order: z.number().min(0).optional(),
});

export type UpdatePageSectionInputData = z.infer<typeof UpdatePageSectionInputSchema>;

export class UpdatePageSectionInput {
    constructor(
        public readonly id: string,
        public readonly title?: string,
        public readonly content?: {
            subtitle?: string;
            description?: string;
            content?: Record<string, any>;
            images?: string[];
        },
        public readonly settings?: Record<string, any>,
        public readonly isActive?: boolean,
        public readonly order?: number
    ) { }

    static create(data: UpdatePageSectionInputData): UpdatePageSectionInput {
        const validated = UpdatePageSectionInputSchema.parse(data);

        return new UpdatePageSectionInput(
            validated.id,
            validated.title,
            validated.content,
            validated.settings,
            validated.isActive,
            validated.order
        );
    }

    static fromFormData(formData: FormData): UpdatePageSectionInput {
        const contentStr = formData.get('content') as string;
        const settingsStr = formData.get('settings') as string;
        const isActiveStr = formData.get('isActive') as string;
        const orderStr = formData.get('order') as string;

        const data: UpdatePageSectionInputData = {
            id: formData.get('id') as string,
            title: formData.get('title') as string || undefined,
            content: contentStr ? JSON.parse(contentStr) : undefined,
            settings: settingsStr ? JSON.parse(settingsStr) : undefined,
            isActive: isActiveStr ? isActiveStr === 'true' : undefined,
            order: orderStr ? parseInt(orderStr, 10) : undefined,
        };

        return UpdatePageSectionInput.create(data);
    }

    static fromJSON(json: string): UpdatePageSectionInput {
        const data = JSON.parse(json);
        return UpdatePageSectionInput.create(data);
    }

    hasUpdates(): boolean {
        return !!(
            this.title !== undefined ||
            this.content !== undefined ||
            this.settings !== undefined ||
            this.isActive !== undefined ||
            this.order !== undefined
        );
    }

    toJSON(): string {
        return JSON.stringify({
            id: this.id,
            title: this.title,
            content: this.content,
            settings: this.settings,
            isActive: this.isActive,
            order: this.order,
        });
    }
}