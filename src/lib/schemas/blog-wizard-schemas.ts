import { z } from "zod";

const MIN_TITLE_LENGTH = 10;
const MAX_TITLE_LENGTH = 200;
const MIN_DESCRIPTION_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 500;
const MIN_CONTENT_LENGTH = 100;
const MAX_CONTENT_LENGTH = 10_000;
const MIN_AUTHOR_LENGTH = 2;
const MAX_AUTHOR_LENGTH = 100;
const MIN_EXCERPT_LENGTH = 50;
const MAX_EXCERPT_LENGTH = 500;
const MIN_SLUG_LENGTH = 3;
const MAX_SLUG_LENGTH = 100;

// Base blog wizard data schema
export const BaseBlogWizardSchema = z.object({
	title: z
		.string()
		.min(MIN_TITLE_LENGTH, "El título debe tener al menos 10 caracteres")
		.max(MAX_TITLE_LENGTH, "El título no puede exceder 200 caracteres"),
	description: z
		.string()
		.min(
			MIN_DESCRIPTION_LENGTH,
			"La descripción debe tener al menos 50 caracteres"
		)
		.max(
			MAX_DESCRIPTION_LENGTH,
			"La descripción no puede exceder 500 caracteres"
		),
	status: z.enum(["draft", "published"]).default("draft"),
});

// Content step schema
export const BlogContentStepSchema = z.object({
	title: z
		.string()
		.min(MIN_TITLE_LENGTH, "El título debe tener al menos 10 caracteres")
		.max(MAX_TITLE_LENGTH, "El título no puede exceder 200 caracteres"),
	content: z
		.string()
		.min(MIN_CONTENT_LENGTH, "El contenido debe tener al menos 100 caracteres")
		.max(MAX_CONTENT_LENGTH, "El contenido no puede exceder 10,000 caracteres"),
	author: z
		.string()
		.min(MIN_AUTHOR_LENGTH, "El autor debe tener al menos 2 caracteres")
		.max(MAX_AUTHOR_LENGTH, "El autor no puede exceder 100 caracteres"),
	category: z.enum([
		"market-analysis",
		"investment-tips",
		"property-news",
		"legal-advice",
		"lifestyle",
	]),
	excerpt: z
		.string()
		.min(MIN_EXCERPT_LENGTH, "El extracto debe tener al menos 50 caracteres")
		.max(MAX_EXCERPT_LENGTH, "El extracto no puede exceder 500 caracteres")
		.optional(),
});

// Media step schema
export const BlogMediaStepSchema = z.object({
	coverImage: z.string().url("Debe ser una URL válida").optional(),
	images: z.array(
		z.object({
			id: z.string(),
			url: z.string().url(),
			filename: z.string(),
			size: z.number(),
			contentType: z.string(),
			width: z.number().optional(),
			height: z.number().optional(),
			alt: z.string().optional(),
			caption: z.string().optional(),
		})
	),
	videos: z.array(
		z.object({
			id: z.string(),
			url: z.string().url(),
			title: z.string(),
			duration: z.number().optional(),
			thumbnail: z.string().url().optional(),
		})
	),
});

// SEO step schema
export const BlogSEOStepSchema = z.object({
	seoTitle: z
		.string()
		.max(MIN_TITLE_LENGTH, "El título SEO no puede exceder 60 caracteres")
		.optional(),
	seoDescription: z
		.string()
		.max(
			MIN_DESCRIPTION_LENGTH,
			"La descripción SEO no puede exceder 160 caracteres"
		)
		.optional(),
	tags: z
		.array(z.string().min(1))
		.min(1, "Debe incluir al menos una etiqueta")
		.max(10, "No puede exceder 10 etiquetas"),
	slug: z
		.string()
		.min(MIN_SLUG_LENGTH, "El slug debe tener al menos 3 caracteres")
		.max(MAX_SLUG_LENGTH, "El slug no puede exceder 100 caracteres")
		.optional(),
	publishDate: z.date().optional(),
	featured: z.boolean(),
});

