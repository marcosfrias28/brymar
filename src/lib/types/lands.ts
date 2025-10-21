/**
 * Land-related types consolidating all land DTOs
 */

import { Address, AddressInput, BaseEntity, Currency, Image, ImageInput, SearchResult, ActionResult } from "./shared";

export type LandType =
    | "residential"
    | "commercial"
    | "agricultural"
    | "industrial"
    | "recreational"
    | "mixed-use"
    | "vacant";

export type LandStatus = "available" | "sold" | "reserved" | "under-contract" | "archived";

export interface LandFeatures {
    zoning?: string;
    utilities: string[]; // water, electricity, gas, sewer, etc.
    access: string[]; // road access, utilities access, etc.
    topography?: string; // flat, sloped, hilly, etc.
    soilType?: string;
    waterRights?: boolean;
    mineralRights?: boolean;
    restrictions?: string[];
    developmentPotential?: string;
}

export interface Land extends BaseEntity {
    name: string;
    description: string;
    area: number; // in acres or square meters
    price: number;
    currency: Currency;
    location: string; // general location description
    address?: Address; // specific address if available
    type: LandType;
    features: LandFeatures;
    images: Image[];
    status: LandStatus;
    userId: string;
}

export interface CreateLandInput {
    name: string;
    description: string;
    area: number;
    price: number;
    currency: Currency;
    location: string;
    address?: AddressInput;
    type: LandType;
    features: LandFeatures;
    images?: ImageInput[];
}

export interface UpdateLandInput extends Partial<CreateLandInput> {
    id: string;
}

export interface LandSearchFilters {
    minPrice?: number;
    maxPrice?: number;
    landTypes?: LandType[];
    location?: string;
    minArea?: number;
    maxArea?: number;
    utilities?: string[];
    zoning?: string[];
    status?: LandStatus[];
    userId?: string;
}

export interface LandSearchResult extends SearchResult<Land> {
    filters: {
        applied: string[];
        available: {
            landTypes: LandType[];
            priceRanges: { min: number; max: number; label: string }[];
            locations: string[];
            utilities: string[];
            zoning: string[];
        };
    };
}

// Action result types
export type CreateLandResult = ActionResult<Land>;
export type UpdateLandResult = ActionResult<Land>;
export type GetLandResult = ActionResult<Land>;
export type SearchLandsResult = ActionResult<LandSearchResult>;
export type DeleteLandResult = ActionResult<void>;