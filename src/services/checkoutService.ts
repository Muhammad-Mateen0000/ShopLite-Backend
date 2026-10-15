import Stripe from "stripe";

import { env } from "../config/env.js";
import { stripe } from "../config/stripe.js";
import { supabase } from "../config/supabase.js";

interface CheckoutItem {
  productId: string;
  quantity: number;
}

export async function createCheckoutSession(
  userId: string,
  items: CheckoutItem[],
) {
  const productIds = items.map((item) => item.productId);

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, description, price, image_url")
    .in("id", productIds);

  if (productsError) {
    console.error("Product fetch failed:", productsError);

    throw new Error("Failed to fetch products");
  }

  if (!products || products.length !== productIds.length) {
    throw new Error("One or more products were not found");
  }

  const productMap = new Map(
    products.map((product) => [product.id, product]),
  );

  const orderItems = items.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new Error("Product not found");
    }

    return {
      product_id: product.id,
      quantity: item.quantity,
      price: product.price,
    };
  });

  const total = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      status: "pending",
      total,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Order creation failed:", orderError);

    throw new Error("Failed to create order");
  }

  const orderItemsWithOrderId = orderItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: orderItemsError } = await supabase
    .from("order_items")
    .insert(orderItemsWithOrderId);

  if (orderItemsError) {
    console.error(
      "Order items creation failed:",
      orderItemsError,
    );

    await supabase
      .from("orders")
      .delete()
      .eq("id", order.id);

    throw new Error("Failed to create order items");
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    orderItems.map((item) => {
      const product = productMap.get(item.product_id);

      if (!product) {
        throw new Error("Product not found");
      }

      return {
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: product.price,
          product_data: {
            name: product.name,
            description:
              product.description ?? undefined,
          },
        },
      };
    });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${env.frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.frontendUrl}/payment-cancel`,
    metadata: {
      orderId: order.id,
      userId,
    },
  });

  const { error: updateOrderError } = await supabase
    .from("orders")
    .update({
      stripe_session_id: session.id,
    })
    .eq("id", order.id);

  if (updateOrderError) {
    console.error(
      "Order Stripe session update failed:",
      updateOrderError,
    );

    throw new Error("Failed to update order");
  }

  return {
    orderId: order.id,
    checkoutUrl: session.url,
  };
}