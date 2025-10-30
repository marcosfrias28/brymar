/**
 * Verification script to check seeded data
 * Run this after seeding to verify everything was inserted correctly
 */

const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	console.error("DATABASE_URL environment variable is required");
	process.exit(1);
}

const sql = postgres(connectionString);
const _db = drizzle(sql);

async function verifySeededData() {
	try {
		console.log("🔍 Verifying seeded data...\n");

		// Check if user exists
		const user = await sql`
			SELECT id, email, name 
			FROM users 
			WHERE email = 'contact@mzn.group'
		`;

		if (user.length === 0) {
			console.error("❌ User with email contact@mzn.group not found");
			return;
		}

		console.log(`✅ User found: ${user[0].name} (${user[0].email})`);
		const userId = user[0].id;

		// Check properties
		const properties = await sql`
			SELECT COUNT(*) as count, 
				   COUNT(CASE WHEN status = 'available' THEN 1 END) as available
			FROM properties
		`;
		console.log(
			`🏠 Properties: ${properties[0].count} total, ${properties[0].available} available`
		);

		// Check lands
		const lands = await sql`
			SELECT COUNT(*) as count,
				   COUNT(CASE WHEN status = 'available' THEN 1 END) as available
			FROM lands
		`;
		console.log(
			`🌱 Lands: ${lands[0].count} total, ${lands[0].available} available`
		);

		// Check activities
		const activities = await sql`
			SELECT COUNT(*) as count
			FROM user_activities 
			WHERE user_id = ${userId}
		`;
		console.log(`📊 Activities: ${activities[0].count} for user`);

		// Check activities by type
		const activitiesByType = await sql`
			SELECT type, COUNT(*) as count
			FROM user_activities 
			WHERE user_id = ${userId}
			GROUP BY type
			ORDER BY count DESC
		`;

		console.log("\n📈 Activities by type:");
		activitiesByType.forEach((row) => {
			console.log(`   ${row.type}: ${row.count}`);
		});

		// Check recent activities
		const recentActivities = await sql`
			SELECT type, title, description, created_at
			FROM user_activities 
			WHERE user_id = ${userId}
			ORDER BY created_at DESC
			LIMIT 5
		`;

		console.log("\n🕒 Recent activities:");
		recentActivities.forEach((activity, index) => {
			const date = new Date(activity.created_at).toLocaleDateString("it-IT");
			const time = new Date(activity.created_at).toLocaleTimeString("it-IT");
			console.log(
				`   ${index + 1}. [${activity.type}] ${activity.title} (${date} ${time})`
			);
		});

		// Check property details
		const propertyDetails = await sql`
			SELECT title, price, currency, property_type, bedrooms, bathrooms, area
			FROM properties
			ORDER BY price DESC
			LIMIT 3
		`;

		console.log("\n🏠 Top properties by price:");
		propertyDetails.forEach((property, index) => {
			console.log(
				`   ${index + 1}. ${property.title} - ${property.price.toLocaleString()} ${property.currency}`
			);
			console.log(
				`      ${property.property_type} | ${property.bedrooms} bed | ${property.bathrooms} bath | ${property.area} sqm`
			);
		});

		// Check land details
		const landDetails = await sql`
			SELECT title, price, currency, land_type, area
			FROM lands
			ORDER BY price DESC
		`;

		console.log("\n🌱 Lands by price:");
		landDetails.forEach((land, index) => {
			console.log(
				`   ${index + 1}. ${land.title} - ${land.price.toLocaleString()} ${land.currency}`
			);
			console.log(`      ${land.land_type} | ${land.area} sqm`);
		});

		// Check database constraints
		console.log("\n🔗 Database constraints:");

		// Check foreign key constraint
		const foreignKeys = await sql`
			SELECT constraint_name, table_name, column_name
			FROM information_schema.key_column_usage
			WHERE constraint_name = 'fk_user_activities_user_id'
		`;

		if (foreignKeys.length > 0) {
			console.log("   ✅ Foreign key constraint exists");
		} else {
			console.log("   ⚠️  Foreign key constraint not found");
		}

		// Check indexes
		const indexes = await sql`
			SELECT indexname, tablename
			FROM pg_indexes
			WHERE tablename IN ('user_activities', 'properties', 'lands')
			ORDER BY tablename, indexname
		`;

		console.log("   📊 Indexes:");
		indexes.forEach((index) => {
			console.log(`      ${index.tablename}.${index.indexname}`);
		});

		// Summary
		console.log("\n📋 Summary:");
		console.log(`   ✅ User: ${user[0].name}`);
		console.log(`   ✅ Properties: ${properties[0].count}`);
		console.log(`   ✅ Lands: ${lands[0].count}`);
		console.log(`   ✅ Activities: ${activities[0].count}`);
		console.log(
			`   ✅ Database constraints: ${foreignKeys.length > 0 ? "OK" : "Missing"}`
		);
		console.log(`   ✅ Indexes: ${indexes.length} created`);

		console.log("\n🎉 Verification completed successfully!");
	} catch (error) {
		console.error("❌ Verification failed:", error);
		throw error;
	} finally {
		await sql.end();
	}
}

// Run verification
verifySeededData()
	.then(() => {
		console.log("✅ Verification process completed!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("❌ Verification process failed:", error);
		process.exit(1);
	});
