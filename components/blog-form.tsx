"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { translations } from "@/lib/translations";
import { useLangStore } from "@/utils/store/lang-store";
import { useBlogPosts } from "@/hooks/use-blog";

export function BlogForm() {
  const language = useLangStore((prev) => prev.language);
  const t = translations[language].blogForm;
  const { createBlogPost, createState, isCreating } = useBlogPosts();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle image selection if needed
  };

  useEffect(() => {
    if (createState.success) {
      // Reset form or redirect as needed
      const form = document.querySelector("form") as HTMLFormElement;
      if (form) form.reset();
    }
  }, [createState]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createBlogPost(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">{t.postTitle}</Label>
        <Input id="title" name="title" required />
      </div>
      <div>
        <Label htmlFor="content">{t.content}</Label>
        <Textarea id="content" name="content" required />
      </div>
      <div>
        <Label htmlFor="author">{t.author}</Label>
        <Input id="author" name="author" required />
      </div>
      <div>
        <Label htmlFor="image">{t.coverImage}</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
      </div>
      <Button type="submit" disabled={isCreating}>
        {isCreating ? "Creando..." : t.submit}
      </Button>
    </form>
  );
}
