import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "../db/drizzle";
import { accounts, session, users, verification } from "../db/schema";
import { nextCookies } from "better-auth/next-js";
import { emailOTP, admin } from "better-auth/plugins";
import { error as logError, getSafeUserMessage } from "../logger";
import { sendVerificationOTP } from "../email";

// Definire i ruoli come oggetto
const ROLES = {
  admin: 'admin',
  agent: 'agent', 
  user: 'user'
} as const;

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
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
    updateAge: 60 * 60 * 24, // 1 día
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5 // 5 minutos
    }
  },
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
  plugins: [
    nextCookies(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const result = await sendVerificationOTP({
            to: email,
            subject: "Código de verificación",
            url: `Tu código de verificación es: ${otp}`,
          });
          if (!result.success) {
            // Log seguro para el servidor (sin exponer detalles técnicos)
            await logError('Failed to send email OTP', result.error, { email, type });

            // Mensaje genérico y seguro para el usuario
            throw new Error(await getSafeUserMessage('EMAIL_SEND_ERROR'));
          }
        }
      },
    }),
    // admin({
    //   roles: ROLES,
    //   defaultRole: 'user',
    //   permissions: {
    //     // Dashboard y administración
    //     'dashboard.access': ['admin', 'agent'],
    //     'analytics.view': ['admin'],
    //     'settings.view': ['admin', 'agent'],
        
    //     // Propiedades
    //     'properties.view': ['admin', 'agent', 'user'],
    //     'properties.manage': ['admin', 'agent'],
        
    //     // Terrenos
    //     'lands.view': ['admin', 'agent', 'user'],
    //     'lands.manage': ['admin', 'agent'],
        
    //     // Blog
    //     'blog.view': ['admin', 'agent', 'user'],
    //     'blog.manage': ['admin'],
        
    //     // Usuarios
    //     'users.view': ['admin'],
    //     'users.manage': ['admin'],
        
    //     // Perfil
    //     'profile.access': ['admin', 'agent', 'user'],
    //     'profile.manage': ['admin', 'agent', 'user'],
    //   },
    // }),
  ],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false, // Permitir inicio de sesión sin verificación
    sendResetPassword: async ({ user, url }, request) => {
      const result = await sendVerificationOTP({
        to: user.email,
        subject: "Reset della password",
        url,
      });
      if (!result.success) {
        await logError('Password reset email failed to send', result.error, { email: user.email });
      }
    },
  },
});
