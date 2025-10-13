import { container } from './Container';

// Import use cases
import { CreatePropertyUseCase } from '@/application/use-cases/property/CreatePropertyUseCase';
import { UpdatePropertyUseCase } from '@/application/use-cases/property/UpdatePropertyUseCase';
import { SearchPropertiesUseCase } from '@/application/use-cases/property/SearchPropertiesUseCase';
import { PublishPropertyUseCase } from '@/application/use-cases/property/PublishPropertyUseCase';

import { RegisterUserUseCase } from '@/application/use-cases/user/RegisterUserUseCase';
import { AuthenticateUserUseCase } from '@/application/use-cases/user/AuthenticateUserUseCase';
import { UpdateUserProfileUseCase } from '@/application/use-cases/user/UpdateUserProfileUseCase';

import { SaveWizardDraftUseCase } from '@/application/use-cases/wizard/SaveWizardDraftUseCase';
import { LoadWizardDraftUseCase } from '@/application/use-cases/wizard/LoadWizardDraftUseCase';
import { PublishWizardUseCase } from '@/application/use-cases/wizard/PublishWizardUseCase';
import { GenerateAIContentUseCase } from '@/application/use-cases/wizard/GenerateAIContentUseCase';

// Import repositories
import { DrizzlePropertyRepository } from '@/infrastructure/database/repositories/DrizzlePropertyRepository';
import { DrizzleUserRepository } from '@/infrastructure/database/repositories/DrizzleUserRepository';
import { DrizzleWizardDraftRepository } from '@/infrastructure/database/repositories/DrizzleWizardDraftRepository';

// Import external services
import { HuggingFaceAIService } from '@/infrastructure/external-services/ai/HuggingFaceAIService';
import { VercelBlobImageService } from '@/infrastructure/external-services/storage/VercelBlobImageService';
import { EmailNotificationService } from '@/infrastructure/external-services/EmailNotificationService';

export function initializeContainer(): void {
    // Register repositories
    container.registerSingleton('IPropertyRepository', DrizzlePropertyRepository);
    container.registerSingleton('IUserRepository', DrizzleUserRepository);
    container.registerSingleton('IWizardDraftRepository', DrizzleWizardDraftRepository);

    // Register external services
    container.registerSingleton('IAIService', HuggingFaceAIService);
    container.registerSingleton('IImageService', VercelBlobImageService);
    container.registerSingleton('INotificationService', EmailNotificationService);

    // Register use cases
    container.register('CreatePropertyUseCase', CreatePropertyUseCase);
    container.register('UpdatePropertyUseCase', UpdatePropertyUseCase);
    container.register('SearchPropertiesUseCase', SearchPropertiesUseCase);
    container.register('PublishPropertyUseCase', PublishPropertyUseCase);

    container.register('RegisterUserUseCase', RegisterUserUseCase);
    container.register('AuthenticateUserUseCase', AuthenticateUserUseCase);
    container.register('UpdateUserProfileUseCase', UpdateUserProfileUseCase);

    container.register('SaveWizardDraftUseCase', SaveWizardDraftUseCase);
    container.register('LoadWizardDraftUseCase', LoadWizardDraftUseCase);
    container.register('PublishWizardUseCase', PublishWizardUseCase);
    container.register('GenerateAIContentUseCase', GenerateAIContentUseCase);
}

// Initialize container on module load
initializeContainer();