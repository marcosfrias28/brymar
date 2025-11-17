"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { ArrowLeft, Edit3, Home } from "lucide-react";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { PropertyCreator } from "@/components/creator/PropertyCreator";
import { useProperty } from "@/hooks/use-properties";
import type { Property } from "@/lib/types/properties";

export default function PropertyEditPage() {
	const params = useParams();
	const id = (params?.id as string) || "";
	const { data: result, isLoading, error } = useProperty(id);
	const property = result?.data as Property | undefined;

	const initialValues = useMemo(() => {
		if (!property) return;
		const images = (property.images || []).map((img: { url: string }) => ({
			url: img.url,
		}));
		return {
			title: property.title,
			description: property.description,
			price: property.price,
			surface: property.features?.area,
			propertyType: property.type,
			bedrooms: property.features?.bedrooms,
			bathrooms: property.features?.bathrooms,
			location: property.address?.city || "",
			tags: (property.tags || []).join(", "),
			images,
		};
	}, [property]);

	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard", icon: Home },
		{ label: "Propiedades", href: "/dashboard/properties" },
		{ label: "Editar", icon: Edit3 },
	];

	let descriptionText = "";
	if (isLoading) {
		descriptionText = "Cargando...";
	} else if (error) {
		descriptionText = "Error al cargar";
	} else {
		descriptionText = property?.title || "";
	}

	return (
		<DashboardPageLayout
			actions={
				<Button asChild variant="outline">
					<Link href="/dashboard/properties">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Volver a Propiedades
					</Link>
				</Button>
			}
			breadcrumbs={breadcrumbs}
			description={descriptionText}
			title="Editar Propiedad"
		>
			<Card>
				<CardHeader>
					<CardTitle>Formulario de Edición</CardTitle>
					<CardDescription>{descriptionText}</CardDescription>
				</CardHeader>
				<CardContent>
					{property ? <PropertyCreator initialValues={initialValues} /> : null}
				</CardContent>
			</Card>
		</DashboardPageLayout>
	);
}
