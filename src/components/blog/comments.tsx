"use client";

import { useActionState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createCommentAction } from "@/lib/actions/comments-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const schema = z.object({
  postId: z.string(),
  content: z.string().min(3),
  name: z.string().optional(),
  email: z.string().email().optional(),
});

type FormValues = z.infer<typeof schema>;

export function Comments({ postId, initial }: { postId: string; initial?: any[] }) {
  const [state, action] = useActionState(createCommentAction, { success: false } as any);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { postId, content: "", name: "", email: "" },
  });

  const onSubmit = (values: FormValues) => {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, String(v));
    });
    action(fd);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {initial?.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">
                {(c.name || "Anónimo")} • {new Date(c.createdAt).toLocaleDateString()}
              </div>
              <p className="mt-2 whitespace-pre-line">{c.content}</p>
            </CardContent>
          </Card>
        ))}
        {initial?.length === 0 && <p className="text-sm text-muted-foreground">Sé el primero en comentar</p>}
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3" action={action as any}>
        <input type="hidden" {...form.register("postId")} value={postId} />
        <Input placeholder="Nombre" {...form.register("name")} />
        <Input type="email" placeholder="Email" {...form.register("email")} />
        <Textarea rows={4} placeholder="Comentario" {...form.register("content")} />
        <Button type="submit">Publicar comentario</Button>
      </form>
    </div>
  );
}

