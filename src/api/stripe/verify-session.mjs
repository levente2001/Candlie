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
  if (req.method !== "GET") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const session_id = url.searchParams.get("session_id");

    if (!session_id) return json(res, 400, { error: "Missing session_id" });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    return json(res, 200, {
      ok: true,
      paid: session.payment_status === "paid",
      status: session.status,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent || null,
      amount_total: session.amount_total || null,
      currency: session.currency || null,
      metadata: session.metadata || {},
    });
  } catch (e) {
    console.error("[stripe/verify-session] error:", e);
    return json(res, 500, { error: "Stripe session verify failed" });
  }
}
