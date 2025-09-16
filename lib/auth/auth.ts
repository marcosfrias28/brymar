import { betterAuth } from "better-auth";
import { sendVerificationEmail } from "../email";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "../db/drizzle";
import { accounts, session, users, verification } from "../db/schema";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session,
      account: accounts,
      verification,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "user",
        input: false,
      },
    },
  },
  session: {
    updateAge: 24 * 60 * 60, // 24 hours
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: true,
    sendVerificationEmail: true,
    sendResetPassword: async ({ user, url }, request) => {
      const result = await sendVerificationEmail({
        to: user.email,
        subject: "Reset della password",
        url,
      });
      if (!result.success) {
        console.log("Email reset password non inviata:", result.error);
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }, request) => {
      const result = await sendVerificationEmail({
        to: user.email,
        subject: "Verifica il tuo indirizzo email",
        url,
      });
      if (!result.success) {
        console.log("Email verification non inviata:", result.error);
      }
    },
  },
});
