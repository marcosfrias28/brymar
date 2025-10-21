/**
 * Database connection test utility
 */

import { db, testConnection } from './connection';
import { users } from './schema/index';

export async function runConnectionTest(): Promise<boolean> {
    try {
        console.log('🔍 Testing database connection...');

        // Test basic connection
        const isConnected = await testConnection();
        if (!isConnected) {
            console.error('❌ Database connection failed');
            return false;
        }

        console.log('✅ Database connection successful');

        // Test schema access
        console.log('🔍 Testing schema access...');
        const userCount = await db.select().from(users).limit(1);
        console.log('✅ Schema access successful');

        console.log('🎉 All database tests passed!');
        return true;
    } catch (error) {
        console.error('❌ Database test failed:', error);
        return false;
    }
}

// CLI runner
if (require.main === module) {
    runConnectionTest()
        .then((success) => process.exit(success ? 0 : 1))
        .catch(() => process.exit(1));
}