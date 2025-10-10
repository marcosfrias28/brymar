"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Navigation, Plus, X, Search } from "lucide-react";

export interface LocationData {
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: {
    street?: string;
    city: string;
    province: string;
    postalCode?: string;
    country: string;
    formattedAddress: string;
  };
  accessRoads?: string[];
  nearbyLandmarks?: string[];
}

interface LocationPickerStepProps {
  data: LocationData;
  onUpdate: (data: Partial<LocationData>) => void;
  title?: string;
  description?: string;
  showAccessRoads?: boolean;
  showLandmarks?: boolean;
  showCoordinates?: boolean;
  errors?: Record<string, string>;
}

export function LocationPickerStep({
  data,
  onUpdate,
  title = "Ubicación",
  description = "Proporciona la ubicación exacta",
  showAccessRoads = true,
  showLandmarks = true,
  showCoordinates = true,
  errors = {},
}: LocationPickerStepProps) {
  const [newAccessRoad, setNewAccessRoad] = useState("");
  const [newLandmark, setNewLandmark] = useState("");

  const handleLocationChange = (value: string) => {
    onUpdate({ location: value });
  };

  const handleAddressChange = (field: string, value: string) => {
    const currentAddress = data.address || {
      street: "",
      city: "",
      province: "",
      postalCode: "",
      country: "Dominican Republic",
      formattedAddress: "",
    };

    const updatedAddress = {
      ...currentAddress,
      [field]: value,
    };

    // Update formatted address
    const parts = [
      updatedAddress.street,
      updatedAddress.city,
      updatedAddress.province,
      updatedAddress.country,
    ].filter(Boolean);
    updatedAddress.formattedAddress = parts.join(", ");

    onUpdate({ address: updatedAddress });
  };

  const handleCoordinatesChange = (lat: string, lng: string) => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (!isNaN(latNum) && !isNaN(lngNum)) {
      onUpdate({
        coordinates: {
          lat: latNum,
          lng: lngNum,
        },
      });
    } else {
      onUpdate({ coordinates: undefined });
    }
  };

  const addAccessRoad = () => {
    if (newAccessRoad.trim()) {
      const currentRoads = data.accessRoads || [];
      onUpdate({ accessRoads: [...currentRoads, newAccessRoad.trim()] });
      setNewAccessRoad("");
    }
  };

  const removeAccessRoad = (index: number) => {
    const currentRoads = data.accessRoads || [];
    onUpdate({ accessRoads: currentRoads.filter((_, i) => i !== index) });
  };

  const addLandmark = () => {
    if (newLandmark.trim()) {
      const currentLandmarks = data.nearbyLandmarks || [];
      onUpdate({ nearbyLandmarks: [...currentLandmarks, newLandmark.trim()] });
      setNewLandmark("");
    }
  };

  const removeLandmark = (index: number) => {
    const currentLandmarks = data.nearbyLandmarks || [];
    onUpdate({
      nearbyLandmarks: currentLandmarks.filter((_, i) => i !== index),
    });
  };

  const searchLocation = () => {
    // Placeholder for location search functionality
    // In a real implementation, this would integrate with a geocoding service
    console.log("Searching for location:", data.location);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Dirección Principal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación General *</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                value={data.location || ""}
                onChange={(e) => handleLocationChange(e.target.value)}
                placeholder="Ej: Punta Cana, La Altagracia"
                className={errors.location ? "border-destructive" : ""}
              />
              <Button
                type="button"
                variant="outline"
                onClick={searchLocation}
                disabled={!data.location}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location}</p>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="street">Calle/Dirección</Label>
              <Input
                id="street"
                value={data.address?.street || ""}
                onChange={(e) => handleAddressChange("street", e.target.value)}
                placeholder="Ej: Carretera Verón-Punta Cana"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad *</Label>
              <Input
                id="city"
                value={data.address?.city || ""}
                onChange={(e) => handleAddressChange("city", e.target.value)}
                placeholder="Ej: Punta Cana"
                className={errors["address.city"] ? "border-destructive" : ""}
              />
              {errors["address.city"] && (
                <p className="text-sm text-destructive">
                  {errors["address.city"]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Provincia *</Label>
              <Input
                id="province"
                value={data.address?.province || ""}
                onChange={(e) =>
                  handleAddressChange("province", e.target.value)
                }
                placeholder="Ej: La Altagracia"
                className={
                  errors["address.province"] ? "border-destructive" : ""
                }
              />
              {errors["address.province"] && (
                <p className="text-sm text-destructive">
                  {errors["address.province"]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Código Postal</Label>
              <Input
                id="postalCode"
                value={data.address?.postalCode || ""}
                onChange={(e) =>
                  handleAddressChange("postalCode", e.target.value)
                }
                placeholder="Ej: 23000"
              />
            </div>
          </div>

          {data.address?.formattedAddress && (
            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Dirección Completa:</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {data.address.formattedAddress}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {showCoordinates && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Coordenadas GPS
            </CardTitle>
            <CardDescription>
              Opcional: Proporciona las coordenadas exactas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitud</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={data.coordinates?.lat || ""}
                  onChange={(e) =>
                    handleCoordinatesChange(
                      e.target.value,
                      data.coordinates?.lng?.toString() || ""
                    )
                  }
                  placeholder="Ej: 18.5601"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitud</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={data.coordinates?.lng || ""}
                  onChange={(e) =>
                    handleCoordinatesChange(
                      data.coordinates?.lat?.toString() || "",
                      e.target.value
                    )
                  }
                  placeholder="Ej: -68.3725"
                />
              </div>
            </div>

            {data.coordinates && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <Label className="text-sm font-medium">Coordenadas:</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.coordinates.lat}, {data.coordinates.lng}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showAccessRoads && (
        <Card>
          <CardHeader>
            <CardTitle>Vías de Acceso</CardTitle>
            <CardDescription>
              Describe las carreteras o caminos para llegar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newAccessRoad}
                onChange={(e) => setNewAccessRoad(e.target.value)}
                placeholder="Ej: Autopista del Este, Km 28"
                onKeyPress={(e) => e.key === "Enter" && addAccessRoad()}
              />
              <Button
                type="button"
                onClick={addAccessRoad}
                disabled={!newAccessRoad.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {data.accessRoads && data.accessRoads.length > 0 && (
              <div className="space-y-2">
                <Label>Vías de acceso agregadas:</Label>
                <div className="flex flex-wrap gap-2">
                  {data.accessRoads.map((road, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeAccessRoad(index)}
                    >
                      {road}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showLandmarks && (
        <Card>
          <CardHeader>
            <CardTitle>Puntos de Referencia</CardTitle>
            <CardDescription>
              Lugares conocidos cerca de la ubicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newLandmark}
                onChange={(e) => setNewLandmark(e.target.value)}
                placeholder="Ej: Hard Rock Hotel, Aeropuerto de Punta Cana"
                onKeyPress={(e) => e.key === "Enter" && addLandmark()}
              />
              <Button
                type="button"
                onClick={addLandmark}
                disabled={!newLandmark.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {data.nearbyLandmarks && data.nearbyLandmarks.length > 0 && (
              <div className="space-y-2">
                <Label>Puntos de referencia agregados:</Label>
                <div className="flex flex-wrap gap-2">
                  {data.nearbyLandmarks.map((landmark, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeLandmark(index)}
                    >
                      {landmark}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
