import { renderHook } from "@testing-library/react";
import { useStepValidation } from "../use-step-validation";
import { PropertyType } from "@/types/wizard";

describe("useStepValidation (Enhanced)", () => {
    const mockPropertyData = {
        title: "Beautiful House",
        description: "A wonderful property with great amenities and excellent location",
        price: 150000,
        surface: 200,
        propertyType: PropertyType.HOUSE,
        bedrooms: 3,
        bathrooms: 2,
        characteristics: [
            { id: "1", name: "Pool", category: "amenity" as const, selected: true },
            { id: "2", name: "Garden", category: "feature" as const, selected: true }
        ],
        coordinates: { latitude: 18.5, longitude: -70.0 },
        address: {
            street: "Main Street 123",
            city: "Santo Domingo",
            province: "Distrito Nacional",
            country: "Dominican Republic" as const,
            formattedAddress: "Main Street 123, Santo Domingo, Distrito Nacional"
        },
        images: [
            {
                id: "1",
                url: "https://example.com/image1.jpg",
                filename: "image1.jpg",
                size: 1024000,
                contentType: "image/jpeg",
                displayOrder: 0
            }
        ]
    };

    it("validates step 1 correctly with complete data", () => {
        const { result } = renderHook(() => useStepValidation());

        const validation = result.current.validateStep(1, mockPropertyData);

        expect(validation.isValid).toBe(true);
        expect(validation.completion).toBe(100);
        expect(validation.errors).toHaveLength(0);
        expect(validation.canProceed).toBe(true);
        expect(validation.requiredFields).toContain("Título");
        expect(validation.requiredFields).toContain("Precio");
        expect(validation.missingFields).toHaveLength(0);
    });

    it("validates step 1 with missing required fields", () => {
        const { result } = renderHook(() => useStepValidation());

        const incompleteData = {
            title: "",
            description: "",
            price: 0,
            surface: 0
        };

        const validation = result.current.validateStep(1, incompleteData);

        expect(validation.isValid).toBe(false);
        expect(validation.completion).toBeLessThan(100);
        expect(validation.errors.length).toBeGreaterThan(0);
        expect(validation.canProceed).toBe(false);
        expect(validation.missingFields).toContain("Título");
        expect(validation.missingFields).toContain("Precio");
    });

    it("validates step 2 correctly with complete location data", () => {
        const { result } = renderHook(() => useStepValidation());

        const validation = result.current.validateStep(2, mockPropertyData);

        expect(validation.isValid).toBe(true);
        expect(validation.completion).toBe(100);
        expect(validation.errors).toHaveLength(0);
        expect(validation.canProceed).toBe(true);
    });

    it("validates step 2 with missing coordinates", () => {
        const { result } = renderHook(() => useStepValidation());

        const dataWithoutCoordinates = {
            ...mockPropertyData,
            coordinates: undefined
        };

        const validation = result.current.validateStep(2, dataWithoutCoordinates);

        expect(validation.isValid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);
        expect(validation.missingFields).toContain("Ubicación en el mapa");
    });

    it("validates step 3 correctly with images", () => {
        const { result } = renderHook(() => useStepValidation());

        const validation = result.current.validateStep(3, mockPropertyData);

        expect(validation.isValid).toBe(true);
        expect(validation.completion).toBe(100);
        expect(validation.errors).toHaveLength(0);
        expect(validation.canProceed).toBe(true);
    });

    it("validates step 3 with missing images", () => {
        const { result } = renderHook(() => useStepValidation());

        const dataWithoutImages = {
            ...mockPropertyData,
            images: []
        };

        const validation = result.current.validateStep(3, dataWithoutImages);

        expect(validation.isValid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);
        expect(validation.missingFields).toContain("Imágenes");
    });

    it("validates all steps correctly", () => {
        const { result } = renderHook(() => useStepValidation());

        const allValidations = result.current.validateAllSteps(mockPropertyData);

        expect(allValidations[1].isValid).toBe(true);
        expect(allValidations[2].isValid).toBe(true);
        expect(allValidations[3].isValid).toBe(true);
        expect(allValidations[4].isValid).toBe(true);
    });

    it("checks navigation permissions correctly", () => {
        const { result } = renderHook(() => useStepValidation());

        // Can always navigate backwards
        expect(result.current.canNavigateToStep(1, 3, mockPropertyData)).toBe(true);

        // Can navigate to preview step (step 4) from any step
        expect(result.current.canNavigateToStep(4, 1, mockPropertyData)).toBe(true);

        // Can navigate forward if previous steps are valid
        expect(result.current.canNavigateToStep(2, 1, mockPropertyData)).toBe(true);
        expect(result.current.canNavigateToStep(3, 2, mockPropertyData)).toBe(true);
    });

    it("prevents navigation with invalid data", () => {
        const { result } = renderHook(() => useStepValidation());

        const invalidData = {
            title: "",
            description: "",
            price: 0
        };

        // Cannot navigate forward with invalid step 1 data
        expect(result.current.canNavigateToStep(2, 1, invalidData)).toBe(false);
        expect(result.current.canNavigateToStep(3, 1, invalidData)).toBe(false);
    });

    it("calculates overall progress correctly", () => {
        const { result } = renderHook(() => useStepValidation());

        const progress = result.current.getOverallProgress(mockPropertyData);

        expect(progress).toBe(100);
    });

    it("finds next incomplete step", () => {
        const { result } = renderHook(() => useStepValidation());

        const incompleteData = {
            title: "Test",
            description: "Test description that is long enough to pass validation",
            price: 100000,
            surface: 150,
            propertyType: PropertyType.HOUSE,
            characteristics: [
                { id: "1", name: "Pool", category: "amenity" as const, selected: true }
            ]
            // Missing coordinates and images
        };

        const nextStep = result.current.getNextIncompleteStep(incompleteData);

        expect(nextStep).toBe(2); // Location step is next incomplete
    });

    it("validates individual fields correctly", () => {
        const { result } = renderHook(() => useStepValidation());

        // Valid field
        const validFieldValidation = result.current.getFieldValidation(1, "title", mockPropertyData);
        expect(validFieldValidation.isValid).toBe(true);
        expect(validFieldValidation.error).toBeUndefined();

        // Invalid field
        const invalidFieldValidation = result.current.getFieldValidation(1, "title", { title: "" });
        expect(invalidFieldValidation.isValid).toBe(false);
        expect(invalidFieldValidation.error).toBeDefined();
    });

    it("generates warnings for suboptimal values", () => {
        const { result } = renderHook(() => useStepValidation());

        const dataWithShortTitle = {
            ...mockPropertyData,
            title: "Short" // Less than recommended 20 characters
        };

        const validation = result.current.validateStep(1, dataWithShortTitle);

        expect(validation.warnings.length).toBeGreaterThan(0);
        expect(validation.warnings.some(w => w.field === "Título")).toBe(true);
    });
});