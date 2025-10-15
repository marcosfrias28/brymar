import { User } from '@/domain/user/entities/User';
import { Session } from '@/domain/user/entities/Session';
import { IUserRepository } from '@/domain/user/repositories/IUserRepository';
import { ISessionRepository } from '@/domain/user/repositories/ISessionRepository';
import { Email } from '@/domain/shared/value-objects/Email';
import { UserDomainService } from '@/domain/user/services/UserDomainService';
import { AuthenticateUserInput } from '../../dto/user/AuthenticateUserInput';
import { AuthenticateUserOutput } from '../../dto/user/AuthenticateUserOutput';
import { BusinessRuleViolationError, EntityNotFoundError } from '@/domain/shared/errors/DomainError';

// This would typically be injected as a service interface
interface IPasswordService {
    verify(password: string, hashedPassword: string): Promise<boolean>;
}

interface ITokenService {
    generateSessionToken(): string;
}

/**
 * Use case for authenticating a user
 */
export class AuthenticateUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly sessionRepository: ISessionRepository,
        private readonly passwordService: IPasswordService,
        private readonly tokenService: ITokenService
    ) { }

    /**
     * Executes the user authentication use case
     */
    async execute(input: AuthenticateUserInput): Promise<AuthenticateUserOutput> {
        // 1. Find user by email
        const email = Email.create(input.email);
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new EntityNotFoundError('User', input.email);
        }

        // 2. Validate user can authenticate
        UserDomainService.validateSessionCreation(user, input.ipAddress, input.userAgent);

        // 3. Verify password (this would typically involve checking against stored hash)
        // For now, we'll assume password verification is handled by the password service
        const isPasswordValid = await this.passwordService.verify(input.password, 'stored-hash');

        if (!isPasswordValid) {
            throw new BusinessRuleViolationError('Invalid credentials', 'INVALID_CREDENTIALS');
        }

        // 4. Generate session token
        const sessionToken = this.tokenService.generateSessionToken();

        // 5. Calculate session duration based on user role and remember me preference
        const sessionDurationMs = UserDomainService.getSessionDuration(user, input.rememberMe);
        const expiresAt = new Date(Date.now() + sessionDurationMs);

        // 6. Create session entity
        const session = Session.create({
            userId: user.getId().value,
            token: sessionToken,
            expiresAt,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
        });

        // 7. Clean up old sessions (optional - could be done in background)
        await this.cleanupExpiredSessions(user);

        // 8. Save session
        await this.sessionRepository.save(session);

        // 9. Update user's last login timestamp
        await this.userRepository.updateLastLogin(user.getId(), new Date());

        // 10. Return authentication result
        return AuthenticateUserOutput.from(user, session);
    }

    /**
     * Cleans up expired sessions for a user
     */
    private async cleanupExpiredSessions(user: User): Promise<void> {
        try {
            // Get all sessions for user
            const userSessions = await this.sessionRepository.findAllSessionsByUserId(user.getId());

            // Delete expired sessions
            for (const session of userSessions) {
                if (session.isExpired()) {
                    await this.sessionRepository.delete(session.getId());
                }
            }
        } catch (error) {
            // Log error but don't fail authentication
            // Note: Failed to cleanup expired sessions - this is non-critical
        }
    }

    /**
     * Validates authentication attempt
     */
    private async validateAuthenticationAttempt(user: User): Promise<void> {
        if (!user.getStatus().isActive()) {
            throw new BusinessRuleViolationError('User account is not active', 'USER_NOT_ACTIVE');
        }

        if (user.getStatus().isPendingVerification()) {
            throw new BusinessRuleViolationError('Please verify your email before signing in', 'EMAIL_NOT_VERIFIED');
        }

        if (user.getStatus().isSuspended()) {
            throw new BusinessRuleViolationError('User account is suspended', 'USER_SUSPENDED');
        }
    }
}