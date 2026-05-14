import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PAID_PLANS = [
  {
    plan: "pro",
    title: "Pro Individual",
    price: "From $9/month",
    copy: "Available now for solo professionals who want unbranded signatures, raw HTML export, premium templates, and stronger compatibility controls.",
    action: "checkout"
  },
  {
    plan: "business",
    title: "Business",
    price: "$49/month base",
    copy: "Reserved for the recurring team plan: centralized brand control, shared templates, employee profile planning, and future workspace sync.",
    action: "interest"
  },
  {
    plan: "enterprise",
    title: "Enterprise",
    price: "Custom",
    copy: "For larger organizations that want rollout planning, governance review, and future deployment support.",
    action: "contact"
  }
];

export default function UpgradePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("");
  const [loadingPlan, setLoadingPlan] = useState("");
  const checkoutStatus = searchParams.get("checkout");
  const checkoutNotice = useMemo(() => {
    if (checkoutStatus === "success") {
      return "Checkout completed. If Stripe returned you here, your Pro upgrade flow finished and your confirmation email should be on the way.";
    }
    if (checkoutStatus === "cancel") {
      return "Checkout was canceled. You can keep using the free builder and return to upgrade any time.";
    }
    return "";
  }, [checkoutStatus]);

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

  function handleBusinessInterest() {
    navigate("/contact-sales?plan=business");
  }

  function handleEnterpriseInterest() {
    navigate("/contact-sales?plan=enterprise");
  }

  return (
    <div className="page-stack">
      <section className="section-intro">
        <p className="eyebrow">Upgrade</p>
        <h1>Upgrade when you need cleaner exports, stronger control, or team rollout support.</h1>
        <p className="hero-subheadline">No commitment. Cancel anytime. Signatures stay yours.</p>
      </section>

      {checkoutNotice ? <section className="panel inline-banner">{checkoutNotice}</section> : null}

      <section className="pricing-grid">
        {PAID_PLANS.map((plan) => (
          <article key={plan.plan} className={`pricing-card ${plan.plan === "pro" ? "pricing-card-featured" : ""}`}>
            <div>
              <p className="pricing-name">{plan.title}</p>
              <h2>{plan.price}</h2>
              <p>{plan.copy}</p>
              {plan.action !== "checkout" ? <p className="support-copy">Use the contact form to request rollout planning for this plan.</p> : null}
            </div>
            <button
              className={`button ${plan.plan === "pro" ? "button-primary" : "button-secondary"}`}
              disabled={loadingPlan === plan.plan}
              type="button"
              onClick={() => {
                if (plan.action === "checkout") {
                  handleUpgrade(plan.plan);
                  return;
                }
                if (plan.action === "interest") {
                  handleBusinessInterest();
                  return;
                }
                handleEnterpriseInterest();
              }}
            >
              {loadingPlan === plan.plan
                ? "Opening..."
                : plan.action === "checkout"
                  ? "Upgrade to Pro"
                  : plan.action === "interest"
                    ? "Request Business rollout"
                    : "Contact sales"}
            </button>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="section-intro">
          <p className="eyebrow">What upgrades now</p>
          <h2>Keep the core builder free. Pay for cleaner control and recurring team value.</h2>
        </div>
        <div className="comparison-grid">
          <div className="comparison-card">
            <strong>Free users keep</strong>
            <ul className="feature-list">
              <li>Logo upload</li>
              <li>Core templates</li>
              <li>Copy Signature export</li>
              <li>Universal compatibility-safe workflow</li>
            </ul>
          </div>
          <div className="comparison-card comparison-card-accent">
            <strong>Paid plans unlock</strong>
            <ul className="feature-list">
              <li>Branding removal</li>
              <li>Premium families and variants</li>
              <li>Raw HTML and file export</li>
              <li>Advanced styling and future team rollout support</li>
            </ul>
          </div>
        </div>
      </section>

      {status ? <section className="panel inline-banner">{status}</section> : null}
    </div>
  );
}
