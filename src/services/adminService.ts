import { supabase } from "../config/supabase.js";

type RevenuePoint = {
  label: string;
  amount: number;
};

type TopSellingProduct = {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
};

export async function getAdminStats() {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, status, total, created_at");

  if (ordersError) {
    throw new Error("Failed to fetch admin statistics");
  }

  const { count: customers, error: customersError } =
    await supabase
      .from("profiles")
      .select("id", {
        count: "exact",
        head: true,
      });

  if (customersError) {
    throw new Error(
      "Failed to fetch customer statistics",
    );
  }

  const allOrders = orders ?? [];

  const paidOrders = allOrders.filter(
    (order) => order.status === "paid",
  );

  const totalOrders = allOrders.length;

  const totalRevenue = paidOrders.reduce(
    (sum, order) => sum + order.total,
    0,
  );

  const today = new Date();

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const tomorrowStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
  );

  const todaySales = paidOrders
    .filter((order) => {
      const orderDate = new Date(order.created_at);

      return (
        orderDate >= todayStart &&
        orderDate < tomorrowStart
      );
    })
    .reduce(
      (sum, order) => sum + order.total,
      0,
    );

  const daily: RevenuePoint[] = [];

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - index,
    );

    const nextDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - index + 1,
    );

    const amount = paidOrders
      .filter((order) => {
        const orderDate = new Date(order.created_at);

        return (
          orderDate >= date &&
          orderDate < nextDate
        );
      })
      .reduce(
        (sum, order) => sum + order.total,
        0,
      );

    daily.push({
      label: date.toISOString().slice(0, 10),
      amount,
    });
  }

  const weekly: RevenuePoint[] = [];

  for (let index = 7; index >= 0; index -= 1) {
    const currentWeekStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - index * 7,
    );

    const currentWeekEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - (index - 1) * 7,
    );

    const amount = paidOrders
      .filter((order) => {
        const orderDate = new Date(order.created_at);

        return (
          orderDate >= currentWeekStart &&
          orderDate < currentWeekEnd
        );
      })
      .reduce(
        (sum, order) => sum + order.total,
        0,
      );

    weekly.push({
      label: `Week ${8 - index}`,
      amount,
    });
  }

  const monthly: RevenuePoint[] = [];

  for (let index = 5; index >= 0; index -= 1) {
    const monthStart = new Date(
      today.getFullYear(),
      today.getMonth() - index,
      1,
    );

    const nextMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - index + 1,
      1,
    );

    const amount = paidOrders
      .filter((order) => {
        const orderDate = new Date(order.created_at);

        return (
          orderDate >= monthStart &&
          orderDate < nextMonthStart
        );
      })
      .reduce(
        (sum, order) => sum + order.total,
        0,
      );

    monthly.push({
      label: monthStart.toLocaleDateString(
        "en-US",
        {
          month: "short",
          year: "numeric",
        },
      ),
      amount,
    });
  }

  let topProducts: TopSellingProduct[] = [];

  const paidOrderIds = paidOrders.map(
    (order) => order.id,
  );

  if (paidOrderIds.length > 0) {
    const {
      data: orderItems,
      error: orderItemsError,
    } = await supabase
      .from("order_items")
      .select(`
        product_id,
        quantity,
        price,
        products (
          id,
          name
        )
      `)
      .in("order_id", paidOrderIds);

    if (orderItemsError) {
      throw new Error(
        "Failed to fetch top-selling products",
      );
    }

    const productSales = new Map<
      string,
      TopSellingProduct
    >();

    for (const item of orderItems ?? []) {
      const product = item.products?.[0];

      if (!product) {
        continue;
      }

      const existingProduct =
        productSales.get(item.product_id);

      const itemRevenue =
        item.price * item.quantity;

      if (existingProduct) {
        existingProduct.total_quantity +=
          item.quantity;

        existingProduct.total_revenue +=
          itemRevenue;
      } else {
        productSales.set(item.product_id, {
          product_id: item.product_id,
          product_name: product.name,
          total_quantity: item.quantity,
          total_revenue: itemRevenue,
        });
      }
    }

    topProducts = Array.from(
      productSales.values(),
    )
      .sort(
        (first, second) =>
          second.total_quantity -
          first.total_quantity,
      )
      .slice(0, 5);
  }

  return {
    stats: {
      totalRevenue,
      totalOrders,
      totalCustomers: customers ?? 0,
      todaySales,
    },

    revenue: {
      daily,
      weekly,
      monthly,
    },

    topProducts,
  };
}

export async function getAdminOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      user_id,
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
      ),
      profiles (
        id,
        email,
        first_name,
        last_name
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error("Failed to fetch admin orders");
  }

  return data ?? [];
}

export async function getAdminCustomers() {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      first_name,
      last_name,
      role,
      avatar_url,
      created_at,
      updated_at
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error("Failed to fetch customers");
  }

  return data ?? [];
}

export async function createProduct(product: {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
}) {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: product.name,
      description: product.description ?? null,
      price: product.price,
      image_url: product.image_url || null,
    })
    .select(
      "id, name, description, price, image_url, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error("Failed to create product");
  }

  return data;
}

export async function updateProduct(
  id: string,
  product: {
    name?: string;
    description?: string;
    price?: number;
    image_url?: string;
  },
) {
  const updateData: {
    name?: string;
    description?: string | null;
    price?: number;
    image_url?: string | null;
    updated_at: string;
  } = {
    updated_at: new Date().toISOString(),
  };

  if (product.name !== undefined) {
    updateData.name = product.name;
  }

  if (product.description !== undefined) {
    updateData.description = product.description;
  }

  if (product.price !== undefined) {
    updateData.price = product.price;
  }

  if (product.image_url !== undefined) {
    updateData.image_url =
      product.image_url || null;
  }

  const { data, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select(
      "id, name, description, price, image_url, created_at, updated_at",
    )
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error("Failed to update product");
  }

  return data;
}

export async function deleteProduct(id: string) {
  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return false;
    }

    throw new Error("Failed to delete product");
  }

  return Boolean(data);
}