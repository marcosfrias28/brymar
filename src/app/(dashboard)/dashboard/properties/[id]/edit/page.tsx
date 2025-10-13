"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from '@/hooks/use-user';
import { PropertyWizard } from '@/components/wizard/property';
import {
  completePropertyWizard,
  savePropertyDraft,
  loadPropertyDraft,
} from '@/lib/actions/property-wizard-actions';
import { getPropertyById } from '@/app/actions/property-actions';
import { RouteGuard } from '@/components/auth/route-guard';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { PropertyWizardData } from '@/types/property-wizard';

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [initialData, setInitialData] =
    useState<Partial<PropertyWizardData> | null>(null);
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
        const property = await getPropertyById(propertyId.toString());

        if (!property) {
          setError("Propiedad no encontrada");
          setLoading(false);
          return;
        }

        // Convert property data to wizard format
        const wizardData: Partial<PropertyWizardData> = {
          id: property.id?.toString(),
          title: property.title,
          description: property.description,
          price: property.price,
          surface: property.area, // Map area to surface
          propertyType: property.type as any, // Map type to propertyType
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          characteristics: [], // Default empty characteristics
          coordinates: undefined, // Not available in current schema
          address: {
            street: "",
            city: property.location || "",
            province: "",
            country: "Dominican Republic",
            formattedAddress: property.location || "",
          },
          images: Array.isArray(property.images) ? property.images : [],
          videos: [],
          status: (property.status as "draft" | "published") || "draft",
          language: "es",
          aiGenerated: {
            title: false,
            description: false,
            tags: false,
          },
        };

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

  const handleComplete = async (data: PropertyWizardData) => {
    if (!user?.id || !propertyId) {
      toast.error("Usuario no autenticado o ID de propiedad inválido");
      return;
    }

    try {
      // Add the property ID to the data for updates
      const completeData = {
        ...data,
        id: propertyId.toString(),
        aiGenerated: data.aiGenerated || {
          title: false,
          description: false,
          tags: false,
        },
        address: data.address
          ? {
              ...data.address,
              country: "Dominican Republic" as const,
            }
          : undefined,
      };

      const result = await completePropertyWizard({
        userId: user.id,
        data: completeData,
      });

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
    data: Partial<PropertyWizardData>,
    currentStep: string
  ): Promise<string> => {
    if (!user?.id) {
      toast.error("Usuario no autenticado");
      throw new Error("Usuario no autenticado");
    }

    try {
      const result = await savePropertyDraft({
        userId: user.id,
        data: {
          ...data,
          status: data.status || "draft",
          address: data.address
            ? {
                ...data.address,
                country: "Dominican Republic" as const,
              }
            : undefined,
        },
        currentStep: currentStep,
      });

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
