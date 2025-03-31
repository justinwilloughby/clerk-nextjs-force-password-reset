'use client'

import { useAuth, useSession } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { resetPassword } from "./actions";

export default function PasswordReset() {
    const { isSignedIn } = useAuth();
    const { session } = useSession();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If user is not signed in and doesn't need to reset their password, redirect to home
    useEffect(() => {
        if (!isSignedIn && !session?.user.publicMetadata.passwordResetRequired) {
            router.push('/');
        }
    }, [isSignedIn, session, router]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        // Client-side validation
        if (!password || !confirmPassword) {
            setError('Both password fields are required');
            setIsSubmitting(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsSubmitting(false);
            return;
        }

        try {
            // Reset the password and get the response
            const response = await resetPassword(password);
            
            if (response.success) {
                await session?.reload();
                router.push('/');
            } else {
                setError(response.message);
            }
        } catch (error) {
            console.error('Password reset error:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main>
            <h1>Reset Password</h1>
            
            {error && (
                <div style={{ color: 'red' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="password">
                        New Password
                    </label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword">
                        Confirm Password
                    </label>
                    <input 
                        type="password" 
                        id="confirmPassword" 
                        name="confirmPassword" 
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                </button>
            </form>
        </main>
    )
}