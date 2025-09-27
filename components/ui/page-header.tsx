"use client";

import { cn } from "@/lib/utils";
import { PageHeaderProps } from "@/types/layout";
import { Breadcrumb } from "./breadcrumb";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { useResponsive } from "@/hooks/use-responsive";
import { TouchTarget } from "./touch-target";
import { ariaLabels, focusRingClasses } from "@/lib/utils/accessibility";

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  showSearch = false,
  searchPlaceholder = "Buscar...",
  className,
}: PageHeaderProps) {
  const autoBreadcrumbs = useBreadcrumbs();
  const displayBreadcrumbs = breadcrumbs || autoBreadcrumbs;
  const { isMobile, isTablet, isMobileOrTablet } = useResponsive();

  return (
    <div
      className={cn(
        "border-b border-border/40",
        // Responsive spacing and padding
        isMobile
          ? "space-y-3 pb-4"
          : isTablet
          ? "space-y-3 pb-5"
          : "space-y-4 pb-6",
        className
      )}
    >
      {/* Breadcrumbs */}
      {displayBreadcrumbs.length > 0 && (
        <Breadcrumb items={displayBreadcrumbs} />
      )}

      {/* Header Content */}
      <div
        className={cn(
          "flex flex-col gap-3 sm:gap-4",
          // Better responsive layout
          isMobileOrTablet
            ? "space-y-3"
            : "sm:flex-row sm:items-start sm:justify-between"
        )}
      >
        <div className={cn("flex-1", isMobile ? "space-y-1" : "space-y-2")}>
          <h1
            className={cn(
              "font-bold font-serif tracking-tight text-foreground",
              // Responsive title sizing
              isMobile
                ? "text-2xl"
                : isTablet
                ? "text-2xl sm:text-3xl"
                : "text-3xl"
            )}
          >
            {title}
          </h1>
          {description && (
            <p
              className={cn(
                "text-muted-foreground max-w-2xl leading-relaxed",
                // Responsive description sizing
                isMobile ? "text-sm" : "text-base"
              )}
            >
              {description}
            </p>
          )}
        </div>

        {/* Actions Area */}
        {actions && (
          <div
            className={cn(
              "flex items-center flex-shrink-0",
              // Better mobile layout for actions
              isMobileOrTablet ? "gap-2 flex-wrap" : "gap-2",
              // Full width on mobile for better touch targets
              isMobile && "w-full justify-start"
            )}
          >
            <TouchTarget asChild>{actions}</TouchTarget>
          </div>
        )}
      </div>

      {/* Search Bar (if enabled) */}
      {showSearch && (
        <div className={cn(isMobile ? "w-full" : "max-w-md")}>
          <label htmlFor="page-search" className="sr-only">
            {ariaLabels.search}
          </label>
          <TouchTarget asChild>
            <input
              id="page-search"
              type="search"
              placeholder={searchPlaceholder}
              aria-label={ariaLabels.search}
              className={cn(
                "w-full border border-input rounded-md bg-background placeholder:text-muted-foreground",
                focusRingClasses.input,
                "transition-colors duration-200",
                // Enhanced touch targets
                isMobile ? "px-4 py-3 text-base" : "px-3 py-2 text-sm",
                // Prevent zoom on iOS
                "text-[16px] sm:text-sm"
              )}
            />
          </TouchTarget>
        </div>
      )}
    </div>
  );
}
