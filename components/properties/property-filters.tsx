"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";
import { cn } from "@/lib/utils";

interface PropertyFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  properties: any[];
}

export function PropertyFilters({
  searchTerm,
  onSearchChange,
  properties,
}: PropertyFiltersProps) {
  const locations = [
    ...new Set(properties.map((p) => p.location).filter(Boolean)),
  ];
  const totalProperties = properties.length;

  return (
    <Card
      className={cn(
        "border shadow-sm transition-all duration-200",
        secondaryColorClasses.cardHover
      )}
    >
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar propiedades por título o ubicación..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn("pl-10", secondaryColorClasses.inputFocus)}
            />
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className={secondaryColorClasses.badge}>
              {totalProperties} propiedades
            </Badge>
            {locations.slice(0, 3).map((location) => (
              <Badge
                key={location}
                variant="outline"
                className={cn("text-xs", secondaryColorClasses.interactive)}
              >
                {location}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
