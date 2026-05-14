import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    copy: "Build and copy a branded signature with the core builder, logo upload, and universal-safe export.",
    cta: "Start Free",
    to: "/builder",
    features: [
      "1 saved signature",
      "Core signature builder",
      "Logo upload",
      "Basic templates with limited variants",
      "Basic CTA links",
      "Copy Signature export",
      "Universal Outlook-safe export",
      "Basic compatibility checklist",
      "Signature Pilot AI branding included"
    ]
  },
  {
    name: "Pro Individual",
    price: "From $9/month",
    copy: "For solo professionals who want cleaner branding, premium templates, advanced styling, and richer export control.",
    cta: "Upgrade to Pro",
    to: "/upgrade",
    featured: true,
    features: [
      "Remove Signature Pilot AI branding",
      "All template families and variants",
      "Unlimited saved signatures",
      "Modern and premium layouts",
      "Advanced CTA destinations",
      "Raw HTML export",
      "Download HTML",
      "Premium typography and styling controls",
      "Version history and smart recommendations"
    ]
  },
  {
    name: "Business",
    price: "$49/month base",
    copy: "Request rollout for team signature management, centralized brand control, and shared setup support.",
    cta: "Request rollout",
    to: "/contact-sales?plan=business",
    features: [
      "Up to 10 users",
      "Shared template planning",
      "Centralized brand control",
      "Employee and department profile setup",
      "Team-wide CTA and disclaimer planning",
      "Rollout guidance by request"
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    copy: "Custom rollout support for larger organizations that need guided deployment and structured onboarding.",
    cta: "Contact sales",
    to: "/contact-sales?plan=enterprise",
    features: [
      "Custom rollout planning",
      "Larger team consultation",
      "Priority support path",
      "Advanced setup guidance",
      "Deployment review and migration help"
    ]
  }
];

const MATRIX_ROWS = [
  ["Core builder", "Included", "Included", "Included by rollout", "Included by rollout"],
  ["Logo upload", "Included", "Included", "Included", "Included"],
  ["Universal templates", "Included", "Included", "Included", "Included"],
  ["Modern templates", "Limited", "Full access", "Planned for shared rollout", "Custom rollout"],
  ["Branding removal", "No", "Yes", "Yes", "Yes"],
  ["Raw HTML / file export", "No", "Yes", "By setup needs", "By setup needs"],
  ["Shared templates", "No", "No", "Yes", "Yes"],
  ["Team rollout support", "No", "No", "Request rollout", "Custom rollout"]
];

export default function PricingPage() {
  const [proSelfServe, setProSelfServe] = useState(true);

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

  return (
    <div className="page-stack public-page-stack">
      <section className="public-hero public-hero-compact">
        <div className="public-hero-copy public-hero-copy-centered">
          <p className="eyebrow">Pricing</p>
          <h1>Clear pricing for clean email signatures.</h1>
          <p className="hero-subheadline public-hero-subheadline">
            Start free for branded signature creation. Upgrade to Pro Individual for premium control, or request a Business rollout when you need shared
            team standards.
          </p>
          <div className="trust-pill-row">
            <span className="trust-pill">Best for Gmail, Outlook, Apple Mail, and Yahoo</span>
            <span className="trust-pill">Universal templates stay compatibility-first</span>
          </div>
        </div>
      </section>

      <section className="pricing-grid public-pricing-grid">
        {PLANS.map((plan) => (
          <article key={plan.name} className={`pricing-card public-pricing-card ${plan.featured ? "pricing-card-featured" : ""}`}>
            <div className="pricing-card-copy">
              <p className="pricing-name">{plan.name}</p>
              <h2>{plan.price}</h2>
              <p>{plan.copy}</p>
            </div>
            <ul className="feature-list">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Link
              className={`button ${plan.featured ? "button-primary" : "button-secondary"}`}
              to={plan.name === "Pro Individual" && !proSelfServe ? "/contact-sales?plan=pro" : plan.to}
            >
              {plan.name === "Pro Individual" && !proSelfServe ? "Contact us about Pro" : plan.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className="panel public-matrix-panel">
        <div className="section-intro public-section-intro">
          <p className="eyebrow">Compare plans</p>
          <h2>Free handles the basics. Paid plans unlock polish or rollout support.</h2>
        </div>
        <div className="plan-matrix">
          <div className="plan-matrix-row plan-matrix-head">
            <span>Feature</span>
            <span>Free</span>
            <span>Pro</span>
            <span>Business</span>
            <span>Enterprise</span>
          </div>
          {MATRIX_ROWS.map((row) => (
            <div key={row[0]} className="plan-matrix-row">
              {row.map((cell) => (
                <span key={cell}>{cell}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="public-final-cta public-final-cta-tight">
        <div className="public-final-cta-copy">
          <p className="eyebrow">Need help choosing?</p>
          <h2>Start with Free for personal use, Pro for premium control, and Business when your team needs shared rollout standards.</h2>
        </div>
        <div className="hero-actions">
          <Link className="button button-primary" to="/upgrade">
            Upgrade to Pro
          </Link>
          <Link className="button button-secondary" to="/contact-sales?plan=business">
            Request Business rollout
          </Link>
        </div>
      </section>
    </div>
  );
}
