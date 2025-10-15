import { z } from 'zod';
import { IdSchema } from '@/domain/shared/schemas';

const GetLandByIdInputSchema = z.object({
    id: IdSchema,
});

export type GetLandByIdInputData = z.infer<typeof GetLandByIdInputSchema>;

/**
 * Input DTO for getting a land by ID
 */
export class GetLandByIdInput {
    private constructor(
        public readonly id: string
    ) { }

    /**
     * Creates and validates GetLandByIdInput from raw data
     */
    static create(data: GetLandByIdInputData): GetLandByIdInput {
        const validated = GetLandByIdInputSchema.parse(data);
        return new GetLandByIdInput(validated.id);
    }

    /**
     * Creates GetLandByIdInput from ID string
     */
    static fromId(id: string): GetLandByIdInput {
        return GetLandByIdInput.create({ id });
    }

    /**
     * Creates GetLandByIdInput from form data
     */
    static fromFormData(formData: FormData): GetLandByIdInput {
        const id = formData.get('id') as string;
        return GetLandByIdInput.create({ id });
    }

    /**
     * Validates the input data
     */
    static validate(data: any): GetLandByIdInputData {
        return GetLandByIdInputSchema.parse(data);
    }
}