"use client";

import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { LandForm } from "@/components/lands/land-form";
import { Button } from "@/components/ui/button";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

export default function NewLandPage() {
  const breadcrumbs = useBreadcrumbs();

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        asChild
        className={cn(
          "border-blackCoral text-blackCoral hover:bg-blackCoral hover:text-white",
          secondaryColorClasses.focusRing
        )}
      >
        <Link href="/dashboard/lands">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Link>
      </Button>
    </div>
  );

  return (
    <DashboardPageLayout
      title="Agregar Terreno"
      description="Completa la información del nuevo terreno para agregarlo al inventario"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <div className="max-w-4xl mx-auto">
        <LandForm />
      </div>
    </DashboardPageLayout>
  );
}
