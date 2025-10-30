"use server";
import { Resend } from "resend";
import { VerifyEmailTemplate } from "./email-templates/verify-email";
import {
	critical,
	getSafeUserMessage,
	info,
	error as logError,
} from "./logger";

const resend = new Resend(process?.env?.RESEND_API_KEY);

export const sendVerificationOTP = async ({
	to,
	subject,
	url,
}: {
	to: string;
	subject: string;
	url: string;
}) => {
	try {
		const res = await resend.emails.send({
			from: "Marbry Inmobiliaria <send@marbryinmobiliaria.com>",
			to,
			subject,
			react: await VerifyEmailTemplate({
				verificationUrl: url,
				companyName: "Marbry Inmobiliaria",
			}),
		});
		if (res.error) {
			// Log seguro para el servidor (sin exponer detalles de Resend)
			await logError("Email sending failed", res.error, { to, subject });

			// Retornar mensaje genérico sin exponer detalles técnicos
			return {
				success: false,
				error: await getSafeUserMessage("EMAIL_SEND_ERROR"),
			};
		}
		await info("Email sent successfully", { to, subject });
		return { success: true };
	} catch (error) {
		// Log crítico para errores inesperados
		await critical("Unexpected error during email sending", error, {
			to,
			subject,
		});

		// Mensaje genérico para el usuario
		return {
			success: false,
			error: await getSafeUserMessage("EMAIL_SEND_ERROR"),
		};
	}
};
