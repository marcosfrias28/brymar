import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import db from "@/lib/db/drizzle";
import type { NewWizardDraft, WizardDraft } from "@/lib/db/schema";
import { wizardAnalytics, wizardDrafts } from "@/lib/db/schema";

// Generic draft management interface
export interface DraftData {
	id?: string;
	userId: string;
	formData: any;
	currentStep: number;
	title?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface SaveDraftParams {
	draftId?: string;
	userId: string;
	type: "property" | "land" | "blog";
	formData: any;
	currentStep: number;
	title?: string;
	description?: string;
	steps: any;
}

export interface LoadDraftParams {
	draftId: string;
	userId: string;
}

export interface DeleteDraftParams {
	draftId: string;
	userId: string;
}

export interface DraftResult<T = any> {
	success: boolean;
	data?: T;
	message?: string;
}

// Unified draft manager
export class UnifiedDraftManager {
	static async save(
		params: SaveDraftParams,
	): Promise<DraftResult<{ draftId: string }>> {
		try {
			const draftId = params.draftId || randomUUID();

			const draftData: NewWizardDraft = {
				id: draftId,
				userId: params.userId,
				type: params.type,
				title: params.title || "Borrador sin título",
				description: params.description,
				currentStep: params.currentStep,
				steps: params.steps || [],
				data: params.formData,
				status: "draft",
				updatedAt: new Date(),
			};

			if (params.draftId) {
				// Update existing draft
				await db
					.update(wizardDrafts)
					.set(draftData)
					.where(
						and(
							eq(wizardDrafts.id, params.draftId),
							eq(wizardDrafts.userId, params.userId),
						),
					);
			} else {
				// Create new draft
				await db.insert(wizardDrafts).values({
					...draftData,
					createdAt: new Date(),
				});
			}

			// Track analytics
			await UnifiedDraftManager.trackDraftEvent(
				draftId,
				params.userId,
				params.type,
				"draft_saved",
				params.currentStep,
			);

			return {
				success: true,
				data: { draftId },
				message: "Borrador guardado exitosamente",
			};
		} catch (error) {
			console.error("Error saving draft:", error);
			return {
				success: false,
				message: "Error al guardar el borrador",
			};
		}
	}

	static async load(
		params: LoadDraftParams,
	): Promise<DraftResult<{ formData: any; currentStep: number }>> {
		try {
			const draft = await db
				.select()
				.from(wizardDrafts)
				.where(
					and(
						eq(wizardDrafts.id, params.draftId),
						eq(wizardDrafts.userId, params.userId),
					),
				)
				.limit(1);

			if (!draft[0]) {
				return {
					success: false,
					message: "Borrador no encontrado",
				};
			}

			return {
				success: true,
				data: {
					formData: draft[0].data,
					currentStep: draft[0].currentStep || 0,
				},
				message: "Borrador cargado exitosamente",
			};
		} catch (error) {
			console.error("Error loading draft:", error);
			return {
				success: false,
				message: "Error al cargar el borrador",
			};
		}
	}

	static async delete(params: DeleteDraftParams): Promise<DraftResult> {
		try {
			await db
				.delete(wizardDrafts)
				.where(
					and(
						eq(wizardDrafts.id, params.draftId),
						eq(wizardDrafts.userId, params.userId),
					),
				);

			return {
				success: true,
				message: "Borrador eliminado exitosamente",
			};
		} catch (error) {
			console.error("Error deleting draft:", error);
			return {
				success: false,
				message: "Error al eliminar el borrador",
			};
		}
	}

	static async list(
		userId: string,
		type?: "property" | "land" | "blog",
	): Promise<DraftResult<WizardDraft[]>> {
		try {
			const query = db
				.select()
				.from(wizardDrafts)
				.where(eq(wizardDrafts.userId, userId));

			if (type) {
				query.where(
					and(eq(wizardDrafts.userId, userId), eq(wizardDrafts.type, type)),
				);
			}

			const drafts = await query.orderBy(desc(wizardDrafts.updatedAt));

			return {
				success: true,
				data: drafts,
				message: "Borradores cargados exitosamente",
			};
		} catch (error) {
			console.error("Error listing drafts:", error);
			return {
				success: false,
				data: [],
				message: "Error al cargar los borradores",
			};
		}
	}

	private static async trackDraftEvent(
		draftId: string,
		userId: string,
		type: "property" | "land" | "blog",
		eventType: string,
		stepNumber?: number,
	) {
		try {
			await db.insert(wizardAnalytics).values({
				id: randomUUID(),
				userId,
				draftId,
				type,
				eventType,
				stepNumber,
				createdAt: new Date(),
			});
		} catch (error) {
			console.error("Error tracking draft event:", error);
		}
	}
}

// Legacy compatibility - redirect to unified manager
export class PropertyDraftManager {
	static async save(
		params: SaveDraftParams,
	): Promise<DraftResult<{ draftId: string }>> {
		return UnifiedDraftManager.save({ ...params, type: "property" });
	}

