import { User } from '@/domain/user/entities/User';
import { IUserRepository } from '@/domain/user/repositories/IUserRepository';
import { Email } from '@/domain/shared/value-objects/Email';
import { UserDomainService } from '@/domain/user/services/UserDomainService';
import { CreateUserInput } from '../../dto/user/CreateUserInput';
import { CreateUserOutput } from '../../dto/user/CreateUserOutput';
import { BusinessRuleViolationError, EntityValidationError } from '@/domain/shared/errors/DomainError';

/**
 * Use case for registering a new user
 */
export class RegisterUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository
    ) { }

    /**
     * Executes the user registration use case
     */
    async execute(input: CreateUserInput): Promise<CreateUserOutput> {
        // 1. Validate registration data
        UserDomainService.validateRegistrationData(input.email, input.role);

        // 2. Check if user already exists
        const email = Email.create(input.email);
        const existingUser = await this.userRepository.findByEmail(email);

        if (existingUser) {
            throw new BusinessRuleViolationError('User with this email already exists', 'EMAIL_ALREADY_EXISTS');
        }

        // 3. Create new user entity
        const user = User.create({
            email: input.email,
            profile: {
                firstName: input.firstName || '',
                lastName: input.lastName || ''
            },
            role: input.role,
            preferences: input.preferences,
        });

        // 4. Validate business rules
        if (UserDomainService.needsProfileUpdate(user)) {
            // This is acceptable for new users, they can complete profile later
        }

        // 5. Save user to repository
        await this.userRepository.save(user);

        // 6. Return success result
        return CreateUserOutput.from(user);
    }

    /**
     * Validates input data
     */
    private validateInput(input: CreateUserInput): void {
        if (!input.email) {
            throw new EntityValidationError('Email is required');
        }

        if (input.role && !['admin', 'agent', 'user'].includes(input.role)) {
            throw new EntityValidationError('Invalid role specified');
        }
    }
}