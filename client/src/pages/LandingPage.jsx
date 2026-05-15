import React from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { generateSignatureArtifacts } from "../utils/htmlSignatureGenerator";

const HERO_CLIENTS = ["Gmail", "Outlook", "Apple Mail", "Yahoo", "Thunderbird"];

const HOW_IT_WORKS_STEPS = [
  {
    number: "1",
    title: "Fill in your details",
    description: "Add your contact info, company, logo, and CTA without touching raw code."
  },
  {
    number: "2",
    title: "Pick a template",
    description: "Choose a compatibility-safe layout or a richer modern design you can test first."
  },
  {
    number: "3",
    title: "Copy and paste anywhere",
    description: "Use Copy Signature for the safest install path in the clients you already use."
  }
];

const CLIENT_PILLS = [
  { label: "Gmail", tone: "gmail" },
  { label: "Outlook", tone: "outlook" },
  { label: "Apple Mail", tone: "apple" },
  { label: "Yahoo", tone: "yahoo" },
  { label: "Thunderbird", tone: "thunderbird" },
  { label: "Office 365", tone: "office" }
];

const CORE_FEATURES = [
  {
    icon: "🔒",
    title: "Paste-safe HTML",
    description: "Table-based layout that survives Outlook, Gmail, and Apple Mail without breaking."
  },
  {
    icon: "🏷",
    title: "Universal vs Modern labels",
    description: "Know which templates are Outlook-safe before you pick."
  },
  {
    icon: "📊",
    title: "Signature Health Score",
    description: "Export with a compatibility checklist so nothing surprises you."
  }
];

const FEATURE_GROUPS = [
  {
    title: "Universal templates",
    description: "Built for maximum Gmail, Outlook, Apple Mail, and Yahoo compatibility."
  },
  {
    title: "Modern templates",
    description: "Use richer visual structure when you want a sharper look and can test Outlook first."
  },
  {
    title: "Logo upload",
    description: "Upload a logo or profile photo directly without relying on externally hosted image URLs."
  },
  {
    title: "CTA destination links",
    description: "Add click-ready website, scheduling, or booking links without breaking the signature layout."
  },
  {
    title: "Signature Health Score",
    description: "Get a quick read on compatibility, link coverage, and rollout readiness before you export."
  },
  {
    title: "Compatibility checklist",
    description: "Keep Outlook-safe copy and client guidance visible while you build."
  },
  {
    title: "Raw HTML and file export",
    description: "Upgrade when you need direct HTML, download files, or handoff-ready export options."
  },
  {
    title: "Team rollout option",
    description: "Business rollout is available by request when you need shared brand control and team setup."
  }
];

const TEMPLATE_SHOWCASE_SAMPLE = {
  fullName: "James Worthing",
  jobTitle: "Founder",
  companyName: "Signature Pilot AI",
  phone: "1-800-555-5555",
  email: "James@signaturepilotai.com",
  website: "signature-pilot-ai.com",
  location: "Winnipeg, MB",
  tier: "pro",
  includeBranding: false,
  showDivider: true,
  showTemplateTags: false,
  ctaText: "Book a quick call",
  ctaDestinationType: "website",
  ctaUrl: "https://signature-pilot-ai.com"
};

const HERO_SIGNATURE = generateSignatureArtifacts({
  ...TEMPLATE_SHOWCASE_SAMPLE,
  layout: "professional-classic",
  renderMode: "desktop"
}).previewHtml;

