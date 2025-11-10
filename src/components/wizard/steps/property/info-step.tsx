"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { PropertyGeneralSchema } from "@/lib/schemas/property-wizard-schemas";
import type { PropertyStepProps, PropertyWizardData } from "./types";
import { BasicInfoFields } from "./info-step/basic-info-fields";
import { PropertyTypeSelector } from "./info-step/property-type-selector";
import { BedroomBathroomFields } from "./info-step/bedroom-bathroom-fields";
import { CharacteristicsSelector } from "./info-step/characteristics-selector";
import { useInfoHandlers } from "./info-step/use-info-handlers";

export function PropertyInfoStep({ 
	data, 
	onChange,
}: PropertyStepProps) {
	const form = useForm<PropertyWizardData>({
		resolver: zodResolver(PropertyGeneralSchema),
		defaultValues: {
			title: data.title || "",
			description: data.description || "",
			price: data.price || 0,
			surface: data.surface || 0,
			propertyType: data.propertyType || "apartment",
			bedrooms: data.bedrooms,
			bathrooms: data.bathrooms,
			characteristics: data.characteristics || [],
		},
		mode: "onChange",
	});

	const { addCharacteristic, removeCharacteristic } = useInfoHandlers(form);

	useEffect(() => {
		const subscription = form.watch((formData) => {
			onChange(formData as PropertyWizardData);
		});
		return () => subscription.unsubscribe();
	}, [form, onChange]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Información básica</CardTitle>
				<CardDescription>
					Describe tu propiedad y sus características principales
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form className="space-y-6">
						<BasicInfoFields form={form} />
						<PropertyTypeSelector form={form} />
						<BedroomBathroomFields form={form} />
						<CharacteristicsSelector
							form={form}
							onAdd={addCharacteristic}
							onRemove={removeCharacteristic}
						/>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
