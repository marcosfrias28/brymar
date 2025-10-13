import { User } from '@/domain/user/entities/User';

/**
 * Output DTO for user creation result
 */
export class CreateUserOutput {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly name: string,
        public readonly role: string,
        public readonly status: string,
        public readonly createdAt: Date
    ) { }

    /**
     * Creates CreateUserOutput from a User entity
     */
    static from(user: User): CreateUserOutput {
        const profile = user.getProfile();
        const displayName = profile.getDisplayName();

        return new CreateUserOutput(
            user.getId().value,
            user.getEmail().value,
            displayName,
            user.getRole().value,
            user.getStatus().value,
            user.getCreatedAt()
        );
    }

    /**
     * Converts to JSON representation
     */
    toJSON(): object {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            role: this.role,
            status: this.status,
            createdAt: this.createdAt.toISOString(),
        };
    }
}