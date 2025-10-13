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
        const displayName = profile.getDisplayName();
        const redirectUrl = user.getRole().getDefaultRedirectUrl();

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
     * Gets the session token (use with caution)
     */
    getSessionToken(): string {
        return this.session.token;
    }
}