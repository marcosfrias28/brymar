import { Button, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

type WelcomeEmailProps = {
	userName: string;
	dashboardUrl?: string;
};

export const WelcomeEmail = ({
	userName,
	dashboardUrl = "https://arbry.com/dashboard",
}: WelcomeEmailProps) => (
	<EmailLayout
		preview={`¡Bienvenido a ARBRY, ${userName}!`}
		title="Bienvenido a ARBRY"
	>
		<Text className="mb-4 font-semibold text-lg text-slate-900">
			¡Bienvenido a ARBRY, {userName}!
		</Text>

		<Text className="mb-6 text-slate-700 leading-relaxed">
			Nos complace darte la bienvenida a nuestra plataforma. Tu cuenta ha sido
			creada exitosamente y ya puedes comenzar a explorar todas las
			funcionalidades que tenemos para ofrecerte.
		</Text>

		<Section className="my-8 text-center">
			<Button
				className="inline-block rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-semibold text-white no-underline"
				href={dashboardUrl}
			>
				Ir al Dashboard
			</Button>
		</Section>

		<Section className="my-6 rounded-r-lg border-blue-400 border-l-4 bg-blue-50 p-4">
			<Text className="mb-2 font-semibold text-blue-800 text-sm">
				💡 Próximos pasos
			</Text>
			<Text className="m-0 text-blue-700 text-sm">
				Te recomendamos completar tu perfil y explorar las diferentes secciones
				de la plataforma para aprovechar al máximo todas las herramientas
				disponibles.
			</Text>
		</Section>

		<Text className="text-slate-600 text-sm">
			Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
			¡Estamos aquí para ayudarte!
		</Text>
	</EmailLayout>
);

export default WelcomeEmail;
