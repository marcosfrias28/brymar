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

interface CompactToolbarProps {
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
}

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
			<div className="flex flex-col smartphone:flex-row gap-3">
				{/* Search */}
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blackCoral h-4 w-4" />
					<Input
						placeholder={searchPlaceholder}
						value={searchTerm}
						onChange={(e) => onSearchChange(e.target.value)}
						className="pl-10 border-blackCoral focus:ring-arsenic"
					/>
				</div>

				{/* Controls */}
				<div className="flex items-center gap-2">
					{/* View Mode */}
					<div className="flex border border-blackCoral rounded-lg overflow-hidden">
						<Button
							variant={viewMode === "grid" ? "default" : "ghost"}
							size="sm"
							onClick={() => onViewModeChange("grid")}
							className={`rounded-none border-0 ${viewMode === "grid" ? "bg-arsenic text-white" : "text-blackCoral hover:bg-blackCoral/10"}`}
						>
							<Grid3X3 className="h-4 w-4" />
						</Button>
						<Button
							variant={viewMode === "list" ? "default" : "ghost"}
							size="sm"
							onClick={() => onViewModeChange("list")}
							className={`rounded-none border-0 ${viewMode === "list" ? "bg-arsenic text-white" : "text-blackCoral hover:bg-blackCoral/10"}`}
						>
							<List className="h-4 w-4" />
						</Button>
						<Button
							variant={viewMode === "bento" ? "default" : "ghost"}
							size="sm"
							onClick={() => onViewModeChange("bento")}
							className={`rounded-none border-0 ${viewMode === "bento" ? "bg-arsenic text-white" : "text-blackCoral hover:bg-blackCoral/10"}`}
						>
							<LayoutGrid className="h-4 w-4" />
						</Button>
					</div>

					{/* Items per page */}
					<Select
						value={itemsPerPage.toString()}
						onValueChange={(value) => onItemsPerPageChange(Number(value))}
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
						variant="outline"
						size="sm"
						onClick={onToggleFilters}
						className={`border-blackCoral ${showFilters ? "bg-blackCoral text-white" : "text-blackCoral hover:bg-blackCoral hover:text-white"}`}
					>
						<Filter className="h-4 w-4 mr-1" />
						Filtros
					</Button>

					{/* Add New */}
					<Button
						asChild
						size="sm"
						className="bg-arsenic hover:bg-blackCoral text-white"
					>
						<Link href={addNewHref}>
							<Plus className="h-4 w-4 mr-1" />
							{addNewLabel}
						</Link>
					</Button>
				</div>
			</div>

			{/* Quick filters */}
			{quickFilters.length > 0 && (
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-sm text-blackCoral/70">Filtros rápidos:</span>
					{quickFilters.map((filter, index) => (
						<Badge
							key={index}
							variant={filter.active ? "default" : "secondary"}
							className={`cursor-pointer transition-colors ${
								filter.active
									? "bg-arsenic text-white hover:bg-blackCoral"
									: "bg-white border border-blackCoral/30 text-blackCoral hover:bg-blackCoral hover:text-white"
							}`}
							onClick={filter.onClick}
						>
							{filter.label} ({filter.count})
						</Badge>
					))}
				</div>
			)}

			{/* Results count */}
			<div className="text-sm text-blackCoral/70">
				Mostrando {Math.min(itemsPerPage, totalItems)} de {totalItems} elementos
			</div>
		</div>
	);
}
