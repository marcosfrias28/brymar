import { Property, CreatePropertyData } from "../entities/Property";
import { PropertyId } from "../value-objects/PropertyId";
import { PropertyTitle } from "../value-objects/PropertyTitle";
import { Price } from "../value-objects/Price";
import { Address } from "../value-objects/Address";
import { PropertyType } from "../value-objects/PropertyType";
import { PropertyStatus } from "../value-objects/PropertyStatus";
import { PropertyFeatures } from "../value-objects/PropertyFeatures";
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

describe("Property Domain", () => {
    const validPropertyData: CreatePropertyData = {
        title: "Beautiful Family Home",
        description: "A lovely 3-bedroom house with modern amenities and a spacious garden.",
        price: 350000,
        currency: "USD",
        address: {
            street: "123 Main Street",
            city: "Springfield",
            state: "Illinois",
            country: "USA",
            postalCode: "62701",
        },
        type: "house",
        features: {
            bedrooms: 3,
            bathrooms: 2,
            area: 150,
            amenities: ["garden", "garage"],
            features: ["hardwood floors", "updated kitchen"],
            parking: {
                spaces: 2,
                type: "garage" as const,
            },
            yearBuilt: 2010,
        },
        images: ["https://example.com/image1.jpg"],
        featured: false,
    };

    describe("Property Entity", () => {
        it("should create a valid property", () => {
            const property = Property.create(validPropertyData);

            expect(property.getId()).toBeInstanceOf(PropertyId);
            expect(property.getTitle().value).toBe("Beautiful Family Home");
            expect(property.getPrice().amount).toBe(350000);
            expect(property.getStatus().isDraft()).toBe(true);
            expect(property.isComplete()).toBe(true);
        });

        it("should enforce business rules for residential properties", () => {
            const invalidData = {
                ...validPropertyData,
                features: {
                    ...validPropertyData.features,
                    bedrooms: 0, // Invalid for residential
                },
            };

            expect(() => Property.create(invalidData)).toThrow(DomainError);
        });

        it("should allow price updates within limits", () => {
            const property = Property.create(validPropertyData);

            // Small price change should work
            property.updatePrice(360000);
            expect(property.getPrice().amount).toBe(360000);
        });

        it("should prevent significant price changes on published properties", () => {
            const property = Property.create(validPropertyData);
            property.publish();

            // Significant price change should fail
            expect(() => property.updatePrice(700000)).toThrow(DomainError);
        });

        it("should handle image management", () => {
            const property = Property.create(validPropertyData);

            property.addImage("https://example.com/image2.jpg");
            expect(property.getImages()).toHaveLength(2);

            property.removeImage("https://example.com/image1.jpg");
            expect(property.getImages()).toHaveLength(1);
        });

        it("should validate completeness for publishing", () => {
            const property = Property.create(validPropertyData);

            expect(property.canBePublished()).toBe(true);

            property.publish();
            expect(property.getStatus().isPublished()).toBe(true);
        });
    });

    describe("PropertyId Value Object", () => {
        it("should create valid PropertyId from UUID", () => {
            const uuid = "123e4567-e89b-12d3-a456-426614174000";
            const propertyId = PropertyId.create(uuid);

            expect(propertyId.value).toBe(uuid);
            expect(propertyId.isUuid()).toBe(true);
        });

        it("should create valid PropertyId from number", () => {
            const propertyId = PropertyId.fromNumber(123);

            expect(propertyId.value).toBe("123");
            expect(propertyId.isNumeric()).toBe(true);
            expect(propertyId.toNumber()).toBe(123);
        });

        it("should reject invalid PropertyId", () => {
            expect(() => PropertyId.create("invalid-id")).toThrow(DomainError);
            expect(() => PropertyId.create("")).toThrow(DomainError);
        });
    });

    describe("Price Value Object", () => {
        it("should create valid price", () => {
            const price = Price.create(100000, "USD");

            expect(price.amount).toBe(100000);
            expect(price.currency.code).toBe("USD");
            expect(price.format()).toContain("$100,000");
        });

        it("should reject negative prices", () => {
            expect(() => Price.create(-1000)).toThrow(DomainError);
        });

        it("should detect significant price differences", () => {
            const price1 = Price.create(100000);
            const price2 = Price.create(120000);

            expect(price1.isSignificantlyDifferent(price2, 0.15)).toBe(true);
        });

        it("should perform price arithmetic", () => {
            const price1 = Price.create(100000);
            const price2 = Price.create(50000);

            const sum = price1.add(price2);
            expect(sum.amount).toBe(150000);

            const difference = price1.subtract(price2);
            expect(difference.amount).toBe(50000);
        });
    });

    describe("Address Value Object", () => {
        it("should create valid address", () => {
            const address = Address.create({
                street: "123 Main St",
                city: "Springfield",
                state: "IL",
                country: "USA",
            });

            expect(address.street).toBe("123 Main St");
            expect(address.getFullAddress()).toBe("123 Main St, Springfield, IL, USA");
        });

        it("should validate coordinates", () => {
            expect(() => Address.create({
                street: "123 Main St",
                city: "Springfield",
                state: "IL",
                country: "USA",
                coordinates: { latitude: 91, longitude: 0 }, // Invalid latitude
            })).toThrow(DomainError);
        });

        it("should calculate distance between addresses", () => {
            const address1 = Address.create({
                street: "123 Main St",
                city: "Springfield",
                state: "IL",
                country: "USA",
                coordinates: { latitude: 39.7817, longitude: -89.6501 },
            });

            const address2 = Address.create({
                street: "456 Oak Ave",
                city: "Springfield",
                state: "IL",
                country: "USA",
                coordinates: { latitude: 39.7900, longitude: -89.6400 },
            });

            const distance = address1.distanceTo(address2);
            expect(distance).toBeGreaterThan(0);
            expect(distance).toBeLessThan(5); // Should be within 5km
        });
    });

    describe("PropertyFeatures Value Object", () => {
        it("should create valid features", () => {
            const features = PropertyFeatures.create({
                bedrooms: 3,
                bathrooms: 2,
                area: 150,
                amenities: ["pool", "gym"],
            });

            expect(features.bedrooms).toBe(3);
            expect(features.hasAmenity("pool")).toBe(true);
            expect(features.isFamilyFriendly()).toBe(true);
        });

        it("should validate feature constraints", () => {
            expect(() => PropertyFeatures.create({
                bedrooms: -1, // Invalid
                bathrooms: 2,
                area: 150,
            })).toThrow(DomainError);
        });

        it("should calculate price per square meter", () => {
            const features = PropertyFeatures.create({
                bedrooms: 3,
                bathrooms: 2,
                area: 100,
            });

            const pricePerSqm = features.getPricePerSquareMeter(200000);
            expect(pricePerSqm).toBe(2000);
        });
    });

    describe("PropertyStatus Value Object", () => {
        it("should create valid status", () => {
            const status = PropertyStatus.draft();

            expect(status.isDraft()).toBe(true);
            expect(status.canBePublished()).toBe(true);
        });

        it("should handle status transitions", () => {
            const draftStatus = PropertyStatus.draft();
            const publishedStatus = draftStatus.transitionTo(PropertyStatus.published());

            expect(publishedStatus.isPublished()).toBe(true);
        });

        it("should prevent invalid transitions", () => {
            const soldStatus = PropertyStatus.sold();

            expect(() => soldStatus.transitionTo(PropertyStatus.draft())).toThrow(DomainError);
        });
    });

    describe("PropertyType Value Object", () => {
        it("should create valid property type", () => {
            const type = PropertyType.create("house");

            expect(type.value).toBe("house");
            expect(type.isResidential()).toBe(true);
            expect(type.requiresBedrooms()).toBe(true);
        });

        it("should identify commercial properties", () => {
            const type = PropertyType.create("office");

            expect(type.isCommercial()).toBe(true);
            expect(type.isResidential()).toBe(false);
        });

        it("should reject invalid property types", () => {
            expect(() => PropertyType.create("invalid-type")).toThrow(DomainError);
        });
    });
});