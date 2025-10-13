import {
    IAIService,
    PropertyBasicInfo,
    LandBasicInfo,
    BlogBasicInfo
} from '@/application/services/interfaces/IAIService';

export interface HuggingFaceConfig {
    apiKey: string;
    baseUrl: string;
    timeout?: number;
}

export class HuggingFaceAIService implements IAIService {
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly timeout: number;

    constructor(config: HuggingFaceConfig) {
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl;
        this.timeout = config.timeout || 30000; // 30 seconds default
    }

    async generatePropertyTitle(info: PropertyBasicInfo, language: string = "es"): Promise<string> {
        const prompt = this.buildPropertyTitlePrompt(info, language);
        return this.generateText(prompt, "property-title");
    }

    async generatePropertyDescription(info: PropertyBasicInfo, language: string = "es"): Promise<string> {
        const prompt = this.buildPropertyDescriptionPrompt(info, language);
        return this.generateText(prompt, "property-description");
    }

    async generatePropertyTags(info: PropertyBasicInfo, language: string = "es"): Promise<string[]> {
        const prompt = this.buildPropertyTagsPrompt(info, language);
        const result = await this.generateText(prompt, "property-tags");

        // Parse the result into an array of tags
        return this.parseTagsFromText(result);
    }

    async generateMarketInsights(info: PropertyBasicInfo, language: string = "es"): Promise<string> {
        const prompt = this.buildMarketInsightsPrompt(info, language);
        return this.generateText(prompt, "market-insights");
    }

    async generateLandTitle(info: LandBasicInfo, language: string = "es"): Promise<string> {
        const prompt = this.buildLandTitlePrompt(info, language);
        return this.generateText(prompt, "land-title");
    }

    async generateLandDescription(info: LandBasicInfo, language: string = "es"): Promise<string> {
        const prompt = this.buildLandDescriptionPrompt(info, language);
        return this.generateText(prompt, "land-description");
    }

    async generateLandTags(info: LandBasicInfo, language: string = "es"): Promise<string[]> {
        const prompt = this.buildLandTagsPrompt(info, language);
        const result = await this.generateText(prompt, "land-tags");

        return this.parseTagsFromText(result);
    }

    async generateBlogTitle(info: BlogBasicInfo, language: string = "es"): Promise<string> {
        const prompt = this.buildBlogTitlePrompt(info, language);
        return this.generateText(prompt, "blog-title");
    }

    async generateBlogDescription(info: BlogBasicInfo, language: string = "es"): Promise<string> {
        const prompt = this.buildBlogDescriptionPrompt(info, language);
        return this.generateText(prompt, "blog-description");
    }

    async generateBlogTags(info: BlogBasicInfo, language: string = "es"): Promise<string[]> {
        const prompt = this.buildBlogTagsPrompt(info, language);
        const result = await this.generateText(prompt, "blog-tags");

        return this.parseTagsFromText(result);
    }

