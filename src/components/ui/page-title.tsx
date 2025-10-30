"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageTitleProps = {
	title: string;
	description?: string;
	children?: ReactNode;
	className?: string;
	size?: "sm" | "md" | "lg" | "xl";
};

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
					"font-bold font-serif text-foreground tracking-tight",
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
						size === "sm" && "max-w-lg text-sm",
						size === "md" && "max-w-xl text-base",
						size === "lg" && "max-w-2xl text-base",
						size === "xl" && "max-w-3xl text-lg"
					)}
				>
					{description}
				</p>
			)}

			{children && <div className="pt-2">{children}</div>}
		</div>
	);
}
