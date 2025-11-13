import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PillContainerProps = {
	children: ReactNode;
	className?: string;
};

export function PillContainer({ children, className }: PillContainerProps) {
	return (
		<div
			className={cn("flex items-center justify-center gap-2 p-1.5", className)}
		>
			{children}
		</div>
	);
}

type PillLinkProps = {
	children: ReactNode;
	isActive?: boolean;
	className?: string;
};

export function PillLink({
	children,
	isActive = false,
	className,
}: PillLinkProps) {
	return (
		<div
			className={cn(
				"whitespace-nowrap rounded-full px-3 py-2 text-center font-medium text-sm transition-all",
				isActive ? "bg-primary text-foreground" : "text-foreground",
				className
			)}
		>
			{children}
		</div>
	);
}
