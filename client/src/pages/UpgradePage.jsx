import React, { useState } from "react";

const PAID_PLANS = [
  { plan: "pro", title: "Pro", price: "$12/month", copy: "Best for solo professionals who want AI and premium control." },
  { plan: "business", title: "Business", price: "$49/month", copy: "Best for teams that need shared signature standards." }
];

export default function UpgradePage() {
  const [status, setStatus] = useState("");
  const [loadingPlan, setLoadingPlan] = useState("");

  async function handleUpgrade(plan) {
    setLoadingPlan(plan);
    setStatus("");
    try {
      const response = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      const payload = await response.json();
      if (payload.url) {
        window.location.assign(payload.url);
        return;
      }
      setStatus(payload.message || "Billing not configured yet. Add Stripe keys to enable upgrades.");
    } catch {
      setStatus("Billing not configured yet. Add Stripe keys to enable upgrades.");
    } finally {
      setLoadingPlan("");
    }
  }

  return (
    <div className="page-stack">
      <section className="section-intro">
        <p className="eyebrow">Upgrade</p>
        <h1>Upgrade when you need premium signatures and AI support.</h1>
        <p className="hero-subheadline">No commitment. Cancel anytime. Signatures stay yours.</p>
      </section>

      <section className="pricing-grid">
        {PAID_PLANS.map((plan) => (
          <article key={plan.plan} className="pricing-card pricing-card-featured">
            <div>
              <p className="pricing-name">{plan.title}</p>
              <h2>{plan.price}</h2>
              <p>{plan.copy}</p>
            </div>
            <button className="button button-primary" disabled={loadingPlan === plan.plan} type="button" onClick={() => handleUpgrade(plan.plan)}>
              {loadingPlan === plan.plan ? "Opening..." : "Upgrade to Pro"}
            </button>
          </article>
        ))}
      </section>

      {status ? <section className="panel inline-banner">{status}</section> : null}
    </div>
  );
}
