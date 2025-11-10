import type { UseFormReturn } from "react-hook-form";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { PropertyWizardData } from "../types";

export function BasicInfoFields({
	form,
}: {
	form: UseFormReturn<PropertyWizardData>;
}) {
	return (
		<>
			<FormField
				control={form.control}
				name="title"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Título</FormLabel>
						<FormControl>
							<Input
								placeholder="Apartamento de lujo en el centro"
								{...field}
							/>
						</FormControl>
						<FormDescription>
							Un título atractivo ayuda a destacar tu propiedad
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="description"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Descripción</FormLabel>
						<FormControl>
							<textarea
								className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								placeholder="Describe tu propiedad, sus características, ubicación y beneficios..."
								{...field}
							/>
						</FormControl>
						<FormDescription>
							Incluye detalles importantes que hagan tu propiedad más atractiva
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<div className="grid grid-cols-2 gap-4">
				<FormField
					control={form.control}
					name="price"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Precio (€)</FormLabel>
							<FormControl>
								<Input
									placeholder="250000"
									type="number"
									{...field}
									onChange={(e) => field.onChange(Number(e.target.value))}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="surface"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Superficie (m²)</FormLabel>
							<FormControl>
								<Input
									placeholder="120"
									type="number"
									{...field}
									onChange={(e) => field.onChange(Number(e.target.value))}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</>
	);
}
