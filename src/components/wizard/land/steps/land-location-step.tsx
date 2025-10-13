"use client";

import React from "react";
import { WizardStepProps } from '@/types/wizard-core';
import { LandWizardData } from '@/types/land-wizard';
import {
  LocationPickerStep,
  LocationData,
} from '@/components/wizard/shared/location-picker-step';

export function LandLocationStep({
  data,
  onUpdate,
  onNext,
  errors,
  isLoading,
}: WizardStepProps<LandWizardData>) {
  const locationData: LocationData = {
    location: data.location || "",
    coordinates: data.coordinates
      ? {
          lat: data.coordinates.latitude,
          lng: data.coordinates.longitude,
        }
      : undefined,
    address: data.address,
    accessRoads: data.accessRoads,
    nearbyLandmarks: data.nearbyLandmarks,
  };

  const handleLocationUpdate = (updates: Partial<LocationData>) => {
    const convertedUpdates = {
      ...updates,
      coordinates: updates.coordinates
        ? {
            latitude: updates.coordinates.lat,
            longitude: updates.coordinates.lng,
          }
        : updates.coordinates,
      address: updates.address
        ? {
            ...updates.address,
            country: "Dominican Republic" as const,
          }
        : updates.address,
    };
    onUpdate(convertedUpdates);
  };

  return (
    <LocationPickerStep
      data={locationData}
      onUpdate={handleLocationUpdate}
      title="Ubicación del Terreno"
      description="Proporciona la ubicación exacta y detalles de acceso del terreno"
      showAccessRoads={true}
      showLandmarks={true}
      showCoordinates={true}
      errors={errors}
    />
  );
}
