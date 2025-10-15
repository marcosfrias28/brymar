import { Land } from "../entities/Land";
import { LandType } from "../value-objects/LandType";
import { LandArea } from "../value-objects/LandArea";
import { LandPrice } from "../value-objects/LandPrice";
import { LandLocation } from "../value-objects/LandLocation";
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

export class LandDomainService {

    /**
     * Validates if a land meets the minimum requirements for publication
     */
    validateForPublication(land: Land): void {
        if (!land.isComplete()) {
            throw new BusinessRuleViolationError("Land must be complete before publication", "LAND_VALIDATION");
        }

        // Business rule: Beachfront lands require special validation
        if (land.getType().isBeachfront()) {
            this.validateBeachfrontLand(land);
        }

        // Business rule: Commercial lands require minimum area
        if (land.getType().isCommercial()) {
            this.validateCommercialLand(land);
        }

        // Business rule: Agricultural lands have specific requirements
        if (land.getType().isAgricultural()) {
            this.validateAgriculturalLand(land);
        }
    }

    /**
     * Calculates the market value assessment for a land
     */
    calculateMarketValueAssessment(land: Land): {
        pricePerSquareMeter: number;
        marketPosition: "below-market" | "market-rate" | "above-market";
        confidence: "low" | "medium" | "high";
    } {
        const pricePerM2 = land.getPricePerSquareMeter();

        // Simplified market analysis based on land type and location
        const marketRanges = this.getMarketRanges(land.getType(), land.getLocation());

        let marketPosition: "below-market" | "market-rate" | "above-market";
        if (pricePerM2 < marketRanges.low) {
            marketPosition = "below-market";
        } else if (pricePerM2 > marketRanges.high) {
            marketPosition = "above-market";
        } else {
            marketPosition = "market-rate";
        }

        // Confidence based on available data
        const confidence = this.calculateConfidence(land);

        return {
            pricePerSquareMeter: pricePerM2,
            marketPosition,
            confidence
        };
    }

    /**
     * Validates pricing reasonableness for a land
     */
    validatePricing(land: Land): void {
        const pricePerM2 = land.getPricePerSquareMeter();
        const type = land.getType();

        // Business rules for pricing validation
        const pricingRules = {
            beachfront: { min: 100, max: 2000 }, // $100-2000 per m²
            commercial: { min: 50, max: 1000 },  // $50-1000 per m²
            residential: { min: 20, max: 500 },  // $20-500 per m²
            agricultural: { min: 1, max: 50 },   // $1-50 per m²
            industrial: { min: 10, max: 200 },   // $10-200 per m²
            "mixed-use": { min: 30, max: 800 }   // $30-800 per m²
        };

        const rules = pricingRules[type.value];
        if (!rules) {
            throw new BusinessRuleViolationError(`No pricing rules defined for land type: ${type.value}`, "LAND_VALIDATION");
        }

        if (pricePerM2 < rules.min) {
            throw new BusinessRuleViolationError(
                `Price per square meter ($${pricePerM2}) is below minimum for ${type.getDescription()} ($${rules.min})`,
                "LAND_VALIDATION"
            );
        }

        if (pricePerM2 > rules.max) {
            // Note: Price per square meter is above typical maximum for this land type
        }
    }

    /**
     * Determines if two lands are similar for comparison purposes
     */
    areSimilarLands(land1: Land, land2: Land): boolean {
        // Same type
        if (!land1.getType().equals(land2.getType())) {
            return false;
        }

        // Similar area (within 50% difference)
        const area1 = land1.getArea().getValue();
        const area2 = land2.getArea().getValue();
        const areaDifference = Math.abs(area1 - area2) / Math.max(area1, area2);
        if (areaDifference > 0.5) {
            return false;
        }

        // Similar location (simplified - same city/province)
        const location1 = land1.getLocation();
        const location2 = land2.getLocation();
        if (location1.city && location2.city) {
            return location1.isInCity(location2.city);
        }

        return true;
    }

