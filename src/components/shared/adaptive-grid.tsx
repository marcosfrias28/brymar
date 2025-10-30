"use client";

import { Grid, LayoutGrid, List } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { BlogCard } from "@/components/blog/blog-card";
import { LandCardList } from "@/components/lands/land-card-list";
import { PropertyCardList } from "@/components/properties/property-card-list";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type AdaptiveGridProps = {
	children: React.ReactNode[];
	itemsPerPage?: number;
	onItemsPerPageChange?: (value: number) => void;
	className?: string;
};

type ViewMode = "grid" | "list" | "bento";

export function AdaptiveGrid({
	children,
	itemsPerPage = 12,
	onItemsPerPageChange,
	className,
}: AdaptiveGridProps) {
	const [viewMode, setViewMode] = useState<ViewMode>("bento");
	const [currentPage, setCurrentPage] = useState(1);

	const totalPages = Math.ceil(children.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentItems = children.slice(startIndex, endIndex);

	const getGridClasses = () => {
		switch (viewMode) {
			case "list":
				return "flex flex-col gap-4";
			case "grid":
				return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
			case "bento":
				return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 auto-rows-[minmax(280px,auto)]";
			default:
				return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
		}
	};

	const getBentoItemClass = (index: number) => {
		if (viewMode !== "bento") {
			return "";
		}

		// Patrón Apple-style para el bento grid
		const patterns = [
			"xl:col-span-2 xl:row-span-2", // Grande
			"", // Normal
			"", // Normal
			"xl:col-span-2", // Ancho
			"", // Normal
			"xl:row-span-2", // Alto
			"", // Normal
			"", // Normal
			"xl:col-span-2", // Ancho
		];

		return patterns[index % patterns.length] || "";
	};

	const renderListItem = (child: React.ReactNode, index: number) => {
		if (viewMode !== "list") {
			return child;
		}

		// Extract props from the child to render appropriate list component
		const childProps = (child as any)?.props;
		if (!childProps) {
			return child;
		}

		if (childProps.property) {
			return (
				<PropertyCardList
					key={startIndex + index}
					properties={[childProps.property]}
				/>
			);
		}
		if (childProps.land) {
			return (
				<LandCardList key={startIndex + index} lands={[childProps.land]} />
			);
		}
		if (childProps.post) {
			return <BlogCard key={startIndex + index} post={childProps.post} />;
		}

		return child;
	};

	return (
		<div className={cn("space-y-6", className)}>
			{/* Controls */}
			<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				<div className="flex items-center gap-2">
					<span className="font-medium text-arsenic text-sm">Vista:</span>
					<div className="flex rounded-lg border border-blackCoral p-1">
						<Button
							className={cn(
								"h-8 w-8 p-0",
								viewMode === "list" ? "bg-arsenic text-white" : ""
							)}
							onClick={() => setViewMode("list")}
							size="sm"
							variant="ghost"
						>
							<List className="h-4 w-4" />
						</Button>
						<Button
							className={cn(
								"h-8 w-8 p-0",
								viewMode === "grid" ? "bg-arsenic text-white" : ""
							)}
							onClick={() => setViewMode("grid")}
							size="sm"
							variant="ghost"
						>
							<Grid className="h-4 w-4" />
						</Button>
						<Button
							className={cn(
								"h-8 w-8 p-0",
								viewMode === "bento" ? "bg-arsenic text-white" : ""
							)}
							onClick={() => setViewMode("bento")}
							size="sm"
							variant="ghost"
						>
							<LayoutGrid className="h-4 w-4" />
						</Button>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<span className="text-arsenic text-sm">Items por página:</span>
						<Select
							onValueChange={(value) => {
								onItemsPerPageChange?.(Number.parseInt(value, 10));
								setCurrentPage(1);
							}}
							value={itemsPerPage.toString()}
						>
							<SelectTrigger className="h-8 w-20">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="6">6</SelectItem>
								<SelectItem value="12">12</SelectItem>
								<SelectItem value="15">15</SelectItem>
								<SelectItem value="24">24</SelectItem>
								<SelectItem value="48">48</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="text-arsenic text-sm">
						{startIndex + 1}-{Math.min(endIndex, children.length)} de{" "}
						{children.length}
					</div>
				</div>
			</div>

			{/* Grid */}
			<div className={getGridClasses()}>
				{currentItems.map((child, index) => (
					<div className={getBentoItemClass(index)} key={startIndex + index}>
						{renderListItem(child, index)}
					</div>
				))}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2">
					<Button
						className="border-blackCoral"
						disabled={currentPage === 1}
						onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
						size="sm"
						variant="outline"
					>
						Anterior
					</Button>

					<div className="flex gap-1">
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<Button
								className={cn(
									"h-8 w-8 p-0",
									currentPage === page
										? "bg-arsenic text-white"
										: "border-blackCoral"
								)}
								key={page}
								onClick={() => setCurrentPage(page)}
								size="sm"
								variant={currentPage === page ? "default" : "outline"}
							>
								{page}
							</Button>
						))}
					</div>

					<Button
						className="border-blackCoral"
						disabled={currentPage === totalPages}
						onClick={() =>
							setCurrentPage((prev) => Math.min(totalPages, prev + 1))
						}
						size="sm"
						variant="outline"
					>
						Siguiente
					</Button>
				</div>
			)}
		</div>
	);
}
