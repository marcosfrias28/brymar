// Property Wizard Actions - Direct Entity Management

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
	PropertyCompleteSchema,
	PropertyDraftSchema,
} from "@/lib/schemas/property-wizard-schemas";
import type {
	CreatePropertyInput,
	PropertyFeaturesInput,
	PropertyType as PropertyTypeUnion,
	UpdatePropertyInput,
} from "@/lib/types/properties";
import type { AddressInput, Currency, ImageInput } from "@/lib/types/shared";
import {
	type ActionState,
	createErrorResponse,
	createSuccessResponse,
} from "@/lib/validations";
import type { PropertyWizardData } from "@/types/property-wizard";
import type { PropertyType } from "@/types/wizard";
import { createProperty, getPropertyById, updateProperty } from "./properties";

// Schema for creating/updating a property from wizard
const propertyWizardSchema = z.object({
	userId: z.string().min(1, "User ID is required"),
	data: PropertyDraftSchema, // Allow partial data for auto-save
	propertyId: z.string().optional(), // For updates
});

// Schema for publishing a property
const publishPropertySchema = z.object({
	userId: z.string().min(1, "User ID is required"),
	propertyId: z.string().min(1, "Property ID is required"),
	data: PropertyCompleteSchema, // Require complete data for publishing
});

/**
 * Create or update a property from wizard (auto-save functionality)
 */
export async function savePropertyFromWizard(
	data: z.infer<typeof propertyWizardSchema>
): Promise<ActionState<{ propertyId: string }>> {
	try {
		// Validate input
		const validatedData = propertyWizardSchema.parse(data);

		// Map wizard data to typed Create/Update inputs
		const images: ImageInput[] = (validatedData.data.images || []).map(
			(img) => ({
				filename: img.filename,
				mimeType: img.contentType,
				url: img.url,
			})
		);

		const address: AddressInput | undefined = validatedData.data.address
			? {
					street: validatedData.data.address.street,
					city: validatedData.data.address.city,
					state: validatedData.data.address.province,
					country: validatedData.data.address.country,
					postalCode: validatedData.data.address.postalCode,
					coordinates: validatedData.data.coordinates
						? {
								latitude: validatedData.data.coordinates.latitude,
								longitude: validatedData.data.coordinates.longitude,
							}
						: undefined,
				}
			: undefined;

		const features: PropertyFeaturesInput = {
			bedrooms: validatedData.data.bedrooms || 0,
			bathrooms: validatedData.data.bathrooms || 0,
			area: validatedData.data.surface || 0,
			amenities:
				validatedData.data.characteristics
					?.filter((char) => char.category === "amenity")
					.map((char) => char.name) || [],
			features:
				validatedData.data.characteristics
					?.filter((char) => char.category === "feature")
					.map((char) => char.name) || [],
		};

		let result;

		if (validatedData.propertyId) {
			// Update existing property
			const updateInput: UpdatePropertyInput = {
				id: validatedData.propertyId,
				title: validatedData.data.title,
				description: validatedData.data.description,
				price: validatedData.data.price,
				currency: "USD" as Currency,
				type: validatedData.data.propertyType as PropertyTypeUnion,
				address,
				features,
				images,
			};
			result = await updateProperty(updateInput as UpdatePropertyInput);
		} else {
			// Create new property
			const createInput: CreatePropertyInput = {
				title: validatedData.data.title || "Propiedad sin título",
				description: validatedData.data.description || "Descripción pendiente",
				price: validatedData.data.price || 0,
				currency: "USD" as Currency,
				type: (validatedData.data.propertyType as PropertyTypeUnion) || "house",
				address: address || {
					street: "",
					city: "",
					state: "",
					country: "",
					postalCode: "",
				},
				features,
				images,
			};
			result = await createProperty(createInput as CreatePropertyInput);
		}

		if (!result.success) {
			return createErrorResponse(
				result.error || "Error al guardar la propiedad"
			) as ActionState<{ propertyId: string }>;
		}

		// Revalidate relevant paths
		revalidatePath("/dashboard");
		revalidatePath("/dashboard/properties");

		return createSuccessResponse(
			{ propertyId: result.data!.id.toString() },
			"Propiedad guardada exitosamente"
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return createErrorResponse(
				"Datos de propiedad inválidos"
			) as ActionState<{ propertyId: string }>;
		}

		return createErrorResponse("Error al guardar la propiedad") as ActionState<{
			propertyId: string;
		}>;
	}
}

/**
 * Publish a property (change status from draft to published)
 */
