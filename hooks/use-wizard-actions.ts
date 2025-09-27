"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { publishProperty, saveDraft, loadDraft, deleteDraft } from "@/lib/actions/wizard-actions";
import type { PropertyFormData } from "@/types/wizard";

export function useWizardActions(userId?: string) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handlePublishProperty = useCallback(async (data: PropertyFormData) => {
        if (!userId) {
            toast.error("Usuario no autenticado");
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();

            // Add all property data to FormData
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (typeof value === 'object') {
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });

            formData.append('userId', userId);

            const result = await publishProperty(formData);

            if (result.success) {
                toast.success(result.message || "¡Propiedad publicada exitosamente!");

                // Redirect to the published property or dashboard
                if (result.data?.propertyId) {
                    router.push(`/dashboard/properties`);
                }
            } else {
                toast.error(result.error || "Error al publicar la propiedad");
            }
        } catch (error) {
            console.error("Error publishing property:", error);
            toast.error("Error inesperado al publicar la propiedad");
        } finally {
            setIsLoading(false);
        }
    }, [userId, router]);

    const handleSaveDraft = useCallback(async (
        formData: Partial<PropertyFormData>,
        stepCompleted?: number,
        draftId?: string
    ): Promise<string> => {
        if (!userId) {
            toast.error("Usuario no autenticado");
            throw new Error("Usuario no autenticado");
        }

        setIsLoading(true);
        try {
            const formDataObj = new FormData();
            formDataObj.append('userId', userId);
            formDataObj.append('formData', JSON.stringify(formData));

            if (stepCompleted !== undefined) {
                formDataObj.append('stepCompleted', String(stepCompleted));
            }

            if (draftId) {
                formDataObj.append('draftId', draftId);
            }

            const result = await saveDraft(formDataObj);

            if (result.success) {
                toast.success(result.message || "Borrador guardado exitosamente");
                return result.data?.draftId || draftId || "";
            } else {
                toast.error(result.error || "Error al guardar el borrador");
                throw new Error(result.error || "Error al guardar el borrador");
            }
        } catch (error) {
            console.error("Error saving draft:", error);
            toast.error("Error inesperado al guardar el borrador");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    const handleLoadDraft = useCallback(async (draftId: string) => {
        if (!userId) {
            toast.error("Usuario no autenticado");
            return null;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('draftId', draftId);
            formData.append('userId', userId);

            const result = await loadDraft(formData);

            if (result.success) {
                return result.data?.draft || null;
            } else {
                toast.error(result.error || "Error al cargar el borrador");
                return null;
            }
        } catch (error) {
            console.error("Error loading draft:", error);
            toast.error("Error inesperado al cargar el borrador");
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    const handleDeleteDraft = useCallback(async (draftId: string) => {
        if (!userId) {
            toast.error("Usuario no autenticado");
            return false;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('draftId', draftId);
            formData.append('userId', userId);

            const result = await deleteDraft(formData);

            if (result.success) {
                toast.success(result.message || "Borrador eliminado exitosamente");
                return true;
            } else {
                toast.error(result.error || "Error al eliminar el borrador");
                return false;
            }
        } catch (error) {
            console.error("Error deleting draft:", error);
            toast.error("Error inesperado al eliminar el borrador");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    return {
        isLoading,
        publishProperty: handlePublishProperty,
        saveDraft: handleSaveDraft,
        loadDraft: handleLoadDraft,
        deleteDraft: handleDeleteDraft,
    };
}