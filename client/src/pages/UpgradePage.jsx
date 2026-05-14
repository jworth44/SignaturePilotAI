import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const PAID_PLANS = [
  {
    plan: "pro",
    title: "Pro Individual",
    price: "From $9/month",
    copy: "Unlock unbranded signatures, premium template families, advanced styling, raw HTML, and file export.",
    action: "checkout"
  },
  {
    plan: "business",
    title: "Business",
    price: "$49/month base",
    copy: "Request rollout for team signature management, shared templates, centralized branding, and guided setup.",
    action: "interest"
  },
  {
    plan: "enterprise",
    title: "Enterprise",
    price: "Custom",
    copy: "Contact sales for larger rollout planning, custom support, and more structured onboarding needs.",
    action: "contact"
  }
];

export default function UpgradePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("");
  const [loadingPlan, setLoadingPlan] = useState("");
  const [proSelfServe, setProSelfServe] = useState(true);
  const checkoutStatus = searchParams.get("checkout");
  const checkoutNotice = useMemo(() => {
    if (checkoutStatus === "success") {
      return "Checkout completed. Your Pro upgrade flow finished and your confirmation email should be on the way.";
    }
    if (checkoutStatus === "cancel") {
      return "Checkout was canceled. You can keep using the free builder and return to upgrade any time.";
    }
    return "";
  }, [checkoutStatus]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/health")
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled) {
          setProSelfServe(Boolean(payload?.integrations?.billingPlans?.proSelfServe));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProSelfServe(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
      setStatus(payload.message || "Billing is not configured yet. Add Stripe settings to enable self-serve checkout.");
    } catch {
      setStatus("Billing is not configured yet. Add Stripe settings to enable self-serve checkout.");
    } finally {
      setLoadingPlan("");
    }
  }

  return (
    <div className="page-stack public-page-stack">
      <section className="public-hero public-hero-compact">
        <div className="public-hero-copy public-hero-copy-centered">
          <p className="eyebrow">Upgrade</p>
          <h1>Upgrade when you want cleaner control, sharper layouts, or team rollout support.</h1>
          <p className="hero-subheadline public-hero-subheadline">
            Keep the core builder free. Move to Pro Individual for advanced export and styling, or request Business and Enterprise rollout help when your
            signature setup needs to scale.
          </p>
        </div>
      </section>

      {checkoutNotice ? <section className="panel inline-banner">{checkoutNotice}</section> : null}

      <section className="pricing-grid public-pricing-grid">
        {PAID_PLANS.map((plan) => (
          <article key={plan.plan} className={`pricing-card public-pricing-card ${plan.plan === "pro" ? "pricing-card-featured" : ""}`}>
            <div>
              <p className="pricing-name">{plan.title}</p>
              <h2>{plan.price}</h2>
              <p>{plan.copy}</p>
            </div>
            <button
              className={`button ${plan.plan === "pro" ? "button-primary" : "button-secondary"}`}
              disabled={loadingPlan === plan.plan}
              type="button"
              onClick={() => {
                if (plan.action === "checkout" && proSelfServe) {
                  handleUpgrade(plan.plan);
                  return;
                }
                navigate(`/contact-sales?plan=${plan.plan === "enterprise" ? "enterprise" : plan.plan === "business" ? "business" : "pro"}`);
              }}
            >
              {loadingPlan === plan.plan
                ? "Opening..."
                : plan.action === "checkout" && proSelfServe
                  ? "Upgrade to Pro"
                  : plan.action === "checkout"
                    ? "Contact us about Pro"
                  : plan.action === "interest"
                    ? "Request Business rollout"
                    : "Contact sales"}
            </button>
          </article>
        ))}
      </section>

      <section className="comparison-grid public-upgrade-comparison-grid">
        <article className="comparison-card">
          <p className="pricing-name">Free users keep</p>
          <ul className="feature-list">
            <li>Core signature builder</li>
            <li>Logo upload</li>
            <li>Basic templates</li>
            <li>Copy Signature export</li>
            <li>Universal compatibility checklist</li>
          </ul>
        </article>
        <article className="comparison-card comparison-card-accent">
          <p className="pricing-name">Paid plans unlock</p>
          <ul className="feature-list">
            <li>Branding removal</li>
            <li>All template families and variants</li>
            <li>Advanced styling controls</li>
            <li>Raw HTML and download export</li>
            <li>Business rollout support for team management</li>
          </ul>
        </article>
      </section>

      <section className="public-final-cta public-final-cta-tight">
        <div className="public-final-cta-copy">
          <p className="eyebrow">Need rollout guidance?</p>
          <h2>Business and Enterprise requests go through a direct sales contact flow so rollout questions get handled before checkout is forced.</h2>
        </div>
        <div className="hero-actions">
          <Link className="button button-secondary" to="/contact-sales?plan=business">
            Request Business rollout
          </Link>
          <Link className="button button-secondary" to="/contact-sales?plan=enterprise">
            Contact sales
          </Link>
        </div>
      </section>

      {!proSelfServe ? (
        <section className="panel inline-banner">
          Pro self-serve checkout is unavailable right now. Use the contact path and we will help you activate the right plan.
        </section>
      ) : null}

      {status ? <section className="panel inline-banner">{status}</section> : null}
    </div>
  );
}
