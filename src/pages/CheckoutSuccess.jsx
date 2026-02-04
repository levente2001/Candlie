import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Check, Loader2, XCircle } from "lucide-react";
import { createPageUrl } from "../utils";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get("order_id");
  const sessionId = params.get("session_id");

  const [state, setState] = useState({ loading: true, ok: false, error: "" });

  useEffect(() => {
    (async () => {
      try {
        if (!orderId || !sessionId) {
          throw new Error("Hiányzó order_id vagy session_id.");
        }

        const r = await fetch(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`);
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Nem sikerült ellenőrizni a fizetést.");

        if (!j.paid) {
          throw new Error("A fizetés nem lett kifizetett státuszú (paid).");
        }

        await base44.entities.Order.update(orderId, {
          status: "paid",
          stripe_session_id: sessionId,
          stripe_payment_intent: j.payment_intent || null,
          paid_at: new Date().toISOString(),
        });

        localStorage.setItem("cryptoCart", JSON.stringify([]));
        window.dispatchEvent(new Event("cartUpdated"));

        setState({ loading: false, ok: true, error: "" });
      } catch (e) {
        setState({ loading: false, ok: false, error: e?.message || "Hiba történt." });
      }
    })();
  }, [orderId, sessionId]);

  if (state.loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-[var(--candlie-bg)]">
        <div className="flex items-center gap-3 text-black/60">
          <Loader2 className="w-6 h-6 animate-spin" />
          Fizetés ellenőrzése...
        </div>
      </div>
    );
  }

  if (!state.ok) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-[var(--candlie-bg)]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-semibold mb-3">Valami nem oké a fizetéssel</h1>
          <p className="text-black/60 mb-6">{state.error}</p>
          <Link to={createPageUrl("Checkout")} className="text-[var(--candlie-pink-primary)] hover:underline">
            Vissza a checkouthoz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-[var(--candlie-bg)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md mx-auto px-4"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-semibold mb-4">Sikeres fizetés!</h1>
        <p className="text-black/60 mb-8">
          Köszönjük! A rendelésed rögzítve lett, hamarosan feldolgozzuk.
        </p>
        <Link
          to={createPageUrl("Home")}
          className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--candlie-pink-secondary)] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[var(--candlie-pink-primary)]/25 transition-all"
        >
          Vissza a főoldalra
        </Link>
      </motion.div>
    </div>
  );
}
