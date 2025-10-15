import { eq, and, gte, lte, desc, count, lt } from 'drizzle-orm';
import { Session } from '@/domain/user/entities/Session';
import { SessionId } from '@/domain/user/value-objects/SessionId';
import { SessionToken } from '@/domain/user/value-objects/SessionToken';
import { UserId } from '@/domain/user/value-objects/UserId';
import { ISessionRepository } from '@/domain/user/repositories/ISessionRepository';
import { session } from '@/lib/db/schema';
import type { Database } from '@/lib/db/drizzle';

/**
 * Drizzle implementation of the Session repository
 */
export class DrizzleSessionRepository implements ISessionRepository {
    constructor(private readonly _db: Database) { }

    /**
     * Saves a session (create or update)
     */
    async save(sessionEntity: Session): Promise<void> {
        const sessionData = this.mapToDatabase(sessionEntity);

        // Check if session exists
        const existingSession = await this.db
            .select({ id: session.id })
            .from(session)
            .where(eq(session.id, sessionData.id))
            .limit(1);

        if (existingSession.length === 0) {
            // Create new session
            await this.db.insert(session).values(sessionData);
        } else {
            // Update existing session
            await this.db
                .update(session)
                .set({
                    ...sessionData,
                    updatedAt: new Date(),
                })
                .where(eq(session.id, sessionData.id));
        }
    }

    /**
     * Finds a session by its ID
     */
    async findById(id: SessionId): Promise<Session | null> {
        const result = await this.db
            .select()
            .from(session)
            .where(eq(session.id, id.value))
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        return this.mapToDomain(result[0]);
    }

    /**
     * Finds a session by its token
     */
    async findByToken(token: SessionToken): Promise<Session | null> {
        const result = await this.db
            .select()
            .from(session)
            .where(eq(session.token, token.getRawValue()))
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        return this.mapToDomain(result[0]);
    }

    /**
     * Finds all active sessions for a user
     */
    async findActiveSessionsByUserId(userId: UserId): Promise<Session[]> {
        const now = new Date();

        const results = await this.db
            .select()
            .from(session)
            .where(
                and(
                    eq(session.userId, userId.value),
                    gte(session.expiresAt, now)
                )
            )
            .orderBy(desc(session.createdAt));

        return results.map(row => this.mapToDomain(row));
    }

    /**
     * Finds all sessions for a user (active and expired)
     */
    async findAllSessionsByUserId(userId: UserId): Promise<Session[]> {
        const results = await this.db
            .select()
            .from(session)
            .where(eq(session.userId, userId.value))
            .orderBy(desc(session.createdAt));

        return results.map(row => this.mapToDomain(row));
    }

    /**
     * Deletes a session by ID
     */
    async delete(id: SessionId): Promise<void> {
        await this.db
            .delete(session)
            .where(eq(session.id, id.value));
    }

    /**
     * Deletes a session by token
     */
    async deleteByToken(token: SessionToken): Promise<void> {
        await this.db
            .delete(session)
            .where(eq(session.token, token.getRawValue()));
    }

    /**
     * Deletes all sessions for a user
     */
    async deleteAllByUserId(userId: UserId): Promise<void> {
        await this.db
            .delete(session)
            .where(eq(session.userId, userId.value));
    }

    /**
     * Deletes all expired sessions
     */
    async deleteExpiredSessions(): Promise<number> {
        const now = new Date();

        // Get count of expired sessions first
        const countResult = await this.db
            .select({ count: count() })
            .from(session)
            .where(lt(session.expiresAt, now));

        const expiredCount = countResult[0]?.count || 0;

        // Delete expired sessions
        await this.db
            .delete(session)
            .where(lt(session.expiresAt, now));

        return expiredCount;
    }

    /**
     * Checks if a session exists and is valid (not expired)
     */
    async isValidSession(token: SessionToken): Promise<boolean> {
        const now = new Date();

        const result = await this.db
            .select({ id: session.id })
            .from(session)
            .where(
                and(
                    eq(session.token, token.getRawValue()),
                    gte(session.expiresAt, now)
                )
            )
            .limit(1);

        return result.length > 0;
    }

    /**
     * Counts active sessions for a user
     */
    async countActiveSessionsByUserId(userId: UserId): Promise<number> {
        const now = new Date();

        const result = await this.db
            .select({ count: count() })
            .from(session)
            .where(
                and(
                    eq(session.userId, userId.value),
                    gte(session.expiresAt, now)
                )
            );

        return result[0]?.count || 0;
    }

    /**
     * Finds sessions by IP address (for security monitoring)
     */
    async findByIpAddress(ipAddress: string): Promise<Session[]> {
        const results = await this.db
            .select()
            .from(session)
            .where(eq(session.ipAddress, ipAddress))
            .orderBy(desc(session.createdAt));

        return results.map(row => this.mapToDomain(row));
    }

    /**
     * Finds sessions created within a date range
     */
    async findByCreatedDateRange(startDate: Date, endDate: Date): Promise<Session[]> {
        const results = await this.db
            .select()
            .from(session)
            .where(
                and(
                    gte(session.createdAt, startDate),
                    lte(session.createdAt, endDate)
                )
            )
            .orderBy(desc(session.createdAt));

        return results.map(row => this.mapToDomain(row));
    }

    /**
     * Updates session expiration time
     */
    async updateExpiration(id: SessionId, newExpiresAt: Date): Promise<void> {
        await this.db
            .update(session)
            .set({
                expiresAt: newExpiresAt,
                updatedAt: new Date()
            })
            .where(eq(session.id, id.value));
    }

    /**
     * Finds sessions that will expire within a specified time
     */
    async findExpiringWithin(minutes: number): Promise<Session[]> {
        const cutoffTime = new Date();
        cutoffTime.setMinutes(cutoffTime.getMinutes() + minutes);

        const results = await this.db
            .select()
            .from(session)
            .where(
                and(
                    gte(session.expiresAt, new Date()), // Not yet expired
                    lte(session.expiresAt, cutoffTime)  // But will expire within timeframe
                )
            )
            .orderBy(session.expiresAt);

        return results.map(row => this.mapToDomain(row));
    }

    /**
     * Maps database row to domain entity
     */
    private mapToDomain(row: any): Session {
        return Session.reconstitute({
            id: SessionId.create(row.id),
            userId: UserId.create(row.userId),
            token: SessionToken.create(row.token),
            expiresAt: row.expiresAt,
            ipAddress: row.ipAddress,
            userAgent: row.userAgent,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }

    /**
     * Maps domain entity to database row
     */
    private mapToDatabase(sessionEntity: Session): any {
        return {
            id: sessionEntity.getId().value,
            userId: sessionEntity.getUserId().value,
            token: sessionEntity.getToken().getRawValue(),
            expiresAt: sessionEntity.getExpiresAt(),
            ipAddress: sessionEntity.getIpAddress(),
            userAgent: sessionEntity.getUserAgent(),
            createdAt: sessionEntity.getCreatedAt(),
            updatedAt: sessionEntity.getUpdatedAt(),
        };
    }
}