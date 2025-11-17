import { createCommentAction } from "@/lib/actions/comments-actions";

function fd(entries: Record<string, string>) {
  const f = new FormData();
  Object.entries(entries).forEach(([k,v]) => f.append(k, v));
  return f;
}

test("createCommentAction fails on invalid email", async () => {
  const res = await createCommentAction({} as any, fd({ postId: "00000000-0000-0000-0000-000000000000", content: "hi", email: "bad" }));
  expect(res.success).toBe(false);
  expect(res.errors?.email?.length).toBeGreaterThan(0);
});

