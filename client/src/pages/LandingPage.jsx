import React from "react";
import { Link2, ShieldCheck, SlidersHorizontal, Smartphone, Sparkles, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { generateSignatureArtifacts } from "../utils/htmlSignatureGenerator";

const FEATURES = [
  {
    title: "AI Signature Builder",
    description: "Answer three questions and get a tailored layout, wording, and style recommendation in seconds.",
    Icon: Sparkles
  },
  {
    title: "Logo + Brand Upload",
    description: "Upload your company logo or profile photo directly - no image hosting or external links needed.",
    Icon: Upload
  },
  {
    title: "Gmail / Outlook Ready",
    description: "Every signature is built with email-safe HTML that renders correctly in Gmail, Outlook, Apple Mail, and Yahoo.",
    Icon: ShieldCheck
  },
  {
    title: "Clickable Contact Links",
    description: "Phone, email, website, and social links are all tappable - recipients can reach you in one tap.",
    Icon: Link2
  },
  {
    title: "Mobile-Friendly Layouts",
    description: "The Mobile Compact layout stacks cleanly on narrow screens so your signature never breaks on phones.",
    Icon: Smartphone
  },
  {
    title: "Pro Customization",
    description: "Unlock all template families, custom CTA buttons, advanced styling, and raw HTML export with a Pro plan.",
    Icon: SlidersHorizontal
  }
];

const TEMPLATE_SHOWCASE = [
  { name: "Executive", copy: "Leadership-ready with premium spacing", tone: "template-thumb-executive", layout: "premium-consultant", renderMode: "desktop" },
  { name: "Contractor", copy: "Service CTA and field-ready contact flow", tone: "template-thumb-contractor", layout: "contractor-bold", renderMode: "desktop" },
  { name: "Minimal", copy: "Clean founder-friendly signature design", tone: "template-thumb-minimal", layout: "minimal-clean", renderMode: "desktop" },
  { name: "Corporate", copy: "Structured, polished, and brand-led", tone: "template-thumb-corporate", layout: "executive-corporate", renderMode: "desktop" },
  { name: "Mobile Compact", copy: "Built for narrow email clients", tone: "template-thumb-mobile-compact", layout: "mobile-compact", renderMode: "mobile" }
];

const TEMPLATE_SHOWCASE_SAMPLE = {
  fullName: "James Worthing",
  jobTitle: "HSE Advisor",
  companyName: "James Worthing Safety Consulting Services",
  phone: "204-555-5555",
  email: "James@email.com",
  location: "Winnipeg, MB",
  tier: "pro",
  includeBranding: false,
  showDivider: false,
  showTemplateTags: false,
  ctaText: "Book a quick call",
  ctaDestinationType: "none",
  ctaUrl: ""
};

export default function LandingPage() {
  return (
    <div className="page-stack">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Signature Pilot AI</p>
          <h1>Professional email signatures in minutes.</h1>
          <p className="hero-subheadline">
            Signature Pilot AI is an AI-powered email signature builder for Gmail, Outlook, Apple Mail, Yahoo, and any HTML email client, with live preview, export tools, and AI-guided suggestions.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/builder">
              Start Free
            </Link>
            <Link className="button button-secondary" to="/upgrade">
              Upgrade to Pro
            </Link>
          </div>
        </div>

        <div className="hero-preview-card">
          <div className="hero-preview-bar" />
          <div className="hero-preview-body">
            <span className="preview-avatar">SF</span>
            <div>
              <strong>James Worthing</strong>
              <p>Founder | Signature Pilot AI</p>
              <small>Smart signatures. Built in minutes.</small>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        {FEATURES.map((feature) => (
          <article key={feature.title} className="feature-card">
            <p className="feature-icon">
              <feature.Icon aria-hidden="true" size={22} strokeWidth={2.1} />
            </p>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="section-intro">
          <p className="eyebrow">Templates</p>
          <h2>Five polished starting points for different kinds of work.</h2>
          <p className="hero-subheadline">Start with a sharper base instead of editing from a blank email signature every time.</p>
        </div>
        <div className="template-grid">
          {TEMPLATE_SHOWCASE.map((template) => (
            <article key={template.name} className="template-card template-card-static">
              <div className={`template-thumb template-thumb-live ${template.tone}`}>
                <div
                  className="template-thumb-preview"
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{
                    __html: generateSignatureArtifacts({
                      ...TEMPLATE_SHOWCASE_SAMPLE,
                      layout: template.layout,
                      renderMode: template.renderMode
                    }).previewHtml
                  }}
                />
              </div>
              <strong>{template.name}</strong>
              <span>{template.copy}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="before-after-panel">
        <div className="section-intro">
          <p className="eyebrow">Before vs After</p>
          <h2>Turn a plain sign-off into a signature people trust.</h2>
        </div>
        <div className="before-after-grid">
          <article className="before-card">
            <small>Before</small>
            <p>James Worthing</p>
            <p>Founder</p>
            <p>555-123-4567</p>
            <p>hello@company.com</p>
          </article>
          <article className="after-card">
            <small>After</small>
            <div className="after-card-row">
              <span className="preview-avatar">SP</span>
              <div>
                <strong>James Worthing</strong>
                <p>Founder | Northlight Studio</p>
                <small>Book a quick call</small>
              </div>
            </div>
            <div className="after-card-meta">
              <span>Clickable links</span>
              <span>Brand color</span>
              <span>Mobile-safe layout</span>
            </div>
          </article>
        </div>
      </section>

      <section className="pricing-highlight">
        <div>
          <p className="eyebrow">Free vs Pro</p>
          <h2>Start with the essentials. Upgrade when you need more control.</h2>
        </div>
        <div className="pricing-mini-grid">
          <div className="pricing-mini-card">
            <strong>Free</strong>
            <p>Executive, Minimal, and Mobile Compact templates with branded copy-ready signatures.</p>
          </div>
          <div className="pricing-mini-card pricing-mini-card-accent">
            <strong>Pro</strong>
            <p>Contractor and Corporate templates, unbranded HTML export, advanced controls, and AI-powered polish.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
