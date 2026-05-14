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

  return (
    <div className="page-stack">
      <section className="section-intro">
        <p className="eyebrow">Contact Sales</p>
        <h1>{form.plan === "enterprise" ? "Plan your Enterprise rollout." : "Request a Business rollout."}</h1>
        <p className="hero-subheadline">
          Tell us about your team, then open a prefilled email to continue the conversation. This is the current launch-safe contact path for Business and
          Enterprise.
        </p>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Business and Enterprise request form</h2>
          <p className="support-copy">
            This opens your email app and sends a prefilled message to <strong>{contactEmail}</strong>. Nothing is sent until you confirm it in your email
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
              <option value="business">Business</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </label>
          <label className="field field-full">
            <span>Message</span>
            <textarea
              rows="5"
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              placeholder="Tell us what rollout, team structure, or support you need."
            />
          </label>
        </div>

        <div className="contact-lead-actions">
          <a className="button button-primary" href={mailtoHref}>
            {form.plan === "enterprise" ? "Contact sales" : "Request Business rollout"}
          </a>
          <Link className="button button-secondary" to="/upgrade">
            Back to plans
          </Link>
        </div>

        <p className="support-copy contact-lead-note">
          If no email app opens, copy the details into a message to <strong>{contactEmail}</strong>.
        </p>
      </section>
    </div>
  );
}

function normalizePlan(value) {
  return String(value || "").trim().toLowerCase() === "enterprise" ? "enterprise" : "business";
}

function buildSubject(form) {
  const planLabel = form.plan === "enterprise" ? "Enterprise" : "Business";
  const company = form.company?.trim() || "Unknown company";
  return `${planLabel} rollout request - ${company}`;
}

function buildBody(form) {
  const lines = [
    `Plan interest: ${form.plan === "enterprise" ? "Enterprise" : "Business"}`,
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
