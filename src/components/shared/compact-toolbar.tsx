"use client";
import { Filter, Grid3X3, LayoutGrid, List, Plus, Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type CompactToolbarProps = {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	searchPlaceholder: string;
	showFilters: boolean;
	onToggleFilters: () => void;
	viewMode: "grid" | "list" | "bento";
	onViewModeChange: (mode: "grid" | "list" | "bento") => void;
	itemsPerPage: number;
	onItemsPerPageChange: (value: number) => void;
	totalItems: number;
	addNewHref: string;
	addNewLabel: string;
	quickFilters?: Array<{
		label: string;
		count: number;
		active?: boolean;
		onClick: () => void;
	}>;
};

export function CompactToolbar({
	searchTerm,
	onSearchChange,
	searchPlaceholder,
	showFilters,
	onToggleFilters,
	viewMode,
	onViewModeChange,
	itemsPerPage,
	onItemsPerPageChange,
	totalItems,
	addNewHref,
	addNewLabel,
	quickFilters = [],
}: CompactToolbarProps) {
	return (
		<div className="space-y-3">
			{/* Main toolbar */}
			<div className="flex flex-col gap-3 smartphone:flex-row">
				{/* Search */}
				<div className="relative flex-1">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-blackCoral" />
					<Input
						className="border-blackCoral pl-10 focus:ring-arsenic"
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder={searchPlaceholder}
						value={searchTerm}
					/>
				</div>

				{/* Controls */}
				<div className="flex items-center gap-2">
					{/* View Mode */}
					<div className="flex overflow-hidden rounded-lg border border-blackCoral">
						<Button
							className={`rounded-none border-0 ${viewMode === "grid" ? "bg-arsenic text-white" : "text-blackCoral hover:bg-blackCoral/10"}`}
							onClick={() => onViewModeChange("grid")}
							size="sm"
							variant={viewMode === "grid" ? "default" : "ghost"}
						>
							<Grid3X3 className="h-4 w-4" />
						</Button>
						<Button
							className={`rounded-none border-0 ${viewMode === "list" ? "bg-arsenic text-white" : "text-blackCoral hover:bg-blackCoral/10"}`}
							onClick={() => onViewModeChange("list")}
							size="sm"
							variant={viewMode === "list" ? "default" : "ghost"}
						>
							<List className="h-4 w-4" />
						</Button>
						<Button
							className={`rounded-none border-0 ${viewMode === "bento" ? "bg-arsenic text-white" : "text-blackCoral hover:bg-blackCoral/10"}`}
							onClick={() => onViewModeChange("bento")}
							size="sm"
							variant={viewMode === "bento" ? "default" : "ghost"}
						>
							<LayoutGrid className="h-4 w-4" />
						</Button>
					</div>

					{/* Items per page */}
					<Select
						onValueChange={(value) => onItemsPerPageChange(Number(value))}
						value={itemsPerPage.toString()}
					>
						<SelectTrigger className="w-20 border-blackCoral">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="12">12</SelectItem>
							<SelectItem value="15">15</SelectItem>
							<SelectItem value="24">24</SelectItem>
							<SelectItem value="36">36</SelectItem>
						</SelectContent>
					</Select>

					{/* Filters */}
					<Button
						className={`border-blackCoral ${showFilters ? "bg-blackCoral text-white" : "text-blackCoral hover:bg-blackCoral hover:text-white"}`}
						onClick={onToggleFilters}
						size="sm"
						variant="outline"
					>
						<Filter className="mr-1 h-4 w-4" />
						Filtros
					</Button>

					{/* Add New */}
					<Button
						asChild
						className="bg-arsenic text-white hover:bg-blackCoral"
						size="sm"
					>
						<Link href={addNewHref}>
							<Plus className="mr-1 h-4 w-4" />
							{addNewLabel}
						</Link>
					</Button>
				</div>
			</div>

			{/* Quick filters */}
			{quickFilters.length > 0 && (
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-blackCoral/70 text-sm">Filtros rápidos:</span>
					{quickFilters.map((filter, index) => (
						<Badge
							className={`cursor-pointer transition-colors ${
								filter.active
									? "bg-arsenic text-white hover:bg-blackCoral"
									: "border border-blackCoral/30 bg-white text-blackCoral hover:bg-blackCoral hover:text-white"
							}`}
							key={index}
							onClick={filter.onClick}
							variant={filter.active ? "default" : "secondary"}
						>
							{filter.label} ({filter.count})
						</Badge>
					))}
				</div>
			)}

			{/* Results count */}
			<div className="text-blackCoral/70 text-sm">
				Mostrando {Math.min(itemsPerPage, totalItems)} de {totalItems} elementos
			</div>
		</div>
	);
}