export async function publishProperty(
	data: z.infer<typeof publishPropertySchema>
): Promise<ActionState<{ propertyId: string }>> {
	try {
		// Validate input - requires complete data
		const validatedData = publishPropertySchema.parse(data);

		// Map wizard data to update input
		const images: ImageInput[] = (validatedData.data.images || []).map(
			(img) => ({
				filename: img.filename,
				mimeType: img.contentType,
				url: img.url,
			})
		);

		const address: AddressInput | undefined = validatedData.data.address
			? {
					street: validatedData.data.address.street,
					city: validatedData.data.address.city,
					state: validatedData.data.address.province,
					country: validatedData.data.address.country,
					postalCode: validatedData.data.address.postalCode,
					coordinates: validatedData.data.coordinates
						? {
								latitude: validatedData.data.coordinates.latitude,
								longitude: validatedData.data.coordinates.longitude,
							}
						: undefined,
				}
			: undefined;

		const features: PropertyFeaturesInput = {
			bedrooms: validatedData.data.bedrooms || 0,
			bathrooms: validatedData.data.bathrooms || 0,
			area: validatedData.data.surface || 0,
			amenities:
				validatedData.data.characteristics
					?.filter((char) => char.category === "amenity")
					.map((char) => char.name) || [],
			features:
				validatedData.data.characteristics
					?.filter((char) => char.category === "feature")
					.map((char) => char.name) || [],
		};

		// Update property with published status
		const updateInput: UpdatePropertyInput = {
			id: validatedData.propertyId,
			title: validatedData.data.title,
			description: validatedData.data.description,
			price: validatedData.data.price,
			currency: "USD" as Currency,
			type: validatedData.data.propertyType as PropertyTypeUnion,
			address,
			features,
			images,
		};

		const result = await updateProperty(updateInput);

		if (!result.success) {
			return createErrorResponse(
				result.error || "Error al publicar la propiedad"
			) as ActionState<{ propertyId: string }>;
		}

		// Revalidate relevant paths
		revalidatePath("/dashboard");
		revalidatePath("/dashboard/properties");
		revalidatePath("/properties");

		return createSuccessResponse(
			{ propertyId: result.data!.id.toString() },
			"Propiedad publicada exitosamente"
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return createErrorResponse(
				"Datos de propiedad incompletos para publicar"
			) as ActionState<{ propertyId: string }>;
		}

		return createErrorResponse(
			"Error al publicar la propiedad"
		) as ActionState<{ propertyId: string }>;
	}
}

/**
 * Load property data for editing in wizard
 */
export async function loadPropertyForWizard(
	propertyId: string,
	_userId: string
): Promise<
	ActionState<{
		data: Partial<PropertyWizardData>;
	}>
> {
	try {
		// Load property data
		const result = await getPropertyById(propertyId);

		if (!(result.success && result.data)) {
			return createErrorResponse("Propiedad no encontrada") as ActionState<{
				data: Partial<PropertyWizardData>;
			}>;
		}

		const property = result.data;

		// Transform property data to wizard format
		const transformedData = {
			id: property.id.toString(),
			title: property.title,
			description: property.description,
			status: (property.status as "draft" | "published") || "draft",
			price: property.price,
			surface: property.features?.area || 0,
			propertyType: property.type as PropertyType,
			bedrooms: property.features?.bedrooms,
			bathrooms: property.features?.bathrooms,
			characteristics: [
				...(property.features?.amenities?.map((amenity: string) => ({
					id: amenity,
					name: amenity,
					category: "amenity" as const,
					selected: true,
				})) || []),
				...(property.features?.features?.map((feature: string) => ({
					id: feature,
					name: feature,
					category: "feature" as const,
					selected: true,
				})) || []),
			],
			address: property.address
				? {
						street: property.address.street,
						city: property.address.city,
						province: property.address.state,
						country: property.address.country,
						postalCode: property.address.postalCode,
						formattedAddress: `${property.address.street}, ${property.address.city}`,
					}
				: undefined,
			coordinates: property.address?.coordinates
				? {
						latitude: property.address.coordinates.latitude,
						longitude: property.address.coordinates.longitude,
					}
				: undefined,
			images:
				property.images?.map((img, index) => ({
					id: img.url,
					url: img.url,
					filename: img.filename,
					size: 0, // Not stored in property
					contentType: img.mimeType,
					displayOrder: index,
				})) || [],
			language: "es" as const,
			aiGenerated: {
				title: false,
				description: false,
				tags: false,
			},
		};

		return createSuccessResponse(
			{ data: transformedData },
			"Propiedad cargada exitosamente"
		);
	} catch (_error) {
		return createErrorResponse("Error al cargar la propiedad") as ActionState<{
			data: Partial<PropertyWizardData>;
		}>;
	}
}

/**
 * Auto-save property data (simplified version of savePropertyFromWizard)
 */
export async function autoSaveProperty(
	data: Partial<PropertyWizardData>,
	userId: string,
	propertyId?: string
): Promise<{ success: boolean; propertyId?: string; error?: string }> {
	try {
		// Filter out undefined values and ensure required defaults for schema validation
		const filteredData = Object.fromEntries(
			Object.entries(data).filter(([_, value]) => value !== undefined)
		);

		const dataWithDefaults = {
			...filteredData,
			status: data.status || ("draft" as const),
			language: data.language || ("es" as const),
			aiGenerated: data.aiGenerated || {
				title: false,
				description: false,
				tags: false,
			},
		};

		const result = await savePropertyFromWizard({
			userId,
			data: dataWithDefaults,
			propertyId,
		});

		const success = !!result.success;
		return {
			success,
			propertyId: success ? result.data!.propertyId : undefined,
			error: success ? undefined : result.error,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Auto-save failed",
		};
	}
}

/**
 * Validate property step data
 */
export async function validatePropertyStep(
	stepData: any,
	stepNumber: number
): Promise<ActionState<{ isValid: boolean }>> {
	try {
		// Basic validation based on step
		let isValid = false;

		switch (stepNumber) {
			case 1: // General info
				isValid = !!(
					stepData.title &&
					stepData.description &&
					stepData.price &&
					stepData.surface
				);
				break;
			case 2: // Location
				isValid = !!(stepData.address || stepData.coordinates);
				break;
			case 3: // Media
				isValid = !!(stepData.images && stepData.images.length > 0);
				break;
			case 4: // Preview
				isValid = true; // Preview step doesn't require validation
				break;
			default:
				isValid = false;
		}

		return createSuccessResponse(
			{ isValid },
			isValid ? "Paso válido" : "Paso incompleto"
		);
	} catch (_error) {
		return createErrorResponse("Error al validar el paso") as ActionState<{
			isValid: boolean;
		}>;
	}
}
