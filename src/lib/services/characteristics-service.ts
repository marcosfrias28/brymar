import { PropertyType, PropertyCharacteristic } from '@/types/wizard';

export interface CharacteristicDefinition {
    id: string;
    name: string;
    category: "amenity" | "feature" | "location";
    propertyTypes?: PropertyType[]; // If undefined, applies to all types
    isDefault: boolean;
    order: number;
}

// Default characteristics with property type specificity
export const DEFAULT_CHARACTERISTICS: CharacteristicDefinition[] = [
    // Universal Amenities (all property types)
    { id: "parking", name: "Parking", category: "amenity", isDefault: true, order: 1 },
    { id: "security", name: "Security", category: "amenity", isDefault: true, order: 2 },
    { id: "storage", name: "Storage", category: "amenity", isDefault: true, order: 3 },

    // Residential Amenities (house, apartment, villa)
    {
        id: "pool",
        name: "Pool",
        category: "amenity",
        propertyTypes: [PropertyType.HOUSE, PropertyType.APARTMENT, PropertyType.VILLA],
        isDefault: true,
        order: 4
    },
    {
        id: "gym",
        name: "Gym",
        category: "amenity",
        propertyTypes: [PropertyType.APARTMENT, PropertyType.VILLA],
        isDefault: true,
        order: 5
    },
    {
        id: "garden",
        name: "Garden",
        category: "amenity",
        propertyTypes: [PropertyType.HOUSE, PropertyType.VILLA],
        isDefault: true,
        order: 6
    },
    {
        id: "terrace",
        name: "Terrace",
        category: "amenity",
        propertyTypes: [PropertyType.HOUSE, PropertyType.APARTMENT, PropertyType.VILLA],
        isDefault: true,
        order: 7
    },
    {
        id: "balcony",
        name: "Balcony",
        category: "amenity",
        propertyTypes: [PropertyType.APARTMENT],
        isDefault: true,
        order: 8
    },
    {
        id: "garage",
        name: "Garage",
        category: "amenity",
        propertyTypes: [PropertyType.HOUSE, PropertyType.VILLA],
        isDefault: true,
        order: 9
    },

    // Universal Features
    { id: "furnished", name: "Furnished", category: "feature", isDefault: true, order: 10 },
    { id: "air_conditioning", name: "Air Conditioning", category: "feature", isDefault: true, order: 11 },

    // Residential Features
    {
        id: "heating",
        name: "Heating",
        category: "feature",
        propertyTypes: [PropertyType.HOUSE, PropertyType.APARTMENT, PropertyType.VILLA],
        isDefault: true,
        order: 12
    },
    {
        id: "fireplace",
        name: "Fireplace",
        category: "feature",
        propertyTypes: [PropertyType.HOUSE, PropertyType.VILLA],
        isDefault: true,
        order: 13
    },
    {
        id: "walk_in_closet",
        name: "Walk-in Closet",
        category: "feature",
        propertyTypes: [PropertyType.HOUSE, PropertyType.APARTMENT, PropertyType.VILLA],
        isDefault: true,
        order: 14
    },
    {
        id: "laundry_room",
        name: "Laundry Room",
        category: "feature",
        propertyTypes: [PropertyType.HOUSE, PropertyType.APARTMENT, PropertyType.VILLA],
        isDefault: true,
        order: 15
    },
    {
        id: "elevator",
        name: "Elevator",
        category: "feature",
        propertyTypes: [PropertyType.APARTMENT],
        isDefault: true,
        order: 16
    },

    // Commercial Features
    {
        id: "loading_dock",
        name: "Loading Dock",
        category: "feature",
        propertyTypes: [PropertyType.COMMERCIAL],
        isDefault: true,
        order: 17
    },
    {
        id: "office_space",
        name: "Office Space",
        category: "feature",
        propertyTypes: [PropertyType.COMMERCIAL],
        isDefault: true,
        order: 18
    },
    {
        id: "retail_space",
        name: "Retail Space",
        category: "feature",
        propertyTypes: [PropertyType.COMMERCIAL],
        isDefault: true,
        order: 19
    },

    // Land Features
    {
        id: "utilities_available",
        name: "Utilities Available",
        category: "feature",
        propertyTypes: [PropertyType.LAND],
        isDefault: true,
        order: 20
    },
    {
        id: "buildable",
        name: "Buildable",
        category: "feature",
        propertyTypes: [PropertyType.LAND],
        isDefault: true,
        order: 21
    },
    {
        id: "agricultural",
        name: "Agricultural Use",
        category: "feature",
        propertyTypes: [PropertyType.LAND],
        isDefault: true,
        order: 22
    },

    // Location Features (all types)
    { id: "ocean_view", name: "Ocean View", category: "location", isDefault: true, order: 23 },
    { id: "mountain_view", name: "Mountain View", category: "location", isDefault: true, order: 24 },
    { id: "city_view", name: "City View", category: "location", isDefault: true, order: 25 },
    { id: "beach_access", name: "Beach Access", category: "location", isDefault: true, order: 26 },
    { id: "golf_course", name: "Near Golf Course", category: "location", isDefault: true, order: 27 },
    { id: "shopping_center", name: "Near Shopping Center", category: "location", isDefault: true, order: 28 },
    { id: "public_transport", name: "Public Transport", category: "location", isDefault: true, order: 29 },
    { id: "schools_nearby", name: "Schools Nearby", category: "location", isDefault: true, order: 30 },
    { id: "hospitals_nearby", name: "Hospitals Nearby", category: "location", isDefault: true, order: 31 },
];

