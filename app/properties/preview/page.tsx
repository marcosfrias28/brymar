"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Home,
  Bed,
  Bath,
  Square,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { PropertyFormData, PropertyType } from "@/types/wizard";

const PROPERTY_TYPE_LABELS = {
  [PropertyType.HOUSE]: "Casa",
  [PropertyType.APARTMENT]: "Apartamento",
  [PropertyType.LAND]: "Terreno",
  [PropertyType.COMMERCIAL]: "Comercial",
  [PropertyType.VILLA]: "Villa",
};

function PropertyPreviewContent() {
  const searchParams = useSearchParams();
  const [propertyData, setPropertyData] =
    useState<Partial<PropertyFormData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const dataParam = searchParams.get("data");
      if (dataParam) {
        const decoded = decodeURIComponent(dataParam);
        const parsed = JSON.parse(decoded);
        setPropertyData(parsed);
      } else {
        setError("No se encontraron datos de la propiedad");
      }
    } catch (err) {
      setError("Error al cargar los datos de la propiedad");
      console.error("Error parsing property data:", err);
    }
  }, [searchParams]);

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format surface area
  const formatSurface = (surface: number) => {
    return `${surface.toLocaleString()} m²`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.close()}>Cerrar Ventana</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!propertyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando vista previa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.close()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cerrar Vista Previa
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  Vista Previa de Propiedad
                </h1>
                <p className="text-sm text-muted-foreground">
                  Esta es una vista previa de cómo se verá tu propiedad
                  publicada
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="bg-yellow-50 text-yellow-700 border-yellow-200"
            >
              Vista Previa
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images Gallery */}
            {propertyData.images && propertyData.images.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                    <img
                      src={propertyData.images[0].url}
                      alt="Imagen principal"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {propertyData.images.length > 1 && (
                    <div className="p-4">
                      <div className="grid grid-cols-4 gap-2">
                        {propertyData.images.slice(1, 5).map((image, index) => (
                          <div
                            key={image.id}
                            className="aspect-video bg-gray-200 rounded overflow-hidden"
                          >
                            <img
                              src={image.url}
                              alt={`Imagen ${index + 2}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      {propertyData.images.length > 5 && (
                        <p className="text-sm text-muted-foreground mt-2 text-center">
                          +{propertyData.images.length - 5} imágenes más
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Property Information */}
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {propertyData.title || "Título de la propiedad"}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {propertyData.address?.formattedAddress ||
                          "Ubicación no especificada"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-primary" />
                      <Badge variant="secondary">
                        {propertyData.propertyType
                          ? PROPERTY_TYPE_LABELS[propertyData.propertyType]
                          : "Tipo no especificado"}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {propertyData.price
                          ? formatPrice(propertyData.price)
                          : "$0"}
                      </div>
                    </div>
                  </div>

                  {/* Property Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Bed className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-semibold">
                        {propertyData.bedrooms || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Habitaciones
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Bath className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-semibold">
                        {propertyData.bathrooms || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Baños</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Square className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-semibold">
                        {propertyData.surface
                          ? formatSurface(propertyData.surface)
                          : "0 m²"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Superficie
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {propertyData.description ||
                      "No hay descripción disponible"}
                  </p>
                </div>
                {propertyData.aiGenerated?.description && (
                  <Badge variant="outline" className="mt-3">
                    Generado con IA
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Characteristics */}
            {propertyData.characteristics &&
              propertyData.characteristics.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Características</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {propertyData.characteristics
                        .filter((char) => char.selected)
                        .map((characteristic) => (
                          <div
                            key={characteristic.id}
                            className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">
                              {characteristic.name}
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contactar Agente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Home className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold">Brymar Inmobiliaria</h3>
                  <p className="text-sm text-muted-foreground">
                    Agente Inmobiliario
                  </p>
                </div>
                <div className="space-y-2">
                  <Button className="w-full">Contactar por WhatsApp</Button>
                  <Button variant="outline" className="w-full">
                    Enviar Email
                  </Button>
                  <Button variant="outline" className="w-full">
                    Llamar Ahora
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Location Details */}
            {propertyData.address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Ubicación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium">Dirección</div>
                    <div className="text-sm text-muted-foreground">
                      {propertyData.address.street}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Ciudad</div>
                    <div className="text-sm text-muted-foreground">
                      {propertyData.address.city},{" "}
                      {propertyData.address.province}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">País</div>
                    <div className="text-sm text-muted-foreground">
                      {propertyData.address.country}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Propiedad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Tipo:</span>
                  <span className="text-sm font-medium">
                    {propertyData.propertyType
                      ? PROPERTY_TYPE_LABELS[propertyData.propertyType]
                      : "No especificado"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Superficie:</span>
                  <span className="text-sm font-medium">
                    {propertyData.surface
                      ? formatSurface(propertyData.surface)
                      : "No especificado"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Habitaciones:</span>
                  <span className="text-sm font-medium">
                    {propertyData.bedrooms || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Baños:</span>
                  <span className="text-sm font-medium">
                    {propertyData.bathrooms || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertyPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando vista previa...</p>
          </div>
        </div>
      }
    >
      <PropertyPreviewContent />
    </Suspense>
  );
}
