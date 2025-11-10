import type { Land } from "@/lib/types";

const SQUARE_METERS_PER_HECTARE = 10_000;
const SQUARE_METERS_PER_TAREA = 629;
const DEFAULT_PRICE_PER_M2 = 0;
const HECTARES_DECIMAL_PLACES = 4;
const TAREAS_DECIMAL_PLACES = 2;

export function getTypeLabel(type: string): string {
	switch (type) {
		case "commercial":
			return "Comercial";
		case "residential":
			return "Residencial";
		case "agricultural":
			return "Agrícola";
		case "recreational":
			return "Recreativo";
		case "industrial":
			return "Industrial";
		case "mixed-use":
			return "Uso Mixto";
		case "vacant":
			return "Vacante";
		default:
			return type;
	}
}

export function calculateLandMetrics(land: Land) {
	const surface = land.area;
	const pricePerM2 =
		surface > 0 ? Math.round(land.price / surface) : DEFAULT_PRICE_PER_M2;
	const hectares = (surface / SQUARE_METERS_PER_HECTARE).toFixed(
		HECTARES_DECIMAL_PLACES
	);
	const tareas = (surface / SQUARE_METERS_PER_TAREA).toFixed(
		TAREAS_DECIMAL_PLACES
	);

	return {
		surface,
		pricePerM2,
		hectares,
		tareas,
	};
}
