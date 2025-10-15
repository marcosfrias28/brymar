// Entities
export { User } from './entities/User';
export { UserFavorite } from './entities/UserFavorite';

// Value Objects
export { UserId } from './value-objects/UserId';
export { UserRole } from './value-objects/UserRole';
export { UserStatus } from './value-objects/UserStatus';
export { UserProfile } from './value-objects/UserProfile';
export { UserPreferences } from './value-objects/UserPreferences';

// Repositories
export type { IUserRepository } from './repositories/IUserRepository';
export type { IUserFavoriteRepository } from './repositories/IUserFavoriteRepository';

// Services
export { UserDomainService } from './services/UserDomainService';