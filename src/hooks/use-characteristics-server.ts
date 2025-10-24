import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
	createCustomCharacteristic,
	deleteCustomCharacteristic,
	getCharacteristics,
	getDraftCharacteristics,
	saveDraftCharacteristics,
	searchCharacteristics,
} from "@/lib/actions/characteristics-actions";
import type { PropertyCharacteristic, PropertyType } from "@/types/wizard";

export interface UseCharacteristicsServerOptions {
	propertyType?: PropertyType;
	draftId?: string;
	autoSave?: boolean;
	autoSaveDelay?: number;
}

export interface UseCharacteristicsServerReturn {
	// Data
	characteristics: PropertyCharacteristic[];
	selectedCharacteristics: PropertyCharacteristic[];

	// Loading states
	isLoading: boolean;
	isSaving: boolean;
	isSearching: boolean;

	// Actions
	loadCharacteristics: () => Promise<void>;
	loadDraftCharacteristics: (draftId: string) => Promise<void>;
	toggleCharacteristic: (id: string) => void;
	setCharacteristicSelected: (id: string, selected: boolean) => void;
	addCustomCharacteristic: (
		name: string,
		category?: "amenity" | "feature" | "location",
	) => Promise<PropertyCharacteristic | null>;
	removeCustomCharacteristic: (id: string) => Promise<boolean>;
	saveCharacteristics: (draftId?: string) => Promise<void>;
	searchCharacteristics: (
		query: string,
		category?: "amenity" | "feature" | "location",
	) => Promise<PropertyCharacteristic[]>;

	// Utilities
	clearAllSelections: () => void;
	selectAll: () => void;
	getCharacteristicsByCategory: () => Record<string, PropertyCharacteristic[]>;

	// Validation
	isValid: boolean;
	validationMessage?: string;
}

