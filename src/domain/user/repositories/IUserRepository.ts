import { User } from '../entities/User';
import { UserId } from '../value-objects/UserId';
import { Email } from '@/domain/shared/value-objects/Email';
import { UserRole } from '../value-objects/UserRole';
import { UserStatus } from '../value-objects/UserStatus';

/**
 * Repository interface for User aggregate
 */
export interface IUserRepository {
    /**
     * Saves a user (create or update)
     */
    save(user: User): Promise<void>;

    /**
     * Finds a user by their ID
     */
    findById(id: UserId): Promise<User | null>;

    /**
     * Finds a user by their email address
     */
    findByEmail(email: Email): Promise<User | null>;

    /**
     * Finds users by their role
     */
    findByRole(role: UserRole): Promise<User[]>;

    /**
     * Finds users by their status
     */
    findByStatus(status: UserStatus): Promise<User[]>;

    /**
     * Finds all users with pagination
     */
    findAll(offset: number, limit: number): Promise<{
        users: User[];
        total: number;
    }>;

    /**
     * Searches users by name or email
     */
    search(query: string, offset: number, limit: number): Promise<{
        users: User[];
        total: number;
    }>;

    /**
     * Checks if a user exists with the given email
     */
    existsByEmail(email: Email): Promise<boolean>;

    /**
     * Deletes a user by ID
     */
    delete(id: UserId): Promise<void>;

    /**
     * Counts users by role
     */
    countByRole(role: UserRole): Promise<number>;

    /**
     * Counts users by status
     */
    countByStatus(status: UserStatus): Promise<number>;

    /**
     * Finds users created within a date range
     */
    findByCreatedDateRange(startDate: Date, endDate: Date): Promise<User[]>;

    /**
     * Finds users who haven't logged in for a specified number of days
     */
    findInactiveUsers(daysSinceLastLogin: number): Promise<User[]>;

    /**
     * Updates the last login timestamp for a user
     */
    updateLastLogin(id: UserId, timestamp: Date): Promise<void>;
}