"use client";

import { Filter, Grid, List, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InlineErrorState } from "@/components/ui/error-states";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-states";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

export type FilterOption = {
	key: string;
	label: string;
	type: "select" | "search" | "range";
	options?: { value: string; label: string }[];
	placeholder?: string;
};

export type UnifiedListProps<T> = {
	title: string;
	items: T[];
	renderItem: (item: T, index: number) => React.ReactNode;
	isLoading?: boolean;
	error?: string;
	filters?: FilterOption[];
	searchPlaceholder?: string;
	showViewToggle?: boolean;
	showAddButton?: boolean;
	addButtonText?: string;
	onAdd?: () => void;
	onSearch?: (query: string) => void;
	onFilter?: (filters: Record<string, any>) => void;
	className?: string;
	emptyMessage?: string;
	emptyDescription?: string;
};

export function UnifiedList<T>({
	title,
	items,
	renderItem,
	isLoading = false,
	error,
	filters = [],
	searchPlaceholder = "Buscar...",
	showViewToggle = true,
	showAddButton = false,
	addButtonText = "Agregar",
	onAdd,
	onSearch,
	onFilter,
	className,
	emptyMessage = "No se encontraron elementos",
	emptyDescription = "Intenta ajustar los filtros o agregar nuevos elementos",
}: UnifiedListProps<T>) {
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [searchQuery, setSearchQuery] = useState("");
	const [filterValues, setFilterValues] = useState<Record<string, any>>({});

	const handleSearch = (query: string) => {
		setSearchQuery(query);
		onSearch?.(query);
	};

	const handleFilterChange = (key: string, value: any) => {
		const newFilters = { ...filterValues, [key]: value };
		setFilterValues(newFilters);
		onFilter?.(newFilters);
	};

	const hasActiveFilters = Object.values(filterValues).some(
		(value) => value && value !== ""
	);
	const activeFilterCount = Object.values(filterValues).filter(
		(value) => value && value !== ""
	).length;

	if (error) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="font-bold text-2xl text-foreground">{title}</h2>
				</div>
				<InlineErrorState message={error} />
			</div>
		);
	}

	return (
		<div className={cn("space-y-6", className)}>
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<h2 className="font-bold text-2xl text-foreground">{title}</h2>
					{items.length > 0 && (
						<Badge className="text-xs" variant="secondary">
							{items.length}
						</Badge>
					)}
				</div>

				<div className="flex items-center gap-2">
					{showViewToggle && (
						<div className="flex items-center rounded-lg border p-1">
							<Button
								className="h-8 w-8 p-0"
								onClick={() => setViewMode("grid")}
								size="sm"
								variant={viewMode === "grid" ? "default" : "ghost"}
							>
								<Grid className="h-4 w-4" />
							</Button>
							<Button
								className="h-8 w-8 p-0"
								onClick={() => setViewMode("list")}
								size="sm"
								variant={viewMode === "list" ? "default" : "ghost"}
							>
								<List className="h-4 w-4" />
							</Button>
						</div>
					)}

					{showAddButton && onAdd && (
						<Button className="flex items-center gap-2" onClick={onAdd}>
							<Plus className="h-4 w-4" />
							{addButtonText}
						</Button>
					)}
				</div>
			</div>

			{/* Filters */}
			{(onSearch || filters.length > 0) && (
				<Card className={cn("border-border", secondaryColorClasses.cardHover)}>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-lg">
							<Filter className="h-5 w-5" />
							Filtros
							{hasActiveFilters && (
								<Badge className="text-xs" variant="default">
									{activeFilterCount}
								</Badge>
							)}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-4 xl:grid-cols-2">
							{onSearch && (
								<div className="relative">
									<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
									<Input
										className={cn("pl-10", secondaryColorClasses.inputFocus)}
										onChange={(e) => handleSearch(e.target.value)}
										placeholder={searchPlaceholder}
										value={searchQuery}
									/>
								</div>
							)}

							{filters.map((filter) => (
								<div key={filter.key}>
									{filter.type === "select" && (
										<Select
											onValueChange={(value) =>
												handleFilterChange(filter.key, value)
											}
											value={filterValues[filter.key] || ""}
										>
											<SelectTrigger
												className={secondaryColorClasses.selectFocus}
											>
												<SelectValue
													placeholder={filter.placeholder || filter.label}
												/>
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="">Todos</SelectItem>
												{filter.options?.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}

									{filter.type === "search" && (
										<Input
											className={secondaryColorClasses.inputFocus}
											onChange={(e) =>
												handleFilterChange(filter.key, e.target.value)
											}
											placeholder={filter.placeholder || filter.label}
											value={filterValues[filter.key] || ""}
										/>
									)}
								</div>
							))}
						</div>

						{hasActiveFilters && (
							<div className="flex items-center gap-2 border-t pt-2">
								<span className="text-muted-foreground text-sm">
									Filtros activos:
								</span>
								{Object.entries(filterValues).map(([key, value]) => {
									if (!value) {
										return null;
									}
									const filter = filters.find((f) => f.key === key);
									const displayValue =
										filter?.options?.find((o) => o.value === value)?.label ||
										value;

									return (
										<Badge
											className="cursor-pointer text-xs hover:bg-destructive hover:text-destructive-foreground"
											key={key}
											onClick={() => handleFilterChange(key, "")}
											variant="secondary"
										>
											{filter?.label}: {displayValue} ×
										</Badge>
									);
								})}
								<Button
									className="h-6 px-2 text-xs"
									onClick={() => {
										setFilterValues({});
										setSearchQuery("");
										onFilter?.({});
										onSearch?.("");
									}}
									size="sm"
									variant="ghost"
								>
									Limpiar todo
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Content */}
			{isLoading ? (
				<div className="flex justify-center py-12">
					<LoadingSpinner />
				</div>
			) : items.length === 0 ? (
				<Card className="border-border">
					<CardContent className="flex flex-col items-center justify-center py-12 text-center">
						<div className="mb-2 text-muted-foreground">
							<Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
						</div>
						<h3 className="mb-2 font-semibold text-foreground text-lg">
							{emptyMessage}
						</h3>
						<p className="mb-4 max-w-md text-muted-foreground">
							{emptyDescription}
						</p>
						{showAddButton && onAdd && (
							<Button className="flex items-center gap-2" onClick={onAdd}>
								<Plus className="h-4 w-4" />
								{addButtonText}
							</Button>
						)}
					</CardContent>
				</Card>
			) : (
				<div
					className={cn(
						viewMode === "grid"
							? "grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-2 xl:grid-cols-4"
							: "space-y-4"
					)}
				>
					{items.map((item, index) => renderItem(item, index))}
				</div>
			)}
		</div>
	);
}
