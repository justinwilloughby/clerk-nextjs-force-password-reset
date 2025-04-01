# Clerk Next.js Force Password Reset Sample

This is a Next.js 

## Using This Sample

1. Create a Clerk account

2. Create a Clerk application with the default authentication strategies (Google + Email/Pass)

3. Enable email magic link or email OTP as an authentication strategy so users loaded without a password can still prove who they are

4. Customize session token to include `public_metadata` and store it in a field called `metadata`

5. Clone the repo:

```bash
git clone
```

6. Install dependencies:

```bash
npm install
```

8. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

9. Open [http://localhost:3000](http://localhost:3000) to access the app.

10. Test password reset flow by setting a users `public_metadata.passwordResetRequired` to `true`. You can do this in the portal or by bulk importing some users using `scripts/create-users.ts`. Sign in as the user and see that password reset is enforced.