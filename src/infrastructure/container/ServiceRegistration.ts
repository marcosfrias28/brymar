import { container } from './Container';

// Import use cases
import { CreatePropertyUseCase } from '@/application/use-cases/property/CreatePropertyUseCase';
import { UpdatePropertyUseCase } from '@/application/use-cases/property/UpdatePropertyUseCase';
import { SearchPropertiesUseCase } from '@/application/use-cases/property/SearchPropertiesUseCase';
import { PublishPropertyUseCase } from '@/application/use-cases/property/PublishPropertyUseCase';
import { GetPropertyByIdUseCase } from '@/application/use-cases/property/GetPropertyByIdUseCase';

import { RegisterUserUseCase } from '@/application/use-cases/user/RegisterUserUseCase';

import { UpdateUserProfileUseCase } from '@/application/use-cases/user/UpdateUserProfileUseCase';
import { GetCurrentUserUseCase } from '@/application/use-cases/user/GetCurrentUserUseCase';
import { SignOutUseCase } from '@/application/use-cases/user/SignOutUseCase';
import { RemoveFavoriteUseCase } from '@/application/use-cases/user/RemoveFavoriteUseCase';
import { MarkNotificationAsReadUseCase } from '@/application/use-cases/user/MarkNotificationAsReadUseCase';
import { MarkAllNotificationsAsReadUseCase } from '@/application/use-cases/user/MarkAllNotificationsAsReadUseCase';

import { SaveWizardDraftUseCase } from '@/application/use-cases/wizard/SaveWizardDraftUseCase';
import { LoadWizardDraftUseCase } from '@/application/use-cases/wizard/LoadWizardDraftUseCase';
import { PublishWizardUseCase } from '@/application/use-cases/wizard/PublishWizardUseCase';
import { GenerateAIContentUseCase } from '@/application/use-cases/wizard/GenerateAIContentUseCase';

// Import repositories
import { DrizzlePropertyRepository } from '@/infrastructure/database/repositories/DrizzlePropertyRepository';
import { DrizzleUserRepository } from '@/infrastructure/database/repositories/DrizzleUserRepository';
import { DrizzleWizardDraftRepository } from '@/infrastructure/database/repositories/DrizzleWizardDraftRepository';
import { StubUserFavoriteRepository } from '@/infrastructure/services/StubUserFavoriteRepository';

// Import external services
import { HuggingFaceAIService } from '@/infrastructure/external-services/ai/HuggingFaceAIService';
import { VercelBlobImageService } from '@/infrastructure/external-services/storage/VercelBlobImageService';
import { EmailNotificationService } from '@/infrastructure/external-services/EmailNotificationService';
import { StubAnalyticsService } from '@/infrastructure/services/StubAnalyticsService';

// Import domain services
import { WizardDomainService } from '@/domain/wizard/services/WizardDomainService';

// Import additional repositories
import { DrizzleWizardMediaRepository } from '@/infrastructure/database/repositories/DrizzleWizardMediaRepository';
import { DrizzleLandRepository } from '@/infrastructure/database/repositories/DrizzleLandRepository';
import { DrizzleBlogRepository } from '@/infrastructure/database/repositories/DrizzleBlogRepository';

// Import additional use cases
import { CreateLandUseCase } from '@/application/use-cases/land/CreateLandUseCase';
import { UpdateLandUseCase } from '@/application/use-cases/land/UpdateLandUseCase';
import { SearchLandsUseCase } from '@/application/use-cases/land/SearchLandsUseCase';
import { GetLandByIdUseCase } from '@/application/use-cases/land/GetLandByIdUseCase';
import {
    CreateBlogPostUseCase,
    GetBlogPostByIdUseCase,
    SearchBlogPostsUseCase,
    UpdateBlogPostUseCase,
    DeleteBlogPostUseCase,
    PublishBlogPostUseCase
} from '@/application/use-cases/content';

// Import additional domain services
import { ContentDomainService } from '@/domain/content/services/ContentDomainService';

