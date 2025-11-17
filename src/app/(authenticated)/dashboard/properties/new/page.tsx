"use client";
import Link from "next/link";
import { ArrowLeft, Home, Plus } from "lucide-react";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PropertyCreator } from "@/components/smart-form/property-creator";

export default function PropertyNewPage() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Propiedades", href: "/dashboard/properties" },
    { label: "Nueva", icon: Plus },
  ];

  return (
    <DashboardPageLayout
      actions={
        <>
        <Button asChild variant="outline">
          <Link href="/dashboard/properties">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Propiedades
          </Link>
        </Button><Button asChild variant="outline">
          <Link href="/dashboard/properties">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Propiedades
          </Link>
        </Button>
        </>
      }
      breadcrumbs={breadcrumbs}
      description="Crea una nueva propiedad con soporte de validación e IA"
      title="Nueva Propiedad"
    >
      <Card>
        <CardHeader>
          <CardTitle>Formulario de Propiedad</CardTitle>
          <CardDescription>Completa los campos y guarda el borrador</CardDescription>
        </CardHeader>
        <CardContent>
          <PropertyCreator />
        </CardContent>
      </Card>
    </DashboardPageLayout>
  );
}