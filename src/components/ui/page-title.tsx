"use client";

import { cn } from '@/lib/utils';
import { ReactNode } from "react";

interface PageTitleProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function PageTitle({
  title,
  description,
  children,
  className,
  size = "lg",
}: PageTitleProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h1
        className={cn(
          "font-bold font-serif tracking-tight text-foreground",
          size === "sm" && "text-xl",
          size === "md" && "text-2xl",
          size === "lg" && "text-3xl",
          size === "xl" && "text-4xl"
        )}
      >
        {title}
      </h1>

      {description && (
        <p
          className={cn(
            "text-muted-foreground leading-relaxed",
            size === "sm" && "text-sm max-w-lg",
            size === "md" && "text-base max-w-xl",
            size === "lg" && "text-base max-w-2xl",
            size === "xl" && "text-lg max-w-3xl"
          )}
        >
          {description}
        </p>
      )}

      {children && <div className="pt-2">{children}</div>}
    </div>
  );
}
