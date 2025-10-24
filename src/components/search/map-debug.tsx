"use client";

import React from "react";
import { SearchMapView } from "./search-map-view";

// Simulamos datos reales con coordenadas de República Dominicana
const realDataSample = [
	{
		id: "21",
		title: "Hermosa Apartamento en República Dominicana",
		price: { amount: 2500000, currency: "USD" },
		address: {
			street: "Calle Principal, Santiago de los Caballeros",
			city: "Santiago de los Caballeros",
			state: "Santiago de los Caballeros",
			country: "República Dominicana",
			coordinates: {
				latitude: 19.43,
				longitude: -70.6574,
			},
		},
		type: "apartamento",
		features: {
			area: 120,
			bedrooms: 3,
			bathrooms: 2,
		},
		images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"],
	},
	{
		id: "22",
		title: "Villa Moderna en Cap Cana",
		price: { amount: 4500000, currency: "USD" },
		address: {
			street: "Cap Cana Resort",
			city: "Nagua",
			state: "Nagua",
			country: "República Dominicana",
			coordinates: {
				latitude: 19.2544,
				longitude: -69.3836,
			},
		},
		type: "villa",
		features: {
			area: 350,
			bedrooms: 5,
			bathrooms: 4,
		},
		images: [
			"https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400",
		],
	},
	{
		id: "23",
		title: "Terreno Comercial en Santo Domingo",
		price: 1800000,
		location: "Santo Domingo Centro, República Dominicana",
		coordinates: {
			lat: 18.4404,
			lng: -69.8889,
		},
		type: "comercial",
		area: 1500,
		features: {
			area: 1500,
		},
		mainImage:
			"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400",
	},
];

export function MapDebug() {
	const [view, setView] = React.useState<"results" | "map">("map");

	console.log("MapDebug - Datos de prueba:", realDataSample);

	return (
		<div className="h-screen flex flex-col">
			<div className="p-4 bg-blue-50 border-b">
				<h1 className="text-xl font-bold">Debug del Mapa - Datos Reales</h1>
				<p className="text-sm text-gray-600">
					Probando con {realDataSample.length} propiedades con coordenadas
					reales de RD
				</p>
				<div className="mt-2 text-xs">
					<strong>Coordenadas:</strong>
					{realDataSample.map((item, i) => (
						<span key={i} className="ml-2">
							{item.coordinates?.lat || item.address?.coordinates?.latitude},
							{item.coordinates?.lng || item.address?.coordinates?.longitude}
						</span>
					))}
				</div>
			</div>

			<div className="flex-1">
				<SearchMapView
					properties={realDataSample}
					onViewChange={setView}
					currentView={view}
					className="h-full"
				/>
			</div>
		</div>
	);
}
