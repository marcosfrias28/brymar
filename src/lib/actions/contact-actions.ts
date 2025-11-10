"use server";

import { z } from "zod";
import { extractValidationErrors, type FormState } from "@/lib/types/forms";

// Constants for validation
const MIN_NAME_LENGTH = 2;
const MIN_PHONE_LENGTH = 8;
const MIN_MESSAGE_LENGTH = 10;
const PROCESSING_DELAY_MS = 1000;

// Contact form validation schema
const ContactFormSchema = z.object({
	name: z.string().min(MIN_NAME_LENGTH, "El nombre es requerido y debe tener al menos 2 caracteres"),
	email: z.string().email("Ingresa un correo electrónico válido"),
	phone: z.string().min(MIN_PHONE_LENGTH, "Ingresa un número de teléfono válido"),
	message: z.string().min(MIN_MESSAGE_LENGTH, "El mensaje debe tener al menos 10 caracteres"),
});

/**
 * Contact form action using FormState pattern
 */
export async function contactFormAction(
	_prevState: FormState,
	formData: FormData
): Promise<FormState> {
	try {
		// Parse form data
		const data = {
			name: formData.get("name") as string,
			email: formData.get("email") as string,
			phone: formData.get("phone") as string,
			message: formData.get("message") as string,
		};

		// Validate with Zod schema
		const validation = ContactFormSchema.safeParse(data);

		if (!validation.success) {
			return {
				success: false,
				errors: extractValidationErrors(validation.error),
			};
		}

		// Simulate processing time
		await new Promise((resolve) => setTimeout(resolve, PROCESSING_DELAY_MS));

		// TODO: Implement actual contact form processing
		// - Send email notification
		// - Save to database
		// - Integrate with CRM
		// - Send confirmation to user

		return {
			success: true,
			message: "¡Gracias por contactarnos! Te responderemos pronto.",
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "Error al enviar el formulario",
		};
	}
}
