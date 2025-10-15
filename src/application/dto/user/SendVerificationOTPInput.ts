import { z } from 'zod';
import { EmailSchema } from '@/domain/shared/schemas';

const SendVerificationOTPInputSchema = z.object({
    email: EmailSchema,
    purpose: z.enum(['email_verification', 'password_reset', 'two_factor']).default('email_verification'),
});

export type SendVerificationOTPInputData = z.infer<typeof SendVerificationOTPInputSchema>;

/**
 * Input DTO for sending verification OTP
 */
export class SendVerificationOTPInput {
    private constructor(
        public readonly email: string,
        public readonly purpose: 'email_verification' | 'password_reset' | 'two_factor'
    ) { }

    /**
     * Creates and validates SendVerificationOTPInput from raw data
     */
    static create(data: SendVerificationOTPInputData): SendVerificationOTPInput {
        const validated = SendVerificationOTPInputSchema.parse(data);

        return new SendVerificationOTPInput(
            validated.email,
            validated.purpose
        );
    }

    /**
     * Creates SendVerificationOTPInput from form data
     */
    static fromFormData(formData: FormData): SendVerificationOTPInput {
        const data: SendVerificationOTPInputData = {
            email: formData.get('email') as string,
            purpose: (formData.get('purpose') as 'email_verification' | 'password_reset' | 'two_factor') || 'email_verification',
        };

        return SendVerificationOTPInput.create(data);
    }

    /**
     * Validates the input data
     */
    static validate(data: any): SendVerificationOTPInputData {
        return SendVerificationOTPInputSchema.parse(data);
    }
}