import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { PropertyType } from "@/types/wizard";
import type { PropertyWizardData } from "@/types/property-wizard";

const propertyTypeOptions: { value: PropertyType; label: string }[] = [
	{ value: PropertyType.HOUSE, label: "Casa" },
	{ value: PropertyType.APARTMENT, label: "Apartamento" },
	{ value: PropertyType.VILLA, label: "Villa" },
	{ value: PropertyType.COMMERCIAL, label: "Comercial" },
	{ value: PropertyType.LAND, label: "Terreno" },
];

type BasicInfoFieldsProps = {
	formData: Partial<PropertyWizardData>;
	updateField: (field: keyof PropertyWizardData, value: unknown) => void;
};

export function BasicInfoFields({
	formData,
	updateField,
}: BasicInfoFieldsProps) {
	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<label className="font-medium text-sm" htmlFor="title">
					Título
				</label>
				<Input
					id="title"
					onChange={(e) => updateField("title", e.target.value)}
					placeholder="Ej: Apartamento en Piantini"
					value={formData.title || ""}
				/>
			</div>

			<div className="space-y-2">
				<label className="font-medium text-sm" htmlFor="description">
					Descripción
				</label>
				<Textarea
					id="description"
					onChange={(e) => updateField("description", e.target.value)}
					placeholder="Describe la propiedad..."
					rows={4}
					value={formData.description || ""}
				/>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div className="space-y-2">
					<label className="font-medium text-sm" htmlFor="price">
						Precio
					</label>
					<Input
						id="price"
						onChange={(e) => updateField("price", Number(e.target.value))}
						placeholder="100000"
						type="number"
						value={formData.price || ""}
					/>
				</div>

				<div className="space-y-2">
					<label className="font-medium text-sm" htmlFor="surface">
						Superficie (m²)
					</label>
					<Input
						id="surface"
						onChange={(e) => updateField("surface", Number(e.target.value))}
						placeholder="100"
						type="number"
						value={formData.surface || ""}
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div className="space-y-2">
					<label className="font-medium text-sm" htmlFor="propertyType">
						Tipo de propiedad
					</label>
					<Select
						onValueChange={(value) =>
							updateField("propertyType", value as PropertyType)
						}
						value={formData.propertyType || ""}
					>
						<SelectTrigger>
							<SelectValue placeholder="Selecciona tipo" />
						</SelectTrigger>
						<SelectContent>
							{propertyTypeOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<label className="font-medium text-sm" htmlFor="bedrooms">
						Habitaciones
					</label>
					<Input
						id="bedrooms"
						onChange={(e) => updateField("bedrooms", Number(e.target.value))}
						placeholder="3"
						type="number"
						value={formData.bedrooms || ""}
					/>
				</div>

				<div className="space-y-2">
					<label className="font-medium text-sm" htmlFor="bathrooms">
						Baños
					</label>
					<Input
						id="bathrooms"
						onChange={(e) => updateField("bathrooms", Number(e.target.value))}
						placeholder="2"
						type="number"
						value={formData.bathrooms || ""}
					/>
				</div>
			</div>
		</div>
	);
}
