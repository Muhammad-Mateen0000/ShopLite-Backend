import Stripe from "stripe";

import { supabase } from "../config/supabase.js";

export async function handleStripeWebhookEvent(
  event: Stripe.Event,
) {
  const { data: existingEvent, error: existingEventError } =
    await supabase
      .from("stripe_events")
      .select("id")
      .eq("event_id", event.id)
      .maybeSingle();

  if (existingEventError) {
    throw new Error(
      "Failed to check Stripe event",
    );
  }

  if (existingEvent) {
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session =
      event.data.object as Stripe.Checkout.Session;

    const orderId = session.metadata?.orderId;

    if (!orderId) {
      throw new Error(
        "Order ID missing from Stripe session",
      );
    }

    const { data: order, error: orderError } =
      await supabase
        .from("orders")
        .update({
          status: "paid",
          stripe_session_id: session.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select("id")
        .maybeSingle();

    if (orderError) {
      throw new Error(
        "Failed to update order",
      );
    }

    if (!order) {
      throw new Error(
        "Order not found for Stripe session",
      );
    }
  }

  const { error: eventInsertError } =
    await supabase
      .from("stripe_events")
      .insert({
        event_id: event.id,
        event_type: event.type,
      });

  if (eventInsertError) {
    throw new Error(
      "Failed to save Stripe event",
    );
  }
}