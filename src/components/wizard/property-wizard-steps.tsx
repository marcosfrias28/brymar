"use client";

import { useState, useCallback } from "react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
	AlertCircle,
	RefreshCw,
	X,
	Plus,
	Upload,
	Square,
	Home,
	Building,
	Trees,
	Store,
} from "lucide-react";
import { InteractiveMap } from "./shared/interactive-map";
import type { Coordinates } from "@/types/wizard";

// Validation constants
const MIN_TITLE_LENGTH = 5;
const MAX_TITLE_LENGTH = 100;
const MIN_DESCRIPTION_LENGTH = 20;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_PRICE = 10_000_000;
const MAX_SURFACE = 10_000;
const MAX_BEDROOMS = 20;
const MAX_BATHROOMS = 20;
const MAX_CHARACTERISTICS = 20;
const MAX_IMAGES = 50;
const MAX_VIDEOS = 10;
const MIN_STREET_LENGTH = 5;
const MIN_CITY_LENGTH = 2;
const MIN_STATE_LENGTH = 2;
const MIN_COUNTRY_LENGTH = 2;
const MIN_LAT = -90;
const MAX_LAT = 90;
const MIN_LNG = -180;
const MAX_LNG = 180;

// Enhanced property wizard schema with better validation
export const PropertyWizardSchema = z.object({
	// Base info
	title: z
		.string()
		.min(
			MIN_TITLE_LENGTH,
			`El título debe tener al menos ${MIN_TITLE_LENGTH} caracteres`
		)
		.max(
			MAX_TITLE_LENGTH,
			`El título no puede exceder ${MAX_TITLE_LENGTH} caracteres`
		),
	description: z
		.string()
		.min(
			MIN_DESCRIPTION_LENGTH,
			`La descripción debe tener al menos ${MIN_DESCRIPTION_LENGTH} caracteres`
		)
		.max(
			MAX_DESCRIPTION_LENGTH,
			`La descripción no puede exceder ${MAX_DESCRIPTION_LENGTH} caracteres`
		),

	// Property details
	price: z
		.number()
		.min(1, "El precio es requerido")
		.max(MAX_PRICE, `El precio no puede exceder ${MAX_PRICE.toLocaleString()}`),
	surface: z
		.number()
		.min(1, "La superficie es requerida")
		.max(
			MAX_SURFACE,
			`La superficie no puede exceder ${MAX_SURFACE.toLocaleString()} m²`
		),
	propertyType: z.enum(["house", "apartment", "villa", "land", "commercial"]),
	bedrooms: z
		.number()
		.min(0, "Los dormitorios no pueden ser negativos")
		.max(MAX_BEDROOMS, `No puede haber más de ${MAX_BEDROOMS} dormitorios`),
	bathrooms: z
		.number()
		.min(0, "Los baños no pueden ser negativos")
		.max(MAX_BATHROOMS, `No puede haber más de ${MAX_BATHROOMS} baños`),

	// Location
	address: z.object({
		street: z
			.string()
			.min(
				MIN_STREET_LENGTH,
				`La calle debe tener al menos ${MIN_STREET_LENGTH} caracteres`
			),
		city: z
			.string()
			.min(
				MIN_CITY_LENGTH,
				`La ciudad debe tener al menos ${MIN_CITY_LENGTH} caracteres`
			),
		state: z
			.string()
			.min(
				MIN_STATE_LENGTH,
				`La provincia debe tener al menos ${MIN_STATE_LENGTH} caracteres`
			),
		country: z
			.string()
			.min(
				MIN_COUNTRY_LENGTH,
				`El país debe tener al menos ${MIN_COUNTRY_LENGTH} caracteres`
			),
		postalCode: z.string().optional(),
	}),
	coordinates: z
		.object({
			lat: z.number().min(MIN_LAT).max(MAX_LAT).optional(),
			lng: z.number().min(MIN_LNG).max(MAX_LNG).optional(),
		})
		.optional(),

	// Features
	characteristics: z
		.array(z.string())
		.max(
			MAX_CHARACTERISTICS,
			`No puede haber más de ${MAX_CHARACTERISTICS} características`
		),

	// Media
	images: z
		.array(
			z.object({
				url: z.string().url(),
				filename: z.string(),
				size: z.number(),
				contentType: z.string(),
			})
		)
		.max(MAX_IMAGES, `No puede haber más de ${MAX_IMAGES} imágenes`),
	videos: z
		.array(
			z.object({
				url: z.string().url(),
				title: z.string().optional(),
			})
		)
		.max(MAX_VIDEOS, `No puede haber más de ${MAX_VIDEOS} videos`),

	// Metadata
	language: z.enum(["es", "en"]).default("es"),
	aiGenerated: z
		.object({
			title: z.boolean().default(false),
			description: z.boolean().default(false),
			tags: z.boolean().default(false),
		})
		.default({
			title: false,
			description: false,
			tags: false,
		}),
});

