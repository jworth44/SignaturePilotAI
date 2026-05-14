import React from "react";
import { Link } from "react-router-dom";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    copy: "Build one professional signature, add your logo, and copy it safely into major email clients.",
    cta: "Start Free",
    to: "/builder",
    features: [
      "1 active signature draft",
      "Core signature builder",
      "Logo upload",
      "Basic templates with limited variants",
      "Basic CTA links",
      "Copy rendered signature",
      "Universal Outlook-safe export",
      "Basic compatibility checklist",
      "Signature Pilot AI branding included"
    ]
  },
  {
    name: "Pro Individual",
    price: "From $9/month",
    copy: "For professionals who want cleaner exports, stronger styling control, unbranded signatures, and the full template set.",
    cta: "Upgrade to Pro",
    to: "/upgrade",
    featured: true,
    features: [
      "Remove Signature Pilot AI branding",
      "All template families",
      "All 12 built-in variants",
      "Raw HTML export",
      "Download HTML",
      "Advanced CTA destinations",
      "Advanced styling controls",
      "Premium typography and layout controls",
      "One-click polish and smart recommendations"
    ]
  },
  {
    name: "Business",
    price: "$49/month base",
    copy: "Positioned for teams who need centralized signature control, consistent branding, and shared rollout standards.",
    cta: "Team rollout info",
    to: "/upgrade",
    features: [
      "Up to 10 users",
      "Team signature management",
      "Centralized brand control",
      "Shared templates",
      "Employee profile planning",
      "Team-wide CTA and disclaimer control",
      "Role and department template support",
      "Campaigns, analytics, and workspace sync on the roadmap"
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    copy: "For larger organizations planning future rollout, governance, and deployment workflows.",
    cta: "Contact us",
    to: "/upgrade",
    features: [
      "Custom rollout planning",
      "Priority migration support",
      "Future Microsoft 365 and Google Workspace sync planning",
      "Future advanced governance and deployment options"
    ]
  }
];

export default function PricingPage() {
  return (
    <div className="page-stack">
      <section className="section-intro">
        <p className="eyebrow">Pricing</p>
        <h1>Choose the plan that fits how you manage email signatures.</h1>
        <p className="hero-subheadline">
          Signature Pilot AI is built for one thing: professional signatures that paste cleanly into Gmail, Outlook, Apple Mail, Yahoo, and other major
          email clients without broken formatting.
        </p>
      </section>

      <section className="pricing-grid">
        {PLANS.map((plan) => (
          <article key={plan.name} className={`pricing-card ${plan.featured ? "pricing-card-featured" : ""}`}>
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
              to={plan.name === "Business" ? "/contact-sales?plan=business" : plan.name === "Enterprise" ? "/contact-sales?plan=enterprise" : plan.to}
            >
              {plan.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="section-intro">
          <p className="eyebrow">Compatibility First</p>
          <h2>Do not pay just to make a basic signature work.</h2>
          <p className="hero-subheadline">
            Free covers the basics people expect: logo upload, core templates, rendered copy, and a compatibility-safe export path. Pro unlocks cleaner
            branding, more layout control, and advanced export tools. Business is the request-a-rollout team plan.
          </p>
        </div>

        <div className="comparison-grid">
          <div className="comparison-card">
            <strong>What stays free</strong>
            <ul className="feature-list">
              <li>Basic signature creation</li>
              <li>Logo upload</li>
              <li>Core templates</li>
              <li>Copy Signature export</li>
              <li>Universal compatibility checklist</li>
            </ul>
          </div>
          <div className="comparison-card comparison-card-accent">
            <strong>What upgrades</strong>
            <ul className="feature-list">
              <li>Branding removal</li>
              <li>Premium families and variants</li>
              <li>Raw HTML and file export</li>
              <li>Advanced styling and CTA destinations</li>
              <li>Saved-history and team features</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
