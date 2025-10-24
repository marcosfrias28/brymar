import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import db from "../db/drizzle"; // Usar la instancia principal que ya está configurada correctamente
import { accounts, sessions, users, verificationTokens } from "../db/schema";
import { sendVerificationOTP } from "../email";
import { getSafeUserMessage, error as logError } from "../logger";

export const auth = betterAuth({
	secret: process.env.BETTER_AUTH_SECRET || "P2MTvnMR37nfWXt11MUGS5AT45mTjTlZ",
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: users,
			session: sessions,
			account: accounts,
			verification: verificationTokens,
		},
	}),
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 días
		updateAge: 60 * 60 * 24, // 1 día
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5, // 5 minutos
		},
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: false,
				defaultValue: "user",
				input: true,
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
						await logError("Failed to send email OTP", result.error, {
							email,
							type,
						});

						// Mensaje genérico y seguro para el usuario
						throw new Error(await getSafeUserMessage("EMAIL_SEND_ERROR"));
					}
				}
			},
		}),
	],
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		requireEmailVerification: false, // Permitir inicio de sesión sin verificación
		sendResetPassword: async ({ user, url }, _request) => {
			const result = await sendVerificationOTP({
				to: user.email,
				subject: "Reset della password",
				url,
			});
			if (!result.success) {
				await logError("Password reset email failed to send", result.error, {
					email: user.email,
				});
			}
		},
	},
});
