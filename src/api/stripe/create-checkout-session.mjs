import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

    const { orderId, items, customerEmail, shipping } = body;

    if (!orderId) return json(res, 400, { error: "Missing orderId" });
    if (!Array.isArray(items) || items.length === 0)
      return json(res, 400, { error: "Cart is empty" });

    const line_items = items.map((i) => {
      const quantity = Math.max(1, Number(i.quantity || 1));
      const unit_amount = Math.max(0, Math.round(Number(i.price || 0))); // HUF: 0-decimal
      return {
        quantity,
        price_data: {
          currency: "huf",
          unit_amount,
          product_data: {
            name: String(i.name || "Termék"),
            metadata: {
              product_id: String(i.id || ""),
              size: String(i.size || ""),
            },
          },
        },
      };
    });

    const shippingAmount = Math.max(0, Math.round(Number(shipping?.amount || 0)));
    const shippingName = shipping?.name ? String(shipping.name) : "Szállítás";

    if (shippingAmount > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: "huf",
          unit_amount: shippingAmount,
          product_data: { name: `Szállítás – ${shippingName}` },
        },
      });
    }

    const origin =
      req.headers.origin ||
      (req.headers.host ? `https://${req.headers.host}` : "http://localhost:5173");

    const success_url = `${origin}/checkout/success?order_id=${encodeURIComponent(
      orderId
    )}&session_id={CHECKOUT_SESSION_ID}`;

    const cancel_url = `${origin}/checkout?canceled=1&order_id=${encodeURIComponent(
      orderId
    )}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail || undefined,
      line_items,
      success_url,
      cancel_url,
      metadata: { orderId: String(orderId) },
    });

    return json(res, 200, { id: session.id, url: session.url });
  } catch (e) {
    console.error("[stripe/create-checkout-session] error:", e);
    return json(res, 500, { error: "Stripe session creation failed" });
  }
}
