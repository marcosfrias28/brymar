import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const actionButtonVariants = cva(
	"inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				primary:
					"bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:border-secondary focus-visible:ring-secondary/50",
				secondary:
					"bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 focus-visible:border-secondary focus-visible:ring-secondary/50",
				"secondary-outline":
					"border border-secondary bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 focus-visible:border-secondary focus-visible:ring-secondary/50",
				destructive:
					"bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
				outline:
					"border bg-background shadow-xs hover:border-secondary/30 hover:bg-accent hover:text-accent-foreground focus-visible:border-secondary focus-visible:ring-secondary/50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
				ghost:
					"hover:bg-secondary/10 hover:text-secondary-foreground focus-visible:ring-secondary/50 dark:hover:bg-secondary/20",
				link: "text-secondary-foreground underline-offset-4 hover:underline focus-visible:ring-secondary/50",
			},
			size: {
				sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				icon: "size-9",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "default",
		},
	}
);

interface ActionButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof actionButtonVariants> {
	asChild?: boolean;
	loading?: boolean;
	icon?: React.ReactNode;
	iconPosition?: "left" | "right";
}

const ActionButton = ({
	className,
	variant,
	size,
	asChild = false,
	loading = false,
	icon,
	iconPosition = "left",
	children,
	disabled,
	ref,
	...props
}: ActionButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) => {
	const Comp = asChild ? Slot : "button";

	const isDisabled = disabled || loading;

	return (
		<Comp
			className={cn(actionButtonVariants({ variant, size }), className)}
			disabled={isDisabled}
			ref={ref}
			{...props}
		>
			{loading && (
				<svg
					className="size-4 animate-spin"
					fill="none"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						fill="currentColor"
					/>
				</svg>
			)}
			{!loading && icon && iconPosition === "left" && icon}
			{children}
			{!loading && icon && iconPosition === "right" && icon}
		</Comp>
	);
};

ActionButton.displayName = "ActionButton";

export { ActionButton, actionButtonVariants };
export type { ActionButtonProps };
