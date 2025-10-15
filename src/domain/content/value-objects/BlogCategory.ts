import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export type BlogCategoryType =
    | "market-analysis"
    | "investment-tips"
    | "property-news"
    | "legal-advice"
    | "lifestyle";

export class BlogCategory {
    private static readonly VALID_CATEGORIES: BlogCategoryType[] = [
        "market-analysis",
        "investment-tips",
        "property-news",
        "legal-advice",
        "lifestyle"
    ];

    private static readonly CATEGORY_LABELS: Record<BlogCategoryType, string> = {
        "market-analysis": "Análisis de Mercado",
        "investment-tips": "Consejos de Inversión",
        "property-news": "Noticias Inmobiliarias",
        "legal-advice": "Asesoría Legal",
        "lifestyle": "Estilo de Vida"
    };

    private constructor(private readonly _value: BlogCategoryType) {
        this.validate(_value);
    }

    static create(category: string): BlogCategory {
        return new BlogCategory(category as BlogCategoryType);
    }

    static marketAnalysis(): BlogCategory {
        return new BlogCategory("market-analysis");
    }

    static investmentTips(): BlogCategory {
        return new BlogCategory("investment-tips");
    }

    static propertyNews(): BlogCategory {
        return new BlogCategory("property-news");
    }

    static legalAdvice(): BlogCategory {
        return new BlogCategory("legal-advice");
    }

    static lifestyle(): BlogCategory {
        return new BlogCategory("lifestyle");
    }

    private validate(category: string): void {
        if (!category || category.trim().length === 0) {
            throw new ValueObjectValidationError("Blog category cannot be empty");
        }

        if (!BlogCategory.VALID_CATEGORIES.includes(category as BlogCategoryType)) {
            throw new ValueObjectValidationError(
                `Invalid blog category: ${category}. Valid categories are: ${BlogCategory.VALID_CATEGORIES.join(", ")}`
            );
        }
    }

    get value(): BlogCategoryType {
        return this._value;
    }

    getLabel(): string {
        return BlogCategory.CATEGORY_LABELS[this._value];
    }

    isValid(): boolean {
        return BlogCategory.VALID_CATEGORIES.includes(this._value);
    }

    isMarketAnalysis(): boolean {
        return this._value === "market-analysis";
    }

    isInvestmentTips(): boolean {
        return this._value === "investment-tips";
    }

    isPropertyNews(): boolean {
        return this._value === "property-news";
    }

    isLegalAdvice(): boolean {
        return this._value === "legal-advice";
    }

    isLifestyle(): boolean {
        return this._value === "lifestyle";
    }

    static getAllCategories(): BlogCategoryType[] {
        return [...BlogCategory.VALID_CATEGORIES];
    }

    static getCategoryLabel(category: BlogCategoryType): string {
        return BlogCategory.CATEGORY_LABELS[category];
    }

    equals(other: BlogCategory): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}