    async isAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                },
                signal: AbortSignal.timeout(5000), // 5 second timeout for health check
            });

            return response.ok;
        } catch {
            return false;
        }
    }

    private async generateText(prompt: string, type: string): Promise<string> {
        try {
            const response = await fetch(`${this.baseUrl}/generate`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_length: this.getMaxLengthForType(type),
                        temperature: 0.7,
                        do_sample: true,
                        top_p: 0.9,
                    },
                }),
                signal: AbortSignal.timeout(this.timeout),
            });

            if (!response.ok) {
                throw new Error(`HuggingFace API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            if (Array.isArray(result) && result.length > 0) {
                return this.cleanGeneratedText(result[0].generated_text || "", prompt);
            }

            throw new Error("Invalid response format from HuggingFace API");
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`AI generation failed: ${error.message}`);
            }
            throw new Error("AI generation failed: Unknown error");
        }
    }

    private getMaxLengthForType(type: string): number {
        switch (type) {
            case "property-title":
            case "land-title":
            case "blog-title":
                return 100;
            case "property-tags":
            case "land-tags":
            case "blog-tags":
                return 150;
            case "property-description":
            case "land-description":
            case "blog-description":
                return 500;
            case "market-insights":
                return 300;
            default:
                return 200;
        }
    }

    private cleanGeneratedText(text: string, originalPrompt: string): string {
        // Remove the original prompt from the generated text
        let cleaned = text.replace(originalPrompt, "").trim();

        // Remove common AI artifacts
        cleaned = cleaned.replace(/^(AI:|Assistant:|Response:)/i, "").trim();

        // Remove excessive whitespace
        cleaned = cleaned.replace(/\s+/g, " ").trim();

        // Remove incomplete sentences at the end
        const sentences = cleaned.split(/[.!?]+/);
        if (sentences.length > 1 && sentences[sentences.length - 1].trim().length < 10) {
            sentences.pop();
            cleaned = sentences.join(". ").trim() + ".";
        }

        return cleaned;
    }

    private parseTagsFromText(text: string): string[] {
        // Try to extract tags from various formats
        let tags: string[] = [];

        // Look for comma-separated tags
        if (text.includes(",")) {
            tags = text.split(",").map(tag => tag.trim());
        }
        // Look for newline-separated tags
        else if (text.includes("\n")) {
            tags = text.split("\n").map(tag => tag.trim());
        }
        // Look for bullet points
        else if (text.includes("•") || text.includes("-")) {
            tags = text.split(/[•-]/).map(tag => tag.trim()).filter(tag => tag.length > 0);
        }
        // Fallback: split by spaces and take meaningful words
        else {
            tags = text.split(/\s+/).filter(tag => tag.length > 2);
        }

        // Clean and filter tags
        return tags
            .map(tag => tag.replace(/[^\w\s-]/g, "").trim())
            .filter(tag => tag.length > 0 && tag.length < 30)
            .slice(0, 10); // Limit to 10 tags
    }

    // Property prompt builders
    private buildPropertyTitlePrompt(info: PropertyBasicInfo, language: string): string {
        const isSpanish = language === "es";

        const basePrompt = isSpanish
            ? "Genera un título atractivo para una propiedad inmobiliaria con las siguientes características:"
            : "Generate an attractive title for a real estate property with the following characteristics:";

        const details = [];
        if (info.propertyType) details.push(`${isSpanish ? "Tipo" : "Type"}: ${info.propertyType}`);
        if (info.bedrooms) details.push(`${isSpanish ? "Habitaciones" : "Bedrooms"}: ${info.bedrooms}`);
        if (info.bathrooms) details.push(`${isSpanish ? "Baños" : "Bathrooms"}: ${info.bathrooms}`);
        if (info.area) details.push(`${isSpanish ? "Área" : "Area"}: ${info.area} m²`);
        if (info.location) details.push(`${isSpanish ? "Ubicación" : "Location"}: ${info.location}`);
        if (info.price) details.push(`${isSpanish ? "Precio" : "Price"}: ${info.price} ${info.currency || "USD"}`);

        return `${basePrompt}\n${details.join("\n")}\n\n${isSpanish ? "Título:" : "Title:"}`;
    }

    private buildPropertyDescriptionPrompt(info: PropertyBasicInfo, language: string): string {
        const isSpanish = language === "es";

        const basePrompt = isSpanish
            ? "Escribe una descripción atractiva y detallada para una propiedad inmobiliaria:"
            : "Write an attractive and detailed description for a real estate property:";

        const details = [];
        if (info.propertyType) details.push(`${isSpanish ? "Tipo" : "Type"}: ${info.propertyType}`);
        if (info.bedrooms) details.push(`${isSpanish ? "Habitaciones" : "Bedrooms"}: ${info.bedrooms}`);
        if (info.bathrooms) details.push(`${isSpanish ? "Baños" : "Bathrooms"}: ${info.bathrooms}`);
        if (info.area) details.push(`${isSpanish ? "Área" : "Area"}: ${info.area} m²`);
        if (info.location) details.push(`${isSpanish ? "Ubicación" : "Location"}: ${info.location}`);
        if (info.price) details.push(`${isSpanish ? "Precio" : "Price"}: ${info.price} ${info.currency || "USD"}`);

        return `${basePrompt}\n${details.join("\n")}\n\n${isSpanish ? "Descripción:" : "Description:"}`;
    }

    private buildPropertyTagsPrompt(info: PropertyBasicInfo, language: string): string {
        const isSpanish = language === "es";

        const basePrompt = isSpanish
            ? "Genera etiquetas relevantes para esta propiedad (separadas por comas):"
            : "Generate relevant tags for this property (comma-separated):";

        const details = [];
        if (info.propertyType) details.push(info.propertyType);
        if (info.location) details.push(info.location);
        if (info.bedrooms) details.push(`${info.bedrooms} ${isSpanish ? "habitaciones" : "bedrooms"}`);

        return `${basePrompt}\n${details.join(", ")}\n\n${isSpanish ? "Etiquetas:" : "Tags:"}`;
    }

    private buildMarketInsightsPrompt(info: PropertyBasicInfo, language: string): string {
        const isSpanish = language === "es";

        const basePrompt = isSpanish
            ? "Proporciona información del mercado inmobiliario para esta propiedad:"
            : "Provide real estate market insights for this property:";

        const details = [];
        if (info.propertyType) details.push(`${isSpanish ? "Tipo" : "Type"}: ${info.propertyType}`);
        if (info.location) details.push(`${isSpanish ? "Ubicación" : "Location"}: ${info.location}`);
        if (info.price) details.push(`${isSpanish ? "Precio" : "Price"}: ${info.price} ${info.currency || "USD"}`);

        return `${basePrompt}\n${details.join("\n")}\n\n${isSpanish ? "Análisis de mercado:" : "Market analysis:"}`;
    }

    // Land prompt builders
    private buildLandTitlePrompt(info: LandBasicInfo, language: string): string {
        const isSpanish = language === "es";

        const basePrompt = isSpanish
            ? "Genera un título atractivo para un terreno con las siguientes características:"
            : "Generate an attractive title for a land plot with the following characteristics:";

        const details = [];
        if (info.landType) details.push(`${isSpanish ? "Tipo" : "Type"}: ${info.landType}`);
        if (info.area) details.push(`${isSpanish ? "Área" : "Area"}: ${info.area} m²`);
        if (info.location) details.push(`${isSpanish ? "Ubicación" : "Location"}: ${info.location}`);
        if (info.price) details.push(`${isSpanish ? "Precio" : "Price"}: ${info.price}`);

        return `${basePrompt}\n${details.join("\n")}\n\n${isSpanish ? "Título:" : "Title:"}`;
    }

    private buildLandDescriptionPrompt(info: LandBasicInfo, language: string): string {
        const isSpanish = language === "es";

        const basePrompt = isSpanish
            ? "Escribe una descripción atractiva para un terreno:"
            : "Write an attractive description for a land plot:";

        const details = [];
        if (info.landType) details.push(`${isSpanish ? "Tipo" : "Type"}: ${info.landType}`);
        if (info.area) details.push(`${isSpanish ? "Área" : "Area"}: ${info.area} m²`);
        if (info.location) details.push(`${isSpanish ? "Ubicación" : "Location"}: ${info.location}`);
        if (info.zoning) details.push(`${isSpanish ? "Zonificación" : "Zoning"}: ${info.zoning}`);

        return `${basePrompt}\n${details.join("\n")}\n\n${isSpanish ? "Descripción:" : "Description:"}`;
    }

    private buildLandTagsPrompt(info: LandBasicInfo, language: string): string {
        const isSpanish = language === "es";

        const basePrompt = isSpanish
            ? "Genera etiquetas relevantes para este terreno (separadas por comas):"
            : "Generate relevant tags for this land plot (comma-separated):";

        const details = [];
        if (info.landType) details.push(info.landType);
        if (info.location) details.push(info.location);
        if (info.zoning) details.push(info.zoning);

        return `${basePrompt}\n${details.join(", ")}\n\n${isSpanish ? "Etiquetas:" : "Tags:"}`;
    }

    // Blog prompt builders
    private buildBlogTitlePrompt(info: BlogBasicInfo, language: string): string {
        const isSpanish = language === "es";

        const basePrompt = isSpanish
            ? "Genera un título atractivo para un artículo de blog:"
            : "Generate an attractive title for a blog article:";

        const details = [];
        if (info.category) details.push(`${isSpanish ? "Categoría" : "Category"}: ${info.category}`);
        if (info.topic) details.push(`${isSpanish ? "Tema" : "Topic"}: ${info.topic}`);
        if (info.targetAudience) details.push(`${isSpanish ? "Audiencia" : "Audience"}: ${info.targetAudience}`);

        return `${basePrompt}\n${details.join("\n")}\n\n${isSpanish ? "Título:" : "Title:"}`;
    }

    private buildBlogDescriptionPrompt(info: BlogBasicInfo, language: string): string {
        const isSpanish = language === "es";

        const basePrompt = isSpanish
            ? "Escribe una descripción atractiva para un artículo de blog:"
            : "Write an attractive description for a blog article:";

        const details = [];
        if (info.category) details.push(`${isSpanish ? "Categoría" : "Category"}: ${info.category}`);
        if (info.topic) details.push(`${isSpanish ? "Tema" : "Topic"}: ${info.topic}`);
        if (info.keywords) details.push(`${isSpanish ? "Palabras clave" : "Keywords"}: ${info.keywords.join(", ")}`);

        return `${basePrompt}\n${details.join("\n")}\n\n${isSpanish ? "Descripción:" : "Description:"}`;
    }

    private buildBlogTagsPrompt(info: BlogBasicInfo, language: string): string {
        const isSpanish = language === "es";

        const basePrompt = isSpanish
            ? "Genera etiquetas relevantes para este artículo (separadas por comas):"
            : "Generate relevant tags for this article (comma-separated):";

        const details = [];
        if (info.category) details.push(info.category);
        if (info.topic) details.push(info.topic);
        if (info.keywords) details.push(...info.keywords);

        return `${basePrompt}\n${details.join(", ")}\n\n${isSpanish ? "Etiquetas:" : "Tags:"}`;
    }
}