// Blog Wizard Configuration for New Framework

import {
	BlogContentStepSchema,
	BlogMediaStepSchema,
	BlogSEOStepSchema,
	BlogWizardSchema,
} from "@/lib/schemas/blog-wizard-schemas";
import type { BlogWizardData } from "@/types/blog-wizard";
import type { WizardConfig, WizardStepProps } from "@/types/wizard-core";

// Temporary simple content step component
function SimpleBlogContentStep({
	data,
	onUpdate,
	errors,
}: WizardStepProps<BlogWizardData>) {
	return (
		<div className="space-y-4">
			<div>
				<label className="mb-2 block font-medium text-sm">Título</label>
				<input
					className="w-full rounded border p-2"
					onChange={(e) => onUpdate({ title: e.target.value })}
					type="text"
					value={data.title || ""}
				/>
			</div>
			<div>
				<label className="mb-2 block font-medium text-sm">Contenido</label>
				<textarea
					className="w-full rounded border p-2"
					onChange={(e) => onUpdate({ content: e.target.value })}
					rows={10}
					value={data.content || ""}
				/>
			</div>
			<div>
				<label className="mb-2 block font-medium text-sm">Categoría</label>
				<select
					className="w-full rounded border p-2"
					onChange={(e) =>
						onUpdate({ category: e.target.value as BlogWizardData["category"] })
					}
					value={data.category || ""}
				>
					<option value="">Seleccionar categoría</option>
					<option value="market-analysis">Análisis de Mercado</option>
					<option value="investment-tips">Consejos de Inversión</option>
					<option value="property-news">Noticias Inmobiliarias</option>
					<option value="legal-advice">Asesoría Legal</option>
					<option value="lifestyle">Estilo de Vida</option>
				</select>
			</div>
		</div>
	);
}

// Temporary simple media step component
function SimpleBlogMediaStep({
	data,
	onUpdate,
	errors,
}: WizardStepProps<BlogWizardData>) {
	return (
		<div className="space-y-4">
			<div>
				<label className="mb-2 block font-medium text-sm">
					URL de Imagen de Portada
				</label>
				<input
					className="w-full rounded border p-2"
					onChange={(e) => onUpdate({ coverImage: e.target.value })}
					placeholder="https://ejemplo.com/imagen.jpg"
					type="url"
					value={data.coverImage || ""}
				/>
			</div>
		</div>
	);
}

// Temporary simple SEO step component
function SimpleBlogSeoStep({
	data,
	onUpdate,
	errors,
}: WizardStepProps<BlogWizardData>) {
	return (
		<div className="space-y-4">
			<div>
				<label className="mb-2 block font-medium text-sm"> SEO Title </label>
				<input
					className="w-full rounded border p-2"
					onChange={(e) => onUpdate({ seoTitle: e.target.value })}
					type="text"
					value={data.seoTitle || ""}
				/>
			</div>
			<div>
				<label className="mb-2 block font-medium text-sm">
					{" "}
					SEO Description{" "}
				</label>
				<textarea
					className="w-full rounded border p-2"
					onChange={(e) => onUpdate({ seoDescription: e.target.value })}
					rows={3}
					value={data.seoDescription || ""}
				/>
			</div>
		</div>
	);
}

// Temporary simple preview step component
function SimpleBlogPreviewStep({
	data,
	onUpdate,
	errors,
}: WizardStepProps<BlogWizardData>) {
	return (
		<div className="space-y-4">
			<h2 className="font-bold text-2xl">{data.title || "Sin título"}</h2>
			{data.coverImage && (
				<img
					alt="Portada"
					className="w-full max-w-md rounded"
					src={data.coverImage}
				/>
			)}
			<div className="prose">
				<p>{data.content || "Sin contenido"}</p>
			</div>
			<div className="text-gray-600 text-sm">
				<p>Categoría: {data.category || "Sin categoría"}</p>
				<p>SEO Title: {data.seoTitle || "Sin título SEO"}</p>
				<p>SEO Description: {data.seoDescription || "Sin descripción SEO"}</p>
			</div>
		</div>
	);
}

export const blogWizardConfig: WizardConfig<BlogWizardData> = {
	id: "blog-wizard",
	type: "blog",
	title: "Crear Artículo",
	description: "Asistente para crear artículos de blog",
	steps: [
		{
			id: "content",
			title: "Contenido",
			description: "Información básica y contenido del artículo",
			component: SimpleBlogContentStep,
			validation: BlogContentStepSchema,
		},
		{
			id: "media",
			title: "Multimedia",
			description: "Imágenes y videos para el artículo",
			component: SimpleBlogMediaStep,
			validation: BlogMediaStepSchema,
		},
		{
			id: "seo",
			title: "SEO",
			description: "Optimización para motores de búsqueda",
			component: SimpleBlogSeoStep,
			validation: BlogSEOStepSchema,
		},
		{
			id: "preview",
			title: "Vista Previa",
			description: "Revisa cómo se verá tu artículo",
			component: SimpleBlogPreviewStep,
			isOptional: true,
		},
	],
	validation: {
		stepSchemas: {
			content: BlogContentStepSchema,
			media: BlogMediaStepSchema,
			seo: BlogSEOStepSchema,
		},
		finalSchema: BlogWizardSchema,
	},
	persistence: {
		autoSave: true,
		autoSaveInterval: 30_000,
		storageKey: "blog-wizard",
	},
	navigation: {
		allowSkipSteps: false,
		showProgress: true,
		showStepNumbers: true,
	},
};
