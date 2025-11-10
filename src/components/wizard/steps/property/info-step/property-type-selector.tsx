import type { UseFormReturn } from "react-hook-form";
import {
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PROPERTY_TYPES } from "./constants";
import type { PropertyWizardData } from "../types";

export function PropertyTypeSelector({
	form,
}: {
	form: UseFormReturn<PropertyWizardData>;
}) {
	return (
		<FormField
			control={form.control}
			name="propertyType"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Tipo de propiedad</FormLabel>
					<div className="grid grid-cols-2 gap-3">
						{PROPERTY_TYPES.map(({ value, label, icon: Icon }) => (
							<Button
								className={cn(
									"h-auto justify-start p-4",
									field.value === value
										? "border-primary bg-primary text-primary-foreground"
										: "border-border bg-background hover:bg-accent"
								)}
								key={value}
								onClick={() => field.onChange(value)}
								type="button"
								variant="outline"
							>
								<Icon className="mr-2 h-5 w-5" strokeWidth={1.5} />
								<span className="font-medium text-sm">{label}</span>
							</Button>
						))}
					</div>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
