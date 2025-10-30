import { cn } from "@/lib/utils";

function Skeleton({
	className,
	variant = "default",
	...props
}: React.ComponentProps<"div"> & {
	variant?: "default" | "secondary" | "shimmer";
}) {
	const variants = {
		default: "bg-muted animate-pulse",
		secondary: "bg-secondary/20 animate-pulse border border-secondary/30",
		shimmer:
			"bg-gradient-to-r from-muted via-secondary/20 to-muted animate-pulse",
	};

	return (
		<div
			className={cn("rounded-md", variants[variant], className)}
			data-slot="skeleton"
			{...props}
		/>
	);
}

export { Skeleton };
