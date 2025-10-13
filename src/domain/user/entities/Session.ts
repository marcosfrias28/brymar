import { Entity } from '@/domain/shared/entities/Entity';
import { SessionId } from '../value-objects/SessionId';
import { UserId } from '../value-objects/UserId';
import { SessionToken } from '../value-objects/SessionToken';
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

export interface CreateSessionData {
    userId: string;
    token: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
}

export interface SessionData {
    id: SessionId;
    userId: UserId;
    token: SessionToken;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Session entity representing a user session
 */
export class Session extends Entity {
    private constructor(
        private readonly _sessionId: SessionId,
        private readonly userId: UserId,
        private token: SessionToken,
        private expiresAt: Date,
        private ipAddress?: string,
        private userAgent?: string,
        createdAt: Date = new Date(),
        updatedAt: Date = new Date()
    ) {
        super(_sessionId.value, createdAt, updatedAt);
    }

    /**
     * Creates a new Session instance
     */
    static create(data: CreateSessionData): Session {
        const id = SessionId.generate();
        const userId = UserId.create(data.userId);
        const token = SessionToken.create(data.token);

        if (data.expiresAt <= new Date()) {
            throw new BusinessRuleViolationError('Session expiration date must be in the future');
        }

        return new Session(
            id,
            userId,
            token,
            data.expiresAt,
            data.ipAddress,
            data.userAgent
        );
    }

    /**
     * Reconstitutes a Session from persisted data
     */
    static reconstitute(data: SessionData): Session {
        return new Session(
            data.id,
            data.userId,
            data.token,
            data.expiresAt,
            data.ipAddress,
            data.userAgent,
            data.createdAt,
            data.updatedAt
        );
    }

    /**
     * Checks if the session is expired
     */
    isExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    /**
     * Checks if the session is valid (not expired)
     */
    isValid(): boolean {
        return !this.isExpired();
    }

    /**
     * Extends the session expiration time
     */
    extend(newExpiresAt: Date): void {
        if (newExpiresAt <= new Date()) {
            throw new BusinessRuleViolationError('New expiration date must be in the future');
        }

        if (this.isExpired()) {
            throw new BusinessRuleViolationError('Cannot extend an expired session');
        }

        this.expiresAt = newExpiresAt;
        this.touch();
    }

    /**
     * Refreshes the session with a new token
     */
    refresh(newToken: string, newExpiresAt: Date): void {
        if (this.isExpired()) {
            throw new BusinessRuleViolationError('Cannot refresh an expired session');
        }

        this.token = SessionToken.create(newToken);
        this.expiresAt = newExpiresAt;
        this.touch();
    }

    /**
     * Checks if the session belongs to a specific user
     */
    belongsToUser(userId: string): boolean {
        return this.userId.equals(UserId.create(userId));
    }

    // Getters
    getId(): SessionId {
        return this._sessionId;
    }

    getUserId(): UserId {
        return this.userId;
    }

    getToken(): SessionToken {
        return this.token;
    }

    getExpiresAt(): Date {
        return this.expiresAt;
    }

    getIpAddress(): string | undefined {
        return this.ipAddress;
    }

    getUserAgent(): string | undefined {
        return this.userAgent;
    }
}