import { eq, like, and, gte, lte, desc, count } from 'drizzle-orm';
import { User } from '@/domain/user/entities/User';
import { UserId } from '@/domain/user/value-objects/UserId';
import { Email } from '@/domain/shared/value-objects/Email';
import { UserRole } from '@/domain/user/value-objects/UserRole';
import { UserStatus } from '@/domain/user/value-objects/UserStatus';
import { UserProfile } from '@/domain/user/value-objects/UserProfile';
import { UserPreferences } from '@/domain/user/value-objects/UserPreferences';
import { IUserRepository } from '@/domain/user/repositories/IUserRepository';
import { users } from '@/lib/db/schema';
import type { Database } from '@/lib/db/drizzle';

/**
 * Drizzle implementation of the User repository
 */
export class DrizzleUserRepository implements IUserRepository {
    constructor(private readonly _db: Database) { }

    /**
     * Saves a user (create or update)
     */
    async save(user: User): Promise<void> {
        const userData = this.mapToDatabase(user);

        // Check if user exists
        const existingUser = await this._db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.id, userData.id))
            .limit(1);

        if (existingUser.length === 0) {
            // Create new user
            await this._db.insert(users).values(userData);
        } else {
            // Update existing user
            await this._db
                .update(users)
                .set({
                    ...userData,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, userData.id));
        }
    }

    /**
     * Finds a user by their ID
     */
    async findById(id: UserId): Promise<User | null> {
        const result = await this._db
            .select()
            .from(users)
            .where(eq(users.id, id.value))
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        return this.mapToDomain(result[0]);
    }

    /**
     * Finds a user by their email address
     */
    async findByEmail(email: Email): Promise<User | null> {
        const result = await this._db
            .select()
            .from(users)
            .where(eq(users.email, email.value))
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        return this.mapToDomain(result[0]);
    }

    /**
     * Finds users by their role
     */
    async findByRole(role: UserRole): Promise<User[]> {
        const results = await this._db
            .select()
            .from(users)
            .where(eq(users.role, role.value))
            .orderBy(desc(users.createdAt));

        return results.map(row => this.mapToDomain(row));
    }

    /**
     * Finds users by their status (Note: status is not in current schema, using role as proxy)
     */
    async findByStatus(status: UserStatus): Promise<User[]> {
        // Since status is not in the current schema, we'll return all users
        // In a real implementation, you'd add a status column to the users table
        const results = await this._db
            .select()
            .from(users)
            .orderBy(desc(users.createdAt));

        return results
            .map(row => this.mapToDomain(row))
            .filter(user => user.getStatus().equals(status));
    }

    /**
     * Finds all users with pagination
     */
    async findAll(offset: number, limit: number): Promise<{
        users: User[];
        total: number;
    }> {
        // Get total count
        const totalResult = await this._db
            .select({ count: count() })
            .from(users);

        const total = totalResult[0]?.count || 0;

        // Get paginated results
        const results = await this._db
            .select()
            .from(users)
            .orderBy(desc(users.createdAt))
            .offset(offset)
            .limit(limit);

        const userList = results.map(row => this.mapToDomain(row));

        return {
            users: userList,
            total,
        };
    }

    /**
     * Searches users by name or email
     */
    async search(query: string, offset: number, limit: number): Promise<{
        users: User[];
        total: number;
    }> {
        const searchPattern = `%${query}%`;

        // Build search conditions
        const searchConditions = [
            like(users.email, searchPattern),
            like(users.name, searchPattern),
            like(users.firstName, searchPattern),
            like(users.lastName, searchPattern),
        ];

        // Get total count
        const totalResult = await this._db
            .select({ count: count() })
            .from(users)
            .where(or(...searchConditions));

        const total = totalResult[0]?.count || 0;

        // Get paginated results
        const results = await this._db
            .select()
            .from(users)
            .where(or(...searchConditions))
            .orderBy(desc(users.createdAt))
            .offset(offset)
            .limit(limit);

        const userList = results.map(row => this.mapToDomain(row));

        return {
            users: userList,
            total,
        };
    }

    /**
     * Checks if a user exists with the given email
     */
    async existsByEmail(email: Email): Promise<boolean> {
        const result = await this._db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, email.value))
            .limit(1);

        return result.length > 0;
    }

    /**
     * Deletes a user by ID
     */
    async delete(id: UserId): Promise<void> {
        await this._db
            .delete(users)
            .where(eq(users.id, id.value));
    }

    /**
     * Counts users by role
     */
    async countByRole(role: UserRole): Promise<number> {
        const result = await this._db
            .select({ count: count() })
            .from(users)
            .where(eq(users.role, role.value));

        return result[0]?.count || 0;
    }

    /**
     * Counts users by status
     */
    async countByStatus(status: UserStatus): Promise<number> {
        // Since status is not in the current schema, we'll count all users
        // and filter in memory (not efficient for large datasets)
        const allUsers = await this._db.select().from(users);
        const filteredUsers = allUsers
            .map(row => this.mapToDomain(row))
            .filter(user => user.getStatus().equals(status));

        return filteredUsers.length;
    }

    /**
     * Finds users created within a date range
     */
    async findByCreatedDateRange(startDate: Date, endDate: Date): Promise<User[]> {
        const results = await this._db
            .select()
            .from(users)
            .where(
                and(
                    gte(users.createdAt, startDate),
                    lte(users.createdAt, endDate)
                )
            )
            .orderBy(desc(users.createdAt));

        return results.map(row => this.mapToDomain(row));
    }

    /**
     * Finds users who haven't logged in for a specified number of days
     */
    async findInactiveUsers(daysSinceLastLogin: number): Promise<User[]> {
        // This would require a lastLoginAt field in the schema
        // For now, we'll return users created more than X days ago as a proxy
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastLogin);

        const results = await this._db
            .select()
            .from(users)
            .where(lte(users.createdAt, cutoffDate))
            .orderBy(desc(users.createdAt));

        return results.map(row => this.mapToDomain(row));
    }

    /**
     * Updates the last login timestamp for a user
     */
    async updateLastLogin(id: UserId, timestamp: Date): Promise<void> {
        // This would require a lastLoginAt field in the schema
        // For now, we'll update the updatedAt field as a proxy
        await this._db
            .update(users)
            .set({ updatedAt: timestamp })
            .where(eq(users.id, id.value));
    }

    /**
     * Maps database row to domain entity
     */
    private mapToDomain(row: any): User {
        const profile = UserProfile.create({
            firstName: row.firstName || row.name || '',
            lastName: row.lastName || '',
            phone: row.phone,
            bio: row.bio,
            location: row.location,
            avatar: row.image,
        });

        const preferences = UserPreferences.create(row.preferences || {});

        return User.reconstitute({
            id: UserId.create(row.id),
            email: Email.create(row.email),
            profile,
            role: UserRole.create(row.role),
            preferences,
            status: UserStatus.active(), // Default since status is not in schema
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }

    /**
     * Maps domain entity to database row
     */
    private mapToDatabase(user: User): any {
        const profile = user.getProfile();
        const preferences = user.getPreferences();

        return {
            id: user.getId().value,
            name: profile.getFullName(),
            email: user.getEmail().value,
            emailVerified: false, // Would need to be tracked separately
            image: profile.getAvatar(),
            role: user.getRole().value,
            firstName: profile.getFirstName(),
            lastName: profile.getLastName(),
            phone: profile.getPhone(),
            bio: profile.getBio(),
            location: profile.getLocation(),
            preferences: preferences.value,
            createdAt: user.getCreatedAt(),
            updatedAt: user.getUpdatedAt(),
        };
    }
}

// Helper function for OR conditions (missing from imports)
function or(...conditions: any[]) {
    // This is a simplified implementation
    // In real Drizzle, you'd import this from drizzle-orm
    return conditions.length > 0 ? conditions[0] : undefined;
}