export interface CharacteristicsFilter {
    category?: "amenity" | "feature" | "location";
    propertyType?: PropertyType;
    search?: string;
    selected?: boolean;
}

export class CharacteristicsService {
    private characteristics: Map<string, PropertyCharacteristic> = new Map();
    private customCharacteristics: PropertyCharacteristic[] = [];

    constructor(
        private translations: Record<string, string> = {},
        private locale: string = "en"
    ) {
        this.initializeDefaultCharacteristics();
    }

    /**
     * Initialize default characteristics with translations
     */
    private initializeDefaultCharacteristics() {
        DEFAULT_CHARACTERISTICS.forEach(def => {
            const characteristic: PropertyCharacteristic = {
                id: def.id,
                name: this.translations[def.id] || def.name,
                category: def.category,
                selected: false,
            };
            this.characteristics.set(def.id, characteristic);
        });
    }

    /**
     * Get characteristics filtered by property type and other criteria
     */
    getCharacteristics(filter: CharacteristicsFilter = {}): PropertyCharacteristic[] {
        const allCharacteristics = [
            ...Array.from(this.characteristics.values()),
            ...this.customCharacteristics
        ];

        return allCharacteristics
            .filter(char => {
                // Filter by category
                if (filter.category && char.category !== filter.category) {
                    return false;
                }

                // Filter by property type
                if (filter.propertyType) {
                    const definition = DEFAULT_CHARACTERISTICS.find(def => def.id === char.id);
                    if (definition?.propertyTypes && !definition.propertyTypes.includes(filter.propertyType)) {
                        return false;
                    }
                }

                // Filter by search term
                if (filter.search) {
                    const searchTerm = filter.search.toLowerCase();
                    if (!char.name.toLowerCase().includes(searchTerm)) {
                        return false;
                    }
                }

                // Filter by selection status
                if (filter.selected !== undefined && char.selected !== filter.selected) {
                    return false;
                }

                return true;
            })
            .sort((a, b) => {
                // Sort by order (default characteristics first), then by name
                const aOrder = DEFAULT_CHARACTERISTICS.find(def => def.id === a.id)?.order || 999;
                const bOrder = DEFAULT_CHARACTERISTICS.find(def => def.id === b.id)?.order || 999;

                if (aOrder !== bOrder) {
                    return aOrder - bOrder;
                }

                return a.name.localeCompare(b.name);
            });
    }

    /**
     * Get characteristics grouped by category
     */
    getCharacteristicsByCategory(filter: CharacteristicsFilter = {}): Record<string, PropertyCharacteristic[]> {
        const characteristics = this.getCharacteristics(filter);

        return characteristics.reduce((acc, char) => {
            if (!acc[char.category]) {
                acc[char.category] = [];
            }
            acc[char.category].push(char);
            return acc;
        }, {} as Record<string, PropertyCharacteristic[]>);
    }

    /**
     * Get selected characteristics
     */
    getSelectedCharacteristics(): PropertyCharacteristic[] {
        return this.getCharacteristics({ selected: true });
    }

