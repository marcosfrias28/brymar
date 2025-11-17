import { EnhancedSearchPage } from "@/components/search/enhanced-search-page";
import { unstable_cache } from "next/cache";
import { searchPropertiesAction } from "@/lib/actions/property-actions";
import { searchLandsAction } from "@/lib/actions/land-actions";
import { parseAsInteger, parseAsStringEnum } from "nuqs/server";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const type = parseAsStringEnum(["properties", "land"]).withDefault("properties").parseServerSide(sp.type);
  const page = parseAsInteger.withDefault(1).parseServerSide(sp.page);
  const limit = parseAsInteger.withDefault(20).parseServerSide(sp.limit);
  const sortBy = parseAsStringEnum(["newest", "price-low", "price-high", "area-large", "area-small"]).withDefault("newest").parseServerSide(sp.sortBy);

  const params = { type, page, limit, sortBy };

  const normalizedType = params.type === "land" ? "lands" : params.type;

  const fetchData = unstable_cache(
    async (filters: { page: number; limit: number; sortBy: string; type: "properties" | "lands" }) => {
      const formData = new FormData();
      formData.append("page", String(filters.page));
      formData.append("limit", String(filters.limit));
      formData.append("sortBy", filters.sortBy);

      if (filters.type === "properties") {
        const result = await searchPropertiesAction(undefined as any, formData);
        return {
          items: result.success ? result.data?.properties || [] : [],
          total: result.success ? result.data?.total || 0 : 0,
        };
      } else {
        const result = await searchLandsAction(undefined as any, formData);
        return {
          items: result.success ? result.data?.lands || [] : [],
          total: result.success ? result.data?.total || 0 : 0,
        };
      }
    },
    ["search", normalizedType, String(params.page), String(params.limit), params.sortBy],
    { revalidate: 60 }
  );

  const { items, total } = await fetchData({
    page: params.page,
    limit: params.limit,
    sortBy: params.sortBy,
    type: normalizedType as "properties" | "lands",
  });

  return (
    <EnhancedSearchPage
      initialFilters={{
        sortBy: params.sortBy,
        page: params.page,
        limit: params.limit,
      }}
      initialSearchType={normalizedType as "properties" | "lands"}
      initialResults={items}
      initialTotal={total}
    />
  );
}
