import { supabase } from "../config/supabase.js";

interface GetOrdersParams {
  userId: string;
  status?: "pending" | "paid" | "failed";
  page: number;
  limit: number;
}

export async function getUserOrders(params: GetOrdersParams) {
  const { userId, status, page, limit } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("orders")
    .select(
      `
        id,
        status,
        total,
        stripe_session_id,
        created_at,
        updated_at,
        order_items (
          id,
          product_id,
          quantity,
          price,
          products (
            id,
            name,
            image_url
          )
        )
      `,
      { count: "exact" },
    )
    .eq("user_id", userId);

  if (status) {
    query = query.eq("status", status);
  }

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error("Failed to fetch orders");
  }

  const total = count ?? 0;

  return {
    orders: data ?? [],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getUserOrderById(userId: string, orderId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        status,
        total,
        stripe_session_id,
        created_at,
        updated_at,
        order_items (
          id,
          product_id,
          quantity,
          price,
          products (
            id,
            name,
            image_url
          )
        )
      `,
    )
    .eq("id", orderId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error("Failed to fetch order");
  }

  return data;
}
