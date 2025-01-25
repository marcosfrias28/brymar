import { betterAuth } from 'better-auth';
import { sendVerificationEmail } from '../email';
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from '../db/drizzle';
import { account, session, user, verification } from '../db/schema';
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user,
            session,
            account,
            verification
        },
    }),
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "user",
                input: false
            },
        }
    },
    plugins: [nextCookies()],
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        requireEmailVerification: true,
        sendVerificationEmail: true,
        sendResetPassword: async ({ user, url }, request) => {
            await sendVerificationEmail({
                to: user.email,
                subject: '',
                url,
            });
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }, request) => {
            await sendVerificationEmail({
                to: user.email,
                subject: 'Verifica il tuo indirizzo email',
                url,
            });
        },
    },
});