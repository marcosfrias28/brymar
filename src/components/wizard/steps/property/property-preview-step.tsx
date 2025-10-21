"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

interface PropertyPreviewData {
  title?: string;
  description?: string;
  price?: number;
  surface?: number;
  bedrooms?: number;
  bathrooms?: number;
  characteristics?: string[];
}

interface PropertyPreviewStepProps {
  data: PropertyPreviewData;
  onChange: (data: PropertyPreviewData) => void;
  errors?: Record<string, string>;
}

export function PropertyPreviewStep({
  data,
  onChange,
  errors,
}: PropertyPreviewStepProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Vista Previa de la Propiedad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">
                {data.title || "Sin título"}
              </h3>
              <p className="text-muted-foreground">
                {data.description || "Sin descripción"}
              </p>
            </div>

            <div className="flex gap-2">
              <Badge variant="outline">Precio: ${data.price || 0}</Badge>
              <Badge variant="outline">
                Superficie: {data.surface || 0} m²
              </Badge>
              {data.bedrooms && (
                <Badge variant="outline">{data.bedrooms} habitaciones</Badge>
              )}
              {data.bathrooms && (
                <Badge variant="outline">{data.bathrooms} baños</Badge>
              )}
            </div>

            {data.characteristics && data.characteristics.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Características:</h4>
                <div className="flex flex-wrap gap-1">
                  {data.characteristics.map((char: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {char}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
