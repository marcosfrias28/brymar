import type { UseFormReturn } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { PropertyWizardData } from "../types";

export function BedroomBathroomFields({
	form,
}: {
	form: UseFormReturn<PropertyWizardData>;
}) {
	const propertyType = form.watch("propertyType");
	if (propertyType !== "apartment" && propertyType !== "house") {
		return null;
	}

	return (
		<div className="grid grid-cols-2 gap-4">
			<FormField
				control={form.control}
				name="bedrooms"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Dormitorios</FormLabel>
						<FormControl>
							<Input
								placeholder="2"
								type="number"
								{...field}
								onChange={(e) =>
									field.onChange(e.target.value ? Number(e.target.value) : undefined)
								}
								value={field.value || ""}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="bathrooms"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Baños</FormLabel>
						<FormControl>
							<Input
								placeholder="2"
								type="number"
								{...field}
								onChange={(e) =>
									field.onChange(e.target.value ? Number(e.target.value) : undefined)
								}
								value={field.value || ""}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
}
