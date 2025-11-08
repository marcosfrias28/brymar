"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BasicInfoFields } from "./fields/basic-info-fields";
import { LocationFields } from "./fields/location-fields";
import { FormActions } from "./fields/form-actions";
import { handlePropertySubmit } from "./property-form-helpers";
import type {
	PropertyWizardData,
	Coordinates,
	Address,
} from "@/types/property-wizard";
import { PropertyType } from "@/types/wizard";

type PropertyFormProps = {
	initialData?: Partial<PropertyWizardData>;
	isEditing?: boolean;
	onCancel?: () => void;
	onSuccess?: () => void;
	onSubmit?: (data: PropertyWizardData) => Promise<void>;
	onSaveDraft?: (data: PropertyWizardData) => Promise<void>;
	isLoading?: boolean;
};

export function PropertyForm({
	initialData,
	isEditing = false,
	onCancel,
	onSuccess,
}: PropertyFormProps) {
	const [coordinates, setCoordinates] = useState<Coordinates | undefined>(
		initialData?.coordinates
	);
	const [address, setAddress] = useState<Address | undefined>(
		initialData?.address
	);
	const [formData, setFormData] = useState<Partial<PropertyWizardData>>({
		title: initialData?.title ?? "",
		description: initialData?.description ?? "",
		price: initialData?.price ?? 0,
		surface: initialData?.surface ?? 0,
		propertyType: initialData?.propertyType ?? PropertyType.APARTMENT,
		bedrooms: initialData?.bedrooms ?? undefined,
		bathrooms: initialData?.bathrooms ?? undefined,
		characteristics: initialData?.characteristics ?? [],
		images: initialData?.images ?? [],
		language: initialData?.language ?? "es",
	});

	const handleSubmit = async (data: PropertyWizardData) => {
		await handlePropertySubmit(data, isEditing, onSuccess);
	};

	const updateField = (field: keyof PropertyWizardData, value: unknown) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<form
			className="space-y-6"
			onSubmit={(e) => {
				e.preventDefault();
				handleSubmit(formData as PropertyWizardData);
			}}
		>
			<Card>
				<CardHeader>
					<CardTitle>Información básica</CardTitle>
				</CardHeader>
				<CardContent>
					<BasicInfoFields formData={formData} updateField={updateField} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Ubicación</CardTitle>
				</CardHeader>
				<CardContent>
					<LocationFields
						address={address}
						coordinates={coordinates}
						onAddressChange={setAddress}
						onCoordinatesChange={setCoordinates}
					/>
				</CardContent>
			</Card>

			<FormActions isEditing={isEditing} onCancel={onCancel} />
		</form>
	);
}
