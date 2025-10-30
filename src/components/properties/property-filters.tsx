"use client";

import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Property } from "@/lib/types/properties";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

type PropertyFiltersProps = {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	properties: Property[];
};

export function PropertyFilters({
	searchTerm,
	onSearchChange,
	properties,
}: PropertyFiltersProps) {
	const locations = [
		...new Set(
			properties
				.map((p) => `${p.address.city}, ${p.address.state}`)
				.filter(Boolean)
		),
	];
	const totalProperties = properties.length;

	return (
		<Card
			className={cn(
				"border shadow-sm transition-all duration-200",
				secondaryColorClasses.cardHover
			)}
		>
			<CardContent className="p-4">
				<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
					{/* Search */}
					<div className="relative max-w-md flex-1">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
						<Input
							className={cn("pl-10", secondaryColorClasses.inputFocus)}
							onChange={(e) => onSearchChange(e.target.value)}
							placeholder="Buscar propiedades por título o ubicación..."
							value={searchTerm}
						/>
					</div>

					{/* Quick Stats */}
					<div className="flex flex-wrap gap-2">
						<Badge className={secondaryColorClasses.badge} variant="secondary">
							{totalProperties} propiedades
						</Badge>
						{locations.slice(0, 3).map((location) => (
							<Badge
								className={cn("text-xs", secondaryColorClasses.interactive)}
								key={location}
								variant="outline"
							>
								{location}
							</Badge>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
