/**
 * Property-specific hooks for state management
 * Replaces complex service layers with simple React hooks
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	createProperty,
	createPropertyInquiry,
	deleteProperty,
	getPropertyById,
	publishProperty,
	searchProperties,
	updateProperty,
} from "@/lib/actions/properties";
import type {
	CreatePropertyInput,
	PropertySearchFilters,
} from "@/lib/types/properties";

/**
 * Hook for property listing and search
 */
export function useProperties(filters?: PropertySearchFilters) {
	return useQuery({
		queryKey: ["properties", filters],
		queryFn: () => searchProperties(filters || {}),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
}

/**
 * Hook for single property data
 */
export function useProperty(id: string) {
	return useQuery({
		queryKey: ["property", id],
		queryFn: () => getPropertyById(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
}

/**
 * Hook for creating a property
 */
export function useCreateProperty() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createProperty,
		onSuccess: (result) => {
			if (result.success) {
				// Invalidate and refetch properties list
				queryClient.invalidateQueries({ queryKey: ["properties"] });
				toast.success("Property created successfully");
			} else {
				toast.error(result.error || "Failed to create property");
			}
		},
		onError: (error) => {
			console.error("Create property error:", error);
			toast.error("Failed to create property");
		},
	});
}

/**
 * Hook for updating a property
 */
export function useUpdateProperty() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateProperty,
		onSuccess: (result) => {
			if (result.success && result.data) {
				// Invalidate and refetch properties list
				queryClient.invalidateQueries({ queryKey: ["properties"] });
				// Invalidate and refetch specific property
				queryClient.invalidateQueries({
					queryKey: ["property", result.data.id],
				});
				toast.success("Property updated successfully");
			} else {
				toast.error(result.error || "Failed to update property");
			}
		},
		onError: (error) => {
			console.error("Update property error:", error);
			toast.error("Failed to update property");
		},
	});
}

/**
 * Hook for publishing a property
 */
export function usePublishProperty() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: publishProperty,
		onSuccess: (result) => {
			if (result.success && result.data) {
				// Invalidate and refetch properties list
				queryClient.invalidateQueries({ queryKey: ["properties"] });
				// Invalidate and refetch specific property
				queryClient.invalidateQueries({
					queryKey: ["property", result.data.id],
				});
				toast.success("Property published successfully");
			} else {
				toast.error(result.error || "Failed to publish property");
			}
		},
		onError: (error) => {
			console.error("Publish property error:", error);
			toast.error("Failed to publish property");
		},
	});
}

/**
 * Hook for deleting a property
 */
export function useDeleteProperty() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteProperty,
		onSuccess: (result) => {
			if (result.success) {
				// Invalidate and refetch properties list
				queryClient.invalidateQueries({ queryKey: ["properties"] });
				toast.success("Property deleted successfully");
			} else {
				toast.error(result.error || "Failed to delete property");
			}
		},
		onError: (error) => {
			console.error("Delete property error:", error);
			toast.error("Failed to delete property");
		},
	});
}

/**
 * Hook for creating a property inquiry
 */
export function useCreatePropertyInquiry() {
	return useMutation({
		mutationFn: createPropertyInquiry,
		onSuccess: (result) => {
			if (result.success) {
				toast.success("Inquiry sent successfully");
			} else {
				toast.error(result.error || "Failed to send inquiry");
			}
		},
		onError: (error) => {
			console.error("Create inquiry error:", error);
			toast.error("Failed to send inquiry");
		},
	});
}

/**
 * Hook for user's own properties
 */
export function useMyProperties(userId?: string) {
	return useQuery({
		queryKey: ["properties", "my", userId],
		queryFn: () => searchProperties({ userId }),
		enabled: !!userId,
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook for featured properties
 */
export function useFeaturedProperties() {
	return useQuery({
		queryKey: ["properties", "featured"],
		queryFn: () => searchProperties({ featured: true, limit: 10 }),
		staleTime: 10 * 60 * 1000, // 10 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
	});
}

/**
 * Hook for property search with debounced filters
 */
export function usePropertySearch(
	filters: PropertySearchFilters,
	debounceMs: number = 500,
) {
	const [debouncedFilters, setDebouncedFilters] = useState(filters);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedFilters(filters);
		}, debounceMs);

		return () => clearTimeout(timer);
	}, [filters, debounceMs]);

	return useProperties(debouncedFilters);
}

// Helper hook for property form state management
export function usePropertyForm(initialData?: Partial<CreatePropertyInput>) {
	const [formData, setFormData] = useState<Partial<CreatePropertyInput>>(
		initialData || {
			title: "",
			description: "",
			price: 0,
			currency: "USD",
			type: "house",
			features: {
				bedrooms: 1,
				bathrooms: 1,
				area: 0,
				amenities: [],
				features: [],
			},
			images: [],
			featured: false,
		},
	);

	const updateFormData = (updates: Partial<CreatePropertyInput>) => {
		setFormData((prev) => ({ ...prev, ...updates }));
	};

	const resetForm = () => {
		setFormData(
			initialData || {
				title: "",
				description: "",
				price: 0,
				currency: "USD",
				type: "house",
				features: {
					bedrooms: 1,
					bathrooms: 1,
					area: 0,
					amenities: [],
					features: [],
				},
				images: [],
				featured: false,
			},
		);
	};

	return {
		formData,
		updateFormData,
		resetForm,
		setFormData,
	};
}
