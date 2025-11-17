"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const LandSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  price: z.coerce.number().nonnegative(),
  surface: z.coerce.number().nonnegative(),
  location: z.string().min(2),
});

type FormValues = z.infer<typeof LandSchema>;

type LandCreatorProps = { initialValues?: Partial<FormValues> };

export function LandCreator({ initialValues }: LandCreatorProps) {
  const { register, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(LandSchema),
    defaultValues: initialValues ?? { title: "", description: "", price: 0, surface: 0, location: "" },
  });

  const onSubmit = (_values: FormValues) => {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo Terreno</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <Input placeholder="Título" {...register("title")} />
          <Textarea rows={4} placeholder="Descripción" {...register("description")} />
          <Input type="number" placeholder="Precio" {...register("price")} />
          <Input type="number" placeholder="Superficie" {...register("surface")} />
          <Input placeholder="Ubicación" {...register("location")} />
          <Button type="submit">Guardar</Button>
        </form>
      </CardContent>
    </Card>
  );
}
