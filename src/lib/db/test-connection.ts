/**
 * Database connection test utility
 */

import { db, testConnection } from "./connection";
import { users } from "./schema/index";

export async function runConnectionTest(): Promise<boolean> {
	try {
		// Test basic connection
		const isConnected = await testConnection();
		if (!isConnected) {
			return false;
		}
		const _userCount = await db.select().from(users).limit(1);
		return true;
	} catch (_error) {
		return false;
	}
}

// CLI runner
if (require.main === module) {
	runConnectionTest()
		.then((success) => process.exit(success ? 0 : 1))
		.catch(() => process.exit(1));
}
