import { z } from 'zod';
import { EmailSchema } from '@/domain/shared/schemas';

const ForgotPasswordInputSchema = z.object({
    email: EmailSchema,
    redirectUrl: z.string().url('Invalid redirect URL').optional(),
});

export type ForgotPasswordInputData = z.infer<typeof ForgotPasswordInputSchema>;

/**
 * Input DTO for forgot password request
 */
export class ForgotPasswordInput {
    private constructor(
        public readonly email: string,
        public readonly redirectUrl?: string
    ) { }

    /**
     * Creates and validates ForgotPasswordInput from raw data
     */
    static create(data: ForgotPasswordInputData): ForgotPasswordInput {
        const validated = ForgotPasswordInputSchema.parse(data);

        return new ForgotPasswordInput(
            validated.email,
            validated.redirectUrl
        );
    }

    /**
     * Creates ForgotPasswordInput from form data
     */
    static fromFormData(formData: FormData): ForgotPasswordInput {
        const data: ForgotPasswordInputData = {
            email: formData.get('email') as string,
            redirectUrl: formData.get('redirectUrl') as string || undefined,
        };

        return ForgotPasswordInput.create(data);
    }

    /**
     * Validates the input data
     */
    static validate(data: any): ForgotPasswordInputData {
        return ForgotPasswordInputSchema.parse(data);
    }
}