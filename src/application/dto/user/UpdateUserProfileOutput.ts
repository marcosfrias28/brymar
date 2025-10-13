import { User } from '@/domain/user/entities/User';

/**
 * Output DTO for user profile update result
 */
export class UpdateUserProfileOutput {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly profile: {
            name?: string;
            firstName?: string;
            lastName?: string;
            phone?: string;
            bio?: string;
            location?: string;
            website?: string;
            image?: string;
            displayName: string;
            isComplete: boolean;
        },
        public readonly preferences: {
            notifications: {
                email: boolean;
                push: boolean;
                marketing: boolean;
            };
            privacy: {
                profileVisible: boolean;
                showEmail: boolean;
                showPhone: boolean;
            };
            display: {
                theme: string;
                language: string;
                currency: string;
            };
        },
        public readonly updatedAt: Date
    ) { }

    /**
     * Creates UpdateUserProfileOutput from a User entity
     */
    static from(user: User): UpdateUserProfileOutput {
        const profile = user.getProfile();
        const preferences = user.getPreferences();

        return new UpdateUserProfileOutput(
            user.getId().value,
            user.getEmail().value,
            {
                name: profile.name,
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone,
                bio: profile.bio,
                location: profile.location,
                website: profile.website,
                image: profile.image,
                displayName: profile.getDisplayName(),
                isComplete: profile.isComplete(),
            },
            {
                notifications: preferences.notifications,
                privacy: preferences.privacy,
                display: preferences.display,
            },
            user.getUpdatedAt()
        );
    }

    /**
     * Converts to JSON representation
     */
    toJSON(): object {
        return {
            id: this.id,
            email: this.email,
            profile: this.profile,
            preferences: this.preferences,
            updatedAt: this.updatedAt.toISOString(),
        };
    }
}