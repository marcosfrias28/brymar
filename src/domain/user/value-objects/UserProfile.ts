import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export interface UserProfileData {
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    phone?: string;
    location?: string;
}

export class UserProfile extends ValueObject<UserProfileData> {
    private constructor(value: UserProfileData) {
        super(value);
    }

    static create(data: UserProfileData): UserProfile {
        if (!data || typeof data !== 'object') {
            throw new ValueObjectValidationError('User profile data is required');
        }

        const { firstName, lastName, avatar, bio, phone, location } = data;

        if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
            throw new ValueObjectValidationError('First name is required');
        }

        if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
            throw new ValueObjectValidationError('Last name is required');
        }

        if (firstName.trim().length > 50) {
            throw new ValueObjectValidationError('First name cannot exceed 50 characters');
        }

        if (lastName.trim().length > 50) {
            throw new ValueObjectValidationError('Last name cannot exceed 50 characters');
        }

        if (bio && bio.length > 500) {
            throw new ValueObjectValidationError('Bio cannot exceed 500 characters');
        }

        if (phone && !this.isValidPhone(phone)) {
            throw new ValueObjectValidationError('Invalid phone number format');
        }

        const profileData: UserProfileData = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            avatar: avatar?.trim() || undefined,
            bio: bio?.trim() || undefined,
            phone: phone?.trim() || undefined,
            location: location?.trim() || undefined
        };

        return new UserProfile(profileData);
    }

    private static isValidPhone(phone: string): boolean {
        // Basic phone validation - can be enhanced based on requirements
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    getFirstName(): string {
        return this._value.firstName;
    }

    getLastName(): string {
        return this._value.lastName;
    }

    getFullName(): string {
        return `${this._value.firstName} ${this._value.lastName}`;
    }

    getAvatar(): string | undefined {
        return this._value.avatar;
    }

    getBio(): string | undefined {
        return this._value.bio;
    }

    getPhone(): string | undefined {
        return this._value.phone;
    }

    getLocation(): string | undefined {
        return this._value.location;
    }

    hasAvatar(): boolean {
        return !!this._value.avatar;
    }

    updateFirstName(firstName: string): UserProfile {
        return UserProfile.create({
            ...this._value,
            firstName
        });
    }

    updateLastName(lastName: string): UserProfile {
        return UserProfile.create({
            ...this._value,
            lastName
        });
    }

    updateAvatar(avatar: string): UserProfile {
        return UserProfile.create({
            ...this._value,
            avatar
        });
    }

    updateBio(bio: string): UserProfile {
        return UserProfile.create({
            ...this._value,
            bio
        });
    }
}