import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary/30 selection:text-foreground",
        "flex h-10 w-full min-w-0 rounded-full border border-border bg-background px-4 py-2 text-base",
        "transition-all duration-200 outline-none ring-offset-background",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "dark:bg-input/30 dark:border-input/50 dark:focus:border-primary/50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
