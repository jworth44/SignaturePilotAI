import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const DEFAULT_CONTACT_EMAIL = "james@signaturepilotai.com";

export default function ContactSalesPage() {
  const [searchParams] = useSearchParams();
  const initialPlan = normalizePlan(searchParams.get("plan"));
  const contactEmail = import.meta.env.VITE_BUSINESS_CONTACT_EMAIL || DEFAULT_CONTACT_EMAIL;
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    users: "",
    plan: initialPlan,
    message: ""
  });

  const subject = useMemo(() => buildSubject(form), [form]);
  const body = useMemo(() => buildBody(form), [form]);
  const mailtoHref = useMemo(() => {
    return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [body, contactEmail, subject]);

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: key === "plan" ? normalizePlan(value) : value
    }));
  }

  const isEnterprise = form.plan === "enterprise";
  const isPro = form.plan === "pro";

  return (
    <div className="page-stack public-page-stack">
      <section className="public-hero public-hero-compact">
        <div className="public-hero-copy public-hero-copy-centered">
          <p className="eyebrow">Contact sales</p>
          <h1>{isEnterprise ? "Plan your Enterprise rollout." : isPro ? "Request your Pro activation." : "Request your Business rollout."}</h1>
          <p className="hero-subheadline public-hero-subheadline">
            Tell us about your team, rollout goals, and support needs. We will open a prefilled email so you can send a complete request without losing the
            details you already entered.
          </p>
        </div>
      </section>

      <section className="sales-page-grid">
        <article className="panel sales-benefits-panel">
          <div className="panel-header">
            <p className="pricing-name">{isEnterprise ? "Enterprise support" : isPro ? "Pro activation" : "Business rollout"}</p>
            <h2>{isEnterprise ? "Custom rollout and support" : isPro ? "Personal upgrade help" : "Team signature management by request"}</h2>
            <p className="support-copy">
              {isPro
                ? "If self-serve billing is unavailable, use this contact flow for manual Pro activation and upgrade support."
                : "Signature Pilot AI can help with shared template setup, brand consistency, and guided rollout planning when your team needs more than a solo builder workflow."}
            </p>
          </div>

          <div className="sales-benefits-list">
            <div className="sales-benefit-item">
              <strong>{isPro ? "Personal upgrade support" : "Shared brand control"}</strong>
              <p>
                {isPro
                  ? "Get help activating premium templates, branding removal, and advanced export controls."
                  : "Keep the same logo, color direction, and signature standards across your team."}
              </p>
            </div>
            <div className="sales-benefit-item">
              <strong>{isPro ? "Clear next steps" : "Employee rollout planning"}</strong>
              <p>
                {isPro
                  ? "Tell us what you need and we can help you move from Free to Pro cleanly."
                  : "Tell us your team size, structure, and what level of setup support you expect."}
              </p>
            </div>
            <div className="sales-benefit-item">
              <strong>{isPro ? "Direct reply" : "Rollout guidance"}</strong>
              <p>{isPro ? "We reply with the best activation path for your account." : "We review your request, confirm what you need, and reply with rollout guidance."}</p>
            </div>
          </div>

          <div className="sales-process-list">
            <div className="sales-process-step">
              <span>1</span>
              <div>
                <strong>Submit request</strong>
                <p>Fill out the form with your plan interest and team details.</p>
              </div>
            </div>
            <div className="sales-process-step">
              <span>2</span>
              <div>
                <strong>We review your rollout needs</strong>
                <p>We look at team size, signature scope, and how much guidance you need.</p>
              </div>
            </div>
            <div className="sales-process-step">
              <span>3</span>
              <div>
                <strong>You receive setup guidance</strong>
                <p>We reply with next steps for Business or Enterprise rollout.</p>
              </div>
            </div>
          </div>
        </article>

        <article className="panel sales-form-panel">
          <div className="panel-header">
            <h2>{isEnterprise ? "Contact sales" : "Request rollout"}</h2>
            <p className="support-copy">
              This opens your email app with a prefilled message to <strong>{contactEmail}</strong>. Nothing is sent until you confirm it in your email
              client.
            </p>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Name</span>
              <input type="text" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
            </label>
            <label className="field">
              <span>Email</span>
              <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
            </label>
            <label className="field">
              <span>Company</span>
              <input type="text" value={form.company} onChange={(event) => updateField("company", event.target.value)} />
            </label>
            <label className="field">
              <span>Number of users</span>
              <input type="text" inputMode="numeric" value={form.users} onChange={(event) => updateField("users", event.target.value)} />
            </label>
            <label className="field">
              <span>Plan interest</span>
              <select value={form.plan} onChange={(event) => updateField("plan", event.target.value)}>
                <option value="pro">Pro Individual</option>
                <option value="business">Business</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </label>
            <label className="field field-full">
              <span>Message</span>
              <textarea
                rows="6"
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                placeholder="Tell us about your rollout goals, departments, and any support you need."
              />
            </label>
          </div>

          <div className="contact-lead-actions">
            <a className="button button-primary" href={mailtoHref}>
              {isEnterprise ? "Contact sales" : isPro ? "Request Pro activation" : "Request Business rollout"}
            </a>
            <Link className="button button-secondary" to="/pricing">
              Back to pricing
            </Link>
          </div>

          <p className="support-copy contact-lead-note">
            If your email app does not open, send the same details to <strong>{contactEmail}</strong>.
          </p>
        </article>
      </section>
    </div>
  );
}

function normalizePlan(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "enterprise") {
    return "enterprise";
  }
  if (normalized === "pro") {
    return "pro";
  }
  return "business";
}

function buildSubject(form) {
  const planLabel = form.plan === "enterprise" ? "Enterprise" : form.plan === "pro" ? "Pro Individual" : "Business";
  const company = form.company?.trim() || "Unknown company";
  return `${planLabel} rollout request - ${company}`;
}

function buildBody(form) {
  const lines = [
    `Plan interest: ${form.plan === "enterprise" ? "Enterprise" : form.plan === "pro" ? "Pro Individual" : "Business"}`,
    `Name: ${form.name || "-"}`,
    `Email: ${form.email || "-"}`,
    `Company: ${form.company || "-"}`,
    `Number of users: ${form.users || "-"}`,
    "",
    "Message:",
    form.message || "-"
  ];

  return lines.join("\n");
}
