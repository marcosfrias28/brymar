import type { UseFormReturn } from "react-hook-form";
import {
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { CHARACTERISTICS_OPTIONS } from "./constants";
import type { PropertyWizardData } from "../types";

export function CharacteristicsSelector({
	form,
	onAdd,
	onRemove,
}: {
	form: UseFormReturn<PropertyWizardData>;
	onAdd: (characteristic: string) => void;
	onRemove: (characteristic: string) => void;
}) {
	return (
		<FormField
			control={form.control}
			name="characteristics"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Características adicionales</FormLabel>
					<div className="space-y-3">
						<select
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							onChange={(e) => {
								if (e.target.value) {
									onAdd(e.target.value);
									e.target.value = "";
								}
							}}
						>
							<option value="">Selecciona características</option>
							{CHARACTERISTICS_OPTIONS.filter(
								(option) => !field.value.includes(option)
							).map((characteristic) => (
								<option key={characteristic} value={characteristic}>
									{characteristic}
								</option>
							))}
						</select>

						{field.value.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{field.value.map((characteristic) => (
									<Badge
										className="flex items-center gap-1 pr-1"
										key={characteristic}
										variant="secondary"
									>
										{characteristic}
										<Button
											className="h-auto p-0 text-muted-foreground hover:text-destructive"
											onClick={() => onRemove(characteristic)}
											size="sm"
											type="button"
											variant="ghost"
										>
											<X className="h-3 w-3" strokeWidth={1.5} />
										</Button>
									</Badge>
								))}
							</div>
						)}
					</div>
					<FormDescription>
						Selecciona las características más importantes de tu propiedad
					</FormDescription>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
