import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/']);
const isResetPasswordRoute = createRouteMatcher(['/reset-password']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
    const { userId, sessionClaims } = await auth();

    // If user needs to reset their password and is not on the reset password page or API route, redirect them
    if (userId && sessionClaims?.metadata.passwordResetRequired && !isResetPasswordRoute(req)) {
        return NextResponse.redirect(new URL('/reset-password', req.url));
    }

    // If user is trying to access the reset password functionality but doesn't need it, redirect to home
    if (isResetPasswordRoute(req) && (!userId || !sessionClaims?.metadata.passwordResetRequired)) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    // If user is on a public route, allow them to access the page
    if (isPublicRoute(req)) return NextResponse.next();

    // Protect all other routes
    await auth.protect();
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}