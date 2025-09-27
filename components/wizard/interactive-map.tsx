"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { LatLngExpression, Icon, Map as LeafletMap } from "leaflet";
import { Coordinates } from "@/types/wizard";
import {
  mapService,
  DOMINICAN_REPUBLIC_CENTER,
} from "@/lib/services/map-service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Crosshair, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  isMobile,
  isTouchDevice,
  mobileClasses,
} from "@/lib/utils/mobile-utils";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

// Fix for default markers in Next.js - use CDN icons
const markerIcon = new Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface InteractiveMapProps {
  coordinates?: Coordinates;
  onCoordinatesChange: (coordinates: Coordinates) => void;
  onAddressChange?: (address: any) => void;
  className?: string;
  height?: string;
  isMobile?: boolean;
}

// Component to handle map clicks
function MapClickHandler({
  onCoordinatesChange,
  onAddressChange,
}: {
  onCoordinatesChange: (coordinates: Coordinates) => void;
  onAddressChange?: (address: any) => void;
}) {
  const [isGeocoding, setIsGeocoding] = useState(false);

  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const coordinates: Coordinates = {
        latitude: lat,
        longitude: lng,
      };

      // Update coordinates immediately
      onCoordinatesChange(coordinates);

      // Reverse geocode to get address
      if (onAddressChange) {
        setIsGeocoding(true);
        try {
          const address = await mapService.reverseGeocode(coordinates);
          onAddressChange(address);
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          // Don't show error to user, just log it
        } finally {
          setIsGeocoding(false);
        }
      }
    },
  });

  return null;
}

