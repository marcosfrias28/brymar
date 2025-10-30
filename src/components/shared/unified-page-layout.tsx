"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CompactStats } from "./compact-stats";
import { CompactToolbar } from "./compact-toolbar";
import { UniversalCard } from "./universal-card";

type UnifiedPageLayoutProps = {
	title: string;
	stats: Array<{
		label: string;
		value: string | number;
		icon: React.ReactNode;
		color: string;
	}>;
	items: any[];
	itemType: "property" | "land" | "blog";
	searchPlaceholder: string;
	addNewHref: string;
	addNewLabel: string;
	quickFilters?: Array<{
		label: string;
		count: number;
		active?: boolean;
		onClick: () => void;
	}>;
	statusFilters?: Array<{
		label: string;
		value: string;
		active?: boolean;
		onClick: () => void;
	}>;
};

export function UnifiedPageLayout({
	title,
	stats,
	items,
	itemType,
	searchPlaceholder,
	addNewHref,
	addNewLabel,
	quickFilters = [],
	statusFilters = [],
}: UnifiedPageLayoutProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [viewMode, setViewMode] = useState<"grid" | "list" | "bento">("grid");
	const [itemsPerPage, setItemsPerPage] = useState(15);
	const [currentPage, setCurrentPage] = useState(1);

	// Filter items based on search
	const filteredItems = items.filter((item) => {
		const searchFields =
			itemType === "property"
				? [item.title, item.location, item.type]
				: itemType === "land"
					? [item.name, item.location, item.type]
					: [item.title, item.author, item.category];

		return searchFields.some((field) =>
			field?.toLowerCase().includes(searchTerm.toLowerCase())
		);
	});

	// Pagination
	const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedItems = filteredItems.slice(
		startIndex,
		startIndex + itemsPerPage
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="mb-2 font-bold text-2xl text-blackCoral">{title}</h1>
				<CompactStats stats={stats} />
			</div>

			{/* Status Filters */}
			{statusFilters.length > 0 && (
				<div className="flex flex-wrap items-center gap-2">
					<span className="font-medium text-blackCoral/70 text-sm">
						Estado:
					</span>
					{statusFilters.map((filter, index) => (
						<Button
							className={
								filter.active
									? "bg-arsenic text-white hover:bg-blackCoral"
									: "border-blackCoral text-blackCoral hover:bg-blackCoral hover:text-white"
							}
							key={index}
							onClick={filter.onClick}
							size="sm"
							variant={filter.active ? "default" : "outline"}
						>
							{filter.label}
						</Button>
					))}
				</div>
			)}

			{/* Toolbar */}
			<CompactToolbar
				addNewHref={addNewHref}
				addNewLabel={addNewLabel}
				itemsPerPage={itemsPerPage}
				onItemsPerPageChange={setItemsPerPage}
				onSearchChange={setSearchTerm}
				onToggleFilters={() => setShowFilters(!showFilters)}
				onViewModeChange={setViewMode}
				quickFilters={quickFilters}
				searchPlaceholder={searchPlaceholder}
				searchTerm={searchTerm}
				showFilters={showFilters}
				totalItems={filteredItems.length}
				viewMode={viewMode}
			/>

			{/* Content Grid */}
			<div
				className={`
        ${viewMode === "grid" ? "grid desktop:grid-cols-4 grid-cols-1 tablet:grid-cols-3 gap-4 smartphone:grid-cols-2" : ""}
        ${viewMode === "list" ? "space-y-3" : ""}
        ${viewMode === "bento" ? "grid desktop:grid-cols-4 grid-cols-1 tablet:grid-cols-3 gap-4 smartphone:grid-cols-2 xl:grid-cols-5" : ""}
      `}
			>
				{paginatedItems.map((item) => (
					<UniversalCard
						key={item.id}
						{...item}
						type={itemType}
						viewMode={viewMode}
					/>
				))}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between">
					<div className="text-blackCoral/70 text-sm">
						Página {currentPage} de {totalPages}
					</div>
					<div className="flex items-center gap-2">
						<Button
							className="border-blackCoral"
							disabled={currentPage === 1}
							onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
							size="sm"
							variant="outline"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							className="border-blackCoral"
							disabled={currentPage === totalPages}
							onClick={() =>
								setCurrentPage(Math.min(totalPages, currentPage + 1))
							}
							size="sm"
							variant="outline"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
