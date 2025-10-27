/**
 * Blog Wizard Module
 *
 * This module contains all blog-specific wizard components and logic.
 * It uses the core wizard framework to provide a complete blog post
 * creation and editing experience.
 *
 * Components:
 * - BlogWizard: Main blog wizard component
 * - Blog Steps: Individual step components for blog content creation
 *
 * Features:
 * - Multi-step blog post creation flow
 * - Rich text editor integration
 * - SEO optimization tools
 * - Media management
 * - Content preview and publishing
 */

export {
	createBlogFromWizard,
	loadBlogDraft,
	saveBlogDraft,
	updateBlogFromWizard,
} from "@/lib/actions/blog-wizard-actions";
// Configuration and Actions (Re-exported for convenience)
export { blogWizardConfig } from "@/lib/wizard/blog-wizard-config";
// Types (Re-exported for convenience)
export type { BlogWizardData } from "@/types/blog-wizard";
// Main Blog Wizard Component
export { BlogWizard } from "./blog-wizard";
// Blog Wizard Steps
// export { BlogContentStep } from "./steps/blog-content-step"; // TODO: Create step
// export { BlogMediaStep } from "./steps/blog-media-step"; // TODO: Create step
export { BlogPreviewStep } from "./steps/blog-preview-step";
// export { BlogSEOStep } from "./steps/blog-seo-step"; // TODO: Create step
