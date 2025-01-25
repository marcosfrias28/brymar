"use client";

import { useActionState, useEffect, useState } from "react";
import { useLangStore } from "@/utils/store/lang-store";
import { PropertySearchTranslations as translations } from "@/lib/translations";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { searchProperties } from "@/lib/actions/property-actions";
import { ActionState } from "@/lib/validations";
import { PropertyMap } from "@/components/property/property-map";
import { SearchFilters } from "@/components/search-filters";
import { PropertyCard } from "@/components/property/property-card";
import { Property } from "@/utils/types/types";

export default function PropertySearch() {
  const language = useLangStore((state) => state.language);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    searchProperties,
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

  if (!language || !translations[language]) return null;

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {t.filters.propertyCount.replace(
                "{count}",
                state?.properties?.length?.toString() || "0"
              )}
            </h1>
            <Select defaultValue="recent">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t.filters.mostRecent} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">{t.filters.mostRecent}</SelectItem>
                {/* Add more sort options as needed */}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Layout */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Left Column - Map (Desktop Only) */}
            <div className="hidden lg:block h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm">
              <PropertyMap />
            </div>

            {/* Right Column - Search and Results */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <SearchFilters
                  translations={translations[language]}
                  onSubmit={formAction}
                  isPending={isPending}
                  onViewChange={setView}
                  view={view}
                />
              </div>

              {state?.properties?.length > 0 && (
                <h2 className="text-lg font-semibold">
                  {t.filters.resultsFound.replace(
                    "{count}",
                    state?.properties?.length?.toString()
                  )}
                </h2>
              )}

              {/* Results */}
              <div
                className={
                  view === "grid" ? "grid gap-4 md:grid-cols-2" : "space-y-4"
                }
              >
                {state?.properties?.map((property: Property) => (
                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    sqm={property.sqm}
                    imageUrl={property.imageUrl}
                    title={property.title}
                    location={property.location}
                    bedrooms={property.bedrooms}
                    bathrooms={property.bathrooms}
                    price={property.price}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
