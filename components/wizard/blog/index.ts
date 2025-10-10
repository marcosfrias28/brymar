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

// Main Blog Wizard Component
export { BlogWizard } from "./blog-wizard";

// Blog Wizard Steps
export { BlogContentStep } from "./steps/blog-content-step";
export { BlogMediaStep } from "./steps/blog-media-step";
export { BlogSEOStep } from "./steps/blog-seo-step";
export { BlogPreviewStep } from "./steps/blog-preview-step";

// Configuration and Actions (Re-exported for convenience)
export { blogWizardConfig } from "@/lib/wizard/blog-wizard-config";
export {
    createBlogFromWizard,
    updateBlogFromWizard,
    saveBlogDraft,
    loadBlogDraft,
} from "@/lib/actions/blog-wizard-actions";

// Types (Re-exported for convenience)
export type { BlogWizardData } from "@/types/blog-wizard";