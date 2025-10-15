"use client";

import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { LandForm } from "@/components/lands/land-form";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { RouteGuard } from "@/components/auth/route-guard";

export default function NewLandPage() {
  const breadcrumbs = useBreadcrumbs();

  return (
    <RouteGuard requiredPermission="lands.manage">
      <DashboardPageLayout
        title="Crear Nuevo Terreno"
        description="Agrega un nuevo terreno al sistema"
        breadcrumbs={breadcrumbs}
      >
        <LandForm />
      </DashboardPageLayout>
    </RouteGuard>
  );
}
