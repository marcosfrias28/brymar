import { useCallback, useEffect, useMemo, useState } from "react";
import {
	type CharacteristicsFilter,
	CharacteristicsService,
} from "@/lib/services/characteristics-service";
import type { PropertyCharacteristic, PropertyType } from "@/types/wizard";

export interface UseCharacteristicsOptions {
	propertyType?: PropertyType;
	initialCharacteristics?: PropertyCharacteristic[];
	translations?: Record<string, string>;
	locale?: string;
}

export interface UseCharacteristicsReturn {
	// Core data
	characteristics: PropertyCharacteristic[];
	characteristicsByCategory: Record<string, PropertyCharacteristic[]>;
	selectedCharacteristics: PropertyCharacteristic[];

	// Filtering and search
	searchTerm: string;
	setSearchTerm: (term: string) => void;
	categoryFilter: string | null;
	setCategoryFilter: (category: string | null) => void;
	filteredCharacteristics: PropertyCharacteristic[];

	// Actions
	toggleCharacteristic: (id: string) => void;
	setCharacteristicSelected: (id: string, selected: boolean) => void;
	addCustomCharacteristic: (
		name: string,
		category?: "amenity" | "feature" | "location",
	) => PropertyCharacteristic;
	removeCustomCharacteristic: (id: string) => boolean;
	clearAllSelections: () => void;
	selectRecommendedForPropertyType: () => void;

	// Validation
	validateForPropertyType: (propertyType: PropertyType) => {
		valid: PropertyCharacteristic[];
		invalid: PropertyCharacteristic[];
	};

	// Statistics
	counts: Record<string, number>;
	selectedCount: number;
	totalCount: number;

	// Service instance for advanced usage
	service: CharacteristicsService;
}

