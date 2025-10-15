import { z } from 'zod';
import {
    EmailSchema,
    OptionalShortTextSchema,
    OptionalPhoneSchema,
    UserRoleSchema,
    UserPreferencesSchema
} from '@/domain/shared/schemas';

const CreateUserInputSchema = z.object({
    email: EmailSchema,
    name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters').optional(),
    firstName: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters').optional(),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters').optional(),
    phone: OptionalPhoneSchema,
    role: UserRoleSchema,
    preferences: UserPreferencesSchema.optional(),
});

export type CreateUserInputData = z.infer<typeof CreateUserInputSchema>;

/**
 * Input DTO for creating a new user
 */
export class CreateUserInput {
    private constructor(
        public readonly email: string,
        public readonly name?: string,
        public readonly firstName?: string,
        public readonly lastName?: string,
        public readonly phone?: string,
        public readonly role: 'admin' | 'editor' | 'super_admin' | 'user' | 'agent' = 'user',
        public readonly preferences?: any
    ) { }

    /**
     * Creates and validates CreateUserInput from raw data
     */
    static create(data: CreateUserInputData): CreateUserInput {
        const validated = CreateUserInputSchema.parse(data);

        return new CreateUserInput(
            validated.email,
            validated.name,
            validated.firstName,
            validated.lastName,
            validated.phone,
            validated.role,
            validated.preferences
        );
    }

    /**
     * Creates CreateUserInput from form data
     */
    static fromFormData(formData: FormData): CreateUserInput {
        const data: CreateUserInputData = {
            email: formData.get('email') as string,
            name: formData.get('name') as string || undefined,
            firstName: formData.get('firstName') as string || undefined,
            lastName: formData.get('lastName') as string || undefined,
            phone: formData.get('phone') as string || undefined,
            role: (formData.get('role') as 'admin' | 'agent' | 'user') || 'user',
            preferences: undefined, // Will use defaults from schema
        };

        return CreateUserInput.create(data);
    }

    /**
     * Validates the input data
     */
    static validate(data: any): CreateUserInputData {
        return CreateUserInputSchema.parse(data);
    }
}