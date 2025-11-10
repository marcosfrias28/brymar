import { Home, Building, Trees, Store } from "lucide-react";

export const PROPERTY_TYPES = [
	{ value: "apartment", label: "Apartamento", icon: Building },
	{ value: "house", label: "Casa", icon: Home },
	{ value: "commercial", label: "Comercial", icon: Store },
	{ value: "land", label: "Terreno", icon: Trees },
	{ value: "other", label: "Otro", icon: Building },
];

export const CHARACTERISTICS_OPTIONS = [
	"Piscina",
	"Garaje",
	"Jardín",
	"Balcón",
	"Aire acondicionado",
	"Calefacción",
	"Chimenea",
	"Vista al mar",
	"Terraza",
	"Trastero",
	"Suite principal",
	"Seguridad 24h",
	"Gimnasio",
	"Sauna",
	"Jacuzzi",
	"Zona infantil",
	"Acceso discapacitados",
	"Amueblado",
	"Electrodomésticos",
	"Cocina equipada",
	"Laundry",
];
