"use client";

import { useState } from "react";
import { useDeleteLand } from "@/hooks/use-lands";
import type { Land } from "@/lib/types";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";
import { calculateLandMetrics, getTypeLabel } from "./land-utils";
import { DeleteLandDialog } from "./delete-land-dialog";
import { LandCardActions } from "./land-card-actions";
import { LandCardContent } from "./land-card-content";
import { LandCardImage } from "./land-card-image";
import { Card, CardContent } from "@/components/ui/card";

type LandCardProps = {
	land: Land;
	showActions?: boolean;
	variant?: "horizontal" | "vertical";
	onEdit?: (id: string) => void;
	onView?: (id: string) => void;
	className?: string;
};

export function LandCard({
	land,
	showActions = true,
	variant = "horizontal",
	onEdit,
	onView,
	className,
}: LandCardProps) {
	const deleteLandMutation = useDeleteLand();
	const { surface, pricePerM2, hectares, tareas } = calculateLandMetrics(land);
	const isVertical = variant === "vertical";
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const handleDeleteClick = () => setIsDeleteDialogOpen(true);
	const handleDeleteConfirm = async () => {
		await deleteLandMutation.mutateAsync(land.id);
		setIsDeleteDialogOpen(false);
	};

	return (
		<>
			<Card
				className={cn(
					"overflow-hidden border-blackCoral/20 shadow-sm transition-all duration-200 hover:shadow-lg",
					secondaryColorClasses.cardHover,
					className
				)}
			>
				<CardContent className="p-0">
					<div
						className={cn(
							"flex",
							isVertical ? "flex-col" : "flex-col sm:flex-row"
						)}
					>
						<LandCardImage
							getTypeLabel={getTypeLabel}
							land={land}
							variant={variant}
						/>

						<LandCardContent
							hectares={hectares}
							land={land}
							onView={onView}
							pricePerM2={pricePerM2}
							surface={surface}
							tareas={tareas}
							variant={variant}
						/>

						{showActions && !isVertical && (
							<LandCardActions
								isDeletePending={deleteLandMutation.isPending}
								landId={land.id}
								onDelete={handleDeleteClick}
								onEdit={onEdit}
								onView={onView}
							/>
						)}
					</div>
				</CardContent>
			</Card>

			<DeleteLandDialog
				isDeleting={deleteLandMutation.isPending}
				isOpen={isDeleteDialogOpen}
				onConfirm={handleDeleteConfirm}
				onOpenChange={setIsDeleteDialogOpen}
			/>
		</>
	);
}
