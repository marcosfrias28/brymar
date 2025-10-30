#!/usr/bin/env node

/**
 * Script to check properties in the database
 */

// Load environment variables
require("dotenv").config();

const { sql } = require("@vercel/postgres");

async function checkProperties() {
	try {
		console.log("🔍 Checking properties in database...");

		// Check if we can connect to the database
		const _connectionTest = await sql`SELECT 1 as test`;
		console.log("✅ Database connection successful");

		// Count total properties
		const countResult = await sql`SELECT COUNT(*) as total FROM properties`;
		const totalProperties = Number.parseInt(countResult.rows[0].total, 10);
		console.log(`📊 Total properties in database: ${totalProperties}`);

		if (totalProperties > 0) {
			// Get first 3 properties
			const propertiesResult = await sql`
                SELECT id, title, price, type, status, location, created_at 
                FROM properties 
                ORDER BY created_at DESC 
                LIMIT 3
            `;

			console.log("\n📋 Sample properties:");
			propertiesResult.rows.forEach((property, index) => {
				console.log(`${index + 1}. ID: ${property.id}`);
				console.log(`   Title: ${property.title}`);
				console.log(`   Price: $${property.price.toLocaleString()}`);
				console.log(`   Type: ${property.type}`);
				console.log(`   Status: ${property.status}`);
				console.log(`   Location: ${property.location}`);
				console.log(`   Created: ${property.created_at}`);
				console.log("");
			});

			// Check status distribution
			const statusResult = await sql`
                SELECT status, COUNT(*) as count 
                FROM properties 
                GROUP BY status 
                ORDER BY count DESC
            `;

			console.log("📈 Properties by status:");
			statusResult.rows.forEach((row) => {
				console.log(`   ${row.status}: ${row.count}`);
			});
		} else {
			console.log("⚠️  No properties found in database");

			// Check if table exists
			const tableCheck = await sql`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'properties'
                )
            `;

			if (tableCheck.rows[0].exists) {
				console.log("✅ Properties table exists but is empty");
			} else {
				console.log("❌ Properties table does not exist");
			}
		}
	} catch (error) {
		console.error("❌ Database error:", error.message);

		if (error.message.includes("connect")) {
			console.log("\n🔧 Connection troubleshooting:");
			console.log("1. Check your POSTGRES_URL environment variable");
			console.log("2. Ensure your database is running");
			console.log("3. Verify network connectivity");
		}
	}
}

checkProperties()
	.then(() => {
		console.log("\n✅ Database check completed");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Script failed:", error.message);
		process.exit(1);
	});