export default function LandingPage() {
  return (
    <div className="page-stack public-page-stack">
      <section className="public-hero public-hero-upgraded">
        <div className="public-hero-copy public-hero-copy-centered public-hero-copy-upgraded">
          <p className="public-hero-rating">★★★★★ Rated 4.7 by professionals</p>
          <p className="eyebrow">Compatibility-first email signatures</p>
          <h1>Professional email signatures that work where you paste them.</h1>
          <p className="hero-subheadline public-hero-subheadline">
            Build clean, branded signatures for Gmail, Outlook, Apple Mail, Yahoo, and major email clients without broken tables, visible borders, or
            messy HTML.
          </p>
          <div className="hero-actions public-hero-actions-centered">
            <Link className="button button-primary" to="/builder">
              Start Free
            </Link>
            <Link className="button button-secondary" to="/pricing">
              View Pricing
            </Link>
          </div>
          <div className="public-client-strip" aria-label="Supported email clients">
            {HERO_CLIENTS.map((client) => (
              <span key={client} className="public-client-chip">
                {client}
              </span>
            ))}
          </div>
        </div>

        <div className="public-hero-window-shell">
          <div className="public-hero-window">
            <div className="public-hero-window-bar">
              <span />
              <span />
              <span />
            </div>
            <div className="public-hero-window-body">
              <div className="public-hero-window-meta">
                <div>
                  <strong>From</strong>
                  <span>James Worthing &lt;James@signaturepilotai.com&gt;</span>
                </div>
                <div>
                  <strong>Subject</strong>
                  <span>Quick follow-up and next steps</span>
                </div>
              </div>
              <div className="public-hero-live-signature" dangerouslySetInnerHTML={{ __html: HERO_SIGNATURE }} />
            </div>
          </div>
        </div>

        <div className="public-how-it-works">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <article key={step.number} className="public-how-step">
              <span className="public-how-step-number">{step.number}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="public-section public-proof-strip">
        <div className="section-intro public-section-intro">
          <p className="eyebrow">Compatibility coverage</p>
          <h2>Works with every major email client</h2>
        </div>
        <div className="public-client-pill-row">
          {CLIENT_PILLS.map((client) => (
            <span key={client.label} className={`public-client-pill public-client-pill-${client.tone}`}>
              {client.label}
            </span>
          ))}
        </div>
      </section>

      <section className="public-section public-core-feature-section">
        <div className="section-intro public-section-intro">
          <p className="eyebrow">Built for real-world paste behavior</p>
          <h2>Everything important is visible before you export.</h2>
        </div>
        <div className="public-core-feature-grid">
          {CORE_FEATURES.map((feature) => (
            <article key={feature.title} className="public-core-feature-card">
              <span className="public-core-feature-icon" aria-hidden="true">
                {feature.icon}
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-section">
        <div className="section-intro public-section-intro">
          <p className="eyebrow">What you actually get</p>
          <h2>A focused builder for signatures that need to survive real email clients.</h2>
          <p className="hero-subheadline">
            Signature Pilot AI is intentionally narrow: fewer broken layouts, cleaner exports, and better compatibility guidance instead of generic design
            clutter.
          </p>
        </div>
        <div className="feature-grid public-feature-grid">
          {FEATURE_GROUPS.map((feature) => (
            <article key={feature.title} className="feature-card public-feature-card">
              <span className="feature-icon public-feature-icon" aria-hidden="true">
                <ShieldCheck size={20} strokeWidth={2.15} />
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-section public-compatibility-section">
        <div className="section-intro public-section-intro">
          <p className="eyebrow">Compatibility first</p>
          <h2>Choose the right template family before you export.</h2>
          <p className="hero-subheadline">
            Universal templates are the safest default for pasted signatures. Modern templates add more polish when you can test Outlook before rollout.
          </p>
        </div>
        <div className="public-compatibility-grid">
          <article className="comparison-card public-compatibility-card public-compatibility-card-safe">
            <p className="pricing-name">Universal</p>
            <h3>Maximum compatibility</h3>
            <p>Best for Gmail, Outlook, Apple Mail, Yahoo, and broad company rollout where paste reliability matters more than visual flair.</p>
            <ul className="feature-list">
              <li>Safest Outlook copy-and-paste path</li>
              <li>Cleaner fallback behavior in strict clients</li>
              <li>Best default for consultants, trades, and broad internal use</li>
            </ul>
          </article>
          <article className="comparison-card public-compatibility-card public-compatibility-card-modern">
            <p className="pricing-name">Modern</p>
            <h3>Sharper styling with caution</h3>
            <p>Best when you want stronger visual hierarchy for Gmail or Apple Mail and you can do a quick Outlook paste test before rollout.</p>
            <ul className="feature-list">
              <li>Richer structure and visual contrast</li>
              <li>Great for founders, executives, and portfolio-forward roles</li>
              <li>Outlook may need a verification pass before wider use</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="public-section">
        <div className="section-intro public-section-intro">
          <p className="eyebrow">Pricing at a glance</p>
          <h2>Start free. Upgrade for cleaner control or team rollout.</h2>
        </div>
        <div className="pricing-mini-grid public-pricing-preview-grid">
          <article className="pricing-mini-card public-plan-mini-card">
            <strong>Free</strong>
            <p>Build and copy one branded signature with logo upload, core templates, and universal-safe export.</p>
          </article>
          <article className="pricing-mini-card pricing-mini-card-accent public-plan-mini-card">
            <strong>Pro Individual</strong>
            <p>Unlock premium templates, branding removal, advanced styling, raw HTML, and download export.</p>
          </article>
          <article className="pricing-mini-card public-plan-mini-card">
            <strong>Business</strong>
            <p>Request rollout for centralized brand control, shared templates, and team signature setup.</p>
          </article>
        </div>
        <div className="public-section-actions">
          <Link className="button button-secondary" to="/pricing">
            Compare Plans
          </Link>
        </div>
      </section>

      <section className="public-final-cta">
        <div className="public-final-cta-copy">
          <p className="eyebrow">Ready to launch</p>
          <h2>Build your signature once, then paste it where you already work.</h2>
          <p className="hero-subheadline">
            Keep the free builder for everyday signatures or upgrade when you want cleaner branding, premium layouts, and stronger export control.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="button button-primary" to="/builder">
            Start Free
          </Link>
          <Link className="button button-secondary" to="/install-guide">
            View Install Guide
          </Link>
        </div>
      </section>
    </div>
  );
}
