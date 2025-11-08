"use server";
import { Resend } from "resend";
import EmailVerificationEmail from "./email-templates/components/email-verification";
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
	username,
}: {
	to: string;
	subject: string;
	url: string;
	username: string;
}) => {
	try {
		const res = await resend.emails.send({
			from: "Marbry Inmobiliaria <send@marbryinmobiliaria.com>",
			react: (
				<EmailVerificationEmail username={username} verificationUrl={url} />
			),
			subject,
			to,
		});
		if (res.error) {
			// Log seguro para el servidor (sin exponer detalles de Resend)
			await logError("Email sending failed", res.error, { subject, to });

			// Retornar mensaje genérico sin exponer detalles técnicos
			return {
				error: await getSafeUserMessage("EMAIL_SEND_ERROR"),
				success: false,
			};
		}
		await info("Email sent successfully", { subject, to });
		return { success: true };
	} catch (error) {
		// Log crítico para errores inesperados
		await critical("Unexpected error during email sending", error, {
			subject,
			to,
		});

		// Mensaje genérico para el usuario
		return {
			error: await getSafeUserMessage("EMAIL_SEND_ERROR"),
			success: false,
		};
	}
};
