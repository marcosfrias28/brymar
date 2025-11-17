"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Edit3, Home } from "lucide-react";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LandCreator } from "@/components/creator/LandCreator";
import { useLand } from "@/hooks/use-lands";
import { useMemo } from "react";

export default function LandEditPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const { data: land, isLoading, error } = useLand(id);

  const initialValues = useMemo(() => {
    if (!land) { return; }
    const features = (land.features || {}) as {
      zoning?: string;
      utilities?: string[];
      restrictions?: string[];
      access?: string[];
      developmentPotential?: string;
    };
    const images = (land.images || []).map((img: { url: string }) => ({ url: img.url }));
    return {
      name: land.name,
      description: land.description,
      price: land.price,
      surface: land.area,
      landType: land.type,
      location: land.location || "",
      tags: ((land as unknown as { tags?: string[] }).tags || []).join(", "),
      images,
      zoning: features.zoning || "",
      utilities: (features.utilities || []).join(", "),
      characteristics: (features.restrictions || []).join(", "),
      accessRoads: (features.access || []).join(", "),
      nearbyLandmarks: features.developmentPotential || "",
    };
  }, [land]);

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Terrenos", href: "/dashboard/lands" },
    { label: "Editar", icon: Edit3 },
  ];

  let descriptionText = "";
  if (isLoading) {
    descriptionText = "Cargando...";
  } else if (error) {
    descriptionText = "Error al cargar";
  } else {
    descriptionText = land?.name || "";
  }

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
      description={descriptionText}
      title="Editar Terreno"
    >
      <Card>
        <CardHeader>
          <CardTitle>Formulario de Edición</CardTitle>
          <CardDescription>{descriptionText}</CardDescription>
        </CardHeader>
        <CardContent>
          {land ? <LandCreator initialValues={initialValues} /> : null}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  );
}