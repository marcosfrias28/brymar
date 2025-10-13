import { Session } from '../entities/Session';
import { SessionId } from '../value-objects/SessionId';
import { SessionToken } from '../value-objects/SessionToken';
import { UserId } from '../value-objects/UserId';

/**
 * Repository interface for Session entity
 */
export interface ISessionRepository {
    /**
     * Saves a session (create or update)
     */
    save(session: Session): Promise<void>;

    /**
     * Finds a session by its ID
     */
    findById(id: SessionId): Promise<Session | null>;

    /**
     * Finds a session by its token
     */
    findByToken(token: SessionToken): Promise<Session | null>;

    /**
     * Finds all active sessions for a user
     */
    findActiveSessionsByUserId(userId: UserId): Promise<Session[]>;

    /**
     * Finds all sessions for a user (active and expired)
     */
    findAllSessionsByUserId(userId: UserId): Promise<Session[]>;

    /**
     * Deletes a session by ID
     */
    delete(id: SessionId): Promise<void>;

    /**
     * Deletes a session by token
     */
    deleteByToken(token: SessionToken): Promise<void>;

    /**
     * Deletes all sessions for a user
     */
    deleteAllByUserId(userId: UserId): Promise<void>;

    /**
     * Deletes all expired sessions
     */
    deleteExpiredSessions(): Promise<number>;

    /**
     * Checks if a session exists and is valid (not expired)
     */
    isValidSession(token: SessionToken): Promise<boolean>;

    /**
     * Counts active sessions for a user
     */
    countActiveSessionsByUserId(userId: UserId): Promise<number>;

    /**
     * Finds sessions by IP address (for security monitoring)
     */
    findByIpAddress(ipAddress: string): Promise<Session[]>;

    /**
     * Finds sessions created within a date range
     */
    findByCreatedDateRange(startDate: Date, endDate: Date): Promise<Session[]>;

    /**
     * Updates session expiration time
     */
    updateExpiration(id: SessionId, newExpiresAt: Date): Promise<void>;

    /**
     * Finds sessions that will expire within a specified time
     */
    findExpiringWithin(minutes: number): Promise<Session[]>;
}