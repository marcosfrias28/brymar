"use client";

import { useState } from "react";
import { MapPin, Layers, Maximize2, Minimize2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Property } from "@/utils/types/types";

interface SearchMapViewProps {
  properties: Property[];
  onViewChange?: (view: "results" | "map") => void;
  currentView?: "results" | "map";
  className?: string;
}

export function SearchMapView({
  properties,
  onViewChange,
  currentView = "map",
  className,
}: SearchMapViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );

  return (
    <Card className={cn("relative", className)}>
      <CardContent className="p-0 h-full">
        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button variant="secondary" size="sm">
            <Layers className="h-4 w-4" />
          </Button>
        </div>

        {/* Property Count Badge */}
        <div className="absolute top-4 left-4 z-10">
          <Badge
            variant="secondary"
            className="bg-background/90 backdrop-blur-sm"
          >
            {properties.length} propiedades
          </Badge>
        </div>

        {/* Map Placeholder */}
        <div className="w-full h-full min-h-[400px] bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center p-8 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg">
            <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Mapa de Propiedades</h3>
            <p className="text-muted-foreground">
              {properties.length > 0
                ? `Mostrando ${properties.length} propiedades en el mapa`
                : "Usa los filtros para encontrar propiedades en el mapa"}
            </p>
          </div>
        </div>

        {/* Selected Property Info */}
        {selectedProperty && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{selectedProperty.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedProperty.location}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      ${selectedProperty.price.toLocaleString()}
                    </p>
                  </div>
                  <Button size="sm">Ver Detalles</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
