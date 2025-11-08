import { z } from "zod";
import { PropertyType } from "@/types/wizard";

// Esquema del formulario de Propiedad (RHF)
export const PropertyFormSchema = z.object({
	title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
	description: z
		.string()
		.min(10, "La descripción debe tener al menos 10 caracteres"),
	price: z.coerce.number().positive("El precio debe ser mayor a 0"),
	surface: z.coerce.number().positive("La superficie debe ser mayor a 0"),
	propertyType: z.nativeEnum(PropertyType, {
		message: "Selecciona un tipo de propiedad válido",
	}),
	bedrooms: z.coerce.number().int().min(0).optional(),
	bathrooms: z.coerce.number().int().min(0).optional(),
	coordinates: z.any().optional(),
	address: z.any().optional(),
	geometry: z.any().optional(),
});

export type PropertyFormData = z.infer<typeof PropertyFormSchema>;
