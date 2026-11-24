import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ListingType = "sale" | "rental";
export type Category = { id: string; name: string; display_order: number };
export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  promo_price: number | null;
  category_id: string | null;
  image_url: string | null;
  in_stock: boolean;
  featured: boolean;
  listing_type: ListingType;
};

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await supabase.from("categories").select("id,name,display_order").order("display_order");
    if (error) throw error;
    return data as Category[];
  },
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () => {
    const { data, error } = await supabase.from("products").select("*").order("featured", { ascending: false }).order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((p) => ({
      ...p,
      price: Number(p.price),
      promo_price: p.promo_price == null ? null : Number(p.promo_price),
      listing_type: p.listing_type === "rental" ? "rental" : "sale",
    })) as Product[];
  },
});

export const unitPrice = (p: Product) => p.promo_price ?? p.price;
