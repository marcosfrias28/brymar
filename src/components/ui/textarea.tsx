import type * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground/60 selection:bg-primary/30 selection:text-foreground",
        "flex min-h-[120px] w-full rounded-2xl border border-border bg-background px-4 py-2 text-base",
        "transition-all duration-200 outline-none ring-offset-background resize-none",
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

export { Textarea };
