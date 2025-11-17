import { Building, Users, Award, MapPin } from "lucide-react";

export default function AboutPage() {
    const values = [
		{
			icon: <Building className="h-8 w-8" />,
			title: "Experiencia",
			description:
				"Más de 15 años ayudando a familias a encontrar su hogar perfecto en el mercado inmobiliario.",
		},
		{
			icon: <Users className="h-8 w-8" />,
			title: "Equipo Experto",
			description:
				"Profesionales altamente capacitados que entienden tus necesidades y te guían en cada paso.",
		},
		{
			icon: <Award className="h-8 w-8" />,
			title: "Calidad Garantizada",
			description:
				"Propiedades verificadas y servicios de primera calidad que superan tus expectativas.",
		},
		{
			icon: <MapPin className="h-8 w-8" />,
			title: "Ubicación Estratégica",
			description:
				"Amplia cobertura en las mejores zonas con acceso a servicios y transporte.",
		},
	];

    const stats = [
		{ label: "Propiedades Vendidas", value: "500+" },
		{ label: "Clientes Satisfechos", value: "1000+" },
		{ label: "Años de Experiencia", value: "15+" },
		{ label: "Agentes Expertos", value: "25+" },
	];

    return (
        <div className="container mx-auto max-w-7xl space-y-16 px-4">

            <section className="rounded-2xl bg-muted/50 p-8">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    {stats.map((stat) => (
                        <div className="space-y-2 text-center" key={stat.label}>
                            <div className="font-bold text-3xl text-primary">
                                {stat.value}
                            </div>
                            <div className="text-muted-foreground text-sm">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-8">
                <div className="space-y-4 text-center">
                    <h3 className="font-bold text-3xl text-foreground">
                        Nuestros Valores
                    </h3>
                    <p className="mx-auto max-w-2xl text-muted-foreground">
                        Estos son los principios que guian cada decisión que tomamos y cada
                        servicio que ofrecemos.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {values.map((value) => (
                        <div
                            className="space-y-4 rounded-xl border bg-card p-6 text-center"
                            key={value.title}
                        >
                            <div className="flex justify-center text-primary">
                                {value.icon}
                            </div>
                            <h4 className="font-semibold text-foreground text-xl">
                                {value.title}
                            </h4>
                            <p className="text-muted-foreground">{value.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-6 rounded-2xl bg-primary p-12 text-center text-primary-foreground">
                <h3 className="font-bold text-3xl">Nuestra Misión</h3>
                <p className="mx-auto max-w-3xl text-lg leading-relaxed">
                    Ser el puente que conecta a las personas con sus sueños inmobiliarios,
                    ofreciendo un servicio excepcional, transparencia total y resultados
                    superiores que transformen vidas y construyan futuros sólidos.
                </p>
            </section>

            <section className="space-y-8">
                <div className="space-y-4 text-center">
                    <h3 className="font-bold text-3xl text-foreground">Nuestro Equipo</h3>
                    <p className="mx-auto max-w-2xl text-muted-foreground">
                        Profesionales apasionados dedicados a hacer realidad tus sueños.
                    </p>
                </div>
                <div className="rounded-xl bg-muted/30 p-8 text-center">
                    <p className="text-muted-foreground">
                        Nuestro equipo está conformado por agentes expertos, asesores
                        legales, y especialistas en mercado que trabajan juntos para
                        brindarte el mejor servicio posible.
                    </p>
                </div>
            </section>
        </div>
    );
}
