"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  secondaryColorClasses,
  badgeVariants,
  interactiveClasses,
} from '@/lib/utils/secondary-colors';

interface LandFiltersProps {
  currentFilter:
    | "all"
    | "commercial"
    | "residential"
    | "agricultural"
    | "beachfront";
  onFilterChange: (
    filter: "all" | "commercial" | "residential" | "agricultural" | "beachfront"
  ) => void;
  totalCount: number;
}

export function LandFilters({
  currentFilter,
  onFilterChange,
  totalCount,
}: LandFiltersProps) {
  const filters = [
    {
      label: "Todos",
      value: "all" as const,
      count: totalCount,
    },
    {
      label: "Comerciales",
      value: "commercial" as const,
      count: 0, // This would be calculated from actual data
    },
    {
      label: "Residenciales",
      value: "residential" as const,
      count: 0, // This would be calculated from actual data
    },
    {
      label: "Agrícolas",
      value: "agricultural" as const,
      count: 0, // This would be calculated from actual data
    },
    {
      label: "Frente al Mar",
      value: "beachfront" as const,
      count: 0, // This would be calculated from actual data
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = currentFilter === filter.value;
        return (
          <Button
            key={filter.value}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              "transition-all duration-200",
              isActive
                ? cn(
                    "bg-arsenic hover:bg-blackCoral text-white",
                    secondaryColorClasses.focusRing
                  )
                : cn(
                    "border-blackCoral/30 text-blackCoral hover:bg-blackCoral hover:text-white",
                    secondaryColorClasses.accentHover,
                    interactiveClasses.button
                  )
            )}
          >
            {filter.label}
            {filter.count > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  "ml-2 text-xs",
                  isActive
                    ? "bg-white/20 text-white"
                    : badgeVariants.secondarySubtle
                )}
              >
                {filter.count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}
