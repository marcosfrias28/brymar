"use client";

import React from "react";
import { SearchMapView } from "./search-map-view";

// Datos de prueba con coordenadas
const testLands = [
	{
		id: "1",
		title: "Terreno en Santo Domingo",
		price: 2_500_000,
		location: "Santo Domingo, República Dominicana",
		coordinates: {
			lat: 18.4861,
			lng: -69.9312,
		},
		type: "residencial",
		area: 1000,
		features: {
			area: 1000,
		},
		mainImage:
			"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400",
	},
	{
		id: "2",
		title: "Terreno en Santiago",
		price: 1_800_000,
		location: "Santiago, República Dominicana",
		coordinates: {
			lat: 19.4515,
			lng: -70.6969,
		},
		type: "comercial",
		area: 1500,
		features: {
			area: 1500,
		},
		mainImage:
			"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400",
	},
	{
		id: "3",
		title: "Terreno en La Romana",
		price: 3_200_000,
		location: "La Romana, República Dominicana",
		coordinates: {
			lat: 18.6151,
			lng: -68.9739,
		},
		type: "turístico",
		area: 2000,
		features: {
			area: 2000,
		},
		mainImage:
			"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400",
	},
];

export function MapTest() {
	const [view, setView] = React.useState<"results" | "map">("map");

	return (
		<div className="h-screen">
			<SearchMapView
				className="h-full"
				currentView={view}
				onViewChange={setView}
				properties={testLands}
			/>
		</div>
	);
}
