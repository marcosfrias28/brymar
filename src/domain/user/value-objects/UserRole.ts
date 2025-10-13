import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export type UserRoleValue = 'user' | 'editor' | 'admin' | 'super_admin';

export class UserRole extends ValueObject<UserRoleValue> {
    private static readonly VALID_ROLES: UserRoleValue[] = ['user', 'editor', 'admin', 'super_admin'];

    private static readonly ROLE_PERMISSIONS: Record<UserRoleValue, string[]> = {
        user: ['read:own_profile', 'update:own_profile'],
        editor: ['read:own_profile', 'update:own_profile', 'create:content', 'update:content', 'delete:own_content'],
        admin: ['read:own_profile', 'update:own_profile', 'create:content', 'update:content', 'delete:content', 'manage:users'],
        super_admin: ['*'] // All permissions
    };

    private constructor(value: UserRoleValue) {
        super(value);
    }

    static create(role: string): UserRole {
        if (!role || typeof role !== 'string') {
            throw new ValueObjectValidationError('User role is required');
        }

        const normalizedRole = role.toLowerCase().trim() as UserRoleValue;

        if (!this.VALID_ROLES.includes(normalizedRole)) {
            throw new ValueObjectValidationError(`Invalid user role: ${role}`);
        }

        return new UserRole(normalizedRole);
    }

    static user(): UserRole {
        return new UserRole('user');
    }

    static editor(): UserRole {
        return new UserRole('editor');
    }

    static admin(): UserRole {
        return new UserRole('admin');
    }

    static superAdmin(): UserRole {
        return new UserRole('super_admin');
    }

    isUser(): boolean {
        return this._value === 'user';
    }

    isEditor(): boolean {
        return this._value === 'editor';
    }

    isAdmin(): boolean {
        return this._value === 'admin';
    }

    isSuperAdmin(): boolean {
        return this._value === 'super_admin';
    }

    hasPermission(permission: string): boolean {
        const permissions = UserRole.ROLE_PERMISSIONS[this._value];
        return permissions.includes('*') || permissions.includes(permission);
    }

    getPermissions(): string[] {
        return UserRole.ROLE_PERMISSIONS[this._value];
    }

    canManage(otherRole: UserRole): boolean {
        const hierarchy: Record<UserRoleValue, number> = {
            user: 1,
            editor: 2,
            admin: 3,
            super_admin: 4
        };

        return hierarchy[this._value] > hierarchy[otherRole._value];
    }
}