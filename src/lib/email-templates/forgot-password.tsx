import { Button, Link, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

type ForgotPasswordEmailProps = {
	userName?: string;
	resetUrl: string;
};

export const ForgotPasswordEmail = ({
	userName = "Usuario",
	resetUrl,
}: ForgotPasswordEmailProps) => (
	<EmailLayout
		preview="Restablece tu contraseña de ARBRY"
		title="Recuperación de Contraseña - ARBRY"
	>
		<Text className="mb-4 font-semibold text-lg text-slate-900">
			¡Hola {userName}!
		</Text>

		<Text className="mb-6 text-slate-700 leading-relaxed">
			Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
			Si fuiste tú quien realizó esta solicitud, haz clic en el botón de abajo
			para crear una nueva contraseña.
		</Text>

		<Section className="my-8 text-center">
			<Button
				className="inline-block rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-semibold text-white no-underline"
				href={resetUrl}
			>
				Restablecer Contraseña
			</Button>
		</Section>

		<Section className="my-6 rounded-r-lg border-amber-400 border-l-4 bg-amber-50 p-4">
			<Text className="mb-2 font-semibold text-amber-800 text-sm">
				🔒 Aviso de Seguridad
			</Text>
			<Text className="m-0 text-amber-700 text-sm">
				Este enlace expirará en 24 horas por tu seguridad. Si no solicitaste
				este cambio, puedes ignorar este correo de forma segura.
			</Text>
		</Section>

		<Text className="mb-3 text-slate-600 text-sm">
			Si tienes problemas con el botón, también puedes copiar y pegar el
			siguiente enlace en tu navegador:
		</Text>

		<Section className="break-all rounded border bg-slate-50 p-3 text-slate-600 text-xs">
			<Link className="text-blue-600 no-underline" href={resetUrl}>
				{resetUrl}
			</Link>
		</Section>
	</EmailLayout>
);

export default ForgotPasswordEmail;
