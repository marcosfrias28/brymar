import { z } from 'zod';

const UpdateUserProfileInputSchema = z.object({
    userId: z.string().uuid('Invalid user ID format'),
    name: z.string().max(100, 'Name cannot exceed 100 characters').optional(),
    firstName: z.string().max(50, 'First name cannot exceed 50 characters').optional(),
    lastName: z.string().max(50, 'Last name cannot exceed 50 characters').optional(),
    phone: z.string().max(20, 'Phone cannot exceed 20 characters').optional(),
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
    location: z.string().max(100, 'Location cannot exceed 100 characters').optional(),
    website: z.string().url('Invalid website URL').max(255, 'Website cannot exceed 255 characters').optional(),
    image: z.string().url('Invalid image URL').optional(),
    preferences: z.object({
        notifications: z.object({
            email: z.boolean().optional(),
            push: z.boolean().optional(),
            marketing: z.boolean().optional(),
        }).optional(),
        privacy: z.object({
            profileVisible: z.boolean().optional(),
            showEmail: z.boolean().optional(),
            showPhone: z.boolean().optional(),
        }).optional(),
        display: z.object({
            theme: z.enum(['light', 'dark', 'system']).optional(),
            language: z.enum(['es', 'en']).optional(),
            currency: z.enum(['USD', 'EUR', 'COP']).optional(),
        }).optional(),
    }).optional(),
});

export type UpdateUserProfileInputData = z.infer<typeof UpdateUserProfileInputSchema>;

/**
 * Input DTO for updating user profile
 */
export class UpdateUserProfileInput {
    private constructor(
        public readonly userId: string,
        public readonly name?: string,
        public readonly firstName?: string,
        public readonly lastName?: string,
        public readonly phone?: string,
        public readonly bio?: string,
        public readonly location?: string,
        public readonly website?: string,
        public readonly image?: string,
        public readonly preferences?: any
    ) { }

    /**
     * Creates and validates UpdateUserProfileInput from raw data
     */
    static create(data: UpdateUserProfileInputData): UpdateUserProfileInput {
        const validated = UpdateUserProfileInputSchema.parse(data);

        return new UpdateUserProfileInput(
            validated.userId,
            validated.name,
            validated.firstName,
            validated.lastName,
            validated.phone,
            validated.bio,
            validated.location,
            validated.website,
            validated.image,
            validated.preferences
        );
    }

    /**
     * Creates UpdateUserProfileInput from form data
     */
    static fromFormData(formData: FormData, userId: string): UpdateUserProfileInput {
        const data: UpdateUserProfileInputData = {
            userId,
            name: formData.get('name') as string || undefined,
            firstName: formData.get('firstName') as string || undefined,
            lastName: formData.get('lastName') as string || undefined,
            phone: formData.get('phone') as string || undefined,
            bio: formData.get('bio') as string || undefined,
            location: formData.get('location') as string || undefined,
            website: formData.get('website') as string || undefined,
            image: formData.get('image') as string || undefined,
        };

        return UpdateUserProfileInput.create(data);
    }

    /**
     * Validates the input data
     */
    static validate(data: any): UpdateUserProfileInputData {
        return UpdateUserProfileInputSchema.parse(data);
    }

    /**
     * Checks if there are any profile updates
     */
    hasProfileUpdates(): boolean {
        return !!(
            this.name ||
            this.firstName ||
            this.lastName ||
            this.phone ||
            this.bio ||
            this.location ||
            this.website ||
            this.image
        );
    }

    /**
     * Checks if there are any preference updates
     */
    hasPreferenceUpdates(): boolean {
        return !!this.preferences;
    }

    /**
     * Gets the profile update data
     */
    getProfileData(): {
        name?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        bio?: string;
        location?: string;
        website?: string;
        image?: string;
    } {
        return {
            name: this.name,
            firstName: this.firstName,
            lastName: this.lastName,
            phone: this.phone,
            bio: this.bio,
            location: this.location,
            website: this.website,
            image: this.image,
        };
    }
}