"use client";

import { useState, useEffect } from "react";
import { Category } from '@/lib/db/schema';
// Category actions need to be implemented in DDD structure
// import { getCategories } from '@/presentation/server-actions/category-actions';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Categories functionality needs to be implemented in DDD structure
      setCategories([]);
      throw new Error('Categories functionality needs to be implemented in DDD structure');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
      console.error("Errore nel fetch delle categorie:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const refetch = async () => {
    await fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    refetch,
  };
}

export default useCategories;