"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Square,
  DollarSign,
  Edit,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";

import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { InlineErrorState } from "@/components/ui/error-states";
import { useLand } from "@/presentation/hooks/use-lands";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { RouteGuard } from "@/components/auth/route-guard";
import { cn } from "@/lib/utils";
import {
  secondaryColorClasses,
  badgeVariants,
  interactiveClasses,
} from "@/lib/utils/secondary-colors";

export default function LandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const landId = params.id as string;

  const { land, loading, error, refetch } = useLand(landId);
  const breadcrumbs = useBreadcrumbs();

  const formatPrice = (price: number, currency: string = "USD") => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      commercial: "Comercial",
      residential: "Residencial",
      agricultural: "Agrícola",
      beachfront: "Frente al Mar",
      industrial: "Industrial",
      mixed: "Mixto",
      tourist: "Turístico",
      development: "Para Desarrollo",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      commercial: "bg-chart-1/20 text-chart-1 border-chart-1/30",
      residential: "bg-chart-2/20 text-chart-2 border-chart-2/30",
      agricultural: "bg-chart-3/20 text-chart-3 border-chart-3/30",
      beachfront: "bg-chart-4/20 text-chart-4 border-chart-4/30",
      industrial: "bg-chart-5/20 text-chart-5 border-chart-5/30",
    };
    return (
      colors[type as keyof typeof colors] ||
      "bg-muted text-muted-foreground border-border"
    );
  };

  if (loading) {
    return (
      <DashboardPageLayout
        title="Cargando terreno..."
        description="Obteniendo información del terreno"
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

  const pricePerM2 = land.getPrice().value / land.getArea().value;
  const hectares = (land.getArea().value / 10000).toFixed(4);
  const tareas = (land.getArea().value / 629).toFixed(2);

  const actions = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => router.back()}
        className={cn(interactiveClasses.button)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>
      <Button
        onClick={() => router.push(`/dashboard/lands/${landId}/edit`)}
        className={cn(
          "bg-arsenic hover:bg-blackCoral",
          secondaryColorClasses.focusRing
        )}
      >
        <Edit className="h-4 w-4 mr-2" />
        Editar
      </Button>
      <Button
        variant="destructive"
        onClick={() => {
          // TODO: Implement delete functionality
          console.log("Delete land:", landId);
        }}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Eliminar
      </Button>
    </div>
  );

  return (
    <RouteGuard requiredPermission="lands.manage">
      <DashboardPageLayout
        title={land.getName().value}
        description={`Detalles del terreno ${getTypeLabel(
          land.getType().value
        ).toLowerCase()}`}
        breadcrumbs={breadcrumbs}
        actions={actions}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card
              className={cn(
                "border-blackCoral/20 shadow-lg transition-all duration-200",
                secondaryColorClasses.cardHover
              )}
            >
              <CardContent className="p-0">
                <div className="relative h-96 overflow-hidden rounded-lg">
                  <Image
                    src={land.images[0] || "/placeholder.svg"}
                    alt={land.getName().value}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={getTypeBadgeColor(land.getType().value)}>
                      {getTypeLabel(land.getType().value)}
                    </Badge>
                  </div>
                </div>
                {land.images.length > 1 && (
                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-2">
                      {land.images.slice(1, 5).map((image, index) => (
                        <div
                          key={index}
                          className="relative h-20 overflow-hidden rounded"
                        >
                          <Image
                            src={image}
                            alt={`${land.getName().value} - ${index + 2}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card
              className={cn(
                "border-blackCoral/20 shadow-lg transition-all duration-200",
                secondaryColorClasses.cardHover
              )}
            >
              <CardHeader>
                <CardTitle className="text-arsenic">Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none text-blackCoral"
                  dangerouslySetInnerHTML={{ __html: land.description }}
                />
              </CardContent>
            </Card>

            {/* Features */}
            {land.features.length > 0 && (
              <Card
                className={cn(
                  "border-blackCoral/20 shadow-lg transition-all duration-200",
                  secondaryColorClasses.cardHover
                )}
              >
                <CardHeader>
                  <CardTitle className="text-arsenic">
                    Características
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {land.features.map((feature, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className={badgeVariants.secondarySubtle}
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price & Details */}
            <Card
              className={cn(
                "border-blackCoral/20 shadow-lg transition-all duration-200",
                secondaryColorClasses.cardHover
              )}
            >
              <CardHeader>
                <CardTitle className="text-arsenic">
                  Información del Precio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-arsenic">
                    {formatPrice(
                      land.getPrice().value,
                      land.getPrice().currency
                    )}
                  </div>
                  <div className="text-sm text-blackCoral/70">
                    ${Math.round(pricePerM2).toLocaleString()}/m²
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blackCoral">
                      <Square className="h-4 w-4" />
                      <span className="text-sm">Área</span>
                    </div>
                    <span className="font-medium text-arsenic">
                      {land.getArea().value.toLocaleString()} m²
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blackCoral">Hectáreas</span>
                    <span className="font-medium text-arsenic">
                      {hectares} ha
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blackCoral">Tareas</span>
                    <span className="font-medium text-arsenic">
                      {tareas} tareas
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card
              className={cn(
                "border-blackCoral/20 shadow-lg transition-all duration-200",
                secondaryColorClasses.cardHover
              )}
            >
              <CardHeader>
                <CardTitle className="text-arsenic">Ubicación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-blackCoral mt-1" />
                  <span className="text-sm text-blackCoral">
                    {land.getLocation().value}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card
              className={cn(
                "border-blackCoral/20 shadow-lg transition-all duration-200",
                secondaryColorClasses.cardHover
              )}
            >
              <CardHeader>
                <CardTitle className="text-arsenic">Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={land.isActive ? "default" : "secondary"}
                  className={
                    land.isActive
                      ? "bg-green-100 text-green-800"
                      : badgeVariants.secondary
                  }
                >
                  {land.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card
              className={cn(
                "border-blackCoral/20 shadow-lg transition-all duration-200",
                secondaryColorClasses.cardHover
              )}
            >
              <CardHeader>
                <CardTitle className="text-arsenic">Fechas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="text-blackCoral">Creado:</span>
                  <span className="ml-2 font-medium text-arsenic">
                    {new Date(land.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-blackCoral">Actualizado:</span>
                  <span className="ml-2 font-medium text-arsenic">
                    {new Date(land.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardPageLayout>
    </RouteGuard>
  );
}
