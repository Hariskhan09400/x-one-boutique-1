// src/hooks/useProducts.ts
// ══════════════════════════════════════════════════════════════
//  Merges products from 2 sources:
//  1. Local products.ts  (fallback / bulk products)
//  2. Supabase DB        (admin-managed products)
//  DB products override local if same id
//  Admin can add/edit/delete from DB only
// ══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { products as localProducts } from "../data/products";
import type { Product } from "../types";

export interface DBProduct {
  id:             number | string;
  name:           string;
  price:          number;
  original_price?: number;
  description:    string;
  category:       string;
  stock:          number;
  images:         string[];
  in_stock:       boolean;
  created_at?:    string;
}

// Convert DB row → Product shape used in app
function dbToProduct(row: DBProduct): Product {
  return {
    id:            `db_${row.id}`,
    name:          row.name,
    price:         row.price,
    originalPrice: row.original_price ?? undefined,
    description:   row.description,
    category:      row.category,
    images:        row.images?.length ? row.images : [],
    inStock:       row.in_stock ?? true,
  } as Product;
}

// ── Hook
export function useProducts() {
  const [dbProducts,  setDbProducts]  = useState<DBProduct[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  const fetchDB = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false });
      if (err) throw err;
      setDbProducts((data as DBProduct[]) || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDB(); }, [fetchDB]);

  // Merge: DB products first, then local (no duplicates by name)
  const dbNames    = new Set(dbProducts.map(p => p.name.toLowerCase()));
  const dbConverted = dbProducts.map(dbToProduct);
  const localFiltered = localProducts.filter(
    p => !dbNames.has(p.name.toLowerCase())
  );
  const allProducts: Product[] = [...dbConverted, ...localFiltered];

  return { allProducts, dbProducts, loading, refetch: fetchDB, error };
}

// ── Admin CRUD operations
export const productApi = {

  async add(data: Omit<DBProduct, "id" | "created_at">): Promise<{ error: string | null }> {
    const { error } = await supabase.from("products").insert([{
      name:           data.name,
      price:          data.price,
      original_price: data.original_price || null,
      description:    data.description,
      category:       data.category,
      stock:          data.stock ?? 0,
      images:         data.images || [],
      in_stock:       data.in_stock ?? true,
    }]);
    return { error: error?.message ?? null };
  },

  async update(id: number, data: Partial<DBProduct>): Promise<{ error: string | null }> {
    const { error } = await supabase.from("products").update({
      name:           data.name,
      price:          data.price,
      original_price: data.original_price || null,
      description:    data.description,
      category:       data.category,
      stock:          data.stock,
      images:         data.images || [],
      in_stock:       data.in_stock,
    }).eq("id", id);
    return { error: error?.message ?? null };
  },

  async delete(id: number): Promise<{ error: string | null }> {
    const { error } = await supabase.from("products").delete().eq("id", id);
    return { error: error?.message ?? null };
  },
};