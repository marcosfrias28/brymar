import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export type UserStatusValue = 'active' | 'inactive' | 'suspended' | 'pending_verification';

export class UserStatus extends ValueObject<UserStatusValue> {
    private static readonly VALID_STATUSES: UserStatusValue[] = [
        'active', 'inactive', 'suspended', 'pending_verification'
    ];

    private constructor(value: UserStatusValue) {
        super(value);
    }

    static create(status: string): UserStatus {
        if (!status || typeof status !== 'string') {
            throw new ValueObjectValidationError('User status is required');
        }

        const normalizedStatus = status.toLowerCase().trim() as UserStatusValue;

        if (!this.VALID_STATUSES.includes(normalizedStatus)) {
            throw new ValueObjectValidationError(`Invalid user status: ${status}`);
        }

        return new UserStatus(normalizedStatus);
    }

    static active(): UserStatus {
        return new UserStatus('active');
    }

    static inactive(): UserStatus {
        return new UserStatus('inactive');
    }

    static suspended(): UserStatus {
        return new UserStatus('suspended');
    }

    static pendingVerification(): UserStatus {
        return new UserStatus('pending_verification');
    }

    isActive(): boolean {
        return this._value === 'active';
    }

    isInactive(): boolean {
        return this._value === 'inactive';
    }

    isSuspended(): boolean {
        return this._value === 'suspended';
    }

    isPendingVerification(): boolean {
        return this._value === 'pending_verification';
    }

    canLogin(): boolean {
        return this._value === 'active';
    }

    canPerformActions(): boolean {
        return this._value === 'active';
    }
}