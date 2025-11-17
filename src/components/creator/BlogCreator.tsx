"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SmartRichEditor } from "@/components/smart-form/SmartRichEditor";

const BlogSchema = z.object({
  title: z.string().min(2),
  category: z.string().min(2),
  content: z.string().min(10),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof BlogSchema>;

type BlogCreatorProps = { initialValues?: Partial<FormValues> };

export function BlogCreator({ initialValues }: BlogCreatorProps) {
  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(BlogSchema),
    defaultValues: initialValues ?? { title: "", category: "property-news", content: "", tags: "" },
  });

  const onSubmit = (_values: FormValues) => {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo Post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <Input placeholder="Título" {...register("title")} />
          <Select defaultValue="property-news" onValueChange={(v) => setValue("category", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="property-news">Noticias de Propiedades</SelectItem>
              <SelectItem value="market-analysis">Análisis de Mercado</SelectItem>
              <SelectItem value="investment-tips">Consejos de Inversión</SelectItem>
              <SelectItem value="legal-advice">Asesoría Legal</SelectItem>
              <SelectItem value="home-improvement">Mejoras del Hogar</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
          <SmartRichEditor
            value={watch("content") || ""}
            onChange={(v) => setValue("content", v)}
            placeholder="Contenido del post"
          />
          <Input placeholder="Tags (coma separada)" {...register("tags")} />
          <Button type="submit">Guardar</Button>
        </form>
      </CardContent>
    </Card>
  );
}
