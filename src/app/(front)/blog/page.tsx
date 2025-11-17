import Link from "next/link";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function BlogIndexPage() {
  const posts = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.publishedAt ?? blogPosts.createdAt));

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="space-y-4">
        {posts.map((p) => (
          <div key={p.id} className="rounded-lg border p-4">
            <Link className="font-semibold text-xl" href={`/blog/${p.slug}`}>{p.title}</Link>
            {p.excerpt && <p className="mt-2 text-muted-foreground">{p.excerpt}</p>}
          </div>
        ))}
        {posts.length === 0 && <p className="text-muted-foreground">No hay artículos publicados</p>}
      </div>
    </div>
  );
}
