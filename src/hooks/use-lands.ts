/**
 * Land-specific hooks for state management
 * Replaces complex service layers with hook-based state management
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
	createLand,
	deleteLand,
	getLandById,
	searchLands,
	updateLand,
} from "@/lib/actions/lands";
import type { LandSearchFilters } from "@/lib/types";

/**
 * Hook for land listing and search
 */
export function useLands(filters?: LandSearchFilters) {
	return useQuery({
		queryKey: ["lands", filters],
		queryFn: async () => {
			const result = await searchLands(filters);
			if (!result.success) {
				throw new Error(result.error || "Failed to fetch lands");
			}
			return result.data!;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
}

/**
 * Hook for single land data
 */
export function useLand(id: string) {
	return useQuery({
		queryKey: ["land", id],
		queryFn: async () => {
			const result = await getLandById(id);
			if (!result.success) {
				throw new Error(result.error || "Failed to fetch land");
			}
			return result.data!;
		},
		enabled: !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
}

/**
 * Hook for creating a land listing
 */
export function useCreateLand() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: createLand,
		onSuccess: (result) => {
			if (result.success) {
				// Invalidate and refetch lands queries
				queryClient.invalidateQueries({ queryKey: ["lands"] });

				toast({
					title: "Success",
					description: "Land listing created successfully",
				});
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to create land listing",
					variant: "destructive",
				});
			}
		},
		onError: (error) => {
			console.error("Create land error:", error);
			toast({
				title: "Error",
				description: "An unexpected error occurred",
				variant: "destructive",
			});
		},
	});
}

/**
 * Hook for updating a land listing
 */
export function useUpdateLand() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: updateLand,
		onSuccess: (result, variables) => {
			if (result.success) {
				// Invalidate and refetch lands queries
				queryClient.invalidateQueries({ queryKey: ["lands"] });
				// Invalidate specific land query
				queryClient.invalidateQueries({ queryKey: ["land", variables.id] });

				toast({
					title: "Success",
					description: "Land listing updated successfully",
				});
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to update land listing",
					variant: "destructive",
				});
			}
		},
		onError: (error) => {
			console.error("Update land error:", error);
			toast({
				title: "Error",
				description: "An unexpected error occurred",
				variant: "destructive",
			});
		},
	});
}

/**
 * Hook for deleting a land listing
 */
export function useDeleteLand() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: deleteLand,
		onSuccess: (result, landId) => {
			if (result.success) {
				// Invalidate and refetch lands queries
				queryClient.invalidateQueries({ queryKey: ["lands"] });
				// Remove specific land from cache
				queryClient.removeQueries({ queryKey: ["land", landId] });

				toast({
					title: "Success",
					description: "Land listing deleted successfully",
				});
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to delete land listing",
					variant: "destructive",
				});
			}
		},
		onError: (error) => {
			console.error("Delete land error:", error);
			toast({
				title: "Error",
				description: "An unexpected error occurred",
				variant: "destructive",
			});
		},
	});
}

/**
 * Hook for user's own lands
 */
export function useMyLands() {
	return useQuery({
		queryKey: ["my-lands"],
		queryFn: async () => {
			// This would need user ID from auth context
			// For now, we'll use the general search without userId filter
			const result = await searchLands({});
			if (!result.success) {
				throw new Error(result.error || "Failed to fetch your lands");
			}
			return result.data!;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
}

/**
 * Hook for land search with debounced filters
 */
export function useLandSearch(
	filters: LandSearchFilters,
	enabled: boolean = true,
) {
	return useQuery({
		queryKey: ["land-search", filters],
		queryFn: async () => {
			const result = await searchLands(filters);
			if (!result.success) {
				throw new Error(result.error || "Search failed");
			}
			return result.data!;
		},
		enabled,
		staleTime: 2 * 60 * 1000, // 2 minutes for search results
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook for land statistics (could be extended)
 */
export function useLandStats() {
	return useQuery({
		queryKey: ["land-stats"],
		queryFn: async () => {
			const result = await searchLands({});
			if (!result.success) {
				throw new Error(result.error || "Failed to fetch land statistics");
			}

			const lands = result.data?.items;

			// Calculate basic statistics
			const stats = {
				total: lands.length,
				available: lands.filter((land) => land.status === "available").length,
				sold: lands.filter((land) => land.status === "sold").length,
				averagePrice:
					lands.length > 0
						? lands.reduce((sum, land) => sum + land.price, 0) / lands.length
						: 0,
				totalArea: lands.reduce((sum, land) => sum + land.area, 0),
				byType: lands.reduce(
					(acc, land) => {
						acc[land.type] = (acc[land.type] || 0) + 1;
						return acc;
					},
					{} as Record<string, number>,
				),
			};

			return stats;
		},
		staleTime: 10 * 60 * 1000, // 10 minutes
		gcTime: 15 * 60 * 1000, // 15 minutes
	});
}
