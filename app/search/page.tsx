"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { searchPropertiesAction } from "@/app/actions/property-actions";
import { ActionState } from "@/lib/validations";
import { PropertyMap } from "@/components/property/property-map";
import { SearchFilters } from "@/components/search-filters";
import { PropertyCard } from "@/components/properties/property-card";
import { Property } from "@/utils/types/types";

export default function PropertySearch() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    searchPropertiesAction,
    {
      error: "",
    }
  );
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state?.error]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {`${state?.properties?.length || 0} propiedades encontradas`}
            </h1>
            <div className="flex items-center gap-2">
              <Select value={view} onValueChange={(value: "grid" | "list") => setView(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Cuadrícula</SelectItem>
                  <SelectItem value="list">Lista</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <SearchFilters formAction={formAction} isPending={isPending} />
            </div>

            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="order-2 xl:order-1">
                  {state?.properties && state.properties.length > 0 ? (
                    <div
                      className={cn(
                        "grid gap-4",
                        view === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                      )}
                    >
                      {state.properties.map((property: Property) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          variant={view === "list" ? "horizontal" : "vertical"}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No se encontraron propiedades</p>
                    </div>
                  )}
                </div>

                <div className="order-1 xl:order-2">
                  <div className="sticky top-4">
                    <PropertyMap properties={state?.properties || []} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}