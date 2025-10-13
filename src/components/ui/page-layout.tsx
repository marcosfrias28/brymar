"use client";

import { cn } from '@/lib/utils';
import { ReactNode } from "react";
import { PageHeader } from "./page-header";
import { BackButton } from "./back-button";
import { ActionButtons } from "./action-buttons";
import { BreadcrumbItem } from '@/types/layout';

interface PageLayoutProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children: ReactNode;
  showBackButton?: boolean;
  backButtonHref?: string;
  backButtonLabel?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
}

export function PageLayout({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  showBackButton = false,
  backButtonHref,
  backButtonLabel,
  showSearch = false,
  searchPlaceholder,
  className,
  contentClassName,
  headerClassName,
}: PageLayoutProps) {
  // Combine back button with other actions
  const combinedActions = (
    <ActionButtons>
      {showBackButton && (
        <BackButton
          href={backButtonHref}
          label={backButtonLabel}
          variant="button"
        />
      )}
      {actions}
    </ActionButtons>
  );

  return (
    <div className={cn("space-y-6", className)}>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={combinedActions}
        showSearch={showSearch}
        searchPlaceholder={searchPlaceholder}
        className={headerClassName}
      />

      <div className={cn("space-y-6", contentClassName)}>{children}</div>
    </div>
  );
}
