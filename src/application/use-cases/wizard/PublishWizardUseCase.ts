import { PublishWizardInput } from "../../dto/wizard/PublishWizardInput";
import { PublishWizardOutput } from "../../dto/wizard/PublishWizardOutput";
import { IWizardDraftRepository } from '@/domain/wizard/repositories/IWizardDraftRepository';
import { IWizardMediaRepository } from '@/domain/wizard/repositories/IWizardMediaRepository';
import { WizardDraft } from '@/domain/wizard/entities/WizardDraft';
import { WizardDomainService, WizardStepDefinition } from '@/domain/wizard/services/WizardDomainService';
import { WizardDraftId } from '@/domain/wizard/value-objects/WizardDraftId';
import { WizardType } from '@/domain/wizard/value-objects/WizardType';
import { WizardFormData } from '@/domain/wizard/value-objects/WizardFormData';
import { StepProgress } from '@/domain/wizard/value-objects/StepProgress';
import { CompletionPercentage } from '@/domain/wizard/value-objects/CompletionPercentage';
import { UserId } from '@/domain/user/value-objects/UserId';
import { EntityNotFoundError, BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

// Import use cases for publishing to specific entities
import { CreatePropertyUseCase } from "../property/CreatePropertyUseCase";
import { CreateLandUseCase } from "../land/CreateLandUseCase";
import { CreateBlogPostUseCase } from "../content/CreateBlogPostUseCase";

// Import DTOs for creating entities
import { CreatePropertyInput } from "../../dto/property/CreatePropertyInput";
import { CreateLandInput } from "../../dto/land/CreateLandInput";
import { CreateBlogPostInput } from "../../dto/content/CreateBlogPostInput";

export class PublishWizardUseCase {
    constructor(
        private readonly wizardDraftRepository: IWizardDraftRepository,
        private readonly wizardMediaRepository: IWizardMediaRepository,
        private readonly wizardDomainService: WizardDomainService,
        private readonly createPropertyUseCase: CreatePropertyUseCase,
        private readonly createLandUseCase: CreateLandUseCase,
        private readonly createBlogPostUseCase: CreateBlogPostUseCase
    ) { }

    async execute(input: PublishWizardInput): Promise<PublishWizardOutput> {
        try {
            const draftId = WizardDraftId.create(input.draftId);
            const userId = UserId.create(input.userId);

            // Find the draft
            const wizardDraftData = await this.wizardDraftRepository.findById(draftId.value);

            if (!wizardDraftData) {
                throw new EntityNotFoundError('WizardDraft', input.draftId);
            }

            // Verify ownership
            if (wizardDraftData.userId !== userId.value) {
                throw new BusinessRuleViolationError("You don't have permission to publish this draft", 'UNAUTHORIZED_DRAFT_PUBLISH');
            }

            // Convert WizardDraftData to WizardDraft entity using reconstitute method
            const wizardDraftEntity = WizardDraft.reconstitute({
                id: WizardDraftId.create(wizardDraftData.id),
                userId: UserId.create(wizardDraftData.userId),
                wizardType: WizardType.create(wizardDraftData.wizardType || "property"),
                wizardConfigId: wizardDraftData.wizardConfigId || "",
                formData: WizardFormData.create(wizardDraftData.formData),
                currentStep: wizardDraftData.stepCompleted?.toString() || "general",
                stepProgress: StepProgress.create({}),
                completionPercentage: CompletionPercentage.create(
                    wizardDraftData.completionPercentage || 0
                ),
                title: wizardDraftData.title,
                description: undefined, // Not available in DraftData
                createdAt: wizardDraftData.createdAt || new Date(),
                updatedAt: wizardDraftData.updatedAt || new Date(),
            });

            // Get final form data (use provided data or draft data)
            const finalFormData = input.finalFormData || wizardDraftData.formData;

            // Validate that the wizard can be published
            const stepDefinitions = this.getStepDefinitions(
                wizardDraftData.wizardType || 'property',
                wizardDraftData.wizardConfigId || ''
            );

            const publishValidation = this.wizardDomainService.canPublish(wizardDraftEntity, stepDefinitions);

            if (!publishValidation.canPublish) {
                throw new BusinessRuleViolationError(
                    `Cannot publish wizard: ${publishValidation.reasons.join(", ")}`,
                    'WIZARD_PUBLISH_VALIDATION_FAILED'
                );
            }

            // Publish based on wizard type
            let publishedId: number;
            let title: string;

            switch (wizardDraftData.wizardType || 'property') {
                case "property":
                    const propertyResult = await this.publishProperty(finalFormData, input.userId);
                    publishedId = propertyResult.id;
                    title = propertyResult.title;
                    break;

                case "land":
                    const landResult = await this.publishLand(finalFormData, input.userId);
                    publishedId = landResult.id;
                    title = landResult.title;
                    break;

                case "blog":
                    const blogResult = await this.publishBlogPost(finalFormData, input.userId);
                    publishedId = blogResult.id;
                    title = blogResult.title;
                    break;

                default:
                    throw new BusinessRuleViolationError(`Unsupported wizard type: ${wizardDraftData.wizardType}`, 'UNSUPPORTED_WIZARD_TYPE');
            }

            // Move media from draft to published entity
            await this.wizardMediaRepository.moveToPublished(draftId, publishedId);

            // Delete the draft after successful publishing
            await this.wizardDraftRepository.delete(draftId.value);

            return PublishWizardOutput.create({
                publishedId,
                wizardType: wizardDraftData.wizardType || 'property',
                title,
                publishedAt: new Date(),
                draftId: input.draftId,
            });
        } catch (error) {
            if (error instanceof EntityNotFoundError || error instanceof BusinessRuleViolationError) {
                throw error;
            }
            throw new Error(`Failed to publish wizard: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    private async publishProperty(formData: Record<string, any>, userId: string): Promise<{ id: number; title: string }> {
        // Map wizard form data to property creation input
        const propertyInput = CreatePropertyInput.create({
            title: formData.title,
            description: formData.description,
            price: formData.price,
            currency: formData.currency || "USD",
            type: formData.propertyType,
            features: {
                bedrooms: formData.bedrooms || 0,
                bathrooms: formData.bathrooms || 0,
                area: formData.area || 0,
                amenities: formData.characteristics || [],
                features: [],
            },
            address: formData.address,
            images: formData.images || [],
            featured: false,
        });

        const result = await this.createPropertyUseCase.execute(propertyInput);
        return { id: parseInt(result.id), title: result.title };
    }

    private async publishLand(formData: Record<string, any>, userId: string): Promise<{ id: number; title: string }> {
        // Map wizard form data to land creation input
        const landInput = CreateLandInput.create({
            name: formData.name,
            description: formData.description,
            area: formData.area,
            price: formData.price,
            currency: formData.currency || "USD",
            location: formData.location,
            type: formData.landType,
            features: formData.features || [],
            images: formData.images || [],
        });

        const result = await this.createLandUseCase.execute(landInput);
        return { id: parseInt(result.id), title: result.title };
    }

    private async publishBlogPost(formData: Record<string, any>, userId: string): Promise<{ id: number; title: string }> {
        // Map wizard form data to blog post creation input
        const blogInput = CreateBlogPostInput.create({
            title: formData.title,
            content: formData.content,
            author: formData.author,
            category: formData.category,
            tags: formData.tags || [],
            excerpt: formData.excerpt,
            coverImage: formData.coverImage,
            seoTitle: formData.seoTitle,
            seoDescription: formData.seoDescription,
            featured: false,
            images: formData.images || [],
        });

        const result = await this.createBlogPostUseCase.execute(blogInput);
        return { id: parseInt(result.id), title: result.title };
    }

    /**
     * Get step definitions for a wizard type and config
     * In a real implementation, this would come from a configuration service
     */
    private getStepDefinitions(wizardType: string, wizardConfigId: string): WizardStepDefinition[] {
        // This is a simplified implementation - in practice, you'd load this from configuration
        switch (wizardType) {
            case "property":
                return [
                    { id: "general", title: "General Information", isRequired: true },
                    { id: "location", title: "Location", isRequired: true },
                    { id: "media", title: "Media", isRequired: false },
                    { id: "preview", title: "Preview", isRequired: false },
                ];
            case "land":
                return [
                    { id: "general", title: "General Information", isRequired: true },
                    { id: "location", title: "Location", isRequired: true },
                    { id: "media", title: "Media", isRequired: false },
                    { id: "preview", title: "Preview", isRequired: false },
                ];
            case "blog":
                return [
                    { id: "content", title: "Content", isRequired: true },
                    { id: "settings", title: "Settings", isRequired: true },
                    { id: "preview", title: "Preview", isRequired: false },
                ];
            default:
                return [];
        }
    }
}