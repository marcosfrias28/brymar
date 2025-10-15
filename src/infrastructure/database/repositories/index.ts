/**
 * Simple repository factory functions
 * Following the design pattern from the spec: create simple factory functions that return repository instances
 */

import db from '@/lib/db/drizzle';
import { DrizzleUserRepository } from './DrizzleUserRepository';
import { DrizzlePropertyDraftRepository } from './DrizzlePropertyDraftRepository';
import { DrizzlePropertyRepository } from './DrizzlePropertyRepository';
import { DrizzleLandRepository } from './DrizzleLandRepository';
import { DrizzleLandDraftRepository } from './DrizzleLandDraftRepository';
import { DrizzleBlogRepository } from './DrizzleBlogRepository';
import { DrizzlePageSectionRepository } from './DrizzlePageSectionRepository';
import { DrizzleSessionRepository } from './DrizzleSessionRepository';
import { DrizzleWizardDraftRepository } from './DrizzleWizardDraftRepository';
import { DrizzleWizardMediaRepository } from './DrizzleWizardMediaRepository';

import type { IUserRepository } from '@/domain/user/repositories/IUserRepository';
import type { IPropertyRepository } from '@/domain/property/repositories/IPropertyRepository';
import type { IPropertyDraftRepository } from '@/domain/property/repositories/IPropertyDraftRepository';
import type { ILandRepository } from '@/domain/land/repositories/ILandRepository';
import type { ILandDraftRepository } from '@/domain/land/repositories/ILandDraftRepository';
import type { IBlogRepository } from '@/domain/content/repositories/IBlogRepository';
import type { IPageSectionRepository } from '@/domain/content/repositories/IPageSectionRepository';
import type { ISessionRepository } from '@/domain/user/repositories/ISessionRepository';
import type { IWizardDraftRepository } from '@/domain/wizard/repositories/IWizardDraftRepository';
import type { IWizardMediaRepository } from '@/domain/wizard/repositories/IWizardMediaRepository';

/**
 * Create User Repository instance
 */
export function createUserRepository(): IUserRepository {
    return new DrizzleUserRepository(db);
}

/**
 * Create Property Repository instance
 */
export function createPropertyRepository(): IPropertyRepository {
    return new DrizzlePropertyRepository(db);
}

/**
 * Create Property Draft Repository instance
 */
export function createPropertyDraftRepository(): IPropertyDraftRepository {
    return new DrizzlePropertyDraftRepository(db);
}

/**
 * Create Land Repository instance
 */
export function createLandRepository(): ILandRepository {
    return new DrizzleLandRepository(db);
}

/**
 * Create Land Draft Repository instance
 */
export function createLandDraftRepository(): ILandDraftRepository {
    return new DrizzleLandDraftRepository(db);
}

/**
 * Create Blog Repository instance
 */
export function createBlogRepository(): IBlogRepository {
    return new DrizzleBlogRepository(db);
}

/**
 * Create Page Section Repository instance
 */
export function createPageSectionRepository(): IPageSectionRepository {
    return new DrizzlePageSectionRepository(db);
}

/**
 * Create Session Repository instance
 */
export function createSessionRepository(): ISessionRepository {
    return new DrizzleSessionRepository(db);
}

/**
 * Create Wizard Draft Repository instance
 */
export function createWizardDraftRepository(): IWizardDraftRepository {
    return new DrizzleWizardDraftRepository(db);
}

/**
 * Create Wizard Media Repository instance
 */
export function createWizardMediaRepository(): IWizardMediaRepository {
    return new DrizzleWizardMediaRepository(db);
}

// Export all repository implementations for direct use if needed
export {
    DrizzleUserRepository,
    DrizzlePropertyRepository,
    DrizzlePropertyDraftRepository,
    DrizzleLandRepository,
    DrizzleLandDraftRepository,
    DrizzleBlogRepository,
    DrizzlePageSectionRepository,
    DrizzleSessionRepository,
    DrizzleWizardDraftRepository,
    DrizzleWizardMediaRepository,
};