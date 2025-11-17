"use client";
import Link from "next/link";
import { ArrowLeft, Home, Plus } from "lucide-react";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LandCreator } from "@/components/creator/LandCreator";

export default function LandNewPage() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Terrenos", href: "/dashboard/lands" },
    { label: "Nuevo", icon: Plus },
  ];

  return (
    <DashboardPageLayout
      actions={
        <Button asChild variant="outline">
          <Link href="/dashboard/lands">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Terrenos
          </Link>
        </Button>
      }
      breadcrumbs={breadcrumbs}
      description="Crea un nuevo terreno con validación e IA"
      title="Nuevo Terreno"
    >
      <Card>
        <CardHeader>
          <CardTitle>Formulario de Terreno</CardTitle>
          <CardDescription>Completa los campos y guarda el borrador</CardDescription>
        </CardHeader>
        <CardContent>
          <LandCreator />
        </CardContent>
      </Card>
    </DashboardPageLayout>
  );
}