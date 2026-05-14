import React from "react";
import { ArrowRight, CheckCircle2, Copy, Download, ShieldCheck, Sparkles, Upload, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import { generateSignatureArtifacts } from "../utils/htmlSignatureGenerator";

const FEATURE_GROUPS = [
  {
    title: "Universal templates",
    description: "Built for maximum Gmail, Outlook, Apple Mail, and Yahoo compatibility.",
    Icon: ShieldCheck
  },
  {
    title: "Modern templates",
    description: "Use richer visual structure when you want a sharper look and can test Outlook first.",
    Icon: Sparkles
  },
  {
    title: "Logo upload",
    description: "Upload a logo or profile photo directly without relying on externally hosted image URLs.",
    Icon: Upload
  },
  {
    title: "CTA destination links",
    description: "Add click-ready website, scheduling, or booking links without breaking the signature layout.",
    Icon: ArrowRight
  },
  {
    title: "Signature Health Score",
    description: "Get a quick read on compatibility, link coverage, and rollout readiness before you export.",
    Icon: CheckCircle2
  },
  {
    title: "Compatibility checklist",
    description: "Keep Outlook-safe copy and client guidance visible while you build.",
    Icon: ShieldCheck
  },
  {
    title: "Raw HTML and file export",
    description: "Upgrade when you need direct HTML, download files, or handoff-ready export options.",
    Icon: Download
  },
  {
    title: "Team rollout option",
    description: "Business rollout is available by request when you need shared brand control and team setup.",
    Icon: Wand2
  }
];

const TRUST_POINTS = ["Gmail-ready", "Outlook-safe universal templates", "Apple Mail-ready", "Mobile-aware"];

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
      <section className="public-hero">
        <div className="public-hero-copy public-hero-copy-centered">
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
          <div className="trust-pill-row">
            {TRUST_POINTS.map((point) => (
              <span key={point} className="trust-pill">
                {point}
              </span>
            ))}
          </div>
        </div>

        <div className="product-preview-shell">
          <div className="product-preview-flow">
            <div className="product-preview-step">
              <span className="product-preview-number">01</span>
              <strong>Preview</strong>
              <p>Choose a compatibility-safe layout.</p>
            </div>
            <div className="product-preview-step">
              <span className="product-preview-number">02</span>
              <strong>Copy</strong>
              <p>Use Copy Signature for the safest paste path.</p>
            </div>
            <div className="product-preview-step">
              <span className="product-preview-number">03</span>
              <strong>Paste</strong>
              <p>Install cleanly in Gmail, Outlook, Apple Mail, or Yahoo.</p>
            </div>
          </div>
          <div className="public-signature-preview-card">
            <div className="public-signature-preview-frame">
              <div dangerouslySetInnerHTML={{ __html: HERO_SIGNATURE }} />
            </div>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="section-intro public-section-intro">
          <p className="eyebrow">Why it feels better</p>
          <h2>A focused builder for signatures that need to survive real email clients.</h2>
          <p className="hero-subheadline">
            Signature Pilot AI is intentionally narrow: fewer broken layouts, cleaner exports, and better compatibility guidance instead of generic design
            clutter.
          </p>
        </div>
        <div className="feature-grid public-feature-grid">
          {FEATURE_GROUPS.map((feature) => (
            <article key={feature.title} className="feature-card public-feature-card">
              <span className="feature-icon public-feature-icon">
                <feature.Icon aria-hidden="true" size={20} strokeWidth={2.15} />
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
