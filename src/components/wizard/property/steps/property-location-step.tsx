// Property Location Step for New Framework

"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WizardStepProps } from '@/types/wizard-core';
import {
  PropertyWizardData,
  Coordinates,
  Address,
} from '@/types/property-wizard';
import { PropertyLocationSchema } from '@/lib/schemas/property-wizard-schemas';
import { mapService, DOMINICAN_PROVINCES } from '@/lib/services/map-service';
import { useMobileFormOptimization } from '@/hooks/use-mobile-responsive';
import { mobileClasses } from '@/lib/utils/mobile-utils';
import { InteractiveMap } from '@/components/wizard/shared/interactive-map';
import { SimpleLocationPicker } from '@/components/wizard/shared/simple-location-picker';
import { MapErrorBoundary } from '@/components/wizard/shared/map-error-boundary';
import {
  WizardStepLayout,
  WizardFormSection,
  WizardFormField,
} from '@/components/wizard/shared/consistent-navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  AlertCircle,
} from "lucide-react";
import { cn } from '@/lib/utils';

interface LocationFormData {
  coordinates?: Coordinates;
  address?: Address;
}

export function PropertyLocationStep({
  data,
  onUpdate,
  onNext,
  onPrevious,
  isLoading,
  isMobile = false,
}: WizardStepProps<PropertyWizardData>) {
  // Static Spanish text instead of translations
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [useSimpleMap, setUseSimpleMap] = useState(false);

  // Mobile form optimization
  const { getInputProps } = useMobileFormOptimization();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    trigger,
  } = useForm<LocationFormData>({
    resolver: zodResolver(PropertyLocationSchema),
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
    const formData: Partial<PropertyWizardData> = {};
    if (watchedCoordinates) {
      formData.coordinates = watchedCoordinates;
    }
    if (watchedAddress) {
      formData.address = watchedAddress;
    }
    onUpdate(formData);
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
      const currentAddress = watchedAddress || ({} as Partial<Address>);
      const updatedAddress: Address = {
        street: currentAddress.street || "",
        city: currentAddress.city || "",
        province: currentAddress.province || "",
        country: currentAddress.country || "Dominican Republic",
        formattedAddress: currentAddress.formattedAddress || "",
        postalCode: currentAddress.postalCode,
        [field]: value,
      };

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
    if (!address?.street || !address?.city) {
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

  // If simple map is requested or InteractiveMap fails, use SimpleLocationPicker
  if (useSimpleMap) {
    return (
      <div className={cn(isMobile ? "space-y-4" : "space-y-6")}>
        <SimpleLocationPicker
          data={{
            location: data.address?.formattedAddress || "",
            coordinates: data.coordinates
              ? {
                  lat: data.coordinates.latitude,
                  lng: data.coordinates.longitude,
                }
              : undefined,
            address: data.address,
          }}
          onUpdate={(locationData) => {
            const updateData: Partial<PropertyWizardData> = {};

            if (locationData.coordinates) {
              updateData.coordinates = {
                latitude: locationData.coordinates.lat,
                longitude: locationData.coordinates.lng,
              };
            }

            if (locationData.address) {
              // Ensure street is not undefined to match Address type
              const address = {
                ...locationData.address,
                street: locationData.address.street || ""
              };
              updateData.address = address;
            }

            onUpdate(updateData);
          }}
          title="Ubicación de la Propiedad"
          description="Proporciona la ubicación exacta de la propiedad"
          errors={{}}  // Pass empty object since SimpleLocationPicker expects Record<string, string>
        />

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
            disabled={isLoading}
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
      </div>
    );
  }

  return (
    <WizardStepLayout
      title="Ubicación de la Propiedad"
      description="Proporciona la ubicación exacta de tu propiedad"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Interactive Map Section */}
        <WizardFormSection
          title="Ubicación en el Mapa"
          icon={<MapPin className="w-5 h-5" />}
        >
          <div
            className={cn(
              "flex items-center justify-between mb-4",
              isMobile ? "space-x-1" : "space-x-2"
            )}
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUseSimpleMap(true)}
              className="text-xs"
            >
              Usar mapa simple
            </Button>
          </div>

          <MapErrorBoundary onUseSimple={() => setUseSimpleMap(true)}>
            <InteractiveMap
              coordinates={watchedCoordinates}
              onCoordinatesChange={handleCoordinatesChange}
              onAddressChange={handleAddressChange}
              height={isMobile ? "300px" : "400px"}
              className={cn(isMobile && "rounded-lg overflow-hidden")}
            />
          </MapErrorBoundary>

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
        </WizardFormSection>

        {/* Address Form Section */}
        <WizardFormSection
          title="Dirección de la Propiedad"
          icon={<Search className="w-5 h-5" />}
        >
          {/* Street Address */}
          <WizardFormField
            label="Calle"
            required
            error={errors.address?.street?.message}
          >
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
          </WizardFormField>

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
            <WizardFormField
              label="Ciudad"
              required
              error={errors.address?.city?.message}
            >
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
            </WizardFormField>

            {/* Province */}
            <WizardFormField
              label="Provincia"
              required
              error={errors.address?.province?.message}
            >
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
            </WizardFormField>
          </div>

          {/* Postal Code */}
          <WizardFormField label="Código Postal">
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
          </WizardFormField>

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
                isGeocoding ||
                !watchedAddress?.street ||
                !watchedAddress?.city
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
                <AlertCircle
                  className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")}
                />
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
                className={cn(
                  "font-medium",
                  isMobile ? "text-xs" : "text-sm"
                )}
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
        </WizardFormSection>

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
            disabled={isLoading}
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
    </WizardStepLayout>
  );
}
