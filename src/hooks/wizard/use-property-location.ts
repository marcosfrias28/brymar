import { useState, useEffect } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropertyLocationSchema } from "@/lib/schemas/property-wizard-schemas";
import type { PropertyWizardData } from "@/components/wizard/steps/property/types";

const DEFAULT_ADDRESS = {
	street: "",
	city: "",
	state: "",
	postalCode: "",
	country: "República Dominicana",
} as const;

const DEFAULT_COORDINATES = { lat: 0, lng: 0 } as const;

const convertCoordinates = (
	coords: { lat?: number; lng?: number } | null | undefined
): { latitude: number; longitude: number } | undefined => {
	if (!coords) {
		return;
	}
	const hasCoordinates =
		typeof coords.lat === "number" && typeof coords.lng === "number";
	if (!hasCoordinates) {
		return;
	}
	return { latitude: coords.lat as number, longitude: coords.lng as number };
};

const createFormDefaultValues = (data: PropertyWizardData) => ({
	address: data.address || DEFAULT_ADDRESS,
	coordinates: data.coordinates || DEFAULT_COORDINATES,
});

const createFieldUpdaters = (form: UseFormReturn<PropertyWizardData>) => ({
	onUpdateAddressField: (field: string, value: string) => {
		const currentAddress = form.getValues("address") || {};
		form.setValue(
			"address",
			{ ...currentAddress, [field]: value },
			{ shouldValidate: true }
		);
	},
	onUpdateCoordinates: (field: "lat" | "lng", value: number) => {
		const currentCoords = form.getValues("coordinates") || DEFAULT_COORDINATES;
		form.setValue(
			"coordinates",
			{ ...currentCoords, [field]: value },
			{ shouldValidate: true }
		);
	},
});

const createFormCallbacks = (
	form: UseFormReturn<PropertyWizardData>,
	setMapError: (error: string | null) => void,
	setUseFormFallback: (value: boolean) => void
) => ({
	onCoordinatesChange: (coords: { latitude: number; longitude: number }) => {
		form.setValue(
			"coordinates",
			{ lat: coords.latitude, lng: coords.longitude },
			{ shouldValidate: true }
		);
	},
	onAddressChange: (address: Record<string, string>) => {
		form.setValue(
			"address",
			{ ...DEFAULT_ADDRESS, ...address },
			{ shouldValidate: true }
		);
	},
	handleMapError: (error: string) => {
		setMapError(error);
		setUseFormFallback(true);
	},
	retryMap: () => {
		setMapError(null);
		setUseFormFallback(false);
	},
});

export const usePropertyLocation = (
	initialData: PropertyWizardData,
	onDataChange: (data: PropertyWizardData) => void
) => {
	const [mapError, setMapError] = useState<string | null>(null);
	const [useFormFallback, setUseFormFallback] = useState(false);

	const form = useForm<PropertyWizardData>({
		resolver: zodResolver(PropertyLocationSchema),
		defaultValues: createFormDefaultValues(initialData),
		mode: "onChange",
	});

	useEffect(() => {
		const subscription = form.watch((formData) => {
			onDataChange({ ...initialData, ...formData } as PropertyWizardData);
		});
		return () => subscription.unsubscribe();
	}, [form, onDataChange, initialData]);

	const { onUpdateAddressField, onUpdateCoordinates } =
		createFieldUpdaters(form);
	const { onCoordinatesChange, onAddressChange, handleMapError, retryMap } =
		createFormCallbacks(form, setMapError, setUseFormFallback);

	return {
		form,
		mapError,
		useFormFallback,
		setUseFormFallback,
		onUpdateAddressField,
		onUpdateCoordinates,
		onCoordinatesChange,
		onAddressChange,
		handleMapError,
		retryMap,
		coordinates: convertCoordinates(form.watch("coordinates")),
	};
};
