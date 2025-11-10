import { ContactRound, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SectionHeader, SectionWrapper } from "@/components/ui/section-wrapper";
import { UnifiedForm, type FormConfig } from "@/components/forms/unified-form";
import { contactFormAction } from "@/lib/actions/contact-actions";

// Constants for validation
const contactFormConfig: FormConfig = {
	title: "Envíanos un mensaje",
	description: "Completa el formulario y nos pondremos en contacto contigo",
	submitText: "Enviar mensaje",
	fields: [
		{
			name: "name",
			label: "Nombre completo",
			type: "text",
			required: true,
			placeholder: "Tu nombre completo",
		},
		{
			name: "email",
			label: "Correo electrónico",
			type: "text",
			required: true,
			placeholder: "tu@email.com",
		},
		{
			name: "phone",
			label: "Teléfono",
			type: "text",
			required: true,
			placeholder: "Tu número de teléfono",
		},
		{
			name: "message",
			label: "Mensaje",
			type: "textarea",
			required: true,
			placeholder: "Escribe tu mensaje aquí...",
			rows: 5,
		},
	],
};

export default function ContactPage() {
	return (
		<SectionWrapper>
			<SectionHeader
				description="¿Buscas tu hogar soñado o estás listo para vender? Nuestro equipo de expertos ofrece orientación personalizada y conocimiento del mercado adaptado a ti."
				icon={<ContactRound />}
				subtitle="Contáctanos"
				title="¿Tienes preguntas? ¡Estamos aquí para ayudarte!"
			/>

			<div className="mx-auto max-w-7xl rounded-2xl border bg-card p-4 shadow-lg">
				<div className="flex flex-col gap-8 lg:flex-row">
					<div className="relative w-full overflow-hidden rounded-2xl lg:w-1/2">
						<div className="absolute inset-0 z-10 bg-foreground/60">
							<Image
								alt="Contacto"
								className="object-cover mix-blend-overlay"
								fill
								priority
								src="/images/contact.jpg"
							/>
						</div>
						<div className="relative z-20 flex h-full flex-col justify-between p-8">
							<div className="space-y-2">
								<h3 className="font-medium text-2xl text-white">
									Información de contacto
								</h3>
								<p className="text-white/80">
									¿Listo para encontrar tu hogar soñado o vender tu propiedad?
									¡Estamos aquí para ayudarte!
								</p>
							</div>

							<div className="mt-8 space-y-6">
								<Link className="group block" href="tel:+1234567890">
									<div className="flex items-center gap-4 transition-colors group-hover:text-primary">
										<div className="rounded-full bg-primary/10 p-2 text-primary">
											<Phone className="h-6 w-6" />
										</div>
										<span className="font-medium text-white">
											+1 234 567 890
										</span>
									</div>
								</Link>

								<Link className="group block" href="mailto:info@brymar.com">
									<div className="flex items-center gap-4 transition-colors group-hover:text-primary">
										<div className="rounded-full bg-primary/10 p-2 text-primary">
											<Mail className="h-6 w-6" />
										</div>
										<span className="font-medium text-white">
											info@brymar.com
										</span>
									</div>
								</Link>

								<div className="flex items-start gap-4">
									<div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
										<MapPin className="h-6 w-6" />
									</div>
									<div>
										<p className="font-medium text-white">Nuestra ubicación</p>
										<p className="text-white/80">
											Calle Principal 123, Ciudad, País
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="w-full p-6 lg:w-1/2 lg:p-8">
						<UnifiedForm
							action={contactFormAction}
							config={contactFormConfig}
						/>
					</div>
				</div>
			</div>
		</SectionWrapper>
	);
}
