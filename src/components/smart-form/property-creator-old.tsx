"use client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card as UIcard, CardContent as UIcardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle } from "@/components/ui/field";
import { SmartFormProvider } from "@/components/smart-form/SmartFormContext";
import { GeoField } from "@/components/smart-form/GeoField";
import { ImageDropzone } from "@/components/smart-form/ImageDropzone";
import { SmartRichEditor } from "@/components/smart-form/SmartRichEditor";
import { SeoPreview } from "@/components/smart-form/SeoPreview";
import { getAISuggestionService } from "@/lib/services/ai/ai-suggestions.service";
import { useActionState } from "react";
import { usePropertyCreatorStore } from "@/stores/creator/propertyCreatorStore";
import { Sparkles } from "lucide-react";

export const PropertyCreatorSchema = z.object({
  title: z.string().min(2, "Título requerido"),
  description: z.string().min(10, "Descripción mínima de 10 caracteres"),
  price: z.coerce.number().nonnegative("Precio inválido"),
  surface: z.coerce.number().nonnegative("Superficie inválida"),
  propertyType: z.string().optional(),
  bedrooms: z.coerce.number().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  amenities: z.string().optional(),
  features: z.string().optional(),
  tags: z.string().optional(),
  status: z.string().optional(),
  location: z.string().optional(),
  images: z.array(z.object({ url: z.string().url() })).optional(),
});

type FormValues = z.infer<typeof PropertyCreatorSchema>;
type PropertyCreatorProps = { initialValues?: Partial<FormValues> };

