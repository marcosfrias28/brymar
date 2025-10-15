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
                name: profile.getFullName(),
                firstName: profile.getFirstName(),
                lastName: profile.getLastName(),
                phone: profile.getPhone(),
                bio: profile.getBio(),
                location: profile.getLocation(),
                website: undefined, // Not available in current UserProfile
                image: profile.getAvatar(),
                displayName: profile.getFullName(),
                isComplete: true, // Not available in current UserProfile
            },
            {
                notifications: {
                    email: preferences.getNotificationPreferences().email ?? true,
                    push: preferences.getNotificationPreferences().push ?? true,
                    marketing: preferences.getNotificationPreferences().marketing ?? false,
                },
                privacy: {
                    profileVisible: preferences.getPrivacyPreferences().profileVisibility === 'public',
                    showEmail: preferences.getPrivacyPreferences().showEmail ?? false,
                    showPhone: preferences.getPrivacyPreferences().showPhone ?? false,
                },
                display: {
                    theme: preferences.getTheme(),
                    language: preferences.getLanguage(),
                    currency: 'USD', // Default currency, not available in current UserPreferences
                },
            },
            user.getUpdatedAt()
        );
    }

    /**
     * Frontend compatibility methods
     */
    getId(): { value: string } {
        return { value: this.id };
    }

    getEmail(): { value: string } {
        return { value: this.email };
    }

    getProfile(): { value: any } {
        return { value: this.profile };
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