// Complete blog wizard schema
export const BlogWizardSchema = z.object({
	// Base fields
	title: z
		.string()
		.min(MIN_TITLE_LENGTH, "El título debe tener al menos 10 caracteres")
		.max(MAX_TITLE_LENGTH, "El título no puede exceder 200 caracteres"),
	description: z
		.string()
		.min(
			MIN_DESCRIPTION_LENGTH,
			"La descripción debe tener al menos 50 caracteres"
		)
		.max(
			MAX_DESCRIPTION_LENGTH,
			"La descripción no puede exceder 500 caracteres"
		),
	status: z.enum(["draft", "published"]),
	// Content fields
	content: z
		.string()
		.min(MIN_CONTENT_LENGTH, "El contenido debe tener al menos 100 caracteres")
		.max(MAX_CONTENT_LENGTH, "El contenido no puede exceder 10,000 caracteres"),
	author: z
		.string()
		.min(MIN_AUTHOR_LENGTH, "El autor debe tener al menos 2 caracteres")
		.max(MAX_AUTHOR_LENGTH, "El autor no puede exceder 100 caracteres"),
	category: z.enum([
		"market-analysis",
		"investment-tips",
		"property-news",
		"legal-advice",
		"lifestyle",
	]),
	excerpt: z
		.string()
		.min(MIN_EXCERPT_LENGTH, "El extracto debe tener al menos 50 caracteres")
		.max(MAX_EXCERPT_LENGTH, "El extracto no puede exceder 500 caracteres")
		.optional(),

	// Media fields
	coverImage: z.string().url("Debe ser una URL válida").optional(),
	images: z.array(
		z.object({
			id: z.string(),
			url: z.string().url(),
			filename: z.string(),
			size: z.number(),
			contentType: z.string(),
			width: z.number().optional(),
			height: z.number().optional(),
			alt: z.string().optional(),
			caption: z.string().optional(),
		})
	),
	videos: z.array(
		z.object({
			id: z.string(),
			url: z.string().url(),
			title: z.string(),
			duration: z.number().optional(),
			thumbnail: z.string().url().optional(),
		})
	),

	// SEO fields
	seoTitle: z
		.string()
		.max(MIN_TITLE_LENGTH, "El título SEO no puede exceder 60 caracteres")
		.optional(),
	seoDescription: z
		.string()
		.max(
			MIN_DESCRIPTION_LENGTH,
			"La descripción SEO no puede exceder 160 caracteres"
		)
		.optional(),
	tags: z
		.array(z.string().min(1))
		.min(1, "Debe incluir al menos una etiqueta")
		.max(10, "No puede exceder 10 etiquetas"),
	slug: z
		.string()
		.min(MIN_SLUG_LENGTH, "El slug debe tener al menos 3 caracteres")
		.max(MAX_SLUG_LENGTH, "El slug no puede exceder 100 caracteres")
		.optional(),
	publishDate: z.date().optional(),
	featured: z.boolean(),

	// Computed fields
	readTime: z.number().optional(),
});

// Step validation schemas
export const blogWizardStepSchemas = {
	0: BlogContentStepSchema,
	1: BlogMediaStepSchema,
	2: BlogSEOStepSchema,
	3: z.object({}), // Preview step - no validation needed
};

// Type definitions
export type BlogWizardData = z.infer<typeof BlogWizardSchema>;
export type BlogContentStepData = z.infer<typeof BlogContentStepSchema>;
export type BlogMediaStepData = z.infer<typeof BlogMediaStepSchema>;
export type BlogSEOStepData = z.infer<typeof BlogSEOStepSchema>;

// Category labels for UI
export const categoryLabels = {
	"market-analysis": "Análisis de Mercado",
	"investment-tips": "Consejos de Inversión",
	"property-news": "Noticias Inmobiliarias",
	"legal-advice": "Asesoría Legal",
	lifestyle: "Estilo de Vida",
} as const;

// Default blog wizard data
export const defaultBlogWizardData: BlogWizardData = {
	title: "",
	description: "",
	content: "",
	author: "",
	category: "property-news",
	status: "draft",
	images: [],
	videos: [],
	tags: ["inmobiliaria"],
	featured: false,
};
