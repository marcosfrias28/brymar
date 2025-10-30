"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { BlogSearchFilters } from "@/lib/types/blog";

type BlogFiltersProps = {
	filters: BlogSearchFilters;
	onFiltersChange: (filters: BlogSearchFilters) => void;
};

export function BlogFilters({ filters, onFiltersChange }: BlogFiltersProps) {
	const handleFilterChange = (key: keyof BlogSearchFilters, value: any) => {
		onFiltersChange({ ...filters, [key]: value });
	};

	const clearFilters = () => {
		onFiltersChange({
			page: 1,
			limit: 12,
		});
	};

	return (
		<Card className="border-border">
			<CardContent className="p-4">
				<div className="grid grid-cols-1 laptop:grid-cols-5 tablet:grid-cols-3 gap-4 smartphone:grid-cols-2">
					{/* Status */}
					<div className="space-y-2">
						<Label className="text-foreground">Estado</Label>
						<Select
							onValueChange={(value) =>
								handleFilterChange(
									"status",
									value === ""
										? undefined
										: (value as "draft" | "published" | "archived")
								)
							}
							value={filters.status || ""}
						>
							<SelectTrigger className="border-border">
								<SelectValue placeholder="Todos los estados" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">Todos</SelectItem>
								<SelectItem value="published">Publicados</SelectItem>
								<SelectItem value="draft">Borradores</SelectItem>
								<SelectItem value="archived">Archivados</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Category */}
					<div className="space-y-2">
						<Label className="text-foreground">Categoría</Label>
						<Select
							onValueChange={(value) =>
								handleFilterChange("category", value === "" ? undefined : value)
							}
							value={filters.category || ""}
						>
							<SelectTrigger className="border-border">
								<SelectValue placeholder="Todas las categorías" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">Todas</SelectItem>
								<SelectItem value="property-news">
									Noticias de Propiedades
								</SelectItem>
								<SelectItem value="market-analysis">
									Análisis de Mercado
								</SelectItem>
								<SelectItem value="investment-tips">
									Consejos de Inversión
								</SelectItem>
								<SelectItem value="legal-advice">Asesoría Legal</SelectItem>
								<SelectItem value="home-improvement">
									Mejoras del Hogar
								</SelectItem>
								<SelectItem value="general">General</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Search Query */}
					<div className="space-y-2">
						<Label className="text-foreground">Buscar</Label>
						<Input
							className="border-border"
							onChange={(e) =>
								handleFilterChange("query", e.target.value || undefined)
							}
							placeholder="Buscar en posts..."
							value={filters.query || ""}
						/>
					</div>
				</div>

				{/* Clear Filters Button */}
				<div className="mt-4 flex justify-end">
					<Button
						className="border-border text-foreground hover:bg-secondary"
						onClick={clearFilters}
						variant="outline"
					>
						Limpiar Filtros
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