export function useCharacteristicsServer(
	options: UseCharacteristicsServerOptions = {},
): UseCharacteristicsServerReturn {
	const {
		propertyType,
		draftId,
		autoSave = false,
		autoSaveDelay = 2000,
	} = options;

	const { toast } = useToast();

	// State
	const [characteristics, setCharacteristics] = useState<
		PropertyCharacteristic[]
	>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(
		null,
	);

	// Computed values
	const selectedCharacteristics = characteristics.filter(
		(char) => char.selected,
	);
	const isValid = selectedCharacteristics.length > 0;
	const validationMessage = !isValid
		? "Please select at least one characteristic"
		: undefined;

	// Load characteristics from server
	const loadCharacteristics = useCallback(async () => {
		try {
			setIsLoading(true);
			const serverCharacteristics = await getCharacteristics(propertyType);
			setCharacteristics(serverCharacteristics);
		} catch (error) {
			console.error("Error loading characteristics:", error);
			toast({
				title: "Error",
				description: "Failed to load characteristics",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}, [propertyType, toast]);

	// Load draft characteristics
	const loadDraftCharacteristics = useCallback(
		async (targetDraftId: string) => {
			try {
				setIsLoading(true);
				const draftCharacteristics =
					await getDraftCharacteristics(targetDraftId);

				// Merge with existing characteristics, preserving selections
				setCharacteristics((prev) => {
					const merged = [...prev];

					draftCharacteristics.forEach((draftChar) => {
						const existingIndex = merged.findIndex(
							(char) => char.id === draftChar.id,
						);
						if (existingIndex >= 0) {
							merged[existingIndex] = {
								...merged[existingIndex],
								selected: draftChar.selected,
							};
						} else {
							merged.push(draftChar);
						}
					});

					return merged;
				});
			} catch (error) {
				console.error("Error loading draft characteristics:", error);
				toast({
					title: "Error",
					description: "Failed to load draft characteristics",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		},
		[toast],
	);

	// Auto-save functionality
	const triggerAutoSave = useCallback(() => {
		if (!autoSave || !draftId) return;

		if (autoSaveTimeout) {
			clearTimeout(autoSaveTimeout);
		}

		const timeout = setTimeout(async () => {
			try {
				await saveDraftCharacteristics(draftId, characteristics);
			} catch (error) {
				console.error("Auto-save failed:", error);
			}
		}, autoSaveDelay);

		setAutoSaveTimeout(timeout);
	}, [autoSave, draftId, characteristics, autoSaveDelay, autoSaveTimeout]);

	// Toggle characteristic selection
	const toggleCharacteristic = useCallback((id: string) => {
		setCharacteristics((prev) =>
			prev.map((char) =>
				char.id === id ? { ...char, selected: !char.selected } : char,
			),
		);
	}, []);

	// Set characteristic selection state
	const setCharacteristicSelected = useCallback(
		(id: string, selected: boolean) => {
			setCharacteristics((prev) =>
				prev.map((char) => (char.id === id ? { ...char, selected } : char)),
			);
		},
		[],
	);

	// Add custom characteristic
	const addCustomCharacteristic = useCallback(
		async (
			name: string,
			category: "amenity" | "feature" | "location" = "feature",
		): Promise<PropertyCharacteristic | null> => {
			try {
				const newCharacteristic = await createCustomCharacteristic(
					name,
					category,
				);

				setCharacteristics((prev) => [
					...prev,
					{ ...newCharacteristic, selected: true },
				]);

				toast({
					title: "Success",
					description: "Custom characteristic added",
				});

				return newCharacteristic;
			} catch (error) {
				console.error("Error adding custom characteristic:", error);
				toast({
					title: "Error",
					description: "Failed to add custom characteristic",
					variant: "destructive",
				});
				return null;
			}
		},
		[toast],
	);

	// Remove custom characteristic
	const removeCustomCharacteristic = useCallback(
		async (id: string): Promise<boolean> => {
			try {
				await deleteCustomCharacteristic(id);

				setCharacteristics((prev) => prev.filter((char) => char.id !== id));

				toast({
					title: "Success",
					description: "Custom characteristic removed",
				});

				return true;
			} catch (error) {
				console.error("Error removing custom characteristic:", error);
				toast({
					title: "Error",
					description: "Failed to remove custom characteristic",
					variant: "destructive",
				});
				return false;
			}
		},
		[toast],
	);

	// Save characteristics
	const saveCharacteristics = useCallback(
		async (targetDraftId?: string) => {
			const saveDraftId = targetDraftId || draftId;
			if (!saveDraftId) {
				throw new Error("No draft ID provided");
			}

			try {
				setIsSaving(true);
				await saveDraftCharacteristics(saveDraftId, characteristics);

				toast({
					title: "Success",
					description: "Characteristics saved",
				});
			} catch (error) {
				console.error("Error saving characteristics:", error);
				toast({
					title: "Error",
					description: "Failed to save characteristics",
					variant: "destructive",
				});
				throw error;
			} finally {
				setIsSaving(false);
			}
		},
		[draftId, characteristics, toast],
	);

	// Search characteristics
	const searchCharacteristicsAction = useCallback(
		async (
			query: string,
			category?: "amenity" | "feature" | "location",
		): Promise<PropertyCharacteristic[]> => {
			try {
				setIsSearching(true);
				const results = await searchCharacteristics(
					query,
					propertyType,
					category,
				);
				return results;
			} catch (error) {
				console.error("Error searching characteristics:", error);
				toast({
					title: "Error",
					description: "Failed to search characteristics",
					variant: "destructive",
				});
				return [];
			} finally {
				setIsSearching(false);
			}
		},
		[propertyType, toast],
	);

	// Clear all selections
	const clearAllSelections = useCallback(() => {
		setCharacteristics((prev) =>
			prev.map((char) => ({ ...char, selected: false })),
		);
	}, []);

	// Select all characteristics
	const selectAll = useCallback(() => {
		setCharacteristics((prev) =>
			prev.map((char) => ({ ...char, selected: true })),
		);
	}, []);

	// Get characteristics by category
	const getCharacteristicsByCategory = useCallback((): Record<
		string,
		PropertyCharacteristic[]
	> => {
		return characteristics.reduce(
			(acc, char) => {
				if (!acc[char.category]) {
					acc[char.category] = [];
				}
				acc[char.category].push(char);
				return acc;
			},
			{} as Record<string, PropertyCharacteristic[]>,
		);
	}, [characteristics]);

	// Load initial data
	useEffect(() => {
		loadCharacteristics();
	}, [loadCharacteristics]);

	// Load draft data if draftId is provided
	useEffect(() => {
		if (draftId) {
			loadDraftCharacteristics(draftId);
		}
	}, [draftId, loadDraftCharacteristics]);

	// Trigger auto-save when characteristics change
	useEffect(() => {
		triggerAutoSave();
	}, [triggerAutoSave]);

	// Cleanup auto-save timeout on unmount
	useEffect(() => {
		return () => {
			if (autoSaveTimeout) {
				clearTimeout(autoSaveTimeout);
			}
		};
	}, [autoSaveTimeout]);

	return {
		// Data
		characteristics,
		selectedCharacteristics,

		// Loading states
		isLoading,
		isSaving,
		isSearching,

		// Actions
		loadCharacteristics,
		loadDraftCharacteristics,
		toggleCharacteristic,
		setCharacteristicSelected,
		addCustomCharacteristic,
		removeCustomCharacteristic,
		saveCharacteristics,
		searchCharacteristics: searchCharacteristicsAction,

		// Utilities
		clearAllSelections,
		selectAll,
		getCharacteristicsByCategory,

		// Validation
		isValid,
		validationMessage,
	};
}
