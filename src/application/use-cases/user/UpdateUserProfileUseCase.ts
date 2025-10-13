import { User } from '@/domain/user/entities/User';
import { UserId } from '@/domain/user/value-objects/UserId';
import { IUserRepository } from '@/domain/user/repositories/IUserRepository';
import { UserDomainService } from '@/domain/user/services/UserDomainService';
import { UpdateUserProfileInput } from '../../dto/user/UpdateUserProfileInput';
import { UpdateUserProfileOutput } from '../../dto/user/UpdateUserProfileOutput';
import { EntityNotFoundError, BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

/**
 * Use case for updating user profile information
 */
export class UpdateUserProfileUseCase {
    constructor(
        private readonly userRepository: IUserRepository
    ) { }

    /**
     * Executes the user profile update use case
     */
    async execute(input: UpdateUserProfileInput): Promise<UpdateUserProfileOutput> {
        // 1. Find user by ID
        const userId = UserId.create(input.userId);
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new EntityNotFoundError('User', input.userId);
        }

        // 2. Validate user can update profile
        this.validateProfileUpdate(user);

        // 3. Update profile information if provided
        if (input.hasProfileUpdates()) {
            const profileData = input.getProfileData();
            user.updateProfile(profileData);
        }

        // 4. Update preferences if provided
        if (input.hasPreferenceUpdates()) {
            user.updatePreferences(input.preferences);
        }

        // 5. Validate business rules after update
        this.validateUpdatedProfile(user);

        // 6. Save updated user
        await this.userRepository.save(user);

        // 7. Return updated profile
        return UpdateUserProfileOutput.from(user);
    }

    /**
     * Validates if user can update their profile
     */
    private validateProfileUpdate(user: User): void {
        if (!user.isActive()) {
            throw new BusinessRuleViolationError('Cannot update profile for inactive user');
        }

        if (user.getStatus().isSuspended()) {
            throw new BusinessRuleViolationError('Cannot update profile for suspended user');
        }
    }

    /**
     * Validates the updated profile meets business requirements
     */
    private validateUpdatedProfile(user: User): void {
        // Check if profile completeness requirements are met for the user's role
        if (!UserDomainService.isProfileCompleteForRole(user)) {
            // This is a warning, not an error - user can still save incomplete profile
            // but might be prompted to complete it later
        }

        // Additional business rule validations could go here
        // For example, agents might need certain fields to be filled
        const role = user.getRole();
        const profile = user.getProfile();

        if (role.isAgent() || role.isAdmin()) {
            if (!profile.hasContactInfo()) {
                // This could be a warning or requirement depending on business rules
                console.warn(`${role.value} user should have contact information`);
            }
        }
    }

    /**
     * Validates specific field updates
     */
    private validateFieldUpdates(input: UpdateUserProfileInput): void {
        // Website URL validation (additional to DTO validation)
        if (input.website) {
            try {
                new URL(input.website);
            } catch {
                throw new BusinessRuleViolationError('Invalid website URL format');
            }
        }

        // Phone number format validation (could be more sophisticated)
        if (input.phone) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(input.phone.replace(/[\s\-\(\)]/g, ''))) {
                throw new BusinessRuleViolationError('Invalid phone number format');
            }
        }

        // Bio content validation (could check for inappropriate content)
        if (input.bio && input.bio.length > 500) {
            throw new BusinessRuleViolationError('Bio cannot exceed 500 characters');
        }
    }
}