// Type inference
export type PropertyWizardData = z.infer<typeof PropertyWizardSchema>;

// Validation functions
export const validatePropertyGeneral = (
	data: PropertyWizardData
): Record<string, string> => {
	const errors: Record<string, string> = {};

	if (!data.title || data.title.length < MIN_TITLE_LENGTH) {
		errors.title = `El título debe tener al menos ${MIN_TITLE_LENGTH} caracteres`;
	}
	if (!data.description || data.description.length < MIN_DESCRIPTION_LENGTH) {
		errors.description = `La descripción debe tener al menos ${MIN_DESCRIPTION_LENGTH} caracteres`;
	}
	if (!data.price || data.price < 1) {
		errors.price = "El precio es requerido";
	}
	if (!data.surface || data.surface < 1) {
		errors.surface = "La superficie es requerida";
	}
	if (!data.propertyType) {
		errors.propertyType = "El tipo de propiedad es requerido";
	}

	return errors;
};

export const validatePropertyLocation = (
	data: PropertyWizardData
): Record<string, string> => {
	const errors: Record<string, string> = {};

	if (!data.address?.street || data.address.street.length < MIN_STREET_LENGTH) {
		errors["address.street"] =
			`La calle debe tener al menos ${MIN_STREET_LENGTH} caracteres`;
	}
	if (!data.address?.city || data.address.city.length < MIN_CITY_LENGTH) {
		errors["address.city"] =
			`La ciudad debe tener al menos ${MIN_CITY_LENGTH} caracteres`;
	}
	if (!data.address?.state || data.address.state.length < MIN_STATE_LENGTH) {
		errors["address.state"] =
			`La provincia debe tener al menos ${MIN_STATE_LENGTH} caracteres`;
	}
	if (
		!data.address?.country ||
		data.address.country.length < MIN_COUNTRY_LENGTH
	) {
		errors["address.country"] =
			`El país debe tener al menos ${MIN_COUNTRY_LENGTH} caracteres`;
	}

	return errors;
};

export const validatePropertyMedia = (
	data: PropertyWizardData
): Record<string, string> => {
	const errors: Record<string, string> = {};

	if (!data.images || data.images.length === 0) {
		errors.images = "Debes agregar al menos una imagen";
	}

	return errors;
};

// Helper components
type PropertyStepProps = {
	data: PropertyWizardData;
	onChange: (data: PropertyWizardData) => void;
	errors?: Record<string, string>;
};

// Property type options
const propertyTypes = [
	{ value: "house", label: "Casa", icon: Home },
	{ value: "apartment", label: "Apartamento", icon: Building },
	{ value: "villa", label: "Villa", icon: Trees },
	{ value: "land", label: "Terreno", icon: Square },
	{ value: "commercial", label: "Comercial", icon: Store },
];

// Common characteristics
const _commonCharacteristics = [
	"Piscina",
	"Jardín",
	"Garaje",
	"Terraza",
	"Balcón",
	"Aire acondicionado",
	"Calefacción",
	"Chimenea",
	"Vista al mar",
	"Amueblado",
	"Seguridad 24h",
	"Gimnasio",
	"Sauna",
	"Jacuzzi",
	"Solarium",
	"Trastero",
	"Ascensor",
];

// Custom hook for general step handlers
function usePropertyGeneralHandlers(
	data: PropertyWizardData,
	onChange: (updatedData: PropertyWizardData) => void
) {
	const [newCharacteristic, setNewCharacteristic] = useState("");

	const updateField = (field: keyof PropertyWizardData, value: unknown) => {
		onChange({ ...data, [field]: value });
	};

	const updateAddressField = (field: string, value: string) => {
		onChange({
			...data,
			address: {
				...data.address,
				[field]: value,
			},
		});
	};

	const addCharacteristic = () => {
		if (
			newCharacteristic.trim() &&
			!data.characteristics.includes(newCharacteristic.trim())
		) {
			updateField("characteristics", [
				...data.characteristics,
				newCharacteristic.trim(),
			]);
			setNewCharacteristic("");
		}
	};

	const removeCharacteristic = (characteristic: string) => {
		updateField(
			"characteristics",
			data.characteristics.filter((char) => char !== characteristic)
		);
	};

	return {
		newCharacteristic,
		setNewCharacteristic,
		updateField,
		updateAddressField,
		addCharacteristic,
		removeCharacteristic,
	};
}

