"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { BreadcrumbItem } from '@/types/layout';
import { cn } from '@/lib/utils';
import { secondaryColorClasses } from '@/lib/utils/secondary-colors';
import { useResponsive } from '@/hooks/use-responsive';
import { TouchTarget } from "./touch-target";
import { ariaLabels, focusRingClasses } from '@/lib/utils/accessibility';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const { isMobile, isTablet } = useResponsive();

  // Limit items on mobile for better UX
  const displayItems =
    isMobile && items.length > 2
      ? [items[items.length - 2], items[items.length - 1]]
      : items;

  return (
    <nav
      className={cn(
        "flex items-center",
        // Responsive spacing and text size
        isMobile ? "space-x-0.5 text-xs" : "space-x-1 text-sm",
        className
      )}
      aria-label={ariaLabels.breadcrumbNavigation}
      role="navigation"
    >
      <ol className="flex items-center space-x-1">
        {/* Home link - hide on mobile if we have items */}
        {(!isMobile || items.length === 0) && (
          <li>
            <TouchTarget asChild>
              <Link
                href="/dashboard"
                aria-label="Ir al Dashboard"
                className={cn(
                  "flex items-center text-muted-foreground transition-colors rounded-md",
                  secondaryColorClasses.navHover,
                  "hover:text-foreground",
                  focusRingClasses.default,
                  // Enhanced touch targets
                  isMobile ? "px-2 py-2 min-h-[36px]" : "px-2 py-1"
                )}
              >
                <Home
                  className={cn(isMobile ? "h-4 w-4" : "h-4 w-4")}
                  aria-hidden="true"
                />
                <span className="sr-only">Dashboard</span>
              </Link>
            </TouchTarget>
          </li>
        )}

        {displayItems.map((item, index) => (
          <li
            key={index}
            className={cn(
              "flex items-center",
              isMobile ? "space-x-0.5" : "space-x-1"
            )}
          >
            <ChevronRight
              className={cn(
                "text-muted-foreground",
                isMobile ? "h-3 w-3" : "h-4 w-4"
              )}
            />
            {item.href ? (
              <TouchTarget asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center text-muted-foreground transition-colors rounded-md",
                    secondaryColorClasses.navHover,
                    "hover:text-foreground focus-visible:outline-none",
                    secondaryColorClasses.focusRing,
                    // Responsive spacing and touch targets
                    isMobile
                      ? "space-x-1 px-2 py-2 min-h-[36px]"
                      : "space-x-1 px-2 py-1"
                  )}
                >
                  {item.icon && (
                    <item.icon
                      className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")}
                    />
                  )}
                  <span className="truncate max-w-[100px] sm:max-w-none">
                    {item.label}
                  </span>
                </Link>
              </TouchTarget>
            ) : (
              <div
                className={cn(
                  "flex items-center text-foreground font-medium rounded-md",
                  secondaryColorClasses.accent,
                  // Responsive spacing
                  isMobile ? "space-x-1 px-2 py-2" : "space-x-1 px-2 py-1"
                )}
              >
                {item.icon && (
                  <item.icon className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                )}
                <span className="truncate max-w-[100px] sm:max-w-none">
                  {item.label}
                </span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
