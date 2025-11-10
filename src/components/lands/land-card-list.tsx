"use client";

import type { Land } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LandCard } from "./land-card";

type LandCardListProps = {
	lands: Land[];
	variant?: "horizontal" | "vertical";
	showActions?: boolean;
	onEdit?: (id: string) => void;
	onView?: (id: string) => void;
	className?: string;
};

export function LandCardList({
	lands,
	variant = "horizontal",
	showActions = true,
	onEdit,
	onView,
	className,
}: LandCardListProps) {
	if (lands.length === 0) {
		return null;
	}

	return (
		<div
			className={cn(
				"gap-4",
				variant === "vertical"
					? "grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-2"
					: "space-y-4",
				className
			)}
		>
			{lands.map((land) => (
				<LandCard
					key={land.id}
					land={land}
					onEdit={onEdit}
					onView={onView}
					showActions={showActions}
					variant={variant}
				/>
			))}
		</div>
	);
}
