"use client";

import { PageHeader } from "@/components/sections/page-header";
import { PropertyCard } from "@/components/properties/property-card";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { InlineErrorState } from "@/components/ui/error-states";
import { Home } from "lucide-react";
import { useProperties } from "@/presentation/hooks/use-properties";

export default function PropertiesPage() {
  const { properties, loading, error, refetch } = useProperties();

  if (loading) {
    return (
      <>
        <PageHeader
          title="Properties"
          subtitle="Experience elegance and comfort with our exclusive luxury villas, designed for sophisticated living."
          icon={<Home className="w-5 h-5 text-primary" />}
        />
        <section className="pt-0! relative">
          <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center space-y-4">
                <LoadingSpinner />
                <p className="text-muted-foreground">Loading properties...</p>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader
          title="Properties"
          subtitle="Experience elegance and comfort with our exclusive luxury villas, designed for sophisticated living."
          icon={<Home className="w-5 h-5 text-primary" />}
        />
        <section className="pt-0! relative">
          <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
            <div className="flex items-center justify-center py-20">
              <InlineErrorState message={error} onRetry={refetch} />
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Properties"
        subtitle="Experience elegance and comfort with our exclusive luxury villas, designed for sophisticated living."
        icon={<Home className="w-5 h-5 text-primary" />}
      />

      <section className="pt-0! relative">
        {/* Elementi decorativi con colore secondario */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-secondary/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-secondary/8 rounded-full blur-xl"></div>

        <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
          {properties.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-muted-foreground">
                <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  No properties found
                </h3>
                <p>There are currently no properties available.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {properties.map((property) => (
                <PropertyCard
                  key={property.getId().value}
                  property={property}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
