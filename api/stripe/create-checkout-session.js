import Stripe from "stripe";

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

async function readBodyJson(req) {
  // Vercelen néha van req.body, néha streamből kell olvasni
  if (req.body) {
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method Not Allowed" });

  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return sendJson(res, 500, { error: "Missing STRIPE_SECRET_KEY env var" });
    if (!key.startsWith("sk_")) {
      return sendJson(res, 500, { error: "STRIPE_SECRET_KEY must start with sk_ (you probably set a pk_ key)" });
    }

    const stripe = new Stripe(key, { apiVersion: "2024-06-20" });

    const body = await readBodyJson(req);
    const { orderId, items, customerEmail, shipping, discountAmount } = body || {};

    if (!orderId) return sendJson(res, 400, { error: "Missing orderId" });
    if (!Array.isArray(items) || items.length === 0) {
      return sendJson(res, 400, { error: "Cart is empty" });
    }

    const currency = "huf";
    const toMinor = (amountMajor) => Math.round(Number(amountMajor || 0) * 100);

    const line_items = items.map((i) => {
      const quantity = Math.max(1, Number(i.quantity || 1));
      const unit_amount = Math.max(0, toMinor(i.price));
      return {
        quantity,
        price_data: {
          currency: "huf",
          unit_amount,
          product_data: {
            name: String(i.name || "Termék"),
          },
        },
      };
    });

    // Apply discount by reducing line item amounts (Stripe doesn't allow negative line items here)
    let discountMinor = Math.max(0, Math.round(Number(discountAmount || 0) * 100));
    if (discountMinor > 0) {
      for (const li of line_items) {
        if (discountMinor <= 0) break;
        const qty = Math.max(1, Number(li.quantity || 1));
        const unit = Math.max(0, Number(li.price_data?.unit_amount || 0));
        const lineTotal = unit * qty;
        if (lineTotal <= 0) continue;

        const reduce = Math.min(lineTotal, discountMinor);
        const newLineTotal = lineTotal - reduce;
        const newUnit = Math.floor(newLineTotal / qty);
        li.price_data.unit_amount = Math.max(0, newUnit);
        discountMinor -= reduce;
      }
    }

    const shippingAmount = Math.max(0, toMinor(shipping?.amount)); 
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

    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;
    const origin = req.headers.origin || `${proto}://${host}`;

    const success_url = `${origin}/checkout/success?order_id=${encodeURIComponent(orderId)}&session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${origin}/checkout?canceled=1&order_id=${encodeURIComponent(orderId)}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail || undefined,
      line_items,
      success_url,
      cancel_url,
      metadata: { orderId: String(orderId) },
    });

    return sendJson(res, 200, { id: session.id, url: session.url });
  } catch (e) {
    console.error("[create-checkout-session] ERROR:", e);
    // visszaadjuk a Stripe hibát, hogy lásd a pontos okot
    return sendJson(res, 500, {
      error: e?.message || "Stripe session creation failed",
      type: e?.type,
      code: e?.code,
      param: e?.param,
    });
  }
}
