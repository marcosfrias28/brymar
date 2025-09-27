"use client";

import { memo, useMemo } from "react";
import { PageHeader } from "./page-header";
import { ContentGrid } from "./content-grid";
import { DashboardPageLayoutProps } from "@/types/layout";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/ui/page-transition";
import { useResponsive } from "@/hooks/use-responsive";
import { ariaLabels } from "@/lib/utils/accessibility";

export const DashboardPageLayout = memo(function DashboardPageLayout({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  sidebar,
  className,
  contentClassName,
  showSearch = false,
  searchPlaceholder = "Buscar...",
}: DashboardPageLayoutProps) {
  const { isMobile, isTablet, isMobileOrTablet } = useResponsive();

  // Memoize computed classes to prevent unnecessary recalculations
  const containerClasses = useMemo(
    () =>
      cn(
        "flex-1 space-y-4 max-w-full",
        // Mobile-first responsive padding
        "p-3 sm:p-4 md:p-6 lg:p-8",
        // Adjust spacing based on screen size
        isMobile && "space-y-3",
        isTablet && "space-y-4",
        !isMobileOrTablet && "space-y-6"
      ),
    [isMobile, isTablet, isMobileOrTablet]
  );

  const mainContentClasses = useMemo(
    () => cn("flex-1 w-full", contentClassName),
    [contentClassName]
  );

  return (
    <PageTransition
      variant="fade"
      className={cn("flex flex-col min-h-screen bg-background", className)}
    >
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:ring-2 focus:ring-secondary focus:ring-offset-2"
      >
        {ariaLabels.skipToContent}
      </a>

      {/* Page Container with responsive padding */}
      <div className={containerClasses}>
        {/* Page Header */}
        <PageTransition variant="slideDown" delay={1}>
          <header role="banner">
            <PageHeader
              title={title}
              description={description}
              breadcrumbs={breadcrumbs}
              actions={actions}
              showSearch={showSearch}
              searchPlaceholder={searchPlaceholder}
            />
          </header>
        </PageTransition>

        {/* Page Content */}
        <PageTransition variant="slideUp" delay={2}>
          <main
            id="main-content"
            role="main"
            aria-label={`${title} - Contenido principal`}
            className={mainContentClasses}
          >
            <ContentGrid
              layout={sidebar ? "two-column" : "single"}
              sidebar={sidebar}
            >
              {children}
            </ContentGrid>
          </main>
        </PageTransition>
      </div>
    </PageTransition>
  );
});
