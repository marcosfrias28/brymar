"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TreePine } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { LandWizardData } from "../../land-wizard";

const LAND_TYPES = [
	{ value: "residential", label: "Residencial" },
	{ value: "commercial", label: "Comercial" },
	{ value: "agricultural", label: "Agrícola" },
	{ value: "beachfront", label: "Frente al Mar" },
];

const LandGeneralSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	description: z.string().min(1, "La descripción es requerida"),
	price: z.number().min(1, "El precio es requerido"),
	surface: z.number().min(1, "La superficie es requerida"),
	landType: z.string().min(1, "El tipo de terreno es requerido"),
});

type LandGeneralStepProps = {
	data: LandWizardData;
	onChange: (data: LandWizardData) => void;
};

export function LandGeneralStep({ data, onChange }: LandGeneralStepProps) {
	const form = useForm<z.infer<typeof LandGeneralSchema>>({
		resolver: zodResolver(LandGeneralSchema),
		defaultValues: {
			name: data.name || "",
			description: data.description || "",
			price: data.price || 0,
			surface: data.surface || 0,
			landType: data.landType || "",
		},
	});

	// Watch form values and update parent
	form.watch((values) => {
		onChange({ ...data, ...values });
	});

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TreePine className="h-5 w-5" />
						Información General del Terreno
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Form {...form}>
						<form className="space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nombre del Terreno *</FormLabel>
										<FormControl>
											<Input placeholder="Terreno en Punta Cana" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Descripción *</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Describe las características principales del terreno..."
												rows={3}
												{...field}
											/>
										</FormControl>
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
											<FormLabel>Precio (USD) *</FormLabel>
											<FormControl>
												<Input
													placeholder="100000"
													type="number"
													{...field}
													onChange={(e) =>
														field.onChange(Number(e.target.value))
													}
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
											<FormLabel>Superficie (m²) *</FormLabel>
											<FormControl>
												<Input
													placeholder="1000"
													type="number"
													{...field}
													onChange={(e) =>
														field.onChange(Number(e.target.value))
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="landType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tipo de Terreno *</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecciona el tipo de terreno" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{LAND_TYPES.map((type) => (
													<SelectItem key={type.value} value={type.value}>
														{type.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
