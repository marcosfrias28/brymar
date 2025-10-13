"use client";

import React, { useState } from "react";
import { SimpleLocationPicker, SimpleLocationData } from "./simple-location-picker";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LocationTest() {
  const [locationData, setLocationData] = useState<SimpleLocationData>({
    location: "",
    coordinates: undefined,
    address: undefined,
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test de Ubicación Simple</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleLocationPicker
            data={locationData}
            onUpdate={(data) => {
              setLocationData((prev) => ({ ...prev, ...data }));
            }}
            title="Ubicación de Prueba"
            description="Prueba el selector de ubicación simple"
          />

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Datos actuales:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(locationData, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
