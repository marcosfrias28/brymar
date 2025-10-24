/**
 * Avatar upload server action using @vercel/blob directly
 */

"use server";

import { put } from "@vercel/blob";
import { validateBlobConfig } from "@/lib/config/blob-config";
import type { ActionState } from "@/lib/validations";

export async function uploadAvatarAction(
	prevState: ActionState<{ url: string }>,
	formData: FormData
): Promise<ActionState<{ url: string }>> {
	try {
		const file = formData.get("avatar") as File;

		if (!file) {
			return {
				success: false,
				error: "No se encontró el archivo",
			};
		}

		// Validate blob configuration
		const blobConfig = validateBlobConfig();
		if (!blobConfig.isConfigured) {
			return {
				success: false,
				error: "El almacenamiento de archivos no está configurado",
			};
		}

		// Generate filename with timestamp to avoid conflicts
		const timestamp = Date.now();
		const filename = `avatar-${timestamp}-${file.name}`;

		// Upload file directly to Vercel Blob
		const blob = await put(filename, file, {
			access: "public",
		});

		return {
			success: true,
			data: {
				url: blob.url,
			},
		};
	} catch (error) {
		console.error("Error uploading avatar:", error);
		return {
			success: false,
			error: "Error al subir el archivo",
		};
	}
}