export function PropertyCreator({ initialValues }: PropertyCreatorProps) {
  const [state, action] = useActionState(async (_prev: any, formData: FormData) => {
    const mod = await import("@/lib/actions/creator-actions");
    return mod.savePropertyDraft(_prev, formData);
  }, {} as any);
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { form, setField } = usePropertyCreatorStore();
  const [lang, setLang] = useState<"es" | "en">("es");
  const [temp, setTemp] = useState<number>(0.6);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(PropertyCreatorSchema),
    defaultValues: initialValues ?? {
      title: (form.title as unknown as string) || "",
      description: (form.description as unknown as string) || "",
      price: (form.price as unknown as number) || 0,
      surface: (form.surface as unknown as number) || 0,
      propertyType: (form.propertyType as unknown as string) || "",
      bedrooms: (form.bedrooms as unknown as number) || undefined,
      bathrooms: (form.bathrooms as unknown as number) || undefined,
      amenities: (form.amenities as unknown as string) || "",
      features: (form.features as unknown as string) || "",
      tags: (form.tags as unknown as string) || "",
      status: (form.status as unknown as string) || "",
      location: (form.location as unknown as string) || "",
      images: (form.images as unknown as Array<{ url: string }>) || [],
    },
  });

  const onSave = async (payload: Record<string, any>) => {
    if (inputRef.current && formRef.current) {
      inputRef.current.value = JSON.stringify(payload);
      formRef.current.requestSubmit();
    }
  };

  return (
    <SmartFormProvider onSave={onSave}>
      <FieldSet>
        <FieldLegend>Propiedad</FieldLegend>
        <FieldDescription>Completa la información de la propiedad.</FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="title">Título</FieldLabel>
            <Input id="title" aria-invalid={!!errors.title} {...register("title", { onChange: (e) => setField("title", e.target.value) })} />
            <FieldError errors={errors.title ? [{ message: errors.title.message }] : undefined} />
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Descripción</FieldLabel>
            <SmartRichEditor value={watch("description") || ""} onChange={(v) => { setValue("description", v); setField("description", v); }} placeholder="Describe la propiedad..." />
            <FieldError errors={errors.description ? [{ message: errors.description.message }] : undefined} />
          </Field>
          <Field orientation="responsive">
            <FieldContent>
              <FieldLabel htmlFor="price">Precio</FieldLabel>
              <Input id="price" type="number" aria-invalid={!!errors.price} {...register("price", { valueAsNumber: true, onChange: (e) => setField("price", Number(e.target.value)) })} />
              <FieldError errors={errors.price ? [{ message: errors.price.message }] : undefined} />
            </FieldContent>
            <FieldContent>
              <FieldLabel htmlFor="surface">Superficie (m²)</FieldLabel>
              <Input id="surface" type="number" aria-invalid={!!errors.surface} {...register("surface", { valueAsNumber: true, onChange: (e) => setField("surface", Number(e.target.value)) })} />
              <FieldError errors={errors.surface ? [{ message: errors.surface.message }] : undefined} />
            </FieldContent>
          </Field>
          <Field orientation="responsive">
            <FieldContent>
              <FieldLabel htmlFor="propertyType">Tipo de propiedad</FieldLabel>
              <Input id="propertyType" {...register("propertyType", { onChange: (e) => setField("propertyType", e.target.value) })} />
            </FieldContent>
            <FieldContent>
              <FieldLabel htmlFor="bedrooms">Habitaciones</FieldLabel>
              <Input id="bedrooms" type="number" {...register("bedrooms", { valueAsNumber: true, onChange: (e) => setField("bedrooms", Number(e.target.value)) })} />
            </FieldContent>
            <FieldContent>
              <FieldLabel htmlFor="bathrooms">Baños</FieldLabel>
              <Input id="bathrooms" type="number" {...register("bathrooms", { valueAsNumber: true, onChange: (e) => setField("bathrooms", Number(e.target.value)) })} />
            </FieldContent>
          </Field>
          <Field orientation="responsive">
            <FieldContent>
              <FieldLabel htmlFor="amenities">Amenidades (CSV)</FieldLabel>
              <Input id="amenities" placeholder="Piscina, Jardín" {...register("amenities", { onChange: (e) => setField("amenities", e.target.value) })} />
            </FieldContent>
            <FieldContent>
              <FieldLabel htmlFor="features">Características (CSV)</FieldLabel>
              <Input id="features" placeholder="Vista al mar, Terraza" {...register("features", { onChange: (e) => setField("features", e.target.value) })} />
            </FieldContent>
            <FieldContent>
              <FieldLabel htmlFor="tags">Tags (CSV)</FieldLabel>
              <Input id="tags" placeholder="lujo, moderno" {...register("tags", { onChange: (e) => setField("tags", e.target.value) })} />
            </FieldContent>
          </Field>
          <Field orientation="responsive">
            <FieldContent>
              <FieldLabel htmlFor="status">Estado</FieldLabel>
              <Input id="status" {...register("status", { onChange: (e) => setField("status", e.target.value) })} />
            </FieldContent>
            <FieldContent>
              <FieldLabel htmlFor="location">Ubicación</FieldLabel>
              <GeoField name="location" label="" value={watch("location") || ""} onChange={(v) => { setValue("location", v as any); setField("location", v); }} />
            </FieldContent>
          </Field>
          <FieldSeparator>Imágenes</FieldSeparator>
          <Field>
            <ImageDropzone onChange={(imgs) => { setValue("images", imgs as any); setField("images", imgs); }} />
          </Field>
        </FieldGroup>
      </FieldSet>
      <UIcard className="mt-4">
        <UIcardContent className="flex flex-wrap items-center gap-3 p-3">
          <div className="w-40">
            <Select value={lang} onValueChange={(v) => setLang(v as any)}>
              <SelectTrigger><SelectValue placeholder="Idioma" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Creatividad</span>
            <Slider value={[temp]} onValueChange={(v) => setTemp(v[0] as number)} min={0} max={1} step={0.1} className="w-40" />
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={async () => {
              const svc = getAISuggestionService();
              const values = getValues();
              const features = [values.propertyType, values.amenities, values.features].filter(Boolean).join(", ");
              const prompt = `Genera título, descripción y tags SEO para propiedad (${values.propertyType}) en ${values.location} con características: ${features}. Idioma: ${lang}`;
              const title = await svc.generateText(prompt, { language: lang, maxLength: 80 });
              const description = await svc.generateText(`${prompt}\nDescripción detallada:`, { language: lang, maxLength: 400 });
              const tags = await svc.generateText(`${prompt}\nGenera etiquetas separadas por comas:`, { language: lang, maxLength: 120 });
              setValue("title", title);
              setField("title", title);
              setValue("description", description);
              setField("description", description);
              setValue("tags", tags);
              setField("tags", tags);
            }}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generar IA
          </Button>
          <div className="ml-auto w-full md:w-80">
            <SeoPreview title={watch("title")} description={watch("description")} url="https://brymar.com/properties/preview" />
          </div>
        </UIcardContent>
      </UIcard>
      <form ref={formRef} action={action as any} className="hidden">
        <input ref={inputRef} type="hidden" name="payload" />
      </form>
      <div className="mt-4 flex items-center gap-3">
        <Button
          disabled={state?.success === true}
          onClick={handleSubmit(async () => {
            const values = getValues();
            await onSave({
              ...values,
              coordinates: undefined,
            });
          })}
        >
          Guardar borrador
        </Button>
      </div>
    </SmartFormProvider>
  );
}
