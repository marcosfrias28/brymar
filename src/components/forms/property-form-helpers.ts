import { toast } from "sonner";
import { createPropertyAction } from "@/lib/actions/property-actions";
import type { PropertyWizardData } from "@/types/property-wizard";

export async function handlePropertySubmit(
	data: PropertyWizardData,
	isEditing: boolean,
	onSuccess?: () => void
) {
	try {
		// Convert PropertyWizardData to FormData for the action
		const actionFormData = new FormData();
		actionFormData.append("title", data.title || "");
		actionFormData.append("description", data.description || "");
		actionFormData.append("price", String(data.price || 0));
		actionFormData.append("surface", String(data.surface || 0));
		actionFormData.append("propertyType", data.propertyType || "apartment");

		if (data.bedrooms) {
			actionFormData.append("bedrooms", String(data.bedrooms));
		}
		if (data.bathrooms) {
			actionFormData.append("bathrooms", String(data.bathrooms));
		}
		if (data.address) {
			actionFormData.append("address", JSON.stringify(data.address));
		}
		if (data.coordinates) {
			actionFormData.append("coordinates", JSON.stringify(data.coordinates));
		}

		const result = await createPropertyAction(
			{ success: false, data: { id: "" }, errors: {} },
			actionFormData
		);

		if (result.success) {
			toast.success(
				isEditing
					? "Propiedad actualizada correctamente"
					: "Propiedad creada correctamente"
			);
			onSuccess?.();
		} else {
			toast.error("Error al guardar la propiedad");
		}
	} catch {
		toast.error("Error inesperado al guardar la propiedad");
	}
}
