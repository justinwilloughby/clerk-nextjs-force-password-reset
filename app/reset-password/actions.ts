'use server'

import { auth, clerkClient } from "@clerk/nextjs/server";

type ResetPasswordResponse = {
    success: boolean;
    message: string;
}

export async function resetPassword(password: string): Promise<ResetPasswordResponse> {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
        return {
            success: false,
            message: 'You must be logged in to reset your password'
        };
    }

    if (!sessionClaims?.metadata?.passwordResetRequired) {
        return {
            success: false,
            message: 'Password reset not required'
        };
    }
    
    if (!password) {
        return {
            success: false,
            message: 'Password is required'
        };
    }    
    
    const client = await clerkClient();

    try {
        await client.users.updateUser(userId, {
            password,
            publicMetadata: {
                ...sessionClaims?.metadata,
                passwordResetRequired: false
            }
        });

        return {
            success: true,
            message: 'Password reset successful'
        };
    } catch (error: any) {
        console.error('Error updating user:', error);
        
        if (error.status === 401 || error.status === 403) {
            return {
                success: false,
                message: 'Not authorized to perform this action'
            };
        }
        
        return {
            success: false,
            message: error.message || 'Failed to reset password'
        };
    }
} 