export function InteractiveMap({
  coordinates,
  onCoordinatesChange,
  onAddressChange,
  className,
  height = "400px",
  isMobile: propIsMobile,
}: InteractiveMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Detect mobile if not provided as prop
  const isMobileDevice =
    propIsMobile ?? (typeof window !== "undefined" && isMobile());
  const isTouch = typeof window !== "undefined" && isTouchDevice();

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Center map on coordinates when they change
  useEffect(() => {
    if (mapRef.current && coordinates) {
      mapRef.current.setView([coordinates.latitude, coordinates.longitude], 15);
    }
  }, [coordinates]);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setMapError("La geolocalización no está disponible en este navegador");
      return;
    }

    setIsLocating(true);
    setMapError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinates: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // Check if location is within Dominican Republic
        if (!mapService.isWithinDominicanRepublic(coordinates)) {
          setMapError("Tu ubicación actual está fuera de República Dominicana");
          setIsLocating(false);
          return;
        }

        onCoordinatesChange(coordinates);

        // Reverse geocode to get address
        if (onAddressChange) {
          try {
            const address = await mapService.reverseGeocode(coordinates);
            onAddressChange(address);
          } catch (error) {
            console.error("Error reverse geocoding current location:", error);
          }
        }

        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setMapError("No se pudo obtener tu ubicación actual");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, [onCoordinatesChange, onAddressChange]);

  // Don't render on server side
  if (!isClient) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div
            className="bg-muted rounded-lg flex items-center justify-center"
            style={{ height }}
          >
            <div className="text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Cargando mapa...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const mapCenter: LatLngExpression = coordinates
    ? [coordinates.latitude, coordinates.longitude]
    : [DOMINICAN_REPUBLIC_CENTER.latitude, DOMINICAN_REPUBLIC_CENTER.longitude];

  const mapBounds: [[number, number], [number, number]] = [
    [17.5, -72.0], // Southwest corner
    [19.9, -68.3], // Northeast corner
  ];

  return (
    <Card
      className={cn(
        className,
        isMobileDevice && "border-0 shadow-none bg-transparent"
      )}
    >
      <CardContent className={cn(isMobileDevice ? "p-0" : "p-6")}>
        <div className={cn(isMobileDevice ? "space-y-3" : "space-y-4")}>
          {/* Map controls */}
          <div
            className={cn(
              isMobileDevice
                ? "flex flex-col space-y-2"
                : "flex items-center justify-between"
            )}
          >
            <div
              className={cn(
                "flex items-center",
                isMobileDevice ? "space-x-1" : "space-x-2"
              )}
            >
              <MapPin
                className={cn(
                  "text-primary",
                  isMobileDevice ? "w-4 h-4" : "w-5 h-5"
                )}
              />
              <span
                className={cn(
                  "font-medium",
                  isMobileDevice ? "text-xs" : "text-sm"
                )}
              >
                {coordinates
                  ? `${coordinates.latitude.toFixed(
                      4
                    )}, ${coordinates.longitude.toFixed(4)}`
                  : "Toca el mapa para seleccionar ubicación"}
              </span>
            </div>

            <Button
              variant="outline"
              size={isMobileDevice ? "default" : "sm"}
              onClick={getCurrentLocation}
              disabled={isLocating}
              className={cn(
                "flex items-center space-x-2",
                isMobileDevice &&
                  `${mobileClasses.touchButton} w-full min-h-[44px]`
              )}
            >
              <Crosshair
                className={cn(
                  isLocating && "animate-spin",
                  isMobileDevice ? "w-5 h-5" : "w-4 h-4"
                )}
              />
              <span className={cn(isMobileDevice ? "text-base" : "text-sm")}>
                {isLocating ? "Ubicando..." : "Mi ubicación"}
              </span>
            </Button>
          </div>

          {/* Error message */}
          {mapError && (
            <div
              className={cn(
                "flex items-center bg-destructive/10 border border-destructive/20 rounded-lg",
                isMobileDevice ? "space-x-1 p-2" : "space-x-2 p-3"
              )}
            >
              <AlertCircle
                className={cn(
                  "text-destructive",
                  isMobileDevice ? "w-4 h-4" : "w-4 h-4"
                )}
              />
              <span
                className={cn(
                  "text-destructive",
                  isMobileDevice ? "text-xs" : "text-sm"
                )}
              >
                {mapError}
              </span>
            </div>
          )}

          {/* Map container */}
          <div
            className="relative rounded-lg overflow-hidden border"
            style={{ height }}
          >
            <MapContainer
              ref={mapRef}
              center={mapCenter}
              zoom={
                coordinates
                  ? isMobileDevice
                    ? 14
                    : 15
                  : isMobileDevice
                  ? 7
                  : 8
              }
              maxBounds={mapBounds}
              maxBoundsViscosity={1.0}
              style={{ height: "100%", width: "100%" }}
              className={cn(
                "z-0",
                isMobileDevice && "touch-pan-y touch-pinch-zoom"
              )}
              touchZoom={isTouch}
              scrollWheelZoom={!isMobileDevice}
              doubleClickZoom={true}
              dragging={true}
              zoomControl={!isMobileDevice}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={18}
              />

              {/* Map click handler */}
              <MapClickHandler
                onCoordinatesChange={onCoordinatesChange}
                onAddressChange={onAddressChange}
              />

              {/* Marker for selected coordinates */}
              {coordinates && (
                <Marker
                  position={[coordinates.latitude, coordinates.longitude]}
                  icon={markerIcon}
                />
              )}
            </MapContainer>

            {/* Overlay instructions */}
            {!coordinates && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none z-10">
                <div
                  className={cn(
                    "bg-white rounded-lg shadow-lg text-center",
                    isMobileDevice ? "p-3 mx-4" : "p-4"
                  )}
                >
                  <MapPin
                    className={cn(
                      "mx-auto mb-2 text-primary",
                      isMobileDevice ? "w-6 h-6" : "w-8 h-8"
                    )}
                  />
                  <p
                    className={cn(
                      "font-medium",
                      isMobileDevice ? "text-xs" : "text-sm"
                    )}
                  >
                    {isMobileDevice ? "Toca el mapa" : "Haz clic en el mapa"}
                  </p>
                  <p
                    className={cn(
                      "text-muted-foreground",
                      isMobileDevice ? "text-xs" : "text-xs"
                    )}
                  >
                    para seleccionar la ubicación
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Map instructions */}
          <div
            className={cn(
              "text-muted-foreground space-y-1",
              isMobileDevice ? "text-xs px-2" : "text-xs"
            )}
          >
            <p>
              • {isMobileDevice ? "Toca" : "Haz clic en"} cualquier punto del
              mapa para seleccionar la ubicación
            </p>
            <p>• Usa el botón "Mi ubicación" para usar tu ubicación actual</p>
            {isMobileDevice && (
              <p>• Pellizca para hacer zoom, arrastra para mover el mapa</p>
            )}
            <p>• El mapa está limitado a República Dominicana</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
