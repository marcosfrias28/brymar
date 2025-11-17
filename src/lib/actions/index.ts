/**
 * Wizard Actions - Centralized Action Exports
 *
 * This file provides a single entry point for all wizard-related server actions,
 * ensuring consistent action usage across the application and proper
 * separation of concerns between different wizard types.
 */

// Re-export common types used by actions
export type { ActionState } from "@/lib/validations";

// Profile Actions
export {
	getUserProfile,
	updateProfileAction,
} from "./profile-actions";
