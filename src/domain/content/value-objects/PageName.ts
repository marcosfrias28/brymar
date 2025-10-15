import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

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

    private constructor(private readonly _value: PageNameType) {
        this.validate(_value);
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
            throw new ValueObjectValidationError("Page name cannot be empty");
        }

        if (!PageName.VALID_PAGES.includes(page as PageNameType)) {
            throw new ValueObjectValidationError(
                `Invalid page name: ${page}. Valid pages are: ${PageName.VALID_PAGES.join(", ")}`
            );
        }
    }

    get value(): PageNameType {
        return this._value;
    }

    getLabel(): string {
        return PageName.PAGE_LABELS[this._value];
    }

    isValid(): boolean {
        return PageName.VALID_PAGES.includes(this._value);
    }

    isHome(): boolean {
        return this._value === "home";
    }

    isAbout(): boolean {
        return this._value === "about";
    }

    isContact(): boolean {
        return this._value === "contact";
    }

    isProperties(): boolean {
        return this._value === "properties";
    }

    isLands(): boolean {
        return this._value === "lands";
    }

    isBlog(): boolean {
        return this._value === "blog";
    }

    isServices(): boolean {
        return this._value === "services";
    }

    static getAllPages(): PageNameType[] {
        return [...PageName.VALID_PAGES];
    }

    static getPageLabel(page: PageNameType): string {
        return PageName.PAGE_LABELS[page];
    }

    equals(other: PageName): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}