"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LocationStepProps, Coordinates, Address } from "@/types/wizard";
import { Step2Schema } from "@/lib/schemas/wizard-schemas";
import { mapService, DOMINICAN_PROVINCES } from "@/lib/services/map-service";
import { useMobileFormOptimization } from "@/hooks/use-mobile-responsive";
import { mobileClasses } from "@/lib/utils/mobile-utils";
import { InteractiveMap } from "../interactive-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
// Removed translations import
import { z } from "zod";

interface LocationFormData {
  coordinates: Coordinates;
  address: Address;
}

export function LocationStep({
  data,
  onUpdate,
  onNext,
  onPrevious,
  isLoading,
  isMobile = false,
}: LocationStepProps & { isMobile?: boolean }) {
  // Static Spanish text instead of translations
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  // Mobile form optimization
  const { getInputProps } = useMobileFormOptimization();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    trigger,
  } = useForm<LocationFormData>({
    resolver: zodResolver(Step2Schema),
    defaultValues: {
      coordinates: data.coordinates || undefined,
      address: data.address || {
        street: "",
        city: "",
        province: "",
        postalCode: "",
        country: "Dominican Republic",
        formattedAddress: "",
      },
    },
    mode: "onChange",
  });

  const watchedCoordinates = watch("coordinates");
  const watchedAddress = watch("address");

  // Update parent component when form data changes
  useEffect(() => {
    if (watchedCoordinates && watchedAddress) {
      onUpdate({
        coordinates: watchedCoordinates,
        address: watchedAddress,
      });
    }
  }, [watchedCoordinates, watchedAddress, onUpdate]);

  // Handle coordinates change from map
  const handleCoordinatesChange = useCallback(
    (coordinates: Coordinates) => {
      setValue("coordinates", coordinates, { shouldValidate: true });
    },
    [setValue]
  );

  // Handle address change from reverse geocoding
  const handleAddressChange = useCallback(
    (address: Address) => {
      setValue("address", address, { shouldValidate: true });
      setGeocodingError(null);
    },
    [setValue]
  );

  // Handle manual address input and forward geocoding
  const handleAddressInputChange = useCallback(
    async (field: keyof Address, value: string) => {
      const currentAddress = watchedAddress;
      const updatedAddress = { ...currentAddress, [field]: value };

      setValue("address", updatedAddress, { shouldValidate: true });

      // Update formatted address
      const formattedAddress = [
        updatedAddress.street,
        updatedAddress.city,
        updatedAddress.province,
        updatedAddress.country,
      ]
        .filter(Boolean)
        .join(", ");

      setValue("address.formattedAddress", formattedAddress);
    },
    [setValue, watchedAddress]
  );

  // Geocode address to update map marker
  const geocodeAddress = useCallback(async () => {
    const address = watchedAddress;
    if (!address.street || !address.city) {
      setGeocodingError("Ingresa la calle y la ciudad");
      return;
    }

    setIsGeocoding(true);
    setGeocodingError(null);

    try {
      const addressString = [address.street, address.city, address.province]
        .filter(Boolean)
        .join(", ");

      const coordinates = await mapService.geocode(addressString);
      setValue("coordinates", coordinates, { shouldValidate: true });
    } catch (error) {
      setGeocodingError(
        error instanceof Error ? error.message : "Dirección no encontrada"
      );
    } finally {
      setIsGeocoding(false);
    }
  }, [watchedAddress, setValue]);

  // Handle form submission
  const onSubmit = useCallback(
    (formData: LocationFormData) => {
      onUpdate(formData);
      onNext();
    },
    [onUpdate, onNext]
  );

  // Validate and proceed to next step
  const handleNext = useCallback(async () => {
    const isFormValid = await trigger();
    if (isFormValid) {
      onNext();
    }
  }, [trigger, onNext]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(isMobile ? mobileClasses.mobileForm : "space-y-6")}
    >
      {/* Interactive Map Section */}
      <div className={cn(isMobile ? "space-y-3" : "space-y-4")}>
        <div
          className={cn(
            "flex items-center",
            isMobile ? "space-x-1" : "space-x-2"
          )}
        >
          <MapPin
            className={cn("text-primary", isMobile ? "w-4 h-4" : "w-5 h-5")}
          />
          <h3
            className={cn("font-semibold", isMobile ? "text-base" : "text-lg")}
          >
            Ubicación en el Mapa
          </h3>
        </div>

        <InteractiveMap
          coordinates={watchedCoordinates}
          onCoordinatesChange={handleCoordinatesChange}
          onAddressChange={handleAddressChange}
          height={isMobile ? "300px" : "400px"}
          className={cn(isMobile && "rounded-lg overflow-hidden")}
        />

        {errors.coordinates && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errors.coordinates.latitude?.message ||
                errors.coordinates.longitude?.message ||
                "Selecciona una ubicación válida en el mapa"}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Address Form Section */}
      <Card className={cn(isMobile && "border-0 shadow-none bg-transparent")}>
        <CardHeader className={cn(isMobile ? "px-0 pb-3" : "")}>
          <CardTitle
            className={cn(
              "flex items-center",
              isMobile ? "space-x-1 text-base" : "space-x-2 text-lg"
            )}
          >
            <Search className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")} />
            <span>Dirección de la Propiedad</span>
          </CardTitle>
        </CardHeader>
        <CardContent className={cn(isMobile ? "px-0 space-y-3" : "space-y-4")}>
          {/* Street Address */}
          <div className={cn(isMobile ? "space-y-1" : "space-y-2")}>
            <Label
              htmlFor="street"
              className={cn(isMobile ? "text-sm font-medium" : "")}
            >
              Calle *
            </Label>
            <Input
              id="street"
              {...getInputProps("text")}
              placeholder="Ej: Calle Principal #123"
              value={watchedAddress?.street || ""}
              onChange={(e) =>
                handleAddressInputChange("street", e.target.value)
              }
              className={cn(
                errors.address?.street && "border-destructive",
                isMobile && mobileClasses.mobileInput
              )}
            />
            {errors.address?.street && (
              <p
                className={cn(
                  "text-destructive",
                  isMobile ? "text-xs" : "text-sm"
                )}
              >
                {errors.address.street.message}
              </p>
            )}
          </div>

          {/* City and Province Row */}
          <div
            className={cn(
              "gap-4",
              isMobile
                ? "grid grid-cols-1 space-y-3"
                : "grid grid-cols-1 md:grid-cols-2"
            )}
          >
            {/* City */}
            <div className={cn(isMobile ? "space-y-1" : "space-y-2")}>
              <Label
                htmlFor="city"
                className={cn(isMobile ? "text-sm font-medium" : "")}
              >
                Ciudad *
              </Label>
              <Input
                id="city"
                {...getInputProps("text")}
                placeholder="Ej: Santo Domingo"
                value={watchedAddress?.city || ""}
                onChange={(e) =>
                  handleAddressInputChange("city", e.target.value)
                }
                className={cn(
                  errors.address?.city && "border-destructive",
                  isMobile && mobileClasses.mobileInput
                )}
              />
              {errors.address?.city && (
                <p
                  className={cn(
                    "text-destructive",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  {errors.address.city.message}
                </p>
              )}
            </div>

            {/* Province */}
            <div className={cn(isMobile ? "space-y-1" : "space-y-2")}>
              <Label
                htmlFor="province"
                className={cn(isMobile ? "text-sm font-medium" : "")}
              >
                Provincia *
              </Label>
              <Select
                value={watchedAddress?.province || ""}
                onValueChange={(value) =>
                  handleAddressInputChange("province", value)
                }
              >
                <SelectTrigger
                  className={cn(
                    errors.address?.province && "border-destructive",
                    isMobile && mobileClasses.mobileInput
                  )}
                >
                  <SelectValue placeholder="Selecciona una provincia" />
                </SelectTrigger>
                <SelectContent>
                  {DOMINICAN_PROVINCES.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.address?.province && (
                <p
                  className={cn(
                    "text-destructive",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  {errors.address.province.message}
                </p>
              )}
            </div>
          </div>

          {/* Postal Code */}
          <div className={cn(isMobile ? "space-y-1" : "space-y-2")}>
            <Label
              htmlFor="postalCode"
              className={cn(isMobile ? "text-sm font-medium" : "")}
            >
              Código Postal
            </Label>
            <Input
              id="postalCode"
              {...getInputProps("text")}
              placeholder="Ej: 10101"
              value={watchedAddress?.postalCode || ""}
              onChange={(e) =>
                handleAddressInputChange("postalCode", e.target.value)
              }
              className={cn(isMobile && mobileClasses.mobileInput)}
            />
          </div>

          {/* Geocode Button */}
          <div
            className={cn(
              isMobile
                ? "flex flex-col space-y-2"
                : "flex items-center space-x-4"
            )}
          >
            <Button
              type="button"
              variant="outline"
              onClick={geocodeAddress}
              disabled={
                isGeocoding || !watchedAddress?.street || !watchedAddress?.city
              }
              className={cn(
                "flex items-center space-x-2",
                isMobile && `${mobileClasses.touchButton} w-full min-h-[48px]`
              )}
            >
              <Search
                className={cn(
                  isGeocoding && "animate-spin",
                  isMobile ? "w-5 h-5" : "w-4 h-4"
                )}
              />
              <span className={cn(isMobile ? "text-base" : "text-sm")}>
                {isGeocoding ? "Buscando..." : "Buscar en el Mapa"}
              </span>
            </Button>

            {geocodingError && (
              <Alert
                variant="destructive"
                className={cn(isMobile ? "w-full" : "flex-1")}
              >
                <AlertCircle className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
                <AlertDescription
                  className={cn(isMobile ? "text-sm" : "text-xs")}
                >
                  {geocodingError}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Formatted Address Display */}
          {watchedAddress?.formattedAddress && (
            <div
              className={cn("bg-muted rounded-lg", isMobile ? "p-2" : "p-3")}
            >
              <Label
                className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}
              >
                Dirección Completa
              </Label>
              <p
                className={cn(
                  "text-muted-foreground mt-1",
                  isMobile ? "text-xs" : "text-sm"
                )}
              >
                {watchedAddress.formattedAddress}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div
        className={cn(
          isMobile ? "flex flex-col space-y-3 pt-4" : "flex justify-between"
        )}
      >
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isLoading}
          className={cn(
            isMobile &&
              `${mobileClasses.touchButton} w-full min-h-[48px] text-base order-2`
          )}
        >
          <ChevronLeft
            className={cn("mr-2", isMobile ? "w-5 h-5" : "w-4 h-4")}
          />
          Anterior
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          disabled={isLoading || !isValid}
          className={cn(
            isMobile &&
              `${mobileClasses.touchButton} w-full min-h-[48px] text-base order-1`
          )}
        >
          Siguiente
          <ChevronRight
            className={cn("ml-2", isMobile ? "w-5 h-5" : "w-4 h-4")}
          />
        </Button>
      </div>
    </form>
  );
}
