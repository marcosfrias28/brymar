"use client";

import type React from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type WizardStepLayoutProps = {
	title: string;
	description?: string;
	icon?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
	headerClassName?: string;
	contentClassName?: string;
};

export function WizardStepLayout({
	title,
	description,
	icon,
	children,
	className,
	headerClassName,
	contentClassName,
}: WizardStepLayoutProps) {
	return (
		<div className={cn("space-y-6", className)}>
			{/* Header Section */}
			<div className={cn("space-y-3", headerClassName)}>
				<div className="flex items-center gap-3">
					{icon && (
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
							{icon}
						</div>
					)}
					<div className="space-y-1">
						<h2 className="font-semibold text-2xl tracking-tight">{title}</h2>
						{description && (
							<p className="text-muted-foreground text-sm">{description}</p>
						)}
					</div>
				</div>
				<Separator />
			</div>

			{/* Content Section */}
			<div className={cn("space-y-6", contentClassName)}>{children}</div>
		</div>
	);
}
