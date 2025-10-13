import { z } from 'zod';

const AuthenticateUserInputSchema = z.object({
    email: z.string().email('Invalid email format').min(1, 'Email is required'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().default(false),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
});

export type AuthenticateUserInputData = z.infer<typeof AuthenticateUserInputSchema>;

/**
 * Input DTO for user authentication
 */
export class AuthenticateUserInput {
    private constructor(
        public readonly email: string,
        public readonly password: string,
        public readonly rememberMe: boolean = false,
        public readonly ipAddress?: string,
        public readonly userAgent?: string
    ) { }

    /**
     * Creates and validates AuthenticateUserInput from raw data
     */
    static create(data: AuthenticateUserInputData): AuthenticateUserInput {
        const validated = AuthenticateUserInputSchema.parse(data);

        return new AuthenticateUserInput(
            validated.email,
            validated.password,
            validated.rememberMe,
            validated.ipAddress,
            validated.userAgent
        );
    }

    /**
     * Creates AuthenticateUserInput from form data
     */
    static fromFormData(formData: FormData): AuthenticateUserInput {
        const data: AuthenticateUserInputData = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            rememberMe: formData.get('rememberMe') === 'true',
        };

        return AuthenticateUserInput.create(data);
    }

    /**
     * Validates the input data
     */
    static validate(data: any): AuthenticateUserInputData {
        return AuthenticateUserInputSchema.parse(data);
    }
}