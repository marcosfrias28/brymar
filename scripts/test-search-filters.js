#!/usr/bin/env node

/**
 * Script to test search filters functionality
 */

// Load environment variables
require("dotenv").config();

const { sql } = require("@vercel/postgres");

async function testSearchFilters() {
	try {
		console.log("🔍 Testing Search Filters\n");

		// Test 1: Filter by property type (apartamento)
		console.log('📋 Test 1: Filter by property type "apartamento"');
		const apartmentResult = await sql`
            SELECT id, title, type, bathrooms, status 
            FROM properties 
            WHERE type = 'apartamento'
            ORDER BY created_at DESC
        `;

		console.log(`Found ${apartmentResult.rows.length} apartments:`);
		apartmentResult.rows.forEach((property) => {
			console.log(
				`  - ID: ${property.id}, Title: ${property.title}, Type: ${property.type}, Bathrooms: ${property.bathrooms}`
			);
		});

		// Test 2: Filter by bathrooms >= 4
		console.log("\n📋 Test 2: Filter by bathrooms >= 4");
		const bathroomResult = await sql`
            SELECT id, title, type, bathrooms, status 
            FROM properties 
            WHERE bathrooms >= 4
            ORDER BY created_at DESC
        `;

		console.log(
			`Found ${bathroomResult.rows.length} properties with 4+ bathrooms:`
		);
		bathroomResult.rows.forEach((property) => {
			console.log(
				`  - ID: ${property.id}, Title: ${property.title}, Type: ${property.type}, Bathrooms: ${property.bathrooms}`
			);
		});

		// Test 3: Combined filter (apartamento AND bathrooms >= 4)
		console.log(
			"\n📋 Test 3: Combined filter (apartamento AND bathrooms >= 4)"
		);
		const combinedResult = await sql`
            SELECT id, title, type, bathrooms, status 
            FROM properties 
            WHERE type = 'apartamento' AND bathrooms >= 4
            ORDER BY created_at DESC
        `;

		console.log(
			`Found ${combinedResult.rows.length} apartments with 4+ bathrooms:`
		);
		combinedResult.rows.forEach((property) => {
			console.log(
				`  - ID: ${property.id}, Title: ${property.title}, Type: ${property.type}, Bathrooms: ${property.bathrooms}`
			);
		});

		// Test 4: Check all property types available
		console.log("\n📋 Test 4: Available property types");
		const typesResult = await sql`
            SELECT type, COUNT(*) as count 
            FROM properties 
            GROUP BY type 
            ORDER BY count DESC
        `;

		console.log("Available property types:");
		typesResult.rows.forEach((row) => {
			console.log(`  - ${row.type}: ${row.count} properties`);
		});

		// Test 5: Check bathroom distribution
		console.log("\n📋 Test 5: Bathroom distribution");
		const bathroomDistribution = await sql`
            SELECT bathrooms, COUNT(*) as count 
            FROM properties 
            GROUP BY bathrooms 
            ORDER BY bathrooms ASC
        `;

		console.log("Bathroom distribution:");
		bathroomDistribution.rows.forEach((row) => {
			console.log(`  - ${row.bathrooms} bathrooms: ${row.count} properties`);
		});

		console.log("\n✅ Search filter tests completed");
	} catch (error) {
		console.error("❌ Test failed:", error.message);
	}
}

testSearchFilters()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Script failed:", error.message);
		process.exit(1);
	});
