import { DomainError } from '@/domain/shared/errors/DomainError';

export type PageNameType =
    | "home"
    | "about"
    | "contact"
    | "properties"
    | "lands"
    | "blog"
    | "services";

export class PageName {
    private static readonly VALID_PAGES: PageNameType[] = [
        "home",
        "about",
        "contact",
        "properties",
        "lands",
        "blog",
        "services"
    ];

    private static readonly PAGE_LABELS: Record<PageNameType, string> = {
        home: "Inicio",
        about: "Acerca de",
        contact: "Contacto",
        properties: "Propiedades",
        lands: "Terrenos",
        blog: "Blog",
        services: "Servicios"
    };

    private constructor(private readonly value: PageNameType) {
        this.validate(value);
    }

    static create(page: string): PageName {
        return new PageName(page as PageNameType);
    }

    static home(): PageName {
        return new PageName("home");
    }

    static about(): PageName {
        return new PageName("about");
    }

    static contact(): PageName {
        return new PageName("contact");
    }

    static properties(): PageName {
        return new PageName("properties");
    }

    static lands(): PageName {
        return new PageName("lands");
    }

    static blog(): PageName {
        return new PageName("blog");
    }

    static services(): PageName {
        return new PageName("services");
    }

    private validate(page: string): void {
        if (!page || page.trim().length === 0) {
            throw new DomainError("Page name cannot be empty");
        }

        if (!PageName.VALID_PAGES.includes(page as PageNameType)) {
            throw new DomainError(
                `Invalid page name: ${page}. Valid pages are: ${PageName.VALID_PAGES.join(", ")}`
            );
        }
    }

    get value(): PageNameType {
        return this.value;
    }

    getLabel(): string {
        return PageName.PAGE_LABELS[this.value];
    }

    isValid(): boolean {
        return PageName.VALID_PAGES.includes(this.value);
    }

    isHome(): boolean {
        return this.value === "home";
    }

    isAbout(): boolean {
        return this.value === "about";
    }

    isContact(): boolean {
        return this.value === "contact";
    }

    isProperties(): boolean {
        return this.value === "properties";
    }

    isLands(): boolean {
        return this.value === "lands";
    }

    isBlog(): boolean {
        return this.value === "blog";
    }

    isServices(): boolean {
        return this.value === "services";
    }

    static getAllPages(): PageNameType[] {
        return [...PageName.VALID_PAGES];
    }

    static getPageLabel(page: PageNameType): string {
        return PageName.PAGE_LABELS[page];
    }

    equals(other: PageName): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}