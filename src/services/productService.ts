import { supabase } from "../config/supabase.js";

interface GetProductsParams {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy: "name" | "price" | "created_at";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

export async function getProducts(params: GetProductsParams) {
  const {
    search,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
    page,
    limit,
  } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select(
      "id, name, description, price, image_url, created_at, updated_at",
      {
        count: "exact",
      },
    );

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (minPrice !== undefined) {
    query = query.gte("price", minPrice);
  }

  if (maxPrice !== undefined) {
    query = query.lte("price", maxPrice);
  }

  query = query.order(sortBy, {
    ascending: sortOrder === "asc",
  });

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Failed to fetch products:", error);

    throw new Error("Failed to fetch products");
  }

  const total = count ?? 0;

  return {
    products: data ?? [],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, description, price, image_url, created_at, updated_at",
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    console.error("Failed to fetch product:", error);

    throw new Error("Failed to fetch product");
  }

  return data;
}
