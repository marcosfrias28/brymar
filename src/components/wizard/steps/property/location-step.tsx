"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import {
	FieldGroup,
	Field,
	FieldLabel,
	FieldError,
	FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { PropertyStepProps, PropertyWizardData } from "./types";
import { usePropertyLocation } from "@/hooks/wizard/use-property-location";
import { InteractiveMap } from "../../shared/interactive-map";

// Constants for magic numbers
const ADDRESS_FIELD_SLICE_1_END = 2;
const ADDRESS_FIELD_SLICE_2_START = 2;
const ADDRESS_FIELD_SLICE_2_END = 4;
const ADDRESS_FIELD_SLICE_3_START = 4;

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
	data: PropertyWizardData;
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
							value={data.coordinates?.[id as "lat" | "lng"] || ""}
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
	data: PropertyWizardData;
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

// Map error handling component
const MapErrorDisplay = ({
	mapError,
	onRetry,
	onUseForm,
}: {
	mapError: string | null;
	onRetry: () => void;
	onUseForm: () => void;
}) => (
	<>
		{mapError && (
			<div className="mt-4 flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/10 p-4">
				<div className="flex items-center space-x-2">
					<AlertCircle className="h-4 w-4 text-destructive" />
					<span className="text-destructive text-sm">{mapError}</span>
				</div>
				<Button
					className="flex items-center space-x-1"
					onClick={onRetry}
					size="sm"
					variant="outline"
				>
					<RefreshCw className="h-3 w-3" />
					<span>Reintentar</span>
				</Button>
			</div>
		)}

		<div className="mt-4 flex justify-center">
			<Button
				className="text-muted-foreground"
				onClick={onUseForm}
				size="sm"
				variant="ghost"
			>
				Usar formulario en su lugar
			</Button>
		</div>
	</>
);

// Map view component
const MapView = ({
	coordinates,
	onCoordinatesChange,
	onAddressChange,
	onError,
	mapError,
	onRetry,
	onUseForm,
}: {
	coordinates: { latitude: number; longitude: number } | undefined;
	onCoordinatesChange: (coords: {
		latitude: number;
		longitude: number;
	}) => void;
	onAddressChange: (address: Record<string, string>) => void;
	onError: (error: string) => void;
	mapError: string | null;
	onRetry: () => void;
	onUseForm: () => void;
}) => (
	<Card>
		<CardHeader>
			<CardTitle>Ubicación</CardTitle>
			<CardDescription>
				Selecciona la ubicación de tu propiedad en el mapa o busca una dirección
			</CardDescription>
		</CardHeader>
		<CardContent>
			<InteractiveMap
				coordinates={coordinates}
				height="450px"
				onAddressChange={onAddressChange}
				onCoordinatesChange={onCoordinatesChange}
				onError={onError}
			/>
			<MapErrorDisplay
				mapError={mapError}
				onRetry={onRetry}
				onUseForm={onUseForm}
			/>
		</CardContent>
	</Card>
);

// Form view component
const FormView = ({
	data,
	errors,
	updateAddressField,
	updateCoordinates,
	mapError,
	onRetry,
}: {
	data: PropertyWizardData;
	errors: Record<string, string>;
	updateAddressField: (field: string, value: string) => void;
	updateCoordinates: (field: "lat" | "lng", value: number) => void;
	mapError: string | null;
	onRetry: () => void;
}) => (
	<Card>
		<CardHeader>
			<CardTitle>Ubicación</CardTitle>
			<CardDescription>Indica dónde se encuentra tu propiedad</CardDescription>
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
							<span className="text-destructive text-sm">
								El mapa no está disponible: {mapError}
							</span>
						</div>
						<Button
							className="flex items-center space-x-1"
							onClick={onRetry}
							size="sm"
							variant="outline"
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

export function PropertyLocationStep({ data, onChange }: PropertyStepProps) {
	const {
		mapError,
		useFormFallback,
		setUseFormFallback,
		onUpdateAddressField,
		onUpdateCoordinates,
		onCoordinatesChange,
		onAddressChange,
		handleMapError,
		retryMap,
		coordinates,
	} = usePropertyLocation(data, onChange);

	// Show map by default, fallback to form on error
	if (!useFormFallback) {
		return (
			<MapView
				coordinates={coordinates}
				mapError={mapError}
				onAddressChange={onAddressChange}
				onCoordinatesChange={onCoordinatesChange}
				onError={handleMapError}
				onRetry={retryMap}
				onUseForm={() => setUseFormFallback(true)}
			/>
		);
	}

	// Fallback form view
	return (
		<FormView
			data={data}
			errors={{}}
			mapError={mapError}
			onRetry={retryMap}
			updateAddressField={onUpdateAddressField}
			updateCoordinates={onUpdateCoordinates}
		/>
	);
}
