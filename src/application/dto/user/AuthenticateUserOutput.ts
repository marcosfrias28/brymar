import { User } from '@/domain/user/entities/User';
import { Session } from '@/domain/user/entities/Session';

/**
 * Output DTO for user authentication result
 */
export class AuthenticateUserOutput {
    constructor(
        public readonly user: {
            id: string;
            email: string;
            name: string;
            role: string;
            status: string;
        },
        public readonly session: {
            id: string;
            token: string;
            expiresAt: Date;
        },
        public readonly redirectUrl: string
    ) { }

    /**
     * Creates AuthenticateUserOutput from User and Session entities
     */
    static from(user: User, session: Session): AuthenticateUserOutput {
        const profile = user.getProfile();
        const displayName = profile.getFullName();
        const redirectUrl = user.getRole().isAdmin() ? '/dashboard' : '/profile';

        return new AuthenticateUserOutput(
            {
                id: user.getId().value,
                email: user.getEmail().value,
                name: displayName,
                role: user.getRole().value,
                status: user.getStatus().value,
            },
            {
                id: session.getId().value,
                token: session.getToken().getRawValue(),
                expiresAt: session.getExpiresAt(),
            },
            redirectUrl
        );
    }

    /**
     * Converts to JSON representation (without sensitive data)
     */
    toJSON(): object {
        return {
            user: {
                id: this.user.id,
                email: this.user.email,
                name: this.user.name,
                role: this.user.role,
                status: this.user.status,
            },
            session: {
                id: this.session.id,
                expiresAt: this.session.expiresAt.toISOString(),
            },
            redirectUrl: this.redirectUrl,
        };
    }

    /**
     * Frontend compatibility methods
     */
    getId(): { value: string } {
        return { value: this.user.id };
    }

    getEmail(): { value: string } {
        return { value: this.user.email };
    }

    getName(): { value: string } {
        return { value: this.user.name };
    }

    getRole(): { value: string } {
        return { value: this.user.role };
    }

    getStatus(): { value: string } {
        return { value: this.user.status };
    }

    /**
     * Gets the session token (use with caution)
     */
    getSessionToken(): string {
        return this.session.token;
    }
}