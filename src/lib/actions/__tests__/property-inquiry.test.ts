import { createPropertyInquiryAction } from "@/lib/actions/property-actions";

function fd(entries: Record<string, string>) {
  const f = new FormData();
  Object.entries(entries).forEach(([k,v]) => f.append(k, v));
  return f;
}

test("createPropertyInquiryAction requires valid fields", async () => {
  const res = await createPropertyInquiryAction({} as any, fd({ propertyId: "not-a-uuid", name: "A", email: "nope", message: "short" }));
  expect(res.success).toBe(false);
});

