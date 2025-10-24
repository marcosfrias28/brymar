/**
 * Wizard-related database schemas
 * Note: Most wizard functionality is frontend-only, only keeping essential tables
 */

import {
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// Enums for wizard types (kept for type safety)
export const wizardTypeEnum = pgEnum("wizard_type", [
	"property",
	"land",
	"blog",
]);
export const wizardStatusEnum = pgEnum("wizard_status", [
	"draft",
	"completed",
	"published",
	"archived",
]);

// Note: Removed unused wizard tables:
// - wizardDrafts: Not actually used in backend
// - wizardMedia: Files handled by Vercel Blob
// - wizardAnalytics: Analytics are frontend-only mockup
// - aiGenerations: Can be frontend-only or removed if not needed

// Type exports for any remaining wizard functionality
// (These can be removed if wizard functionality is completely frontend-only)
