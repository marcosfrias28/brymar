"use client";

import { useActionState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createPropertyInquiryAction } from "@/lib/actions/property-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { InlineErrorState } from "@/components/ui/error-states";

const schema = z.object({
  propertyId: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
});

type FormValues = z.infer<typeof schema>;

export function PropertyContactForm({ propertyId }: { propertyId: string }) {
  const [state, formAction] = useActionState(createPropertyInquiryAction, {
    success: false,
  } as any);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      propertyId,
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, String(v));
    });
    formAction(fd);
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        {state?.errors && (
          <InlineErrorState message="Error al enviar consulta" />
        )}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-3"
          action={formAction as any}
        >
          <input type="hidden" value={propertyId} {...form.register("propertyId")} />
          <Input placeholder="Nombre" {...form.register("name")} />
          <Input type="email" placeholder="Email" {...form.register("email")} />
          <Input placeholder="Teléfono" {...form.register("phone")} />
          <Textarea rows={4} placeholder="Mensaje" {...form.register("message")} />
          <Button type="submit">Enviar consulta</Button>
        </form>
      </CardContent>
    </Card>
  );
}

