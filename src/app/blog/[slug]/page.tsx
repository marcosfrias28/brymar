import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Comments } from "@/components/blog/comments";
import { listCommentsByPost } from "@/lib/actions/comments-actions";

export default async function BlogPostPage({ params }: any) {
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, params.slug))
    .limit(1);

  if (!post || post.status !== "published") notFound();

  const comments = await listCommentsByPost(post.id);

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <h1 className="mb-2 font-bold text-3xl">{post.title}</h1>
      {post.excerpt && <p className="mb-6 text-muted-foreground">{post.excerpt}</p>}
      <article className="prose max-w-none">
        {post.content}
      </article>
      <div className="mt-10">
        <h2 className="mb-4 font-semibold text-2xl">Comentarios</h2>
        <Comments postId={post.id} initial={comments} />
      </div>
    </div>
  );
}
