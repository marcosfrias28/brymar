// Land Wizard Types for New Framework

import type { WizardData } from "./wizard-core";

// Land-specific data extending base wizard data
export interface LandWizardData extends WizardData {
	// General Information
	name: string;
	description: string;
	price: number;
	surface: number;
	landType: "commercial" | "residential" | "agricultural" | "beachfront";
	zoning?: string;
	utilities?: string[];
	characteristics: LandCharacteristic[];

	// Location Information
	location: string;
	coordinates?: {
		latitude: number;
		longitude: number;
	};
	address?: {
		street?: string;
		city: string;
		province: string;
		postalCode?: string;
		country: "Dominican Republic";
		formattedAddress: string;
	};
	accessRoads?: string[];
	nearbyLandmarks?: string[];

	// Media Information
	images: ImageMetadata[];
	aerialImages?: ImageMetadata[];
	documentImages?: ImageMetadata[];

	// SEO and Publishing
	language: "es" | "en";
	aiGenerated: {
		name: boolean;
		description: boolean;
		characteristics: boolean;
	};
	tags?: string[];
	seoTitle?: string;
	seoDescription?: string;
}

// Supporting types
export type LandCharacteristic = {
	id: string;
	name: string;
	category: "zoning" | "utilities" | "access" | "features";
	selected: boolean;
};

export type ImageMetadata = {
	id: string;
	url: string;
	filename: string;
	size: number;
	contentType: string;
	displayOrder: number;
	alt?: string;
	caption?: string;
};

// Default land wizard data
export const defaultLandWizardData: Partial<LandWizardData> = {
	title: "",
	description: "",
	status: "draft",
	name: "",
	price: 0,
	surface: 0,
	landType: "residential",
	location: "",
	images: [],
	language: "es",
	aiGenerated: {
		name: false,
		description: false,
		characteristics: false,
	},
	characteristics: [],
};
