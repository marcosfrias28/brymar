import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex shrink-0 touch-manipulation items-center justify-center gap-2 whitespace-nowrap font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-80 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
				destructive:
					"rounded-full bg-destructive text-white shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
				outline:
					"rounded-full border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground dark:bg-transparent dark:hover:bg-accent/50",
				secondary:
					"rounded-full bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
				ghost:
					"rounded-full hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-6 py-2.5 font-semibold text-base has-[>svg]:px-4",
				sm: "h-9 gap-1.5 rounded-full px-4 font-medium text-sm has-[>svg]:px-3",
				lg: "h-12 rounded-full px-8 font-semibold text-base has-[>svg]:px-6",
				icon: "size-10 rounded-full",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }))}
			data-slot="button"
			{...props}
		/>
	);
}

export { Button, buttonVariants };
