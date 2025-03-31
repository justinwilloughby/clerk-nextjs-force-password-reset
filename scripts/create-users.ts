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

// Example users data - replace with your actual data
const users = [
    {
        email: 'justin+50@clerk.dev',
        firstName: 'Justin',
        lastName: '50',
        passwordResetRequired: true
    },
    {
        email: 'justin+51@clerk.dev',
        firstName: 'Justin',
        lastName: '51',
        passwordResetRequired: true
    }
];

async function uploadUsers() {
    console.log('Starting user upload...');
    
    for (const userData of users) {
        try {
            // Create the user
            const user = await clerk.users.createUser({
                emailAddress: [userData.email],
                firstName: userData.firstName,
                lastName: userData.lastName,
                skipPasswordRequirement: true,
                publicMetadata: {
                    passwordResetRequired: userData.passwordResetRequired
                }
            });

            console.log(`Successfully created user: ${userData.email}`);
        } catch (error) {
            console.error(`Failed to create user ${userData.email}:`, error);
        }
    }

    console.log('Upload complete!');
}

// Run the upload
uploadUsers().catch(console.error); 