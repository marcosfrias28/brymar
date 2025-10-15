import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export type SectionNameType =
    | "hero"
    | "categories"
    | "featured-properties"
    | "team"
    | "faq"
    | "contact-form"
    | "testimonials"
    | "services"
    | "news"
    | "footer";

export class SectionName {
    private static readonly VALID_SECTIONS: SectionNameType[] = [
        "hero",
        "categories",
        "featured-properties",
        "team",
        "faq",
        "contact-form",
        "testimonials",
        "services",
        "news",
        "footer"
    ];

    private static readonly SECTION_LABELS: Record<SectionNameType, string> = {
        hero: "Sección Principal",
        categories: "Categorías",
        "featured-properties": "Propiedades Destacadas",
        team: "Equipo",
        faq: "Preguntas Frecuentes",
        "contact-form": "Formulario de Contacto",
        testimonials: "Testimonios",
        services: "Servicios",
        news: "Noticias",
        footer: "Pie de Página"
    };

    private constructor(private readonly _value: SectionNameType) {
        this.validate(_value);
    }

    static create(section: string): SectionName {
        return new SectionName(section as SectionNameType);
    }

    static hero(): SectionName {
        return new SectionName("hero");
    }

    static categories(): SectionName {
        return new SectionName("categories");
    }

    static featuredProperties(): SectionName {
        return new SectionName("featured-properties");
    }

    static team(): SectionName {
        return new SectionName("team");
    }

    static faq(): SectionName {
        return new SectionName("faq");
    }

    static contactForm(): SectionName {
        return new SectionName("contact-form");
    }

    static testimonials(): SectionName {
        return new SectionName("testimonials");
    }

    static services(): SectionName {
        return new SectionName("services");
    }

    static news(): SectionName {
        return new SectionName("news");
    }

    static footer(): SectionName {
        return new SectionName("footer");
    }

    private validate(section: string): void {
        if (!section || section.trim().length === 0) {
            throw new ValueObjectValidationError("Section name cannot be empty");
        }

        if (!SectionName.VALID_SECTIONS.includes(section as SectionNameType)) {
            throw new ValueObjectValidationError(
                `Invalid section name: ${section}. Valid sections are: ${SectionName.VALID_SECTIONS.join(", ")}`
            );
        }
    }

    get value(): SectionNameType {
        return this._value;
    }

    getLabel(): string {
        return SectionName.SECTION_LABELS[this._value];
    }

    isValid(): boolean {
        return SectionName.VALID_SECTIONS.includes(this._value);
    }

    isHero(): boolean {
        return this._value === "hero";
    }

    isCategories(): boolean {
        return this._value === "categories";
    }

    isFeaturedProperties(): boolean {
        return this._value === "featured-properties";
    }

    isTeam(): boolean {
        return this._value === "team";
    }

    isFaq(): boolean {
        return this._value === "faq";
    }

    isContactForm(): boolean {
        return this._value === "contact-form";
    }

    isTestimonials(): boolean {
        return this._value === "testimonials";
    }

    isServices(): boolean {
        return this._value === "services";
    }

    isNews(): boolean {
        return this._value === "news";
    }

    isFooter(): boolean {
        return this._value === "footer";
    }

    static getAllSections(): SectionNameType[] {
        return [...SectionName.VALID_SECTIONS];
    }

    static getSectionLabel(section: SectionNameType): string {
        return SectionName.SECTION_LABELS[section];
    }

    equals(other: SectionName): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}