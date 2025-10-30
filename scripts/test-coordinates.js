// Script simple para probar coordenadas
console.log("Coordenadas de prueba para República Dominicana:");

const coordinates = [
	{ id: 1, name: "Santo Domingo", lat: 18.4861, lng: -69.9312 },
	{ id: 2, name: "Santo Domingo Norte", lat: 18.5204, lng: -69.954 },
	{ id: 3, name: "Santo Domingo Este", lat: 18.4655, lng: -69.9365 },
	{ id: 4, name: "Santiago", lat: 19.4515, lng: -70.6969 },
	{ id: 5, name: "San Juan", lat: 18.2367, lng: -71.0719 },
	{ id: 6, name: "La Romana", lat: 18.6151, lng: -68.9739 },
	{ id: 7, name: "Puerto Plata", lat: 19.7892, lng: -70.5348 },
	{ id: 8, name: "Bonao", lat: 18.807, lng: -70.2204 },
	{ id: 9, name: "Barahona", lat: 18.0731, lng: -71.2288 },
	{ id: 10, name: "Nagua", lat: 19.2177, lng: -69.4203 },
];

coordinates.forEach((coord) => {
	console.log(
		`UPDATE lands SET location = jsonb_set(COALESCE(location::jsonb, '{}'), '{coordinates}', '{"latitude": ${coord.lat}, "longitude": ${coord.lng}}') WHERE id = ${coord.id};`
	);
});

console.log(
	"\nEjecuta estos comandos SQL en tu base de datos para agregar coordenadas a los terrenos."
);
