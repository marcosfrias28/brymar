// Entities
export { User } from './entities/User';

// Value Objects
export { UserId } from './value-objects/UserId';
export { UserRole } from './value-objects/UserRole';
export { UserStatus } from './value-objects/UserStatus';
export { UserProfile } from './value-objects/UserProfile';
export { UserPreferences } from './value-objects/UserPreferences';

// Repositories
export type { IUserRepository } from './repositories/IUserRepository';

// Services
export { UserDomainService } from './services/UserDomainService';