export function initializeContainer(): void {
    // Import database connection
    const db = require('@/lib/db/drizzle').default;

    // Register repositories with database injection
    container.register('IPropertyRepository', () => new DrizzlePropertyRepository(db));
    container.register('IUserRepository', () => new DrizzleUserRepository(db));
    container.register('ILandRepository', () => new DrizzleLandRepository(db));
    container.register('IBlogRepository', () => new DrizzleBlogRepository(db));
    container.register('IWizardDraftRepository', () => new DrizzleWizardDraftRepository(db));
    container.register('IWizardMediaRepository', () => new DrizzleWizardMediaRepository(db));
    container.registerSingleton('IUserFavoriteRepository', StubUserFavoriteRepository);

    // Register domain services
    container.registerSingleton('WizardDomainService', WizardDomainService);
    container.registerSingleton('ContentDomainService', ContentDomainService);

    // Register external services
    container.register('IAIService', () => new HuggingFaceAIService({
        apiKey: process.env.HUGGINGFACE_API_KEY || '',
        baseUrl: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium'
    }));
    container.register('IImageService', () => new VercelBlobImageService());
    container.register('INotificationService', () => new EmailNotificationService());
    container.registerSingleton('IAnalyticsService', StubAnalyticsService);

    // Register use cases with dependency injection
    container.register('CreatePropertyUseCase', () =>
        new CreatePropertyUseCase(
            container.get('IPropertyRepository'),
            container.get('IImageService'),
            container.get('INotificationService')
        )
    );
    container.register('UpdatePropertyUseCase', () =>
        new UpdatePropertyUseCase(
            container.get('IPropertyRepository'),
            container.get('IImageService'),
            container.get('INotificationService')
        )
    );
    container.register('SearchPropertiesUseCase', () =>
        new SearchPropertiesUseCase(
            container.get('IPropertyRepository')
        )
    );
    container.register('PublishPropertyUseCase', () =>
        new PublishPropertyUseCase(
            container.get('IPropertyRepository'),
            container.get('INotificationService'),
            container.get('IAnalyticsService')
        )
    );
    container.register('GetPropertyByIdUseCase', () =>
        new GetPropertyByIdUseCase(
            container.get('IPropertyRepository')
        )
    );

    // Register user use cases with dependency injection
    container.register('UpdateUserProfileUseCase', () =>
        new UpdateUserProfileUseCase(
            container.get('IUserRepository')
        )
    );

    container.register('GetCurrentUserUseCase', () =>
        new GetCurrentUserUseCase(
            container.get('IUserRepository')
        )
    );

    container.register('SignOutUseCase', () =>
        new SignOutUseCase(
            container.get('IUserRepository')
        )
    );

    container.register('RegisterUserUseCase', () =>
        new RegisterUserUseCase(
            container.get('IUserRepository')
        )
    );

    container.register('RemoveFavoriteUseCase', () =>
        new RemoveFavoriteUseCase(
            container.get('IUserFavoriteRepository')
        )
    );

    container.register('MarkNotificationAsReadUseCase', () =>
        new MarkNotificationAsReadUseCase(
            container.get('IUserRepository')
        )
    );

    container.register('MarkAllNotificationsAsReadUseCase', () =>
        new MarkAllNotificationsAsReadUseCase(
            container.get('IUserRepository')
        )
    );

    // Note: AuthenticateUserUseCase requires additional services (ISessionRepository, IPasswordService, ITokenService)
    // that are not yet fully configured in the container. It can be added later when those services are properly set up.

    // Register wizard use cases with dependency injection
    container.register('SaveWizardDraftUseCase', () =>
        new SaveWizardDraftUseCase(
            container.get('IWizardDraftRepository'),
            container.get('WizardDomainService')
        )
    );
    container.register('LoadWizardDraftUseCase', () =>
        new LoadWizardDraftUseCase(
            container.get('IWizardDraftRepository')
        )
    );
    container.register('PublishWizardUseCase', () =>
        new PublishWizardUseCase(
            container.get('IWizardDraftRepository'),
            container.get('IWizardMediaRepository'),
            container.get('WizardDomainService'),
            container.get('CreatePropertyUseCase'),
            container.get('CreateLandUseCase'),
            container.get('CreateBlogPostUseCase')
        )
    );
    container.register('GenerateAIContentUseCase', () =>
        new GenerateAIContentUseCase(
            container.get('IAIService')
        )
    );

    // Register additional use cases
    container.register('CreateLandUseCase', () =>
        new CreateLandUseCase(
            container.get('ILandRepository'),
            container.get('IImageService'),
            container.get('INotificationService')
        )
    );
    container.register('UpdateLandUseCase', () =>
        new UpdateLandUseCase(
            container.get('ILandRepository'),
            container.get('IImageService'),
            container.get('INotificationService')
        )
    );
    container.register('SearchLandsUseCase', () =>
        new SearchLandsUseCase(
            container.get('ILandRepository')
        )
    );
    container.register('GetLandByIdUseCase', () =>
        new GetLandByIdUseCase(
            container.get('ILandRepository')
        )
    );
    container.register('CreateBlogPostUseCase', () =>
        new CreateBlogPostUseCase(
            container.get('IBlogRepository'),
            container.get('ContentDomainService')
        )
    );
    container.register('GetBlogPostByIdUseCase', () =>
        new GetBlogPostByIdUseCase(
            container.get('IBlogRepository')
        )
    );
    container.register('SearchBlogPostsUseCase', () =>
        new SearchBlogPostsUseCase(
            container.get('IBlogRepository')
        )
    );
    container.register('UpdateBlogPostUseCase', () =>
        new UpdateBlogPostUseCase(
            container.get('IBlogRepository'),
            container.get('ContentDomainService')
        )
    );
    container.register('DeleteBlogPostUseCase', () =>
        new DeleteBlogPostUseCase(
            container.get('IBlogRepository')
        )
    );
    container.register('PublishBlogPostUseCase', () =>
        new PublishBlogPostUseCase(
            container.get('IBlogRepository'),
            container.get('ContentDomainService')
        )
    );
}

// Initialize container on module load
initializeContainer();