import { DomainError } from '@/domain/shared/errors/DomainError';

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

    private constructor(private readonly value: SectionNameType) {
        this.validate(value);
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
            throw new DomainError("Section name cannot be empty");
        }

        if (!SectionName.VALID_SECTIONS.includes(section as SectionNameType)) {
            throw new DomainError(
                `Invalid section name: ${section}. Valid sections are: ${SectionName.VALID_SECTIONS.join(", ")}`
            );
        }
    }

    get value(): SectionNameType {
        return this.value;
    }

    getLabel(): string {
        return SectionName.SECTION_LABELS[this.value];
    }

    isValid(): boolean {
        return SectionName.VALID_SECTIONS.includes(this.value);
    }

    isHero(): boolean {
        return this.value === "hero";
    }

    isCategories(): boolean {
        return this.value === "categories";
    }

    isFeaturedProperties(): boolean {
        return this.value === "featured-properties";
    }

    isTeam(): boolean {
        return this.value === "team";
    }

    isFaq(): boolean {
        return this.value === "faq";
    }

    isContactForm(): boolean {
        return this.value === "contact-form";
    }

    isTestimonials(): boolean {
        return this.value === "testimonials";
    }

    isServices(): boolean {
        return this.value === "services";
    }

    isNews(): boolean {
        return this.value === "news";
    }

    isFooter(): boolean {
        return this.value === "footer";
    }

    static getAllSections(): SectionNameType[] {
        return [...SectionName.VALID_SECTIONS];
    }

    static getSectionLabel(section: SectionNameType): string {
        return SectionName.SECTION_LABELS[section];
    }

    equals(other: SectionName): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}