import db from '@/lib/db/drizzle';
import { propertyCharacteristics } from '@/lib/db/schema';
import { DEFAULT_CHARACTERISTICS } from '@/lib/services/characteristics-service';

/**
 * Seed the property characteristics table with default characteristics
 */
export async function seedCharacteristics() {
    try {
        console.log("Seeding property characteristics...");

        // Check if characteristics already exist
        const existingCharacteristics = await db.select().from(propertyCharacteristics).limit(1);

        if (existingCharacteristics.length > 0) {
            console.log("Characteristics already seeded, skipping...");
            return;
        }

        // Insert default characteristics
        const characteristicsToInsert = DEFAULT_CHARACTERISTICS.map(char => ({
            id: char.id,
            name: char.name,
            category: char.category,
            propertyType: char.propertyTypes ? char.propertyTypes.join(",") : null,
            isDefault: char.isDefault,
            isActive: true,
            order: char.order,
            createdBy: null, // System-created
        }));

        await db.insert(propertyCharacteristics).values(characteristicsToInsert);

        console.log(`Successfully seeded ${characteristicsToInsert.length} characteristics`);
    } catch (error) {
        console.error("Error seeding characteristics:", error);
        throw error;
    }
}

/**
 * Update existing characteristics with new translations or properties
 */
export async function updateCharacteristics() {
    try {
        console.log("Updating property characteristics...");

        for (const char of DEFAULT_CHARACTERISTICS) {
            await db
                .insert(propertyCharacteristics)
                .values({
                    id: char.id,
                    name: char.name,
                    category: char.category,
                    propertyType: char.propertyTypes ? char.propertyTypes.join(",") : null,
                    isDefault: char.isDefault,
                    isActive: true,
                    order: char.order,
                    createdBy: null,
                })
                .onConflictDoUpdate({
                    target: propertyCharacteristics.id,
                    set: {
                        name: char.name,
                        category: char.category,
                        propertyType: char.propertyTypes ? char.propertyTypes.join(",") : null,
                        order: char.order,
                        updatedAt: new Date(),
                    },
                });
        }

        console.log("Successfully updated characteristics");
    } catch (error) {
        console.error("Error updating characteristics:", error);
        throw error;
    }
}

// Run seeding if this file is executed directly
if (require.main === module) {
    seedCharacteristics()
        .then(() => {
            console.log("Seeding completed successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("Seeding failed:", error);
            process.exit(1);
        });
}