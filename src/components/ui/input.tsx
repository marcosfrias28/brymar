import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			className={cn(
				"selection:bg-primary/30 selection:text-foreground file:text-foreground placeholder:text-muted-foreground/60",
				"flex h-10 w-full min-w-0 rounded-full border border-border bg-background px-4 py-2 text-base",
				"outline-none ring-offset-background transition-all duration-200",
				"file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-sm",
				"disabled:pointer-events-none disabled:opacity-50",
				"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
				"dark:border-input/50 dark:bg-input/30 dark:focus:border-primary/50",
				className
			)}
			data-slot="input"
			type={type}
			{...props}
		/>
	);
}

export { Input };
