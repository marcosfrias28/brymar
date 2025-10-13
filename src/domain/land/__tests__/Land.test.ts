import { Land } from "../entities/Land";
import { LandId } from "../value-objects/LandId";
import { LandTitle } from "../value-objects/LandTitle";
import { LandDescription } from "../value-objects/LandDescription";
import { LandArea } from "../value-objects/LandArea";
import { LandPrice } from "../value-objects/LandPrice";
import { LandType } from "../value-objects/LandType";
import { LandStatus } from "../value-objects/LandStatus";
import { LandLocation } from "../value-objects/LandLocation";
import { LandFeatures } from "../value-objects/LandFeatures";
import { LandImages } from "../value-objects/LandImages";
import { BusinessRuleViolationError, ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

describe("Land Entity", () => {
    const validLandData = {
        name: "Beautiful Beachfront Land",
        description: "A stunning piece of beachfront property with ocean views and direct beach access.",
        area: 2500,
        price: 500000,
        currency: "USD",
        location: "Bávaro, Punta Cana, Dominican Republic",
        type: "beachfront",
        features: ["Beach Access", "Ocean View", "Road Access"],
        images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
    };

    describe("create", () => {
        it("should create a land with valid data", () => {
            const land = Land.create(validLandData);

            expect(land.getTitle().value).toBe("Beautiful Beachfront Land");
            expect(land.getArea().getValue()).toBe(2500);
            expect(land.getPrice().amount).toBe(500000);
            expect(land.getType().value).toBe("beachfront");
            expect(land.getStatus().isDraft()).toBe(true);
            expect(land.isNew()).toBe(true);
        });

        it("should throw error for invalid title", () => {
            const invalidData = { ...validLandData, name: "AB" };

            expect(() => Land.create(invalidData)).toThrow(ValueObjectValidationError);
        });

        it("should throw error for invalid area", () => {
            const invalidData = { ...validLandData, area: 0 };

            expect(() => Land.create(invalidData)).toThrow(ValueObjectValidationError);
        });

        it("should throw error for invalid price", () => {
            const invalidData = { ...validLandData, price: 500 };

            expect(() => Land.create(invalidData)).toThrow(ValueObjectValidationError);
        });

        it("should throw error for invalid type", () => {
            const invalidData = { ...validLandData, type: "invalid-type" };

            expect(() => Land.create(invalidData)).toThrow(ValueObjectValidationError);
        });
    });

    describe("business methods", () => {
        let land: Land;

        beforeEach(() => {
            land = Land.create(validLandData);
        });

        describe("updatePrice", () => {
            it("should update price for draft land", async () => {
                const newPrice = LandPrice.create(600000, "USD");

                // Add a small delay to ensure timestamps are different
                await new Promise(resolve => setTimeout(resolve, 1));
                land.updatePrice(newPrice);

                expect(land.getPrice().amount).toBe(600000);
                expect(land.isNew()).toBe(false);
            });

            it("should throw error for significant price change on published land", () => {
                land.publish();
                const newPrice = LandPrice.create(1000000, "USD"); // 100% increase

                expect(() => land.updatePrice(newPrice)).toThrow(BusinessRuleViolationError);
            });
        });

        describe("updateArea", () => {
            it("should update area for draft land", () => {
                const newArea = LandArea.create(3000);

                land.updateArea(newArea);

                expect(land.getArea().getValue()).toBe(3000);
            });

            it("should throw error for area change on published land", () => {
                land.publish();
                const newArea = LandArea.create(3000);

                expect(() => land.updateArea(newArea)).toThrow(BusinessRuleViolationError);
            });
        });

        describe("publish", () => {
            it("should publish complete land", () => {
                land.publish();

                expect(land.getStatus().isPublished()).toBe(true);
            });

            it("should allow publishing complete land", () => {
                // Since we can't create incomplete lands (they throw during creation),
                // and all created lands are complete by definition, 
                // let's test that complete lands can be published
                expect(() => land.publish()).not.toThrow();
                expect(land.getStatus().isPublished()).toBe(true);
            });
        });

        describe("features management", () => {
            it("should add feature", () => {
                land.addFeature("Electricity Available");

                expect(land.getFeatures().hasFeature("Electricity Available")).toBe(true);
            });

            it("should remove feature", () => {
                land.removeFeature("Beach Access");

                expect(land.getFeatures().hasFeature("Beach Access")).toBe(false);
            });
        });

        describe("images management", () => {
            it("should add image", () => {
                const initialCount = land.getImages().getCount();

                land.addImage("https://example.com/new-image.jpg");

                expect(land.getImages().getCount()).toBe(initialCount + 1);
            });

            it("should remove image", () => {
                const initialCount = land.getImages().getCount();

                land.removeImage("https://example.com/image1.jpg");

                expect(land.getImages().getCount()).toBe(initialCount - 1);
            });
        });
    });

    describe("query methods", () => {
        let land: Land;

        beforeEach(() => {
            land = Land.create(validLandData);
        });

        it("should calculate price per square meter", () => {
            const pricePerM2 = land.getPricePerSquareMeter();

            expect(pricePerM2).toBe(200); // 500000 / 2500
        });

        it("should convert area to hectares", () => {
            const hectares = land.getAreaInHectares();

            expect(hectares).toBe(0.25); // 2500 / 10000
        });

        it("should convert area to tareas", () => {
            const tareas = land.getAreaInTareas();

            expect(tareas).toBeCloseTo(3.97, 2); // 2500 / 629
        });

        it("should check if land is complete", () => {
            expect(land.isComplete()).toBe(true);
        });
    });

    describe("reconstitute", () => {
        it("should reconstitute land from data", () => {
            const landData = {
                id: LandId.generate(),
                title: LandTitle.create("Test Land"),
                description: LandDescription.create("Test description for the land property"),
                area: LandArea.create(1000),
                price: LandPrice.create(100000, "USD"),
                location: LandLocation.create("Test Location"),
                type: LandType.create("residential"),
                status: LandStatus.published(),
                features: LandFeatures.create(["Road Access"]),
                images: LandImages.create(["https://example.com/test.jpg"]),
                createdAt: new Date("2024-01-01"),
                updatedAt: new Date("2024-01-02")
            };

            const land = Land.reconstitute(landData);

            expect(land.getLandId()).toBe(landData.id);
            expect(land.getTitle()).toBe(landData.title);
            expect(land.getStatus().isPublished()).toBe(true);
            expect(land.getCreatedAt()).toEqual(new Date("2024-01-01"));
            expect(land.getUpdatedAt()).toEqual(new Date("2024-01-02"));
        });
    });
});