// Form field component with error handling
function FormField({
	id,
	label,
	error,
	children,
}: {
	id: string;
	label: string;
	error?: string;
	children: React.ReactNode;
}) {
	return (
		<Field data-invalid={Boolean(error)}>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			{children}
			{error && <FieldError errors={[{ message: error }]} />}
		</Field>
	);
}

// Characteristics management component
function CharacteristicsSection({
	characteristics,
	newCharacteristic,
	setNewCharacteristic,
	addCharacteristic,
	removeCharacteristic,
}: {
	characteristics: string[];
	newCharacteristic: string;
	setNewCharacteristic: (value: string) => void;
	addCharacteristic: () => void;
	removeCharacteristic: (characteristic: string) => void;
}) {
	return (
		<Field>
			<FieldLabel>Características</FieldLabel>
			<div className="mb-2 flex flex-wrap gap-2">
				{characteristics.map((char) => (
					<Badge
						className="flex items-center gap-1"
						key={char}
						variant="secondary"
					>
						{char}
						<Button
							className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
							onClick={() => removeCharacteristic(char)}
							size="sm"
							type="button"
							variant="ghost"
						>
							<X className="h-2 w-2" />
						</Button>
					</Badge>
				))}
			</div>
			<div className="flex gap-2">
				<Input
					onChange={(e) => setNewCharacteristic(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && addCharacteristic()}
					placeholder="Agregar característica..."
					value={newCharacteristic}
				/>
				<Button onClick={addCharacteristic} size="icon" type="button">
					<Plus className="h-4 w-4" />
				</Button>
			</div>
			<FieldDescription>
				Agrega características principales como piscina, jardín, garaje, \etc.
			</FieldDescription>
		</Field>
	);
}

// Basic info fields component
function BasicInfoFields({
	handlers,
	data,
	errors,
}: {
	handlers: ReturnType<typeof usePropertyGeneralHandlers>;
	data: PropertyWizardData;
	errors: Record<string, string>;
}) {
	return (
		<>
			<FormField error={errors.title} id="title" label="Título">
				<Input
					aria-invalid={Boolean(errors.title)}
					id="title"
					onChange={(e) => handlers.updateField("title", e.target.value)}
					placeholder="Ej: Apartamento de lujo en el centro"
					value={data.title || ""}
				/>
			</FormField>

			<FormField
				error={errors.description}
				id="description"
				label="Descripción"
			>
				<textarea
					aria-invalid={Boolean(errors.description)}
					className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					id="description"
					onChange={(e) => handlers.updateField("description", e.target.value)}
					placeholder="Describe tu propiedad con detalle..."
					rows={4}
					value={data.description || ""}
				/>
			</FormField>

			<FormField error={errors.price} id="price" label="Precio (€)">
				<Input
					aria-invalid={Boolean(errors.price)}
					id="price"
					onChange={(e) =>
						handlers.updateField("price", Number(e.target.value))
					}
					placeholder="250000"
					type="number"
					value={data.price || ""}
				/>
			</FormField>

			<FormField error={errors.surface} id="surface" label="Superficie (m²)">
				<Input
					aria-invalid={Boolean(errors.surface)}
					id="surface"
					onChange={(e) =>
						handlers.updateField("surface", Number(e.target.value))
					}
					placeholder="120"
					type="number"
					value={data.surface || ""}
				/>
			</FormField>
		</>
	);
}

// Property type and rooms component
function PropertyTypeAndRooms({
	handlers,
	data,
	errors,
}: {
	handlers: ReturnType<typeof usePropertyGeneralHandlers>;
	data: PropertyWizardData;
	errors: Record<string, string>;
}) {
	return (
		<>
			<FormField
				error={errors.propertyType}
				id="propertyType"
				label="Tipo de Propiedad"
			>
				<Select
					onValueChange={(value) => handlers.updateField("propertyType", value)}
					value={data.propertyType || ""}
				>
					<SelectTrigger aria-invalid={Boolean(errors.propertyType)}>
						<SelectValue placeholder="Selecciona el tipo de propiedad" />
					</SelectTrigger>
					<SelectContent>
						{propertyTypes.map((type) => (
							<SelectItem key={type.value} value={type.value}>
								<div className="flex items-center gap-2">
									<type.icon className="h-4 w-4" />
									{type.label}
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>

			<div className="grid grid-cols-2 gap-4">
				<FormField error={errors.bedrooms} id="bedrooms" label="Dormitorios">
					<Input
						aria-invalid={Boolean(errors.bedrooms)}
						id="bedrooms"
						onChange={(e) =>
							handlers.updateField("bedrooms", Number(e.target.value))
						}
						placeholder="3"
						type="number"
						value={data.bedrooms || ""}
					/>
				</FormField>

				<FormField error={errors.bathrooms} id="bathrooms" label="Baños">
					<Input
						aria-invalid={Boolean(errors.bathrooms)}
						id="bathrooms"
						onChange={(e) =>
							handlers.updateField("bathrooms", Number(e.target.value))
						}
						placeholder="2"
						type="number"
						value={data.bathrooms || ""}
					/>
				</FormField>
			</div>
		</>
	);
}

// Step 1: General Information
export function PropertyGeneralStep({
	data,
	onChange,
	errors = {},
}: PropertyStepProps) {
	const handlers = usePropertyGeneralHandlers(data, onChange);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Información General</CardTitle>
				<CardDescription>
					Proporciona los detalles básicos de tu propiedad
				</CardDescription>
			</CardHeader>
			<CardContent>
				<FieldGroup>
					<BasicInfoFields data={data} errors={errors} handlers={handlers} />
					<PropertyTypeAndRooms
						data={data}
						errors={errors}
						handlers={handlers}
					/>
					<CharacteristicsSection
						addCharacteristic={handlers.addCharacteristic}
						characteristics={data.characteristics}
						newCharacteristic={handlers.newCharacteristic}
						removeCharacteristic={handlers.removeCharacteristic}
						setNewCharacteristic={handlers.setNewCharacteristic}
					/>
				</FieldGroup>
			</CardContent>
		</Card>
	);
}

// Constants for magic numbers
const ADDRESS_FIELD_SLICE_1_END = 2;
const ADDRESS_FIELD_SLICE_2_START = 2;
const ADDRESS_FIELD_SLICE_2_END = 4;
const ADDRESS_FIELD_SLICE_3_START = 4;

// Type definitions
type PropertyData = {
	address?: {
		street?: string;
		city?: string;
		state?: string;
		postalCode?: string;
		country?: string;
		[field: string]: string | undefined;
	};
	coordinates?: {
		lat?: number;
		lng?: number;
		[field: string]: number | undefined;
	};
	images?: Array<{
		url: string;
		filename: string;
		size: number;
		contentType: string;
	}>;
};

// Helper component for address fields
const AddressField = ({
	id,
	label,
	placeholder,
	value,
	onChange,
	error,
}: {
	id: string;
	label: string;
	placeholder: string;
	value: string;
	onChange: (value: string) => void;
	error?: string;
}) => (
	<Field data-invalid={Boolean(error)}>
		<FieldLabel htmlFor={id}>{label}</FieldLabel>
		<Input
			aria-invalid={Boolean(error)}
			id={id}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			value={value}
		/>
		{error && <FieldError errors={[{ message: error }]} />}
	</Field>
);

// Helper component for coordinate fields
const CoordinateFields = ({
	data,
	onChange,
}: {
	data: PropertyData;
	onChange: (field: "lat" | "lng", value: number) => void;
}) => {
	const coordinateFields = [
		{ id: "lat", label: "Latitud", placeholder: "40.4168" },
		{ id: "lng", label: "Longitud", placeholder: "-3.7038" },
	];

	return (
		<Field>
			<FieldLabel>Coordenadas (Opcional)</FieldLabel>
			<div className="grid grid-cols-2 gap-4">
				{coordinateFields.map(({ id, label, placeholder }) => (
					<div key={id}>
						<FieldLabel className="text-sm" htmlFor={id}>
							{label}
						</FieldLabel>
						<Input
							id={id}
							onChange={(e) =>
								onChange(id as "lat" | "lng", Number(e.target.value))
							}
							placeholder={placeholder}
							step="any"
							type="number"
							value={
								data.coordinates?.[id as keyof typeof data.coordinates] || ""
							}
						/>
					</div>
				))}
			</div>
			<FieldDescription>
				Las coordenadas ayudan a mostrar la ubicación exacta en el mapa
			</FieldDescription>
		</Field>
	);
};

// Helper component for address fields section
const AddressFieldsSection = ({
	data,
	onChange,
	errors,
}: {
	data: PropertyData;
	onChange: (field: string, value: string) => void;
	errors: Record<string, string>;
}) => {
	const addressFields = [
		{ id: "street", label: "Calle", placeholder: "Calle Gran Vía, 123" },
		{ id: "city", label: "Ciudad", placeholder: "Madrid" },
		{ id: "state", label: "Provincia", placeholder: "Madrid" },
		{ id: "postalCode", label: "Código Postal", placeholder: "28013" },
		{ id: "country", label: "País", placeholder: "España" },
	];

	return (
		<>
			{addressFields
				.slice(0, ADDRESS_FIELD_SLICE_1_END)
				.map(({ id, label, placeholder }) => (
					<AddressField
						error={errors[`address.${id}`]}
						id={id}
						key={id}
						label={label}
						onChange={(value) => onChange(id, value)}
						placeholder={placeholder}
						value={data.address?.[id as keyof typeof data.address] || ""}
					/>
				))}

			<div className="grid grid-cols-2 gap-4">
				{addressFields
					.slice(ADDRESS_FIELD_SLICE_2_START, ADDRESS_FIELD_SLICE_2_END)
					.map(({ id, label, placeholder }) => (
						<AddressField
							error={errors[`address.${id}`]}
							id={id}
							key={id}
							label={label}
							onChange={(value) => onChange(id, value)}
							placeholder={placeholder}
							value={data.address?.[id as keyof typeof data.address] || ""}
						/>
					))}
			</div>

			{addressFields
				.slice(ADDRESS_FIELD_SLICE_3_START)
				.map(({ id, label, placeholder }) => (
					<AddressField
						error={errors[`address.${id}`]}
						id={id}
						key={id}
						label={label}
						onChange={(value) => onChange(id, value)}
						placeholder={placeholder}
						value={data.address?.[id as keyof typeof data.address] || ""}
					/>
				))}
		</>
	);
};

// Step 2: Location
export function PropertyLocationStep({
	data,
	onChange,
	errors = {},
}: PropertyStepProps) {
	const [mapError, setMapError] = useState<string | null>(null);
	const [useFormFallback, setUseFormFallback] = useState(false);

	const updateAddressField = (field: string, value: string) => {
		onChange({
			...data,
			address: {
				...data.address,
				[field]: value,
			},
		});
	};

	const updateCoordinates = (field: "lat" | "lng", value: number) => {
		onChange({
			...data,
			coordinates: {
				...data.coordinates,
				[field]: value,
			},
		});
	};

	const handleCoordinatesChange = useCallback((coordinates: Coordinates) => {
		onChange({
			...data,
			coordinates: {
				lat: coordinates.latitude,
				lng: coordinates.longitude,
			},
		});
	}, [data, onChange]);

	const handleAddressChange = useCallback((address: any) => {
		onChange({
			...data,
			address: {
				street: address.street || "",
				city: address.city || "",
				state: address.state || "",
				postalCode: address.postalCode || "",
				country: address.country || "República Dominicana",
			},
		});
	}, [data, onChange]);

	const handleMapError = useCallback((error: string) => {
		setMapError(error);
		setUseFormFallback(true);
	}, []);

	const retryMap = useCallback(() => {
		setMapError(null);
		setUseFormFallback(false);
	}, []);

	// Show map by default, fallback to form on error
	if (!useFormFallback) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Ubicación</CardTitle>
					<CardDescription>
						Selecciona la ubicación de tu propiedad en el mapa o busca una dirección
					</CardDescription>
				</CardHeader>
				<CardContent>
					<InteractiveMap
						coordinates={
							data.coordinates?.lat && data.coordinates?.lng
								? { latitude: data.coordinates.lat, longitude: data.coordinates.lng }
								: undefined
						}
						onCoordinatesChange={handleCoordinatesChange}
						onAddressChange={handleAddressChange}
						onError={handleMapError}
						height="450px"
					/>
					
					{mapError && (
						<div className="mt-4 flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/10 p-4">
							<div className="flex items-center space-x-2">
								<AlertCircle className="h-4 w-4 text-destructive" />
								<span className="text-sm text-destructive">{mapError}</span>
							</div>
							<Button
								onClick={retryMap}
								size="sm"
								variant="outline"
								className="flex items-center space-x-1"
							>
								<RefreshCw className="h-3 w-3" />
								<span>Reintentar</span>
							</Button>
						</div>
					)}

					<div className="mt-4 flex justify-center">
						<Button
							onClick={() => setUseFormFallback(true)}
							variant="ghost"
							size="sm"
							className="text-muted-foreground"
						>
							Usar formulario en su lugar
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Fallback form view
	return (
		<Card>
			<CardHeader>
				<CardTitle>Ubicación</CardTitle>
				<CardDescription>
					Indica dónde se encuentra tu propiedad
				</CardDescription>
			</CardHeader>
			<CardContent>
				<FieldGroup>
					<AddressFieldsSection
						data={data}
						errors={errors}
						onChange={updateAddressField}
					/>
					<CoordinateFields data={data} onChange={updateCoordinates} />
					
					{mapError && (
						<div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/10 p-4">
							<div className="flex items-center space-x-2">
								<AlertCircle className="h-4 w-4 text-destructive" />
								<span className="text-sm text-destructive">
									El mapa no está disponible: {mapError}
								</span>
							</div>
							<Button
								onClick={retryMap}
								size="sm"
								variant="outline"
								className="flex items-center space-x-1"
							>
								<RefreshCw className="h-3 w-3" />
								<span>Reintentar mapa</span>
							</Button>
						</div>
					)}
				</FieldGroup>
			</CardContent>
		</Card>
	);
}

// Step 3: Media
export function PropertyMediaStep({
	data,
	onChange,
	errors = {},
}: PropertyStepProps) {
	const updateField = (field: keyof PropertyWizardData, value: unknown) => {
		onChange({ ...data, [field]: value });
	};

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files) {
			const newImages = Array.from(files).map((file) => ({
				url: URL.createObjectURL(file),
				filename: file.name,
				size: file.size,
				contentType: file.type,
			}));
			updateField("images", [...(data.images || []), ...newImages]);
		}
	};

	const removeImage = (image: unknown) => {
		updateField(
			"images",
			data.images.filter((img) => img !== image)
		);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Fotos y Videos</CardTitle>
				<CardDescription>
					Agrega imágenes y videos para mostrar tu propiedad
				</CardDescription>
			</CardHeader>
			<CardContent>
				<FieldGroup>
					<Field data-invalid={Boolean(errors.images)}>
						<FieldLabel>Imágenes</FieldLabel>
						<div className="space-y-4">
							<div className="rounded-lg border-2 border-border border-dashed p-6 text-center">
								<Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
								<p className="mb-2 text-muted-foreground text-sm">
									Arrastra imágenes aquí o haz clic para seleccionar
								</p>
								<input
									accept="image/*"
									className="hidden"
									id="image-upload"
									multiple
									onChange={handleImageUpload}
									type="file"
								/>
								<Button asChild type="button" variant="outline">
									<label className="cursor-pointer" htmlFor="image-upload">
										Seleccionar Imágenes
									</label>
								</Button>
							</div>

							{data.images && data.images.length > 0 && (
								<div>
									<p className="mb-2 font-medium text-sm">
										Imágenes ({data.images.length})
									</p>
									<ScrollArea className="w-full whitespace-nowrap">
										<div className="flex w-max space-x-4 p-4">
											{data.images.map((image) => (
												<div className="group relative" key={image.url}>
													<div
														aria-label={`Imagen ${image.filename}`}
														className="h-32 w-32 rounded-md border bg-center bg-cover"
														role="img"
														style={{ backgroundImage: `url(${image.url})` }}
													/>
													<Button
														className="absolute top-1 right-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
														onClick={() => removeImage(image)}
														size="icon"
														type="button"
														variant="destructive"
													>
														<X className="h-3 w-3" />
													</Button>
												</div>
											))}
										</div>
										<ScrollBar orientation="horizontal" />
									</ScrollArea>
								</div>
							)}
						</div>
						{errors.images && (
							<FieldError errors={[{ message: errors.images }]} />
						)}
					</Field>
				</FieldGroup>
			</CardContent>
		</Card>
	);
}
