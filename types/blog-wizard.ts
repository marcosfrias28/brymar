// Blog Wizard Types for New Framework

import { WizardData } from "./wizard-core";

// Blog-specific data extending base wizard data
export interface BlogWizardData extends WizardData {
    // Content Information
    content: string;
    author: string;
    category: "market-analysis" | "investment-tips" | "property-news" | "legal-advice" | "lifestyle";
    excerpt?: string;

    // Media Information
    coverImage?: string;
    images: BlogImageMetadata[];
    videos: BlogVideoMetadata[];

    // SEO and Publishing
    seoTitle?: string;
    seoDescription?: string;
    tags: string[];
    slug?: string;
    publishDate?: Date;
    featured: boolean;
    readTime?: number;
}

// Supporting types
export interface BlogImageMetadata {
    id: string;
    url: string;
    filename: string;
    size: number;
    contentType: string;
    width?: number;
    height?: number;
    displayOrder: number;
    alt?: string;
    caption?: string;
}

export interface BlogVideoMetadata {
    id: string;
    url: string;
    title: string;
    duration?: number;
    thumbnail?: string;
}

// Category labels for UI
export const categoryLabels = {
    "market-analysis": "Análisis de Mercado",
    "investment-tips": "Consejos de Inversión",
    "property-news": "Noticias Inmobiliarias",
    "legal-advice": "Asesoría Legal",
    "lifestyle": "Estilo de Vida",
} as const;

// Default blog wizard data
export const defaultBlogWizardData: Partial<BlogWizardData> = {
    title: "",
    description: "",
    status: "draft",
    content: "",
    author: "",
    category: "property-news",
    images: [],
    videos: [],
    tags: ["inmobiliaria"],
    featured: false,
};