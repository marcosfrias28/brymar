"use client";

import { LocationTest } from "@/components/wizard/shared/location-test";

export default function LocationDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Debug: Location Picker</h1>
      <LocationTest />
    </div>
  );
}
