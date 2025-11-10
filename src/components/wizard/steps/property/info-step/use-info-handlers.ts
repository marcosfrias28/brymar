import type { UseFormReturn } from "react-hook-form";
import type { PropertyWizardData } from "../types";

export const useInfoHandlers = (form: UseFormReturn<PropertyWizardData>) => {
	const addCharacteristic = (characteristic: string) => {
		const current = form.getValues("characteristics");
		if (characteristic.trim() && !current.includes(characteristic.trim())) {
			form.setValue("characteristics", [...current, characteristic.trim()], {
				shouldValidate: true,
			});
		}
	};

	const removeCharacteristic = (characteristic: string) => {
		const current = form.getValues("characteristics");
		form.setValue(
			"characteristics",
			current.filter((c) => c !== characteristic),
			{ shouldValidate: true }
		);
	};

	return {
		addCharacteristic,
		removeCharacteristic,
	};
};