    /**
     * Toggle characteristic selection
     */
    toggleCharacteristic(characteristicId: string): void {
        const characteristic = this.characteristics.get(characteristicId);
        if (characteristic) {
            characteristic.selected = !characteristic.selected;
        } else {
            // Check custom characteristics
            const customChar = this.customCharacteristics.find(char => char.id === characteristicId);
            if (customChar) {
                customChar.selected = !customChar.selected;
            }
        }
    }

    /**
     * Set characteristic selection state
     */
    setCharacteristicSelected(characteristicId: string, selected: boolean): void {
        const characteristic = this.characteristics.get(characteristicId);
        if (characteristic) {
            characteristic.selected = selected;
        } else {
            // Check custom characteristics
            const customChar = this.customCharacteristics.find(char => char.id === characteristicId);
            if (customChar) {
                customChar.selected = selected;
            }
        }
    }

    /**
     * Add custom characteristic
     */
    addCustomCharacteristic(
        name: string,
        category: "amenity" | "feature" | "location" = "feature"
    ): PropertyCharacteristic {
        const customCharacteristic: PropertyCharacteristic = {
            id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name.trim(),
            category,
            selected: true,
        };

        this.customCharacteristics.push(customCharacteristic);
        return customCharacteristic;
    }

    /**
     * Remove custom characteristic
     */
    removeCustomCharacteristic(characteristicId: string): boolean {
        if (!characteristicId.startsWith("custom_")) {
            return false;
        }

        const index = this.customCharacteristics.findIndex(char => char.id === characteristicId);
        if (index !== -1) {
            this.customCharacteristics.splice(index, 1);
            return true;
        }

        return false;
    }

    /**
     * Update translations and refresh characteristic names
     */
    updateTranslations(translations: Record<string, string>, locale: string): void {
        this.translations = translations;
        this.locale = locale;

        // Update default characteristic names
        this.characteristics.forEach((char, id) => {
            char.name = translations[id] || DEFAULT_CHARACTERISTICS.find(def => def.id === id)?.name || char.name;
        });
    }

    /**
     * Load characteristics from existing data
     */
    loadCharacteristics(characteristics: PropertyCharacteristic[]): void {
        // Reset selections
        this.characteristics.forEach(char => char.selected = false);
        this.customCharacteristics = [];

        // Apply loaded characteristics
        characteristics.forEach(char => {
            if (char.id.startsWith("custom_")) {
                this.customCharacteristics.push({ ...char });
            } else {
                const existing = this.characteristics.get(char.id);
                if (existing) {
                    existing.selected = char.selected;
                }
            }
        });
    }

    /**
     * Export current characteristics state
     */
    exportCharacteristics(): PropertyCharacteristic[] {
        return [
            ...Array.from(this.characteristics.values()),
            ...this.customCharacteristics
        ];
    }

    /**
     * Get characteristics count by category
     */
    getCharacteristicsCount(filter: CharacteristicsFilter = {}): Record<string, number> {
        const characteristics = this.getCharacteristics(filter);

        return characteristics.reduce((acc, char) => {
            acc[char.category] = (acc[char.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }

    /**
     * Get available property types for current characteristics
     */
    getAvailablePropertyTypes(): PropertyType[] {
        const types = new Set<PropertyType>();

        DEFAULT_CHARACTERISTICS.forEach(def => {
            if (def.propertyTypes) {
                def.propertyTypes.forEach(type => types.add(type));
            } else {
                // If no specific types, add all types
                Object.values(PropertyType).forEach(type => types.add(type));
            }
        });

        return Array.from(types);
    }

    /**
     * Validate characteristics for a property type
     */
    validateCharacteristicsForPropertyType(propertyType: PropertyType): {
        valid: PropertyCharacteristic[];
        invalid: PropertyCharacteristic[];
    } {
        const selected = this.getSelectedCharacteristics();
        const valid: PropertyCharacteristic[] = [];
        const invalid: PropertyCharacteristic[] = [];

        selected.forEach(char => {
            if (char.id.startsWith("custom_")) {
                // Custom characteristics are always valid
                valid.push(char);
            } else {
                const definition = DEFAULT_CHARACTERISTICS.find(def => def.id === char.id);
                if (!definition?.propertyTypes || definition.propertyTypes.includes(propertyType)) {
                    valid.push(char);
                } else {
                    invalid.push(char);
                }
            }
        });

        return { valid, invalid };
    }
}