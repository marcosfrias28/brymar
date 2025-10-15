import { z } from 'zod';
import { EmailSchema } from '@/domain/shared/schemas';

const VerifyOTPInputSchema = z.object({
    email: EmailSchema,
    otp: z.string()
        .min(4, 'OTP must be at least 4 characters')
        .max(8, 'OTP cannot exceed 8 characters')
        .regex(/^\d+$/, 'OTP must contain only numbers'),
    purpose: z.enum(['email_verification', 'password_reset', 'two_factor']).default('email_verification'),
});

export type VerifyOTPInputData = z.infer<typeof VerifyOTPInputSchema>;

/**
 * Input DTO for verifying OTP
 */
export class VerifyOTPInput {
    private constructor(
        public readonly email: string,
        public readonly otp: string,
        public readonly purpose: 'email_verification' | 'password_reset' | 'two_factor'
    ) { }

    /**
     * Creates and validates VerifyOTPInput from raw data
     */
    static create(data: VerifyOTPInputData): VerifyOTPInput {
        const validated = VerifyOTPInputSchema.parse(data);

        return new VerifyOTPInput(
            validated.email,
            validated.otp,
            validated.purpose
        );
    }

    /**
     * Creates VerifyOTPInput from form data
     */
    static fromFormData(formData: FormData): VerifyOTPInput {
        const data: VerifyOTPInputData = {
            email: formData.get('email') as string,
            otp: formData.get('otp') as string,
            purpose: (formData.get('purpose') as 'email_verification' | 'password_reset' | 'two_factor') || 'email_verification',
        };

        return VerifyOTPInput.create(data);
    }

    /**
     * Validates the input data
     */
    static validate(data: any): VerifyOTPInputData {
        return VerifyOTPInputSchema.parse(data);
    }
}