export function useCharacteristics(
	options: UseCharacteristicsOptions = {},
): UseCharacteristicsReturn {
	const {
		propertyType,
		initialCharacteristics = [],
		translations = {},
		locale = "en",
	} = options;

	// Initialize service
	const service = useMemo(() => {
		return new CharacteristicsService(translations, locale);
	}, [translations, locale]);

	// State
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
	const [_updateTrigger, setUpdateTrigger] = useState(0);

	// Load initial characteristics
	useEffect(() => {
		if (initialCharacteristics.length > 0) {
			service.loadCharacteristics(initialCharacteristics);
			setUpdateTrigger((prev) => prev + 1);
		}
	}, [initialCharacteristics, service.loadCharacteristics]);

	// Update translations when they change
	useEffect(() => {
		service.updateTranslations(translations, locale);
		setUpdateTrigger((prev) => prev + 1);
	}, [translations, locale, service.updateTranslations]);

	// Create filter object
	const filter = useMemo(
		(): CharacteristicsFilter => ({
			propertyType,
			search: searchTerm || undefined,
			category: (categoryFilter as any) || undefined,
		}),
		[propertyType, searchTerm, categoryFilter],
	);

	// Get characteristics data
	const characteristics = useMemo(() => {
		return service.getCharacteristics();
	}, [service.getCharacteristics]);

	const characteristicsByCategory = useMemo(() => {
		return service.getCharacteristicsByCategory(filter);
	}, [filter, service.getCharacteristicsByCategory]);

	const filteredCharacteristics = useMemo(() => {
		return service.getCharacteristics(filter);
	}, [filter, service.getCharacteristics]);

	const selectedCharacteristics = useMemo(() => {
		return service.getSelectedCharacteristics();
	}, [service.getSelectedCharacteristics]);

	// Statistics
	const counts = useMemo(() => {
		return service.getCharacteristicsCount(filter);
	}, [filter, service.getCharacteristicsCount]);

	const selectedCount = selectedCharacteristics.length;
	const totalCount = characteristics.length;

	// Actions
	const toggleCharacteristic = useCallback(
		(id: string) => {
			service.toggleCharacteristic(id);
			setUpdateTrigger((prev) => prev + 1);
		},
		[service.toggleCharacteristic],
	);

	const setCharacteristicSelected = useCallback(
		(id: string, selected: boolean) => {
			service.setCharacteristicSelected(id, selected);
			setUpdateTrigger((prev) => prev + 1);
		},
		[service.setCharacteristicSelected],
	);

	const addCustomCharacteristic = useCallback(
		(
			name: string,
			category: "amenity" | "feature" | "location" = "feature",
		) => {
			const characteristic = service.addCustomCharacteristic(name, category);
			setUpdateTrigger((prev) => prev + 1);
			return characteristic;
		},
		[service.addCustomCharacteristic],
	);

	const removeCustomCharacteristic = useCallback(
		(id: string) => {
			const result = service.removeCustomCharacteristic(id);
			if (result) {
				setUpdateTrigger((prev) => prev + 1);
			}
			return result;
		},
		[service.removeCustomCharacteristic],
	);

	const clearAllSelections = useCallback(() => {
		characteristics.forEach((char) => {
			service.setCharacteristicSelected(char.id, false);
		});
		setUpdateTrigger((prev) => prev + 1);
	}, [characteristics, service.setCharacteristicSelected]);

	const selectRecommendedForPropertyType = useCallback(() => {
		if (!propertyType) return;

		// Clear current selections
		clearAllSelections();

		// Get recommended characteristics for property type
		const recommended = service.getCharacteristics({ propertyType });

		// Select top characteristics from each category
		const recommendedByCategory = recommended.reduce(
			(acc, char) => {
				if (!acc[char.category]) acc[char.category] = [];
				acc[char.category].push(char);
				return acc;
			},
			{} as Record<string, PropertyCharacteristic[]>,
		);

		// Select top 3-4 from each category
		Object.values(recommendedByCategory).forEach((chars) => {
			chars.slice(0, 4).forEach((char) => {
				service.setCharacteristicSelected(char.id, true);
			});
		});

		setUpdateTrigger((prev) => prev + 1);
	}, [
		propertyType,
		clearAllSelections,
		service.getCharacteristics,
		service.setCharacteristicSelected,
	]);

	const validateForPropertyType = useCallback(
		(targetPropertyType: PropertyType) => {
			return service.validateCharacteristicsForPropertyType(targetPropertyType);
		},
		[service.validateCharacteristicsForPropertyType],
	);

	return {
		// Core data
		characteristics,
		characteristicsByCategory,
		selectedCharacteristics,

		// Filtering and search
		searchTerm,
		setSearchTerm,
		categoryFilter,
		setCategoryFilter,
		filteredCharacteristics,

		// Actions
		toggleCharacteristic,
		setCharacteristicSelected,
		addCustomCharacteristic,
		removeCustomCharacteristic,
		clearAllSelections,
		selectRecommendedForPropertyType,

		// Validation
		validateForPropertyType,

		// Statistics
		counts,
		selectedCount,
		totalCount,

		// Service instance
		service,
	};
}

// Helper hook for getting characteristics for a specific property type
export function useCharacteristicsForPropertyType(
	propertyType: PropertyType | undefined,
	options: Omit<UseCharacteristicsOptions, "propertyType"> = {},
) {
	return useCharacteristics({
		...options,
		propertyType,
	});
}

// Helper hook for managing characteristics in forms
export function useCharacteristicsForm(
	initialCharacteristics: PropertyCharacteristic[] = [],
	options: UseCharacteristicsOptions = {},
) {
	const characteristics = useCharacteristics({
		...options,
		initialCharacteristics,
	});

	// Export function for form integration
	const exportForForm = useCallback(() => {
		return characteristics.service.exportCharacteristics();
	}, [characteristics.service]);

	// Import function for form integration
	const importFromForm = useCallback(
		(formCharacteristics: PropertyCharacteristic[]) => {
			characteristics.service.loadCharacteristics(formCharacteristics);
		},
		[characteristics.service],
	);

	return {
		...characteristics,
		exportForForm,
		importFromForm,
	};
}
