"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { PropertyWizard } from "@/components/wizard";
import {
  publishProperty,
  saveDraft,
  loadDraft,
} from "@/lib/actions/wizard-actions";
import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { toast } from "sonner";
import type { PropertyFormData } from "@/types/wizard";

export default function NewPropertyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [initialData, setInitialData] = useState<Partial<PropertyFormData>>({});
  const [loading, setLoading] = useState(false);

  const draftId = searchParams?.get("draft");

  useEffect(() => {
    const loadDraftData = async () => {
      if (!draftId || !user?.id) return;

      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("draftId", draftId);
        formData.append("userId", user.id);

        const result = await loadDraft(formData);

        if (result.success && result.data?.draft) {
          setInitialData(result.data.draft.formData);
          toast.success("Borrador cargado exitosamente");
        } else {
          toast.error(result.error || "Error al cargar el borrador");
          // Redirect to new property without draft
          router.replace("/dashboard/properties/new");
        }
      } catch (error) {
        console.error("Error loading draft:", error);
        toast.error("Error inesperado al cargar el borrador");
        router.replace("/dashboard/properties/new");
      } finally {
        setLoading(false);
      }
    };

    loadDraftData();
  }, [draftId, user?.id, router]);

  const handleComplete = async (data: PropertyFormData) => {
    if (!user?.id) {
      toast.error("Usuario no autenticado");
      return;
    }

    try {
      const formData = new FormData();

      // Add all property data to FormData
      formData.append("userId", user.id);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("surface", data.surface.toString());
      formData.append("propertyType", data.propertyType);
      formData.append("bedrooms", (data.bedrooms || 0).toString());
      formData.append("bathrooms", (data.bathrooms || 0).toString());
      formData.append("status", data.status);
      formData.append("language", data.language);

      // Add coordinates
      formData.append("coordinates", JSON.stringify(data.coordinates));

      // Add address
      formData.append("address", JSON.stringify(data.address));

      // Add characteristics
      formData.append("characteristics", JSON.stringify(data.characteristics));

      // Add images metadata
      formData.append("images", JSON.stringify(data.images));

      // Add AI generation flags
      formData.append("aiGenerated", JSON.stringify(data.aiGenerated));

      const result = await publishProperty(formData);

      if (result.success) {
        toast.success("¡Propiedad publicada exitosamente!");
        router.push(`/dashboard/properties/${result.data?.propertyId}`);
      } else {
        toast.error(result.error || "Error al publicar la propiedad");
      }
    } catch (error) {
      console.error("Error publishing property:", error);
      toast.error("Error inesperado al publicar la propiedad");
    }
  };

  const handleSaveDraft = async (
    data: Partial<PropertyFormData>
  ): Promise<string> => {
    if (!user?.id) {
      toast.error("Usuario no autenticado");
      throw new Error("Usuario no autenticado");
    }

    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("formData", JSON.stringify(data));

      // Calculate step completion based on data
      let stepCompleted = 0;
      if (data.title && data.description && data.price) stepCompleted = 1;
      if (data.coordinates && data.address) stepCompleted = 2;
      if (data.images && data.images.length > 0) stepCompleted = 3;

      formData.append("stepCompleted", stepCompleted.toString());

      if (draftId) {
        formData.append("draftId", draftId);
      }

      const result = await saveDraft(formData);

      if (result.success) {
        toast.success("Borrador guardado exitosamente");
        return result.data?.draftId || "";
      } else {
        toast.error(result.error || "Error al guardar el borrador");
        throw new Error(result.error || "Error al guardar el borrador");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Error inesperado al guardar el borrador");
      throw error;
    }
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Propiedades", href: "/dashboard/properties" },
    { label: draftId ? "Continuar Borrador" : "Nueva Propiedad" },
  ];

  if (loading) {
    return (
      <RouteGuard requiredPermission="properties.manage">
        <DashboardPageLayout
          title="Cargando..."
          description="Cargando borrador"
          breadcrumbs={breadcrumbs}
        >
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">
                Cargando borrador...
              </h2>
              <p className="text-muted-foreground">
                Preparando el asistente con tus datos guardados
              </p>
            </div>
          </div>
        </DashboardPageLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard requiredPermission="properties.manage">
      <DashboardPageLayout
        title={draftId ? "Continuar Borrador" : "Nueva Propiedad"}
        description={
          draftId
            ? "Continúa editando tu borrador guardado"
            : "Crea una nueva propiedad usando el asistente inteligente"
        }
        breadcrumbs={breadcrumbs}
      >
        <div className="max-w-6xl mx-auto">
          <PropertyWizard
            initialData={initialData}
            draftId={draftId || undefined}
            onComplete={handleComplete}
            onSaveDraft={handleSaveDraft}
          />
        </div>
      </DashboardPageLayout>
    </RouteGuard>
  );
}
