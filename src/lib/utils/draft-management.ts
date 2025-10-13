
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import db from '@/lib/db/drizzle';
import { propertyDrafts, landDrafts, blogDrafts, wizardAnalytics } from '@/lib/db/schema';
import type {
    PropertyDraft,
    NewPropertyDraft,
    LandDraft,
    NewLandDraft,
    BlogDraft,
    NewBlogDraft
} from '@/lib/db/schema';

// Generic draft management interface
export interface DraftData {
    id?: string;
    userId: string;
    formData: any;
    stepCompleted: number;
    title?: string;
    completionPercentage: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface SaveDraftParams {
    draftId?: string;
    userId: string;
    formData: any;
    stepCompleted: number;
    completionPercentage: number;
    title?: string;
    metadata?: Record<string, any>; // For type-specific metadata like landType, category, etc.
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

// Draft management for properties
export class PropertyDraftManager {
    static async save(params: SaveDraftParams): Promise<DraftResult<{ draftId: string }>> {
        try {
            const draftId = params.draftId || randomUUID();

            const draftData: NewPropertyDraft = {
                id: draftId,
                userId: params.userId,
                formData: params.formData,
                stepCompleted: params.stepCompleted,
                title: params.title,
                propertyType: params.metadata?.propertyType,
                completionPercentage: params.completionPercentage,
                updatedAt: new Date(),
            };

            if (params.draftId) {
                // Update existing draft
                await db
                    .update(propertyDrafts)
                    .set(draftData)
                    .where(and(
                        eq(propertyDrafts.id, params.draftId),
                        eq(propertyDrafts.userId, params.userId)
                    ));
            } else {
                // Create new draft
                await db.insert(propertyDrafts).values({
                    ...draftData,
                    createdAt: new Date(),
                });
            }

            // Track analytics
            await this.trackDraftEvent(draftId, params.userId, 'draft_saved', params.stepCompleted);

            return {
                success: true,
                data: { draftId },
                message: "Borrador guardado exitosamente"
            };
        } catch (error) {
            console.error("Error saving property draft:", error);
            return {
                success: false,
                message: "Error al guardar el borrador"
            };
        }
    }

    static async load(params: LoadDraftParams): Promise<DraftResult<{ formData: any; stepCompleted: number }>> {
        try {
            const draft = await db
                .select()
                .from(propertyDrafts)
                .where(and(
                    eq(propertyDrafts.id, params.draftId),
                    eq(propertyDrafts.userId, params.userId)
                ))
                .limit(1);

            if (!draft[0]) {
                return {
                    success: false,
                    message: "Borrador no encontrado"
                };
            }

            return {
                success: true,
                data: {
                    formData: draft[0].formData,
                    stepCompleted: draft[0].stepCompleted || 0
                },
                message: "Borrador cargado exitosamente"
            };
        } catch (error) {
            console.error("Error loading property draft:", error);
            return {
                success: false,
                message: "Error al cargar el borrador"
            };
        }
    }

    static async delete(params: DeleteDraftParams): Promise<DraftResult> {
        try {
            await db
                .delete(propertyDrafts)
                .where(and(
                    eq(propertyDrafts.id, params.draftId),
                    eq(propertyDrafts.userId, params.userId)
                ));

            return {
                success: true,
                message: "Borrador eliminado exitosamente"
            };
        } catch (error) {
            console.error("Error deleting property draft:", error);
            return {
                success: false,
                message: "Error al eliminar el borrador"
            };
        }
    }

    static async list(userId: string): Promise<DraftResult<PropertyDraft[]>> {
        try {
            const drafts = await db
                .select()
                .from(propertyDrafts)
                .where(eq(propertyDrafts.userId, userId))
                .orderBy(desc(propertyDrafts.updatedAt));

            return {
                success: true,
                data: drafts,
                message: "Borradores cargados exitosamente"
            };
        } catch (error) {
            console.error("Error listing property drafts:", error);
            return {
                success: false,
                data: [],
                message: "Error al cargar los borradores"
            };
        }
    }

    private static async trackDraftEvent(draftId: string, userId: string, eventType: string, stepNumber?: number) {
        try {
            await db.insert(wizardAnalytics).values({
                id: randomUUID(),
                userId,
                wizardType: 'property',
                propertyDraftId: draftId,
                eventType,
                stepNumber,
                createdAt: new Date(),
            });
        } catch (error) {
            console.error("Error tracking draft event:", error);
        }
    }
}

// Draft management for lands
export class LandDraftManager {
    static async save(params: SaveDraftParams): Promise<DraftResult<{ draftId: string }>> {
        try {
            const draftId = params.draftId || randomUUID();

            const draftData: NewLandDraft = {
                id: draftId,
                userId: params.userId,
                formData: params.formData,
                stepCompleted: params.stepCompleted,
                title: params.title,
                landType: params.metadata?.landType,
                completionPercentage: params.completionPercentage,
                updatedAt: new Date(),
            };

            if (params.draftId) {
                // Update existing draft
                await db
                    .update(landDrafts)
                    .set(draftData)
                    .where(and(
                        eq(landDrafts.id, params.draftId),
                        eq(landDrafts.userId, params.userId)
                    ));
            } else {
                // Create new draft
                await db.insert(landDrafts).values({
                    ...draftData,
                    createdAt: new Date(),
                });
            }

            // Track analytics
            await this.trackDraftEvent(draftId, params.userId, 'draft_saved', params.stepCompleted);

            return {
                success: true,
                data: { draftId },
                message: "Borrador guardado exitosamente"
            };
        } catch (error) {
            console.error("Error saving land draft:", error);
            return {
                success: false,
                message: "Error al guardar el borrador"
            };
        }
    }

    static async load(params: LoadDraftParams): Promise<DraftResult<{ formData: any; stepCompleted: number }>> {
        try {
            const draft = await db
                .select()
                .from(landDrafts)
                .where(and(
                    eq(landDrafts.id, params.draftId),
                    eq(landDrafts.userId, params.userId)
                ))
                .limit(1);

            if (!draft[0]) {
                return {
                    success: false,
                    message: "Borrador no encontrado"
                };
            }

            return {
                success: true,
                data: {
                    formData: draft[0].formData,
                    stepCompleted: draft[0].stepCompleted || 0
                },
                message: "Borrador cargado exitosamente"
            };
        } catch (error) {
            console.error("Error loading land draft:", error);
            return {
                success: false,
                message: "Error al cargar el borrador"
            };
        }
    }

    static async delete(params: DeleteDraftParams): Promise<DraftResult> {
        try {
            await db
                .delete(landDrafts)
                .where(and(
                    eq(landDrafts.id, params.draftId),
                    eq(landDrafts.userId, params.userId)
                ));

            return {
                success: true,
                message: "Borrador eliminado exitosamente"
            };
        } catch (error) {
            console.error("Error deleting land draft:", error);
            return {
                success: false,
                message: "Error al eliminar el borrador"
            };
        }
    }

    static async list(userId: string): Promise<DraftResult<LandDraft[]>> {
        try {
            const drafts = await db
                .select()
                .from(landDrafts)
                .where(eq(landDrafts.userId, userId))
                .orderBy(desc(landDrafts.updatedAt));

            return {
                success: true,
                data: drafts,
                message: "Borradores cargados exitosamente"
            };
        } catch (error) {
            console.error("Error listing land drafts:", error);
            return {
                success: false,
                data: [],
                message: "Error al cargar los borradores"
            };
        }
    }

    private static async trackDraftEvent(draftId: string, userId: string, eventType: string, stepNumber?: number) {
        try {
            await db.insert(wizardAnalytics).values({
                id: randomUUID(),
                userId,
                wizardType: 'land',
                landDraftId: draftId,
                eventType,
                stepNumber,
                createdAt: new Date(),
            });
        } catch (error) {
            console.error("Error tracking draft event:", error);
        }
    }
}

// Draft management for blog posts
export class BlogDraftManager {
    static async save(params: SaveDraftParams): Promise<DraftResult<{ draftId: string }>> {
        try {
            const draftId = params.draftId || randomUUID();

            const draftData: NewBlogDraft = {
                id: draftId,
                userId: params.userId,
                formData: params.formData,
                stepCompleted: params.stepCompleted,
                title: params.title,
                category: params.metadata?.category,
                completionPercentage: params.completionPercentage,
                updatedAt: new Date(),
            };

            if (params.draftId) {
                // Update existing draft
                await db
                    .update(blogDrafts)
                    .set(draftData)
                    .where(and(
                        eq(blogDrafts.id, params.draftId),
                        eq(blogDrafts.userId, params.userId)
                    ));
            } else {
                // Create new draft
                await db.insert(blogDrafts).values({
                    ...draftData,
                    createdAt: new Date(),
                });
            }

            // Track analytics
            await this.trackDraftEvent(draftId, params.userId, 'draft_saved', params.stepCompleted);

            return {
                success: true,
                data: { draftId },
                message: "Borrador guardado exitosamente"
            };
        } catch (error) {
            console.error("Error saving blog draft:", error);
            return {
                success: false,
                message: "Error al guardar el borrador"
            };
        }
    }

    static async load(params: LoadDraftParams): Promise<DraftResult<{ formData: any; stepCompleted: number }>> {
        try {
            const draft = await db
                .select()
                .from(blogDrafts)
                .where(and(
                    eq(blogDrafts.id, params.draftId),
                    eq(blogDrafts.userId, params.userId)
                ))
                .limit(1);

            if (!draft[0]) {
                return {
                    success: false,
                    message: "Borrador no encontrado"
                };
            }

            return {
                success: true,
                data: {
                    formData: draft[0].formData,
                    stepCompleted: draft[0].stepCompleted || 0
                },
                message: "Borrador cargado exitosamente"
            };
        } catch (error) {
            console.error("Error loading blog draft:", error);
            return {
                success: false,
                message: "Error al cargar el borrador"
            };
        }
    }

    static async delete(params: DeleteDraftParams): Promise<DraftResult> {
        try {
            await db
                .delete(blogDrafts)
                .where(and(
                    eq(blogDrafts.id, params.draftId),
                    eq(blogDrafts.userId, params.userId)
                ));

            return {
                success: true,
                message: "Borrador eliminado exitosamente"
            };
        } catch (error) {
            console.error("Error deleting blog draft:", error);
            return {
                success: false,
                message: "Error al eliminar el borrador"
            };
        }
    }

    static async list(userId: string): Promise<DraftResult<BlogDraft[]>> {
        try {
            const drafts = await db
                .select()
                .from(blogDrafts)
                .where(eq(blogDrafts.userId, userId))
                .orderBy(desc(blogDrafts.updatedAt));

            return {
                success: true,
                data: drafts,
                message: "Borradores cargados exitosamente"
            };
        } catch (error) {
            console.error("Error listing blog drafts:", error);
            return {
                success: false,
                data: [],
                message: "Error al cargar los borradores"
            };
        }
    }

    private static async trackDraftEvent(draftId: string, userId: string, eventType: string, stepNumber?: number) {
        try {
            await db.insert(wizardAnalytics).values({
                id: randomUUID(),
                userId,
                wizardType: 'blog',
                blogDraftId: draftId,
                eventType,
                stepNumber,
                createdAt: new Date(),
            });
        } catch (error) {
            console.error("Error tracking draft event:", error);
        }
    }
}

// Universal draft manager factory
export class DraftManager {
    static getManager(type: 'property' | 'land' | 'blog') {
        switch (type) {
            case 'property':
                return PropertyDraftManager;
            case 'land':
                return LandDraftManager;
            case 'blog':
                return BlogDraftManager;
            default:
                throw new Error(`Unknown draft type: ${type}`);
        }
    }
}

// Client-side draft persistence utilities
export class ClientDraftManager {
    private static getStorageKey(type: string, userId: string, draftId?: string): string {
        return `wizard_draft_${type}_${userId}_${draftId || 'new'}`;
    }

    static saveDraft(type: string, userId: string, data: any, draftId?: string): void {
        try {
            const key = this.getStorageKey(type, userId, draftId);
            const draftData = {
                data,
                timestamp: Date.now(),
                draftId,
                userId,
                type
            };
            localStorage.setItem(key, JSON.stringify(draftData));
        } catch (error) {
            console.error("Error saving draft to localStorage:", error);
        }
    }

    static loadDraft(type: string, userId: string, draftId?: string): any | null {
        try {
            const key = this.getStorageKey(type, userId, draftId);
            const stored = localStorage.getItem(key);
            if (!stored) return null;

            const draftData = JSON.parse(stored);

            // Check if draft is not too old (24 hours)
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            if (Date.now() - draftData.timestamp > maxAge) {
                this.deleteDraft(type, userId, draftId);
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
            const key = this.getStorageKey(type, userId, draftId);
            localStorage.removeItem(key);
        } catch (error) {
            console.error("Error deleting draft from localStorage:", error);
        }
    }

    static hasDraft(type: string, userId: string, draftId?: string): boolean {
        try {
            const key = this.getStorageKey(type, userId, draftId);
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
                if (key && key.startsWith('wizard_draft_')) {
                    try {
                        const stored = localStorage.getItem(key);
                        if (stored) {
                            const draftData = JSON.parse(stored);
                            if (Date.now() - draftData.timestamp > maxAge) {
                                keysToDelete.push(key);
                            }
                        }
                    } catch (error) {
                        // Invalid JSON, delete it
                        keysToDelete.push(key);
                    }
                }
            }

            keysToDelete.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error("Error clearing expired drafts:", error);
        }
    }
}