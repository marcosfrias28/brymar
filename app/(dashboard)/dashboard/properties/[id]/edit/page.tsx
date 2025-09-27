"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { PropertyWizard } from "@/components/wizard";
import {
  updateProperty,
  saveDraft,
  convertPropertyToWizardFormat,
} from "@/lib/actions/wizard-actions";
import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { PropertyFormData } from "@/types/wizard";

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [initialData, setInitialData] =
    useState<Partial<PropertyFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const propertyId = params?.id ? parseInt(params.id as string) : null;

  useEffect(() => {
    const loadPropertyData = async () => {
      if (!propertyId) {
        setError("ID de propiedad inválido");
        setLoading(false);
        return;
      }

      try {
        const wizardData = await convertPropertyToWizardFormat(propertyId);

        if (!wizardData) {
          setError("Propiedad no encontrada");
          setLoading(false);
          return;
        }

        setInitialData(wizardData);
      } catch (err) {
        console.error("Error loading property:", err);
        setError("Error al cargar la propiedad");
      } finally {
        setLoading(false);
      }
    };

    loadPropertyData();
  }, [propertyId]);

  const handleComplete = async (data: PropertyFormData) => {
    if (!user?.id || !propertyId) {
      toast.error("Usuario no autenticado o ID de propiedad inválido");
      return;
    }

    try {
      const formData = new FormData();

      // Add all property data to FormData
      formData.append("userId", user.id);
      formData.append("propertyId", propertyId.toString()); // Include property ID for updates
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

      const result = await updateProperty(formData);

      if (result.success) {
        toast.success("¡Propiedad actualizada exitosamente!");
        router.push(`/dashboard/properties/${propertyId}`);
      } else {
        toast.error(result.error || "Error al actualizar la propiedad");
      }
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error("Error inesperado al actualizar la propiedad");
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

      const result = await saveDraft(formData);

      if (result.success) {
        toast.success("Cambios guardados como borrador");
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
    {
      label: `Propiedad #${propertyId}`,
      href: `/dashboard/properties/${propertyId}`,
    },
    { label: "Editar" },
  ];

  if (loading) {
    return (
      <RouteGuard requiredPermission="properties.manage">
        <DashboardPageLayout
          title="Cargando..."
          description="Cargando datos de la propiedad"
          breadcrumbs={breadcrumbs}
        >
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">
                Cargando propiedad...
              </h2>
              <p className="text-muted-foreground">
                Preparando el editor para la propiedad
              </p>
            </div>
          </div>
        </DashboardPageLayout>
      </RouteGuard>
    );
  }

  if (error || !initialData) {
    return (
      <RouteGuard requiredPermission="properties.manage">
        <DashboardPageLayout
          title="Error"
          description="No se pudo cargar la propiedad"
          breadcrumbs={breadcrumbs}
        >
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">
                Error al cargar la propiedad
              </h2>
              <p className="text-muted-foreground mb-4">
                {error || "La propiedad no se pudo cargar para edición"}
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/properties">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a Propiedades
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/dashboard/properties/${propertyId}`}>
                    Ver Propiedad
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </DashboardPageLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard requiredPermission="properties.manage">
      <DashboardPageLayout
        title="Editar Propiedad"
        description="Edita la propiedad usando el asistente inteligente"
        breadcrumbs={breadcrumbs}
      >
        <div className="max-w-6xl mx-auto">
          <PropertyWizard
            initialData={initialData}
            onComplete={handleComplete}
            onSaveDraft={handleSaveDraft}
          />
        </div>
      </DashboardPageLayout>
    </RouteGuard>
  );
}
