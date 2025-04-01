import { Clerk } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

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

// Define the user schema
const userSchema = z.object({
	/** The ID of the user as used in your external systems or your previous authentication solution. Must be unique across your instance. */
	userId: z.string().optional(),
	/** Email address to set as User's primary email address. */
	email: z.string().email(),
	/** The first name to assign to the user */
	firstName: z.string().optional(),
	/** The last name to assign to the user */
	lastName: z.string().optional(),
	/** The hashed password to give the user. */
	passwordDigest: z.string().optional(),
	/** The hashing algorithm that was used to generate the password digest.
	 * @see https://clerk.com/docs/reference/backend-api/tag/Users#operation/CreateUser!path=password_hasher&t=request
	 */
	passwordHasher: z
		.enum([
			"argon2i",
			"argon2id",
			"bcrypt",
			"md5",
			"pbkdf2_sha256",
			"pbkdf2_sha256_django",
			"pbkdf2_sha1",
			"scrypt_firebase",
		])
		.optional(),
	/** Metadata saved on the user, that is visible to both your Frontend and Backend APIs */
	public_metadata: z.record(z.string(), z.unknown()).optional(),
	/** Metadata saved on the user, that is only visible to your Backend APIs */
	private_metadata: z.record(z.string(), z.unknown()).optional(),
	/** Metadata saved on the user, that can be updated from both the Frontend and Backend APIs. Note: Since this data can be modified from the frontend, it is not guaranteed to be safe. */
	unsafe_metadata: z.record(z.string(), z.unknown()).optional(),
    /** Whether the user needs to reset their password */
    passwordResetRequired: z.boolean().optional(),
});

type User = z.infer<typeof userSchema>;

// Example users data - replace with your actual data
const users: User[] = [
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
    },
    {
        email: 'justin+52@clerk.dev',
        passwordDigest: '$2a$12$s7BZwqxWN3be1zwXrPj5BOACYRHbSmOrhgNwk5OFKWheRRT2.0LrS',
        passwordHasher: 'bcrypt',
        passwordResetRequired: false
    },
    {
        email: 'justin+53@clerk.dev',
        passwordDigest: '$2a$12$s7BZwqxWN3be1zwXrPj5BOACYRHbSmOrhgNwk5OFKWheRRT2.0LrS',
        passwordHasher: 'bcrypt',
        passwordResetRequired: true
    }
];

async function uploadUsers() {
    console.log('Starting user upload...');
    
    for (const userData of users) {
        try {
            let user;
            if (userData.passwordDigest) {
                user = await clerk.users.createUser({
                    emailAddress: [userData.email],
                    passwordDigest: userData.passwordDigest,
                    passwordHasher: userData.passwordHasher,
                    publicMetadata: {
                        passwordResetRequired: userData.passwordResetRequired
                    }
                });
            } else {
                user = await clerk.users.createUser({
                    emailAddress: [userData.email],
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    skipPasswordRequirement: true,
                    publicMetadata: {
                        passwordResetRequired: userData.passwordResetRequired
                    }
                });
            }

            console.log(`Successfully created user: ${userData.email}`);
        } catch (error) {
            console.error(`Failed to create user ${userData.email}:`, error);
        }
    }

    console.log('Upload complete!');
}

// Run the upload
uploadUsers().catch(console.error); 