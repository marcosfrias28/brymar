"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";
import type { StatCard } from "@/types/layout";

export type UnifiedStatsCardProps = {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  description?: string;
  change?: string;
  loading?: boolean;
};

function StatsCard({ stat, loading = false }: { stat: UnifiedStatsCardProps; loading?: boolean }) {
  const { title, value, icon: Icon, color = "bg-primary", description, change } = stat;

  if (loading) {
    return (
      <Card className="border-border shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="mb-2 h-8 w-16 animate-pulse rounded bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border shadow-lg transition-all duration-200 hover:border-secondary/20 hover:shadow-xl", secondaryColorClasses.cardHover)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-muted-foreground text-sm">
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn("rounded-lg p-2", color)}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl text-foreground">{value}</div>
        {change && (
          <p className="mt-1 text-muted-foreground text-xs">
            <span className="rounded-full bg-secondary/20 px-1.5 py-0.5 font-medium text-secondary-foreground">
              {change}
            </span>{" "}
            {description || "desde el mes pasado"}
          </p>
        )}
        {description && !change && (
          <p className="mt-1 text-muted-foreground text-xs">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export type UnifiedStatsCardsProps = {
  stats: UnifiedStatsCardProps[];
  loading?: boolean;
  className?: string;
  gridCols?: {
    default?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
};

export function UnifiedStatsCards({
  stats,
  loading = false,
  className = "",
  gridCols = {
    default: "2",
    sm: "2",
    md: "3",
    lg: "4",
    xl: "4",
  },
}: UnifiedStatsCardsProps) {
  const gridClasses = cn(
    "grid gap-4",
    `grid-cols-${gridCols.default || "2"}`,
    gridCols.sm && `sm:grid-cols-${gridCols.sm}`,
    gridCols.md && `md:grid-cols-${gridCols.md}`,
    gridCols.lg && `lg:grid-cols-${gridCols.lg}`,
    gridCols.xl && `xl:grid-cols-${gridCols.xl}`,
    className
  );

  return (
    <div className={gridClasses}>
      {stats.map((stat, index) => (
        <StatsCard key={index} loading={loading} stat={stat} />
      ))}
    </div>
  );
}