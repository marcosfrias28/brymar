"use server";

import { categories, type Category, type NewCategory } from '@/lib/db/schema';
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import db from "../../lib/db/drizzle";

// Ottieni tutte le categorie
export async function getCategories(): Promise<Category[]> {
  try {
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.status, "active"))
      .orderBy(asc(categories.order));

    return result;
  } catch (error) {
    console.error("Errore nel recupero delle categorie:", error);
    throw new Error("Impossibile recuperare le categorie");
  }
}

// Ottieni una categoria per ID
export async function getCategoryById(id: number): Promise<Category | null> {
  try {
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Errore nel recupero della categoria:", error);
    throw new Error("Impossibile recuperare la categoria");
  }
}

// Crea una nuova categoria
export async function createCategory(data: Omit<NewCategory, "id" | "createdAt" | "updatedAt">): Promise<Category> {
  try {
    const newCategory: NewCategory = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .insert(categories)
      .values(newCategory)
      .returning();

    revalidatePath("/dashboard");
    revalidatePath("/");

    return result[0];
  } catch (error) {
    console.error("Errore nella creazione della categoria:", error);
    throw new Error("Impossibile creare la categoria");
  }
}

// Aggiorna una categoria
export async function updateCategory(id: number, data: Partial<Omit<NewCategory, "id" | "createdAt">>): Promise<Category> {
  try {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const result = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Categoria non trovata");
    }

    revalidatePath("/dashboard");
    revalidatePath("/");

    return result[0];
  } catch (error) {
    console.error("Errore nell'aggiornamento della categoria:", error);
    throw new Error("Impossibile aggiornare la categoria");
  }
}

// Elimina una categoria
export async function deleteCategory(id: number): Promise<void> {
  try {
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Categoria non trovata");
    }

    revalidatePath("/dashboard");
    revalidatePath("/");
  } catch (error) {
    console.error("Errore nell'eliminazione della categoria:", error);
    throw new Error("Impossibile eliminare la categoria");
  }
}

// Aggiorna l'ordine delle categorie
export async function updateCategoriesOrder(categoryIds: number[]): Promise<void> {
  try {
    const updates = categoryIds.map((id, index) =>
      db
        .update(categories)
        .set({ order: index + 1, updatedAt: new Date() })
        .where(eq(categories.id, id))
    );

    await Promise.all(updates);

    revalidatePath("/dashboard");
    revalidatePath("/");
  } catch (error) {
    console.error("Errore nell'aggiornamento dell'ordine delle categorie:", error);
    throw new Error("Impossibile aggiornare l'ordine delle categorie");
  }
}

// Cambia lo status di una categoria
export async function toggleCategoryStatus(id: number): Promise<Category> {
  try {
    const category = await getCategoryById(id);
    if (!category) {
      throw new Error("Categoria non trovata");
    }

    const newStatus = category.status === "active" ? "inactive" : "active";

    const result = await db
      .update(categories)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();

    revalidatePath("/dashboard");
    revalidatePath("/");

    return result[0];
  } catch (error) {
    console.error("Errore nel cambio di status della categoria:", error);
    throw new Error("Impossibile cambiare lo status della categoria");
  }
}