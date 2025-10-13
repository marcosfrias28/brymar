"use client";

import React from "react";
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface WizardStepLayoutProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function WizardStepLayout({
  title,
  description,
  icon,
  children,
  className,
  headerClassName,
  contentClassName,
}: WizardStepLayoutProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Section */}
      <div className={cn("space-y-3", headerClassName)}>
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <Separator />
      </div>

      {/* Content Section */}
      <div className={cn("space-y-6", contentClassName)}>
        {children}
      </div>
    </div>
  );
}