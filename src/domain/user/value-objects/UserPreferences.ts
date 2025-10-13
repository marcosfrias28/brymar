import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export interface UserPreferencesData {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
    notifications?: {
        email?: boolean;
        push?: boolean;
        marketing?: boolean;
    };
    privacy?: {
        profileVisibility?: 'public' | 'private' | 'friends';
        showEmail?: boolean;
        showPhone?: boolean;
    };
}

export class UserPreferences extends ValueObject<UserPreferencesData> {
    private constructor(value: UserPreferencesData) {
        super(value);
    }

    static create(data: UserPreferencesData = {}): UserPreferences {
        const defaultPreferences: UserPreferencesData = {
            theme: 'system',
            language: 'en',
            timezone: 'UTC',
            notifications: {
                email: true,
                push: true,
                marketing: false
            },
            privacy: {
                profileVisibility: 'public',
                showEmail: false,
                showPhone: false
            }
        };

        const preferences = {
            ...defaultPreferences,
            ...data,
            notifications: {
                ...defaultPreferences.notifications,
                ...data.notifications
            },
            privacy: {
                ...defaultPreferences.privacy,
                ...data.privacy
            }
        };

        // Validate theme
        if (preferences.theme && !['light', 'dark', 'system'].includes(preferences.theme)) {
            throw new ValueObjectValidationError('Invalid theme preference');
        }

        // Validate language (basic validation)
        if (preferences.language && (typeof preferences.language !== 'string' || preferences.language.length !== 2)) {
            throw new ValueObjectValidationError('Invalid language preference');
        }

        // Validate privacy settings
        if (preferences.privacy?.profileVisibility &&
            !['public', 'private', 'friends'].includes(preferences.privacy.profileVisibility)) {
            throw new ValueObjectValidationError('Invalid profile visibility preference');
        }

        return new UserPreferences(preferences);
    }

    getTheme(): 'light' | 'dark' | 'system' {
        return this._value.theme || 'system';
    }

    getLanguage(): string {
        return this._value.language || 'en';
    }

    getTimezone(): string {
        return this._value.timezone || 'UTC';
    }

    getNotificationPreferences() {
        return this._value.notifications || {
            email: true,
            push: true,
            marketing: false
        };
    }

    getPrivacyPreferences() {
        return this._value.privacy || {
            profileVisibility: 'public',
            showEmail: false,
            showPhone: false
        };
    }

    isEmailNotificationEnabled(): boolean {
        return this._value.notifications?.email ?? true;
    }

    isPushNotificationEnabled(): boolean {
        return this._value.notifications?.push ?? true;
    }

    isMarketingNotificationEnabled(): boolean {
        return this._value.notifications?.marketing ?? false;
    }

    isProfilePublic(): boolean {
        return this._value.privacy?.profileVisibility === 'public';
    }

    updateTheme(theme: 'light' | 'dark' | 'system'): UserPreferences {
        return UserPreferences.create({
            ...this._value,
            theme
        });
    }

    updateLanguage(language: string): UserPreferences {
        return UserPreferences.create({
            ...this._value,
            language
        });
    }

    updateNotificationPreferences(notifications: UserPreferencesData['notifications']): UserPreferences {
        return UserPreferences.create({
            ...this._value,
            notifications: {
                ...this._value.notifications,
                ...notifications
            }
        });
    }

    updatePrivacyPreferences(privacy: UserPreferencesData['privacy']): UserPreferences {
        return UserPreferences.create({
            ...this._value,
            privacy: {
                ...this._value.privacy,
                ...privacy
            }
        });
    }
}