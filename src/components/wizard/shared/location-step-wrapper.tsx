"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { MapErrorBoundary } from "./map-error-boundary";
import { SimpleLocationPicker } from "./simple-location-picker";

interface LocationStepWrapperProps {
	children: React.ReactNode;
	fallbackData: any;
	onFallbackUpdate: (data: any) => void;
	title?: string;
	description?: string;
	errors?: Record<string, string>;
}

export function LocationStepWrapper({
	children,
	fallbackData,
	onFallbackUpdate,
	title = "Ubicación",
	description = "Proporciona la ubicación exacta",
	errors = {},
}: LocationStepWrapperProps) {
	const [useSimpleMap, setUseSimpleMap] = useState(false);
	const [hasMapError, setHasMapError] = useState(false);

	// Auto-fallback to simple map if there are repeated errors
	useEffect(() => {
		if (hasMapError) {
			const timer = setTimeout(() => {
				setUseSimpleMap(true);
			}, 3000); // Auto-switch after 3 seconds

			return () => clearTimeout(timer);
		}
	}, [hasMapError]);

	if (useSimpleMap) {
		return (
			<SimpleLocationPicker
				data={fallbackData}
				onUpdate={onFallbackUpdate}
				title={title}
				description={description}
				errors={errors}
			/>
		);
	}

	return (
		<MapErrorBoundary
			onUseSimple={() => {
				setUseSimpleMap(true);
				setHasMapError(true);
			}}
		>
			{children}
		</MapErrorBoundary>
	);
}
