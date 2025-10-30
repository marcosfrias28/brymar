import { Hr, Link, Section, Text } from "@react-email/components";

export const EmailFooter = () => {
	const currentYear = new Date().getFullYear();

	return (
		<Section className="bg-slate-50 px-8 py-6">
			<Hr className="my-4 border-slate-200" />
			<Text className="mb-2 text-center text-slate-600 text-sm">
				Este correo fue enviado por ARBRY. Si tienes alguna pregunta,{" "}
				<Link
					className="text-blue-600 no-underline"
					href="mailto:support@arbry.com"
				>
					contáctanos
				</Link>
				.
			</Text>
			<Text className="m-0 text-center text-slate-500 text-xs">
				© {currentYear} ARBRY. Todos los derechos reservados.
			</Text>
		</Section>
	);
};
