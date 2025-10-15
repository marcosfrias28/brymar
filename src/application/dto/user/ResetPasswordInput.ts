import { z } from 'zod';

const ResetPasswordInputSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password cannot exceed 128 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export type ResetPasswordInputData = z.infer<typeof ResetPasswordInputSchema>;

/**
 * Input DTO for password reset
 */
export class ResetPasswordInput {
    private constructor(
        public readonly token: string,
        public readonly password: string,
        public readonly confirmPassword: string
    ) { }

    /**
     * Creates and validates ResetPasswordInput from raw data
     */
    static create(data: ResetPasswordInputData): ResetPasswordInput {
        const validated = ResetPasswordInputSchema.parse(data);

        return new ResetPasswordInput(
            validated.token,
            validated.password,
            validated.confirmPassword
        );
    }

    /**
     * Creates ResetPasswordInput from form data
     */
    static fromFormData(formData: FormData): ResetPasswordInput {
        const data: ResetPasswordInputData = {
            token: formData.get('token') as string,
            password: formData.get('password') as string,
            confirmPassword: formData.get('confirmPassword') as string,
        };

        return ResetPasswordInput.create(data);
    }

    /**
     * Validates the input data
     */
    static validate(data: any): ResetPasswordInputData {
        return ResetPasswordInputSchema.parse(data);
    }
}