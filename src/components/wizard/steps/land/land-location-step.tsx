"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin } from "lucide-react";
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
import type { LandWizardData } from "../../land-wizard";

const LandLocationSchema = z.object({
	location: z.string().min(1, "La ubicación es requerida"),
});

type LandLocationStepProps = {
	data: LandWizardData;
	onChange: (data: LandWizardData) => void;
};

export function LandLocationStep({ data, onChange }: LandLocationStepProps) {
	const form = useForm<z.infer<typeof LandLocationSchema>>({
		resolver: zodResolver(LandLocationSchema),
		defaultValues: {
			location: data.location || "",
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
						<MapPin className="h-5 w-5" />
						Ubicación del Terreno
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Form {...form}>
						<form className="space-y-4">
							<FormField
								control={form.control}
								name="location"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Ubicación *</FormLabel>
										<FormControl>
											<Input
												placeholder="Punta Cana, República Dominicana"
												{...field}
											/>
										</FormControl>
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