	static async load(
		params: LoadDraftParams,
	): Promise<DraftResult<{ formData: any; stepCompleted: number }>> {
		const result = await UnifiedDraftManager.load(params);
		if (result.success && result.data) {
			return {
				...result,
				data: {
					formData: result.data.formData,
					stepCompleted: result.data.currentStep,
				},
			};
		}
		return result as any;
	}

	static async delete(params: DeleteDraftParams): Promise<DraftResult> {
		return UnifiedDraftManager.delete(params);
	}

	static async list(userId: string): Promise<DraftResult<WizardDraft[]>> {
		return UnifiedDraftManager.list(userId, "property");
	}
}

export class LandDraftManager {
	static async save(
		params: SaveDraftParams,
	): Promise<DraftResult<{ draftId: string }>> {
		return UnifiedDraftManager.save({ ...params, type: "land" });
	}

	static async load(
		params: LoadDraftParams,
	): Promise<DraftResult<{ formData: any; stepCompleted: number }>> {
		const result = await UnifiedDraftManager.load(params);
		if (result.success && result.data) {
			return {
				...result,
				data: {
					formData: result.data.formData,
					stepCompleted: result.data.currentStep,
				},
			};
		}
		return result as any;
	}

	static async delete(params: DeleteDraftParams): Promise<DraftResult> {
		return UnifiedDraftManager.delete(params);
	}

	static async list(userId: string): Promise<DraftResult<WizardDraft[]>> {
		return UnifiedDraftManager.list(userId, "land");
	}
}

export class BlogDraftManager {
	static async save(
		params: SaveDraftParams,
	): Promise<DraftResult<{ draftId: string }>> {
		return UnifiedDraftManager.save({ ...params, type: "blog" });
	}

	static async load(
		params: LoadDraftParams,
	): Promise<DraftResult<{ formData: any; stepCompleted: number }>> {
		const result = await UnifiedDraftManager.load(params);
		if (result.success && result.data) {
			return {
				...result,
				data: {
					formData: result.data.formData,
					stepCompleted: result.data.currentStep,
				},
			};
		}
		return result as any;
	}

	static async delete(params: DeleteDraftParams): Promise<DraftResult> {
		return UnifiedDraftManager.delete(params);
	}

	static async list(userId: string): Promise<DraftResult<WizardDraft[]>> {
		return UnifiedDraftManager.list(userId, "blog");
	}
}

// Universal draft manager factory
export class DraftManager {
	static getManager(type: "property" | "land" | "blog") {
		switch (type) {
			case "property":
				return PropertyDraftManager;
			case "land":
				return LandDraftManager;
			case "blog":
				return BlogDraftManager;
			default:
				throw new Error(`Unknown draft type: ${type}`);
		}
	}
}

// Client-side draft persistence utilities
export class ClientDraftManager {
	private static getStorageKey(
		type: string,
		userId: string,
		draftId?: string,
	): string {
		return `wizard_draft_${type}_${userId}_${draftId || "new"}`;
	}

	static saveDraft(
		type: string,
		userId: string,
		data: any,
		draftId?: string,
	): void {
		try {
			const key = ClientDraftManager.getStorageKey(type, userId, draftId);
			const draftData = {
				data,
				timestamp: Date.now(),
				draftId,
				userId,
				type,
			};
			localStorage.setItem(key, JSON.stringify(draftData));
		} catch (error) {
			console.error("Error saving draft to localStorage:", error);
		}
	}

	static loadDraft(type: string, userId: string, draftId?: string): any | null {
		try {
			const key = ClientDraftManager.getStorageKey(type, userId, draftId);
			const stored = localStorage.getItem(key);
			if (!stored) return null;

			const draftData = JSON.parse(stored);

			// Check if draft is not too old (24 hours)
			const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
			if (Date.now() - draftData.timestamp > maxAge) {
				ClientDraftManager.deleteDraft(type, userId, draftId);
				return null;
			}

			return draftData.data;
		} catch (error) {
			console.error("Error loading draft from localStorage:", error);
			return null;
		}
	}

	static deleteDraft(type: string, userId: string, draftId?: string): void {
		try {
			const key = ClientDraftManager.getStorageKey(type, userId, draftId);
			localStorage.removeItem(key);
		} catch (error) {
			console.error("Error deleting draft from localStorage:", error);
		}
	}

	static hasDraft(type: string, userId: string, draftId?: string): boolean {
		try {
			const key = ClientDraftManager.getStorageKey(type, userId, draftId);
			return localStorage.getItem(key) !== null;
		} catch (error) {
			console.error("Error checking draft in localStorage:", error);
			return false;
		}
	}

	static clearExpiredDrafts(): void {
		try {
			const maxAge = 24 * 60 * 60 * 1000; // 24 hours
			const keysToDelete: string[] = [];

			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key?.startsWith("wizard_draft_")) {
					try {
						const stored = localStorage.getItem(key);
						if (stored) {
							const draftData = JSON.parse(stored);
							if (Date.now() - draftData.timestamp > maxAge) {
								keysToDelete.push(key);
							}
						}
					} catch (_error) {
						// Invalid JSON, delete it
						keysToDelete.push(key);
					}
				}
			}

			keysToDelete.forEach((key) => localStorage.removeItem(key));
		} catch (error) {
			console.error("Error clearing expired drafts:", error);
		}
	}
}
