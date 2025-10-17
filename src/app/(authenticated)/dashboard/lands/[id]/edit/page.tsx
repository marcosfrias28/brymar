"use client";

import { useParams } from "next/navigation";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { LandForm } from "@/components/forms/land-form";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { InlineErrorState } from "@/components/ui/error-states";
import { useLand } from "@/presentation/hooks/use-lands";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { RouteGuard } from "@/components/auth/route-guard";

export default function EditLandPage() {
  const params = useParams();
  const landId = params.id as string;

  const { land, loading, error, refetch } = useLand(landId);
  const breadcrumbs = useBreadcrumbs();

  if (loading) {
    return (
      <DashboardPageLayout
        title="Cargando terreno..."
        description="Obteniendo información del terreno para editar"
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardPageLayout>
    );
  }

  if (error || !land) {
    return (
      <DashboardPageLayout
        title="Error"
        description="No se pudo cargar el terreno"
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <InlineErrorState
            message={error || "Terreno no encontrado"}
            onRetry={refetch}
          />
        </div>
      </DashboardPageLayout>
    );
  }

  // Convert land DTO to form data format
  const initialData = {
    name: land.getName().value,
    type: land.getType().value,
    price: land.getPrice().value.toString(),
    surface: land.getArea().value.toString(),
    location: land.getLocation().value,
    description: land.description,
    images: [], // Images would need to be converted from URLs to File objects
  };

  return (
    <RouteGuard requiredPermission="lands.manage">
      <DashboardPageLayout
        title={`Editar ${land.getName().value}`}
        description="Modifica la información del terreno"
        breadcrumbs={breadcrumbs}
      >
        <LandForm initialData={initialData} isEditing={true} />
      </DashboardPageLayout>
    </RouteGuard>
  );
}
