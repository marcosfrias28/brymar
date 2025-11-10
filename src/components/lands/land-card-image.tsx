import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { badgeVariants } from "@/lib/utils/secondary-colors";
import type { Land } from "@/lib/types";

type LandCardImageProps = {
	land: Land;
	variant: "horizontal" | "vertical";
	getTypeLabel: (type: string) => string;
};

export function LandCardImage({ land, variant, getTypeLabel }: LandCardImageProps) {
	const isVertical = variant === "vertical";

	return (
		<div
			className={cn(
				"relative flex-shrink-0 bg-muted",
				isVertical ? "h-48 w-full" : "h-32 w-full sm:h-auto sm:w-48"
			)}
		>
			{land.images?.[0]?.url ? (
				<Image
					alt={land.name}
					className="object-cover"
					fill
					src={land.images[0].url}
				/>
			) : (
				<div className="flex h-full w-full items-center justify-center bg-muted">
					<Square className="h-8 w-8 text-muted-foreground" />
				</div>
			)}
			<Badge
				className={cn(
					"absolute top-2 right-2 text-xs capitalize",
					badgeVariants.secondarySubtle
				)}
				variant="secondary"
			>
				{getTypeLabel(land.type)}
			</Badge>
		</div>
	);
}
