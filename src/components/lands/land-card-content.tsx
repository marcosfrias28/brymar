import { Calculator, MapPin, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Land } from "@/lib/types";

type LandCardContentProps = {
	land: Land;
	variant: "horizontal" | "vertical";
	surface: number;
	pricePerM2: number;
	hectares: string;
	tareas: string;
	onView?: (id: string) => void;
};

export function LandCardContent({
	land,
	variant,
	surface,
	pricePerM2,
	hectares,
	tareas,
	onView,
}: LandCardContentProps) {
	const isVertical = variant === "vertical";

	const handleView = () => {
		if (onView) {
			onView(land.id);
		}
	};

	return (
		<div
			className={cn(
				"flex-1 p-4",
				isVertical ? "space-y-2" : "flex flex-col justify-between"
			)}
		>
			<div
				className={cn(
					isVertical
						? "space-y-2"
						: "flex items-start justify-between gap-4"
				)}
			>
				<div className="min-w-0 flex-1">
					<h3
						className={cn(
							"mb-1 line-clamp-2 font-semibold text-arsenic",
							isVertical ? "text-lg" : "text-sm"
						)}
					>
						{land.name}
					</h3>

					{land.description && (
						<p className="mb-2 line-clamp-2 text-muted-foreground text-sm">
							{land.description}
						</p>
					)}

					<div className="mb-2 flex items-center gap-2 text-blackCoral text-xs">
						<MapPin className="h-3 w-3" />
						<span className="line-clamp-1">
							{land.location || "Ubicación no especificada"}
						</span>
					</div>

					<div className="flex items-center gap-4 text-blackCoral text-xs">
						<div className="flex items-center gap-1">
							<Square className="h-3 w-3" />
							<span>{surface.toLocaleString()}m²</span>
						</div>
						<div className="flex items-center gap-1">
							<Calculator className="h-3 w-3" />
							<span>${pricePerM2.toLocaleString()}/m²</span>
						</div>
					</div>

					<div className="mt-1 text-blackCoral/70 text-xs">
						{hectares} ha • {tareas} tareas
					</div>
				</div>

				<div
					className={cn(
						"flex-shrink-0",
						isVertical
							? "flex w-full items-center justify-between"
							: "text-right"
					)}
				>
					<div
						className={cn(
							"font-bold text-arsenic",
							isVertical ? "text-2xl text-primary" : "text-lg"
						)}
					>
						${land.price.toLocaleString()}
					</div>
					{isVertical && (
						<Button onClick={handleView} size="sm">
							Ver Detalles
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
