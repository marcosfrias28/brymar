"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ActionButtonsProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  spacing?: "compact" | "normal" | "relaxed";
}

export function ActionButtons({
  children,
  className,
  align = "right",
  spacing = "normal",
}: ActionButtonsProps) {
  return (
    <div
      className={cn(
        "flex items-center flex-wrap",
        // Alignment
        align === "left" && "justify-start",
        align === "right" && "justify-end",
        align === "center" && "justify-center",
        // Spacing
        spacing === "compact" && "gap-1",
        spacing === "normal" && "gap-2",
        spacing === "relaxed" && "gap-3",
        className
      )}
    >
      {children}
    </div>
  );
}
