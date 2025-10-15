import { User } from '@/domain/user/entities/User';

/**
 * Output DTO for GetCurrentUserUseCase
 */
export class GetCurrentUserOutput {
    private constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly firstName: string,
        public readonly lastName: string,
        public readonly role: string,
        public readonly status: string,
        public readonly avatarUrl?: string,
        public readonly phoneNumber?: string,
        public readonly createdAt: Date = new Date(),
        public readonly updatedAt: Date = new Date(),
        public readonly lastLoginAt?: Date
    ) { }

    static fromUser(user: User): GetCurrentUserOutput {
        const profile = user.getProfile();
        return new GetCurrentUserOutput(
            user.getId().value,
            user.getEmail().value,
            profile.getFirstName(),
            profile.getLastName(),
            user.getRole().value,
            user.getStatus().value,
            profile.getAvatar(),
            profile.getPhone(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`.trim();
    }

    get isActive(): boolean {
        return this.status === 'active';
    }

    get isAdmin(): boolean {
        return this.role === 'admin';
    }

    // Frontend compatibility methods
    getId(): { value: string } {
        return { value: this.id };
    }

    getEmail(): { value: string } {
        return { value: this.email };
    }

    getRole(): { value: string } {
        return { value: this.role };
    }

    getStatus(): { value: string; isActive: () => boolean } {
        return {
            value: this.status,
            isActive: () => this.status === 'active'
        };
    }

    getFirstName(): { value: string } {
        return { value: this.firstName };
    }

    getLastName(): { value: string } {
        return { value: this.lastName };
    }

    getAvatarUrl(): { value: string | undefined } {
        return { value: this.avatarUrl };
    }

    getPhoneNumber(): { value: string | undefined } {
        return { value: this.phoneNumber };
    }

    getCreatedAt(): { value: Date } {
        return { value: this.createdAt };
    }

    getUpdatedAt(): { value: Date } {
        return { value: this.updatedAt };
    }

    getLastLoginAt(): { value: Date | undefined } {
        return { value: this.lastLoginAt };
    }

    // Profile methods for backward compatibility
    getProfile() {
        return {
            getFullName: () => this.fullName,
            getFirstName: () => this.firstName,
            getLastName: () => this.lastName,
            getAvatar: () => this.avatarUrl,
            getPhone: () => this.phoneNumber,
            getBio: () => undefined, // Not available in current DTO
            getLocation: () => undefined // Not available in current DTO
        };
    }

    // Preferences methods for backward compatibility
    getPreferences() {
        return {
            value: {
                notifications: {
                    email: true,
                    push: false,
                    marketing: false
                },
                privacy: {
                    profileVisibility: true,
                    showEmail: false,
                    showPhone: false
                },
                theme: 'light',
                display: {
                    language: 'es',
                    currency: 'USD'
                }
            }
        };
    }
}