import { supabase } from "../config/supabase.js";

export async function getUserDashboard(userId: string) {
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      total,
      created_at
    `)
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error("Failed to fetch dashboard data");
  }

  const userOrders = orders ?? [];

  const totalOrders = userOrders.length;

  const totalSpent = userOrders
    .filter((order) => order.status === "paid")
    .reduce(
      (sum, order) => sum + order.total,
      0
    );

  const pendingOrders = userOrders.filter(
    (order) => order.status === "pending"
  ).length;

  const recentOrders = userOrders.slice(0, 5);

  const now = new Date();

  const spendingOverLastSixMonths = [];

  for (let index = 5; index >= 0; index--) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - index,
      1
    );

    const nextMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      1
    );

    const monthTotal = userOrders
      .filter((order) => {
        if (order.status !== "paid") {
          return false;
        }

        const orderDate = new Date(
          order.created_at
        );

        return (
          orderDate >= date &&
          orderDate < nextMonth
        );
      })
      .reduce(
        (sum, order) => sum + order.total,
        0
      );

    spendingOverLastSixMonths.push({
      month: date.toISOString().slice(0, 7),
      total: monthTotal,
    });
  }

  return {
    stats: {
      totalOrders,
      totalSpent,
      pendingOrders,
    },
    spendingOverLastSixMonths,
    recentOrders,
  };
}