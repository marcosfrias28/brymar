import { Land } from "../entities/Land";
import { LandId } from "../value-objects/LandId";
import { LandStatus } from "../value-objects/LandStatus";
import { LandType } from "../value-objects/LandType";
import {
    SearchableRepository,
    StatusFilterableRepository,
    LocationFilterableRepository,
    PriceFilterableRepository,
    SearchCriteria
} from '@/domain/shared/interfaces/BaseRepository';

export interface LandSearchCriteria extends SearchCriteria {
    location?: string;
    landType?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    status?: string;
    features?: string[];
}

export interface ILandRepository extends
    SearchableRepository<Land, LandId, LandSearchCriteria>,
    StatusFilterableRepository<Land, LandId, LandStatus>,
    LocationFilterableRepository<Land, LandId>,
    PriceFilterableRepository<Land, LandId> {

    /**
     * Find lands by type
     */
    findByType(type: LandType): Promise<Land[]>;

    /**
     * Find lands within an area range
     */
    findByAreaRange(minArea: number, maxArea: number): Promise<Land[]>;

    /**
     * Find similar lands (for comparison)
     */
    findSimilar(land: Land, limit: number): Promise<Land[]>;

    /**
     * Get count by type
     */
    countByType(type: LandType): Promise<number>;
}