    /**
     * Generates SEO-friendly suggestions for a land
     */
    generateSEOSuggestions(land: Land): {
        title: string;
        description: string;
        keywords: string[];
    } {
        const type = land.getType();
        const location = land.getLocation();
        const area = land.getArea();
        const price = land.getPrice();

        // Generate title
        const title = `${type.getDescription()} for Sale - ${area.formatWithUnits()} in ${location.getShortAddress()}`;

        // Generate description
        const description = `${type.getDescription()} of ${area.formatWithUnits()} available for ${price.format()} in ${location.getShortAddress()}. ${land.getDescription().getExcerpt(100)}`;

        // Generate keywords
        const keywords = [
            type.value,
            "land for sale",
            location.city || "",
            location.province || "",
            "Dominican Republic",
            "real estate",
            area.toHectares() >= 1 ? "hectares" : "square meters",
            price.currency.code
        ].filter(keyword => keyword.length > 0);

        return { title, description, keywords };
    }

    private validateBeachfrontLand(land: Land): void {
        // Business rule: Beachfront lands must have beach access feature
        if (!land.getFeatures().hasFeature("Beach Access")) {
            throw new BusinessRuleViolationError("Beachfront lands must have beach access", "LAND_VALIDATION");
        }

        // Business rule: Beachfront lands have minimum price requirements
        const pricePerM2 = land.getPricePerSquareMeter();
        if (pricePerM2 < 100) {
            throw new BusinessRuleViolationError("Beachfront land price appears too low for market standards", "LAND_VALIDATION");
        }
    }

    private validateCommercialLand(land: Land): void {
        // Business rule: Commercial lands require minimum area
        const minCommercialArea = 500; // 500 m²
        if (land.getArea().getValue() < minCommercialArea) {
            throw new BusinessRuleViolationError(`Commercial lands must be at least ${minCommercialArea} square meters`, "LAND_VALIDATION");
        }

        // Business rule: Commercial lands should have road access
        if (!land.getFeatures().hasFeature("Road Access")) {
            // Note: Commercial land should have road access for better marketability
        }
    }

    private validateAgriculturalLand(land: Land): void {
        // Business rule: Agricultural lands require minimum area
        const minAgriculturalArea = 1000; // 1000 m² (0.1 hectare)
        if (land.getArea().getValue() < minAgriculturalArea) {
            throw new BusinessRuleViolationError(`Agricultural lands must be at least ${minAgriculturalArea} square meters`, "LAND_VALIDATION");
        }

        // Business rule: Agricultural lands should have water access
        const hasWaterAccess = land.getFeatures().hasFeature("Water Access") ||
            land.getFeatures().hasFeature("Well Water") ||
            land.getFeatures().hasFeature("River Access");

        if (!hasWaterAccess) {
            // Note: Agricultural land should have water access for farming purposes
        }
    }

    private getMarketRanges(type: LandType, location: LandLocation): { low: number; high: number } {
        // Simplified market ranges based on type and location
        // In a real system, this would query market data

        const baseRanges = {
            beachfront: { low: 150, high: 800 },
            commercial: { low: 80, high: 400 },
            residential: { low: 40, high: 200 },
            agricultural: { low: 2, high: 20 },
            industrial: { low: 20, high: 100 },
            "mixed-use": { low: 60, high: 300 }
        };

        let ranges = baseRanges[type.value] || baseRanges.residential;

        // Adjust for premium locations (simplified)
        const premiumAreas = ["Punta Cana", "Cap Cana", "Casa de Campo", "Bávaro"];
        const isPremiumLocation = premiumAreas.some(area =>
            location.address.toLowerCase().includes(area.toLowerCase()) ||
            location.city?.toLowerCase().includes(area.toLowerCase())
        );

        if (isPremiumLocation) {
            ranges = {
                low: ranges.low * 1.5,
                high: ranges.high * 2
            };
        }

        return ranges;
    }

    private calculateConfidence(land: Land): "low" | "medium" | "high" {
        let score = 0;

        // Has complete information
        if (land.isComplete()) score += 2;

        // Has images
        if (!land.getImages().isEmpty()) score += 1;

        // Has features
        if (!land.getFeatures().isEmpty()) score += 1;

        // Has coordinates
        if (land.getLocation().hasCoordinates()) score += 1;

        // Has detailed description
        if (land.getDescription().getWordCount() > 20) score += 1;

        if (score >= 5) return "high";
        if (score >= 3) return "medium";
        return "low";
    }
}