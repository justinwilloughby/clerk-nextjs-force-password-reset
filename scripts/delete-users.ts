import { Clerk } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local in the root directory
dotenv.config({ path: join(__dirname, '../.env.local') });

if (!process.env.CLERK_SECRET_KEY) {
    console.error('CLERK_SECRET_KEY not found in .env.local');
    process.exit(1);
}

// Initialize Clerk client
const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

async function cleanupTestUsers() {
    console.log('Starting test user cleanup...');
    let deletedCount = 0;
    let errorCount = 0;

    try {
        // Get all users
        const users = await clerk.users.getUserList({
            limit: 500
        });

        // Delete each test user
        for (const user of users) {
            try {
                if (user.emailAddresses[0]?.emailAddress.includes('justin+')) {
                    await clerk.users.deleteUser(user.id);
                    console.log(`Deleted user: ${user.emailAddresses[0]?.emailAddress}`);
                    deletedCount++;
                }
            } catch (error) {
                console.error(`Failed to delete user ${user.id}:`, error);
                errorCount++;
            }
        }

        console.log('\nCleanup complete!');
        console.log(`Successfully deleted: ${deletedCount} users`);
        if (errorCount > 0) {
            console.log(`Failed to delete: ${errorCount} users`);
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Run the cleanup
cleanupTestUsers().catch(console.error); 