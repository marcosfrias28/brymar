import type * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			className={cn(
				"selection:bg-primary/30 selection:text-foreground file:text-foreground placeholder:text-muted-foreground/60",
				"flex h-11 w-full min-w-0 rounded-xl border-2 border-border bg-card px-4 py-2.5 text-base",
				"outline-none ring-offset-background transition-all duration-200",
				"file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-sm",
				"disabled:pointer-events-none disabled:opacity-50",
				"hover:border-primary/40",
				"focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20",
				"aria-invalid:border-destructive aria-invalid:ring-destructive/20",
				className
			)}
			data-slot="input"
			type={type}
			{...props}
		/>
	);
}

export { Input };
