import { User } from '../entities/User';
import { Session } from '../entities/Session';
import { Email } from '@/domain/shared/value-objects/Email';
import { UserRole } from '../value-objects/UserRole';
import { BusinessRuleViolationError, ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

/**
 * UserDomainService contains business logic that doesn't belong to a specific entity
 * but operates on User domain concepts
 */
export class UserDomainService {
    /**
     * Validates if a user can be assigned a specific role
     */
    static canAssignRole(currentUser: User, targetUser: User, newRole: UserRole): boolean {
        // Only admins can assign roles
        if (!currentUser.getRole().isAdmin()) {
            return false;
        }

        // Cannot change your own role
        if (currentUser.getId().equals(targetUser.getId())) {
            return false;
        }

        // Cannot assign a role higher than your own
        if (!currentUser.getRole().canManage(newRole)) {
            return false;
        }

        return true;
    }

    /**
     * Validates if a user can deactivate another user
     */
    static canDeactivateUser(currentUser: User, targetUser: User): boolean {
        // Only admins can deactivate users
        if (!currentUser.getRole().isAdmin()) {
            return false;
        }

        // Cannot deactivate yourself
        if (currentUser.getId().equals(targetUser.getId())) {
            return false;
        }

        // Cannot deactivate users with equal or higher role
        return currentUser.getRole().canManage(targetUser.getRole());
    }

    /**
     * Validates if an email change is allowed
     */
    static validateEmailChange(user: User, newEmail: Email): void {
        if (!user.getStatus().isActive()) {
            throw new BusinessRuleViolationError('Cannot change email for inactive user', 'USER_NOT_ACTIVE');
        }

        if (user.getEmail().equals(newEmail)) {
            throw new BusinessRuleViolationError('New email must be different from current email', 'EMAIL_UNCHANGED');
        }
    }

    /**
     * Validates if a user can access a specific resource
     */
    static canAccessResource(user: User, resourceType: string, resourceOwnerId?: string): boolean {
        // Inactive users cannot access any resources
        if (!user.getStatus().isActive()) {
            return false;
        }

        // Admins can access everything
        if (user.getRole().isAdmin()) {
            return true;
        }

        // Check if user has permission for the resource type
        if (!user.hasPermission(resourceType)) {
            return false;
        }

        // If there's a specific owner, check ownership or agent permissions
        if (resourceOwnerId) {
            // Users can access their own resources
            if (user.getId().value === resourceOwnerId) {
                return true;
            }

            // Agents can access resources they manage
            if (user.getRole().isAgent()) {
                return true;
            }

            return false;
        }

        return true;
    }

    /**
     * Determines the appropriate session duration based on user role and preferences
     */
    static getSessionDuration(user: User, rememberMe: boolean = false): number {
        const baseHours = rememberMe ? 720 : 24; // 30 days or 1 day

        // Admins get shorter sessions for security
        if (user.getRole().isAdmin()) {
            return Math.min(baseHours, 8) * 60 * 60 * 1000; // Max 8 hours for admins
        }

        // Agents get medium duration
        if (user.getRole().isAgent()) {
            return Math.min(baseHours, 168) * 60 * 60 * 1000; // Max 7 days for agents
        }

        // Regular users get full duration
        return baseHours * 60 * 60 * 1000;
    }

    /**
     * Validates session creation parameters
     */
    static validateSessionCreation(user: User, ipAddress?: string, userAgent?: string): void {
        if (!user.getStatus().isActive()) {
            throw new BusinessRuleViolationError('Cannot create session for inactive user', 'USER_NOT_ACTIVE');
        }

        if (user.getStatus().isPendingVerification()) {
            throw new BusinessRuleViolationError('User must verify email before creating session', 'EMAIL_NOT_VERIFIED');
        }
    }

    /**
     * Checks if a user profile meets completeness requirements for their role
     */
    static isProfileCompleteForRole(user: User): boolean {
        const profile = user.getProfile();
        const role = user.getRole();

        // Basic completeness check
        if (!profile.isComplete()) {
            return false;
        }

        // Agents and admins need additional contact information
        if ((role.isAgent() || role.isAdmin()) && !profile.isComplete()) {
            return false;
        }

        return true;
    }

    /**
     * Validates user registration data
     */
    static validateRegistrationData(email: string, role?: string): void {
        // Validate email format
        Email.create(email);

        // Validate role if provided
        if (role) {
            const userRole = UserRole.create(role);

            // Only allow user role for self-registration
            if (!userRole.isUser()) {
                throw new BusinessRuleViolationError('Only user role is allowed for self-registration', 'INVALID_SELF_REGISTRATION_ROLE');
            }
        }
    }

    /**
     * Determines if a user needs to update their profile
     */
    static needsProfileUpdate(user: User): boolean {
        const profile = user.getProfile();

        // Check if profile is incomplete
        if (!profile.isComplete()) {
            return true;
        }

        // Check if role requires additional information
        if (!this.isProfileCompleteForRole(user)) {
            return true;
        }

        return false;
    }

    /**
     * Validates password requirements (would be used with password value object)
     */
    static validatePasswordRequirements(password: string): void {
        if (!password || password.length < 8) {
            throw new ValueObjectValidationError('Password must be at least 8 characters long');
        }

        if (password.length > 100) {
            throw new ValueObjectValidationError('Password cannot exceed 100 characters');
        }

        // Check for at least one uppercase letter
        if (!/[A-Z]/.test(password)) {
            throw new ValueObjectValidationError('Password must contain at least one uppercase letter');
        }

        // Check for at least one lowercase letter
        if (!/[a-z]/.test(password)) {
            throw new ValueObjectValidationError('Password must contain at least one lowercase letter');
        }

        // Check for at least one number
        if (!/\d/.test(password)) {
            throw new ValueObjectValidationError('Password must contain at least one number');
        }

        // Check for at least one special character
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            throw new ValueObjectValidationError('Password must contain at least one special character');
        }
    }

    /**
     * Checks if two users can interact (for messaging, etc.)
     */
    static canUsersInteract(user1: User, user2: User): boolean {
        // Both users must be active
        if (!user1.getStatus().isActive() || !user2.getStatus().isActive()) {
            return false;
        }

        // Check privacy preferences
        const user2Privacy = user2.getPreferences().getPrivacyPreferences();

        // If user2's profile is not visible, only admins and agents can interact
        if (user2Privacy.profileVisibility === 'private' && !user1.getRole().isAdmin() && !user1.getRole().isAgent()) {
            return false;
        }

        return true;
    }
}