import { Button, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

type EmailVerificationProps = {
	userName: string;
	verificationUrl: string;
};

export const EmailVerificationEmail = ({
	userName,
	verificationUrl,
}: EmailVerificationProps) => (
	<EmailLayout
		preview="Verifica tu dirección de correo electrónico"
		title="Verificación de Email - ARBRY"
	>
		<Text className="mb-4 font-semibold text-lg text-slate-900">
			¡Hola {userName}!
		</Text>

		<Text className="mb-6 text-slate-700 leading-relaxed">
			Gracias por registrarte en ARBRY. Para completar tu registro y activar tu
			cuenta, necesitamos verificar tu dirección de correo electrónico.
		</Text>

		<Section className="my-8 text-center">
			<Button
				className="inline-block rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-semibold text-white no-underline"
				href={verificationUrl}
			>
				Verificar Email
			</Button>
		</Section>

		<Section className="my-6 rounded-r-lg border-green-400 border-l-4 bg-green-50 p-4">
			<Text className="mb-2 font-semibold text-green-800 text-sm">
				✅ ¿Por qué verificar?
			</Text>
			<Text className="m-0 text-green-700 text-sm">
				La verificación nos ayuda a mantener tu cuenta segura y asegurar que
				puedas recibir notificaciones importantes sobre tu cuenta.
			</Text>
		</Section>

		<Text className="mb-3 text-slate-600 text-sm">
			Este enlace de verificación expirará en 48 horas. Si no puedes hacer clic
			en el botón, copia y pega el siguiente enlace en tu navegador:
		</Text>

		<Section className="break-all rounded border bg-slate-50 p-3 text-slate-600 text-xs">
			{verificationUrl}
		</Section>
	</EmailLayout>
);

export default EmailVerificationEmail;
