"use client";

import { useQueryStates, parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs";

export function useQueryParams() {
  const [params, setParams] = useQueryStates({
    type: parseAsStringEnum(["properties", "land"]).withDefault("properties"),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
    sortBy: parseAsStringEnum(["newest", "price-low", "price-high", "area-large", "area-small"]).withDefault("newest"),
    query: parseAsString.withDefault("").withOptions({ shallow: true }),
  });

  return {
    params,
    setParams,
  };
}