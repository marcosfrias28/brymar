"use client";

import { useState } from "react";
import { payloadApi } from "@/lib/payload/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { translations } from "@/lib/translations";
import { useLangStore } from "@/utils/store/lang-store";
import { toast } from "sonner";

export function BlogForm() {
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const language = useLangStore((prev) => prev.language);
  const t = translations[language].blogForm;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      const content = formData.get("content") as string;
      const author = formData.get("author") as string;
      
      // Upload featured image if provided
      let featuredImageId = null;
      if (image) {
        const imageFormData = new FormData();
        imageFormData.append("file", image);
        const uploadedImage = await payloadApi.media.create(imageFormData);
        featuredImageId = uploadedImage.id;
      }
      
      // Create blog post
      const blogPostData = {
        title,
        content,
        excerpt: content.substring(0, 200) + "...", // Auto-generate excerpt
        featuredImage: featuredImageId,
        author: "1", // Default author ID - should be dynamic based on current user
        categories: ["company-news"], // Default category
        status: "published",
        featured: false,
        publishedDate: new Date().toISOString()
      };
      
      await payloadApi.blogPosts.create(blogPostData);
      toast.success(t.success);
      
      // Reset form
      e.currentTarget.reset();
      setImage(null);
      
    } catch (error) {
      console.error("Error creating blog post:", error);
      toast.error("Errore durante la creazione del post");
    } finally {
      setIsSubmitting(false);
    }
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
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Pubblicazione..." : t.submit}
      </Button>
    </form>
  );
}
