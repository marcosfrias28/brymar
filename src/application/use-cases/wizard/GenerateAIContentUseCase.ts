import { GenerateAIContentInput } from "../../dto/wizard/GenerateAIContentInput";
import { GenerateAIContentOutput } from "../../dto/wizard/GenerateAIContentOutput";
import { IAIService } from "../../services/interfaces/IAIService";
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

export interface PropertyBasicInfo {
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    location?: string;
    price?: number;
    currency?: string;
}

export interface LandBasicInfo {
    landType?: string;
    area?: number;
    location?: string;
    price?: number;
    zoning?: string;
    utilities?: string[];
}

export interface BlogBasicInfo {
    category?: string;
    topic?: string;
    targetAudience?: string;
    keywords?: string[];
}

export class GenerateAIContentUseCase {
    constructor(
        private readonly aiService: IAIService
    ) { }

    async execute(input: GenerateAIContentInput): Promise<GenerateAIContentOutput> {
        const startTime = Date.now();

        try {
            let generatedContent: string;
            let modelUsed: string;

            switch (input.wizardType) {
                case "property":
                    const result = await this.generatePropertyContent(input);
                    generatedContent = result.content;
                    modelUsed = result.model;
                    break;

                case "land":
                    const landResult = await this.generateLandContent(input);
                    generatedContent = landResult.content;
                    modelUsed = landResult.model;
                    break;

                case "blog":
                    const blogResult = await this.generateBlogContent(input);
                    generatedContent = blogResult.content;
                    modelUsed = blogResult.model;
                    break;

                default:
                    throw new BusinessRuleViolationError(`Unsupported wizard type: ${input.wizardType}`, 'UNSUPPORTED_WIZARD_TYPE');
            }

            const processingTime = Date.now() - startTime;

            return GenerateAIContentOutput.success({
                contentType: input.contentType,
                generatedContent,
                language: input.language,
                modelUsed,
                processingTimeMs: processingTime,
            });
        } catch (error) {
            const processingTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

            return GenerateAIContentOutput.failure({
                contentType: input.contentType,
                language: input.language,
                errorMessage,
                processingTimeMs: processingTime,
            });
        }
    }

    private async generatePropertyContent(input: GenerateAIContentInput): Promise<{ content: string; model: string }> {
        const propertyInfo: PropertyBasicInfo = {
            propertyType: input.baseData.propertyType,
            bedrooms: input.baseData.bedrooms,
            bathrooms: input.baseData.bathrooms,
            area: input.baseData.area,
            location: input.baseData.location || input.baseData.address?.city,
            price: input.baseData.price,
            currency: input.baseData.currency,
        };

        switch (input.contentType) {
            case "title":
                return {
                    content: await this.aiService.generatePropertyTitle(propertyInfo, input.language),
                    model: "property-title-generator-v1",
                };

            case "description":
                return {
                    content: await this.aiService.generatePropertyDescription(propertyInfo, input.language),
                    model: "property-description-generator-v1",
                };

            case "tags":
                const tags = await this.aiService.generatePropertyTags(propertyInfo, input.language);
                return {
                    content: Array.isArray(tags) ? tags.join(", ") : tags,
                    model: "property-tags-generator-v1",
                };

            case "market_insights":
                return {
                    content: await this.aiService.generateMarketInsights(propertyInfo, input.language),
                    model: "market-insights-generator-v1",
                };

            default:
                throw new BusinessRuleViolationError(`Unsupported content type for property: ${input.contentType}`, 'UNSUPPORTED_CONTENT_TYPE');
        }
    }

    private async generateLandContent(input: GenerateAIContentInput): Promise<{ content: string; model: string }> {
        const landInfo: LandBasicInfo = {
            landType: input.baseData.landType,
            area: input.baseData.area,
            location: input.baseData.location,
            price: input.baseData.price,
            zoning: input.baseData.zoning,
            utilities: input.baseData.utilities,
        };

        switch (input.contentType) {
            case "title":
                return {
                    content: await this.aiService.generateLandTitle(landInfo, input.language),
                    model: "land-title-generator-v1",
                };

            case "description":
                return {
                    content: await this.aiService.generateLandDescription(landInfo, input.language),
                    model: "land-description-generator-v1",
                };

            case "tags":
                const tags = await this.aiService.generateLandTags(landInfo, input.language);
                return {
                    content: Array.isArray(tags) ? tags.join(", ") : tags,
                    model: "land-tags-generator-v1",
                };

            default:
                throw new BusinessRuleViolationError(`Unsupported content type for land: ${input.contentType}`, 'UNSUPPORTED_CONTENT_TYPE');
        }
    }

    private async generateBlogContent(input: GenerateAIContentInput): Promise<{ content: string; model: string }> {
        const blogInfo: BlogBasicInfo = {
            category: input.baseData.category,
            topic: input.baseData.topic,
            targetAudience: input.baseData.targetAudience,
            keywords: input.baseData.keywords,
        };

        switch (input.contentType) {
            case "title":
                return {
                    content: await this.aiService.generateBlogTitle(blogInfo, input.language),
                    model: "blog-title-generator-v1",
                };

            case "description":
                return {
                    content: await this.aiService.generateBlogDescription(blogInfo, input.language),
                    model: "blog-description-generator-v1",
                };

            case "tags":
                const tags = await this.aiService.generateBlogTags(blogInfo, input.language);
                return {
                    content: Array.isArray(tags) ? tags.join(", ") : tags,
                    model: "blog-tags-generator-v1",
                };

            default:
                throw new BusinessRuleViolationError(`Unsupported content type for blog: ${input.contentType}`, 'UNSUPPORTED_CONTENT_TYPE');
        }
    }
}