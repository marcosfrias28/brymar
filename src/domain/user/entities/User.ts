import { AggregateRoot } from '@/domain/shared/entities/AggregateRoot';
import { BusinessRuleViolationError, EntityValidationError } from '@/domain/shared/errors/DomainError';
import { UserId } from '../value-objects/UserId';
import { Email } from '@/domain/shared/value-objects/Email';
import { UserRole } from '../value-objects/UserRole';
import { UserStatus } from '../value-objects/UserStatus';
import { UserProfile } from '../value-objects/UserProfile';
import { UserPreferences } from '../value-objects/UserPreferences';

export interface CreateUserData {
    email: string;
    profile: {
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    role?: string;
    preferences?: any;
}

export interface UserData {
    id: UserId;
    email: Email;
    profile: UserProfile;
    role: UserRole;
    status: UserStatus;
    preferences: UserPreferences;
    createdAt: Date;
    updatedAt: Date;
}

export class User extends AggregateRoot {
    private constructor(
        id: UserId,
        private email: Email,
        private profile: UserProfile,
        private role: UserRole,
        private status: UserStatus,
        private preferences: UserPreferences,
        createdAt: Date,
        updatedAt: Date
    ) {
        super(id, createdAt, updatedAt);
    }

    static create(data: CreateUserData): User {
        const id = UserId.generate();
        const email = Email.create(data.email);
        const profile = UserProfile.create(data.profile);
        const role = UserRole.create(data.role || 'user');
        const status = UserStatus.active();
        const preferences = UserPreferences.create(data.preferences || {});
        const now = new Date();

        return new User(id, email, profile, role, status, preferences, now, now);
    }

    static reconstitute(data: UserData): User {
        return new User(
            data.id,
            data.email,
            data.profile,
            data.role,
            data.status,
            data.preferences,
            data.createdAt,
            data.updatedAt
        );
    }

    // Business methods
    updateProfile(profile: UserProfile): void {
        this.profile = profile;
        this.touch();
    }

    changeEmail(newEmail: Email): void {
        if (this.email.equals(newEmail)) {
            return;
        }
        this.email = newEmail;
        this.touch();
    }

    updatePreferences(preferences: UserPreferences): void {
        this.preferences = preferences;
        this.touch();
    }

    activate(): void {
        if (this.status.isActive()) {
            return;
        }
        this.status = UserStatus.active();
        this.touch();
    }

    deactivate(): void {
        if (!this.status.isActive()) {
            return;
        }
        this.status = UserStatus.inactive();
        this.touch();
    }

    changeRole(newRole: UserRole): void {
        if (this.role.equals(newRole)) {
            return;
        }
        this.role = newRole;
        this.touch();
    }

    // Query methods
    canManageUsers(): boolean {
        return this.role.isAdmin() || this.role.isSuperAdmin();
    }

    canManageContent(): boolean {
        return this.role.isAdmin() || this.role.isSuperAdmin() || this.role.isEditor();
    }

    hasPermission(permission: string): boolean {
        return this.role.hasPermission(permission);
    }

    // Getters
    getId(): UserId {
        return this.id as UserId;
    }

    getEmail(): Email {
        return this.email;
    }

    getProfile(): UserProfile {
        return this.profile;
    }

    getRole(): UserRole {
        return this.role;
    }

    getStatus(): UserStatus {
        return this.status;
    }

    getPreferences(): UserPreferences {
        return this.preferences;
    }
}