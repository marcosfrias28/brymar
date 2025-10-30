import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeader, SectionWrapper } from "@/components/ui/section-wrapper";
import { Textarea } from "@/components/ui/textarea";

const ContactIcon = () => (
	<svg
		className="fill-current"
		height="20"
		viewBox="0 0 256 256"
		width="20"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path d="M224 120v96a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8v-96a15.87 15.87 0 0 1 4.69-11.32l80-80a16 16 0 0 1 22.62 0l80 80A15.87 15.87 0 0 1 224 120" />
	</svg>
);

export default function ContactPage() {
	return (
		<SectionWrapper>
			<SectionHeader
				description="¿Buscas tu hogar soñado o estás listo para vender? Nuestro equipo de expertos ofrece orientación personalizada y conocimiento del mercado adaptado a ti."
				icon={<ContactIcon />}
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
						<form className="space-y-6">
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<Input
									id="name"
									name="name"
									placeholder="Nombre*"
									required
									type="text"
								/>
								<Input
									id="phone"
									name="phone"
									placeholder="Teléfono*"
									required
									type="tel"
								/>
							</div>

							<div className="space-y-6">
								<Input
									id="email"
									name="email"
									placeholder="Correo electrónico*"
									required
									type="email"
								/>

								<Textarea
									id="message"
									name="message"
									placeholder="Escribe tu mensaje aquí*"
									required
									rows={5}
								/>
							</div>

							<div className="flex justify-end">
								<Button size="lg" type="submit">
									Enviar mensaje
								</Button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</SectionWrapper>
	);
}
